//
// Copyright 2017-2018 Chris Gross @ cgHome
//
/* jshint esversion: 6, strict: true, node: true */

"use strict";
const EventEmitter = require('events').EventEmitter;
const i18n = require("i18n");

const PluginName = "homebridge-digitalSTROM";
const PlatformName = "digitalSTROM";

const DigitalStromServer = require('./lib/dss');
const AccessoryFactory = require('./lib/accessories/factory');

let PlatformAccessory, Service, Characteristic, UUIDGen, HKCategories, CustomTypes;

module.exports = homebridge => {
    console.log(`***** homebridge API version: ${homebridge.version} *****`);

    PlatformAccessory = homebridge.platformAccessory;
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    UUIDGen = homebridge.hap.uuid;
    HKCategories = homebridge.hap.Accessory.Categories;

    CustomTypes = require('./lib/custom-types')(homebridge);

    homebridge.registerPlatform(PluginName, PlatformName, DigitalStromPlatform, true);
};

class DigitalStromPlatform extends EventEmitter {
    constructor(log, config, api) {
        super();
        const platform = this;
        this.config = config;
        this.log = log;
        this.apartment = {};
        this.accessories = {};
        this.cachedAccessories = {};
        this.exclude = ['DummyDevice'].concat(this.config.exclude || []);

        this.log.info(`Plugin - ***** ${PluginName} init *****`);

        i18n.configure({
            locales: ['en', 'de'],
            directory: process.env.HOME + '/data/locales',
            logDebugFn: msg => {
                log.debug(`i18n - ${msg}`)
            },
            logWarnFn: msg => {
                log.warn(`i18n - ${msg}`)
            },
            logErrorFn: msg => {
                log.error(`i18n - ${msg}`)
            },
        });
        i18n.setLocale(this.config.lang || 'en');

        // Initialize and start refreshEvent 
        if (this.config.refreshEvent !== "0") {
            setInterval(() => { this.emit('refreshEvent') }, this.config.refreshEvent * 1000);
        } else {
            this.log.warn('Plugin - RefreshEvent disabled, to enable set refreshEvent > "0" (config.json)');
        };

        this.dSS = new DigitalStromServer(platform);
        this.factory = new AccessoryFactory({ platform, PlatformAccessory, Service, Characteristic, UUIDGen, HKCategories, CustomTypes });

        if (api) {
            this.api = api;

            if (this.api.version < 2.1) {
                throw new Error("Unexpected API version.");
            };

            this.api.on('didFinishLaunching', () => {
                this.log.info("Plugin - ***** DidFinishLaunching *****");

                this.dSS.initialize();
                this.dSS.on('loginSuccessful', () => {
                    this.initializeAccessories();
                });
            });
        };
    }

    initializeAccessories() {
        this.dSS.getApartment(apartment => {
            this.dSS.getDevices(devices => {
                this.apartment = apartment;
                this.apartment.devices = devices;

                this.log.debug('Plugin - ***** Create Devices *****')
                this.factory.createDevices(devices);
                this.log.debug('Plugin - ***** Create Apartment *****')
                this.factory.createApartment(apartment);

                this.log.debug('Plugin - ***** Remove unused Accessories *****')
                Object.keys(this.cachedAccessories).forEach(UUID => {
                    const platformAccessory = this.cachedAccessories[UUID];
                    if (!this.accessories[platformAccessory.UUID]) {
                        this.log.info(`Plugin - Remove unused Accessory ${platformAccessory.displayName} - ${platformAccessory.UUID}`);
                        this.api.unregisterPlatformAccessories(PluginName, PlatformName, [platformAccessory]);
                        delete this.cachedAccessories[platformAccessory.UUID];
                    };

                });
                this.log.info(`Plugin - ***** ${Object.keys(this.accessories).length} Accessory registered (HomeKit limits 100 accessory per bridge) *****`)
            });
        });
    }

    configureAccessory(accessory) {
        this.log.debug(`Plugin - Cached Accessory: ${accessory.displayName} - ${accessory.UUID}`);
        accessory.updateReachability(false);
        this.cachedAccessories[accessory.UUID] = accessory;
    }

    addAccessory(accessory) {
        if (this.exclude.includes(accessory.constructor.name) || this.exclude.includes(accessory.id)) {
            this.log.debug(`Plugin - Excluded Accessory ${accessory.displayName}::${accessory.id} (${accessory.constructor.name}) - ${accessory.UUID}`);
            return
        };

        //* For test's https://testrack2.aizo.com:50443/ ;)
        // if (accessory.id.indexOf('DE-3504175fe000000000000000000068d800') === -1) return;
        // if (accessory.id !== 'ZS-Wohnen') return;

        this.log.info(`Plugin - Add Accessory ${accessory.displayName}::${accessory.id} (${accessory.constructor.name}) - ${accessory.UUID}`)

        if (!this.cachedAccessories[accessory.UUID]) {
            this.log.info(`Plugin - Register Accessory ${accessory.displayName} (${accessory.constructor.name}) - ${accessory.UUID}`);
            this.api.registerPlatformAccessories(PluginName, PlatformName, [accessory.platformAccessory]);
        };
        this.accessories[accessory.UUID] = accessory;

        if (Object.keys(this.accessories).length >= 100) {
            throw new Error("HomeKit enforces a limit of 100 accessories per bridge.");
        };

        return this
    }

    removeAccessory(accessory) {
        this.log.info(`Plugin - Remove Accessory ${accessory.displayName}::${accessory.id} (${accessory.constructor.name}) - ${accessory.UUID}`);

        if (this.accessories[accessory.UUID]) {
            this.log.info(`Plugin - Unregister Accessory ${accessory.displayName} (${accessory.constructor.name}) - ${accessory.UUID}`);
            this.api.unregisterPlatformAccessories(PluginName, PlatformName, [accessory.platformAccessory]);
            delete this.accessories[accessory.UUID];
        };
    }

    // see: https://github.com/KhaosT/homebridge-amazondash/blob/master/index.js
    configurationRequestHandler(context, request, callback) {
        this.log.info("Context: ", JSON.stringify(context));
        this.log.info("Request: ", JSON.stringify(request));

        // Check the request response
        if (request && request.response && request.response.inputs && request.response.inputs.name) {
            this.addAccessory(request.response.inputs.name);

            // Invoke callback with config will let homebridge save the new config into config.json
            // Callback = function(response, type, replace, config)
            // set "type" to platform if the plugin is trying to modify platforms section
            // set "replace" to true will let homebridge replace existing config in config.json
            // "config" is the data platform trying to save
            callback(null, "platform", true, { "platform": "digitalSTROM", "otherConfig": "SomeData" });
            return;
        }

        // - UI Type: Input
        // Can be used to request input from user
        // User response can be retrieved from request.response.inputs next time
        // when configurationRequestHandler being invoked

        const respDict = {
            "type": "Interface",
            "interface": "input",
            "title": "Add Accessory",
            "items": [
                {
                    "id": "name",
                    "title": "Name",
                    "placeholder": "Fancy Light"
                }//, 
                // {
                //   "id": "pw",
                //   "title": "Password",
                //   "secure": true
                // }
            ]
        };

        // - UI Type: List
        // Can be used to ask user to select something from the list
        // User response can be retrieved from request.response.selections next time
        // when configurationRequestHandler being invoked

        // var respDict = {
        //   "type": "Interface",
        //   "interface": "list",
        //   "title": "Select Something",
        //   "allowMultipleSelection": true,
        //   "items": [
        //     "A","B","C"
        //   ]
        // }

        // - UI Type: Instruction
        // Can be used to ask user to do something (other than text input)
        // Hero image is base64 encoded image data. Not really sure the maximum length HomeKit allows.

        // var respDict = {
        //   "type": "Interface",
        //   "interface": "instruction",
        //   "title": "Almost There",
        //   "detail": "Please press the button on the bridge to finish the setup.",
        //   "heroImage": "base64 image data",
        //   "showActivityIndicator": true,
        // "showNextButton": true,
        // "buttonText": "Login in browser",
        // "actionURL": "https://google.com"
        // }

        // Plugin can set context to allow it track setup process
        context.ts = "Hello";

        //invoke callback to update setup UI
        callback(respDict);
    }
}