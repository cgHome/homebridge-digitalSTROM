"use strict";
const _ = require('lodash');
const Accessory = require('../accessory')

module.exports = class Scene extends Accessory {
    constructor(homebridge, scenes, category) {
        super(homebridge, scenes, category || homebridge.HKCategories.SWITCH);

        this.lastCalledScene = 0;

        // Initialize service
        this.platformAccessory.getService(this.Service.AccessoryInformation)
            .setCharacteristic(this.Characteristic.Model, this.constructor.name);
    }

    // Define getter/setter    
    get scenes() { return this.accessory }
    get id() { return `SC-${this.scenes.id}` }

    isMySceneEvent() {
        return false
    }

    getScenes() {
        return this.scenePresets
    }

    createScenes(urlTpl) {
        let usedSubtypes = [];

        _.each(this.getScenes(), (eventName, eventID) => {
            new HKScene(this, eventID, eventName, urlTpl + `&sceneNumber=${eventID}`);
            usedSubtypes.push(eventName);
        });

        // Remove unused scenes
        const scenes = this.platformAccessory.services.slice(0);
        scenes.forEach(service => {
            if (!(typeof service.subtype === 'undefined' || usedSubtypes.includes(service.subtype))) {
                this.log.debug(`${this.logPrefix} Remove unused scene: ${service.subtype}`);
                this.platformAccessory.removeService(service);
            };
        });
    }
}

// HomeKit "Custom"-Scene
class HKScene {
    constructor(accessory, eventID, eventName, url) {
        this.accessory = accessory;
        this.url = url;
        this.eventID = eventID;
        this.eventName = eventName;
        this.serviceName = `${this.name} ${this.accessory.i18n(eventName)}`;

        // Configure service        
        this.switch = this.accessory.getService(this.Service.Switch, this.serviceName, eventName);
        this.switch.getCharacteristic(this.Characteristic.On)
            .on('get', this.getOnState.bind(this))
            .on('set', this.setOnState.bind(this));

        this.pSwitch = this.accessory.getService(this.Service.StatelessProgrammableSwitch, this.serviceName, eventName);
        this.pSwitch.getCharacteristic(this.Characteristic.ProgrammableSwitchEvent)
            .on('set', this.sceneCalled.bind(this))
            .setProps({ maxValue: 0 });

        this.accessory.platform.dSS
            .on('callScene', this.callSceneEvent.bind(this))
            .on('scene_name_changed', this.sceneNameChangedEvent.bind(this));
    }

    // Define getter/setter    
    get Characteristic() { return this.accessory.Characteristic }
    get Service() { return this.accessory.Service }
    get name() { return this.accessory.name }
    get log() { return this.accessory.log }

    callSceneEvent(event) {
        if (this.accessory.isMySceneEvent(event) && event.properties.sceneID === this.eventID) {
            this.log.debug(`${this.accessory.logPrefix} Event '${event.name}' - id: ${event.properties.sceneID} received`);
            if (this.accessory.lastCalledScene === this.eventID) {
                this.log.info(`${this.accessory.logPrefix} Event '${event.name}' - id: ${this.eventID} already called`);
            } else {
                this.pSwitch.getCharacteristic(this.Characteristic.ProgrammableSwitchEvent).setValue(0)
            }
        };
    }

    sceneNameChangedEvent(event) {
        if (this.accessory.isMySceneEvent(event) && event.properties.sceneID === this.eventID) {
            this.log.debug(`${this.accessory.logPrefix} Event '${event.name}' - id: ${event.properties.sceneID} received`);
            if (this.eventName === event.properties.newSceneName) {
                this.log.info(`${this.accessory.logPrefix} Event '${event.name}' - id: (${this.eventID}) ${this.eventName} already set`);
            } else {
                this.log.warn(`${this.accessory.logPrefix} sceneNameChangedEvent: change name not implemented yet`);
            }
        };
    }

    getOnState(callback) {
        callback(null, 0);
    }

    setOnState(on, callback) {
        if (on) {
            this.accessory.dssRequest((this.url), () => {
                setTimeout(() => {
                    this.switch.setCharacteristic(this.Characteristic.On, 0);
                }, 1000);
            });
            this.log.info(`${this.accessory.constructor.name} - ${this.name} callScene: ${this.eventName} (${this.eventID})`);
        };
        callback();
    }

    sceneCalled(value, callback) {
        this.log.info(`${this.accessory.constructor.name} - ${this.name} sceneCalled: ${this.eventName} (${this.eventID})`);
        this.accessory.lastCalledScene = value;
        callback(null, value);
    }
}
