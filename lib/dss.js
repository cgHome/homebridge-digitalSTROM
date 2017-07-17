"use strict";
const path = require('path');
const fs = require('fs');
const request = require('request');
const EventEmitter = require('events').EventEmitter;

const _ = require('lodash');

// Temp fix (self signed cert not working yet)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

module.exports = class DSS extends EventEmitter {
    constructor(platform) {
        super();
        this.setMaxListeners(0);

        this.log = platform.log;
        this.config = platform.config;
        this.api = platform.api;

        this.appToken = this.config.appToken;
        this.token = '';
        this.request = request.defaults({
            baseUrl: this.config.url + '/json',
            agentOptions: {
                ca: fs.readFileSync(path.resolve(this.config.caFile))
            },
            json: true
        });
    }

    initialize() {
        this.login();
        this.on('loginSuccessful', () => {
            this.subscribeDssEvents();
        });
    }

    login() {
        this.request('/system/loginApplication?loginToken=' + this.appToken, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                if (body.ok) {
                    this.log.info(`dSS - Login digitalSTROM-Server '${response.request.host}' successful`);
                    this.token = body.result.token;
                    this.emit('loginSuccessful');
                } else {
                    this.log.error(`dSS - Login failed: ${body.message}, token: ${this.appToken}`);
                }
            } else {
                this.log.error(`dSS - Login failed: ${error.message}`);
            }
        });
    }

    subscribeDssEvents() {
        const eventNames = ['callScene', 'scene_name_changed'];
        let subscriptionID = 42;

        eventNames.forEach(name => {
            var id = subscriptionID++;
            this.dssRequest(`/event/subscribe?subscriptionID=${id}&name=${name}`, () => {
                const longPoll = () => {
                    //! this.log.debug("dSS - Event next long polling");
                    this.dssRequest(`/event/get?subscriptionID=${id}&timeout=60000`, events => {
                        events.events.forEach(event => {
                            // TempFix: dSID ist eigentlich eine dSUID
                            if (typeof event.source.dsid !== 'undefined')
                                event.source['dSUID'] = event.source.dsid;
                            // TempFix: Schreibfehler 
                            if (typeof event.properties.sceneId !== 'undefined')
                                event.properties['sceneID'] = event.properties.sceneId;

                            //! this.log.debug(`dSS - Event received: ${JSON.stringify(event)}`);
                            this.emit(event.name, event);
                        });
                        longPoll();
                    });
                };
                longPoll();
            });
        })
    }

    getApartment(callback) {
        const scenesUrl = '/property/query?query=/apartment/*/*(ZoneID,name,dSUID,dSID,isValid,hardwareName)/groups/*(group,name,color,applicationType)/scenes/*(*)';
        const devicesUrl = '/property/query?query=/apartment/*/*(ZoneID,name)/groups/*(group,name,color,applicationType)/devices/*(dSUID)';

        this.dssRequest(scenesUrl, scenesResult => {
            this.dssRequest(devicesUrl, devicesResult => {
                const apartment = _.merge(scenesResult, devicesResult);

                const dSMeters = {};
                apartment.dSMeters.forEach(dSMeter => {
                    if (!dSMeter.isValid) return;

                    dSMeter.hwInfo = dSMeter.hardwareName;
                    delete dSMeter.hardwareName;

                    dSMeters[dSMeter.dSUID] = dSMeter;
                });
                apartment.dSMeters = dSMeters;

                const zones = {};
                apartment.zones.forEach(zone => {
                    // No broadcast
                    if (zone.ZoneID == 0) return;

                    zones[zone.ZoneID] = zone;

                    const groups = {};
                    zone.groups.forEach(group => {
                        // No broadcast
                        if (group.group == 0) return;

                        groups[group.group] = group;

                        const scenes = {};
                        if (group.hasOwnProperty('scenes')) {
                            group.scenes.forEach(scene => {
                                scenes[scene.scene] = scene;
                            });
                        };
                        group.scenes = scenes;

                        const devices = [];
                        if (group.hasOwnProperty('devices')) {
                            group.devices.forEach(device => {
                                devices.push(device.dSUID);
                            });
                        };
                        group.devices = devices;
                    });
                    zone.groups = groups;
                });
                apartment.zones = zones;

                this.log.debug('dSS - getApartment received .....');
                callback(apartment);
            });
        });
    }

    getDevices(callback) {
        this.dssRequest('/apartment/getDevices', result => {
            const devices = {};
            result.forEach(device => {
                devices[device.dSUID] = device;

                const groups = [];
                device.groups.forEach(group => {
                    groups.push(group);
                });
                device.groups = groups;
            });

            this.log.debug(`dSS - getDevices: ${Object.keys(devices).length} devices received .....`);
            callback(devices);
        });
    }

    getStructure(callback) {
        this.dssRequest('/apartment/getStructure', result => {
            this.log.debug("dSS - getStructure received .....");
            callback(result);
        });
    }

    dssRequest(url, onSuccess, onError) {
        //! this.log.debug(`dSS - dssRequest(req): ${url}`);
        this.request((url.indexOf('?') < 0 ? url + '?' : url + '&') + 'token=' + this.token, (error, response, body) => {
            if (!error && response.statusCode == 200 && body.ok) {
                const result = JSON.stringify(body.result) || '[none]';
                //! this.log.debug(`dSS - dssRequest(res): ${result.substring(0, 69)} ...`);
                onSuccess(body.result)
            } else {
                const errCallback = onError || (error => {
                    this.log.error(`dSS - dssRequest ${error}: ${url}`)
                });
                errCallback(error || '(' + response.statusCode + ') ' + body.message)
            }
        });
    }
}