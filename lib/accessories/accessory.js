"use strict";
const _ = require('lodash');
const i18n = require('i18n');
const EventEmitter = require('events').EventEmitter;

module.exports = class Accessory extends EventEmitter {
    constructor(homebridge, accessory, category) {
        super();
        
        // Initialize accessory
        this.scenePresets = {};        
        this.homebridge = homebridge;
        this.accessory = accessory;
        this.UUID = homebridge.UUIDGen.generate(String(this.id));
        this.displayName = this.name;

        this.logPrefix = `${this.constructor.name} - ${this.name} (${this.id})`;

        // Initialize platformAccessory
        this.platformAccessory = this.platform.cachedAccessories[this.UUID] || new homebridge.PlatformAccessory(this.displayName, this.UUID, category);
        // New accessory is always reachable
        this.platformAccessory.updateReachability(true);

        // Initialize service
        this.platformAccessory.getService(this.Service.AccessoryInformation)
            .setCharacteristic(this.Characteristic.Manufacturer, "homebridge-digitalSTROM")
            .setCharacteristic(this.Characteristic.Name, this.name)
            .setCharacteristic(this.Characteristic.SerialNumber, this.id);

        // Initialize event's
        this.platformAccessory
            .on('identify', this.identifyEvent.bind(this));
    }

    // Define getter/setter    
    get platform() { return this.homebridge.platform }
    get log() { return this.homebridge.platform.log }

    get Service() { return this.homebridge.Service }
    get Characteristic() { return this.homebridge.Characteristic }
    get CustomTypes() { return this.homebridge.CustomTypes }
    get ApplicationGroupsById() { return ApplicationGroups }
    get ApplicationGroupsByName() { return _.invert(ApplicationGroups) }

    get id() { throw Error('Subclass responsibility') }
    get name() { throw Error('Subclass responsibility') }

    identifyEvent(paired, callback) {
        this.log.info(`Accessory - ${this.name} identified`);
        callback();
    }

    refreshEvent(event) {
        //! this.log.debug(`${this.logPrefix} Event  - refreshEvent received`);
    }

    i18n(value) {
        const lValue = i18n.__(value);
        return lValue || value;
    }

    getService(UUID, name, subtype) {
        let accService;
        if (!subtype) {
            accService = this.platformAccessory.getService(UUID);
        } else {
            accService = this.platformAccessory.getServiceByUUIDAndSubType(UUID, subtype);
        }
        if (!accService) {
            accService = this.platformAccessory.addService(UUID, name, subtype);
        };
        return accService
    }

    updateReachability(state) {
        return this.platformAccessory.updateReachability(state);
    }

    dssRequest(url, callback) {
        return this.platform.dSS.dssRequest(url, callback);
    }
}

// Doc: ds-basics.pdf > 2.3 & Table 1
const ApplicationGroups = {
    '1': 'Lights',
    '2': 'Blinds',
    '12': 'Curtains',
    '3': 'Heating',
    '9': 'Cooling',
    '10': 'Ventilation',
    '11': 'Window',
    '48': 'Temperature Control',
    '4': 'Audio',
    '5': 'Video',
    '8': 'Joker'
}