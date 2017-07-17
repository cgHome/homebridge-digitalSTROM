"use strict";
const _ = require('lodash');

const ApartmentScenes = require('./scenes/apartment-scenes');
const ZoneScenes = require('./scenes/zone-scenes');
const GroupScenes = require('./scenes/group-scenes');
const DeviceScenes = require('./scenes/device-scenes');
const DummyDevice = require('./devices/dummy-device');
const LightDevice = require('./devices/light-device');
const ShadeDevice = require('./devices/shade-device');
const EnergyMeter = require('./devices/energy-meter');

module.exports = class Factory {
    constructor(homebridge) {
        this.homebridge = homebridge;
    }

    // Define getter/setter
    get platform() { return this.homebridge.platform }
    get log() { return this.homebridge.platform.log }

    createApartment(apartment) {
        let accessory;

        // Create energyMeter-sensors
        _.forEach(apartment.dSMeters, dSMeter => {
            accessory = new EnergyMeter(this.homebridge, dSMeter);
            this.log.debug(`Sensor - ${accessory.constructor.name} - ${accessory.displayName} (${accessory.id}) created`);
            this.platform.addAccessory(accessory);
        });

        // Create apartment-scenes
        accessory = new ApartmentScenes(this.homebridge);
        this.log.debug(`Scene - ${accessory.constructor.name} - ${accessory.displayName} (${accessory.id}) created`);
        this.platform.addAccessory(accessory);

        for (let zoneID in apartment.zones) {
            const zone = apartment.zones[zoneID];
            const zoneName = zone.name;

            // Create zone-scenes
            accessory = new ZoneScenes(this.homebridge, { zoneID, zoneName });
            this.log.debug(`Scene - ${accessory.constructor.name} - ${accessory.displayName} (${accessory.id}) created`);
            this.platform.addAccessory(accessory);

            for (const groupID in zone.groups) {
                const group = zone.groups[groupID];
                if (group.devices.length == 0 || group.applicationType == 0) {
                    continue
                };

                // Create group-scenes
                accessory = new GroupScenes(this.homebridge, { zoneID, zoneName, group });
                this.log.debug(`Scene - ${accessory.constructor.name} - ${accessory.displayName} (${accessory.id}) created`);
                this.platform.addAccessory(accessory);
            };
        };

        return apartment;
    }

    createDevices(devices) {
        _.forEach(devices, device => {
            this.createDevice(device);
        });
    }

    createDevice(device) {
        let deviceAccessory, sceneAccessory;

        const dSUID = device.dSUID;
        const zoneID = device.zoneID;
        const zoneName = device.zoneName = this.platform.apartment.zones[zoneID].name;

        switch (true) {
            case device.hwInfo.includes('-TK'):                                     // NOP - Push button interface (all)
                break;
            case device.hwInfo.includes('GE-'):                                     // lights (yellow-group)
                deviceAccessory = new LightDevice(this.homebridge, device);
                break;
            case device.hwInfo.includes('GR-'):                                     // shades (gray-group)
                deviceAccessory = new ShadeDevice(this.homebridge, device);
                break;
            default:
                deviceAccessory = new DummyDevice(this.homebridge, device);
                this.log.warn(`Device - DummyDevice - ${deviceAccessory.name} (${device.hwInfo} Mode-${device.outputMode}) not implemented`);
        };
        if (deviceAccessory && !(deviceAccessory instanceof DummyDevice)) {
            // Create DeviceScenes
            let device = deviceAccessory;
            sceneAccessory = new DeviceScenes(this.homebridge, { zoneID, zoneName, dSUID, device });

            this.log.debug(`Device - ${deviceAccessory.constructor.name} - ${deviceAccessory.name} (${deviceAccessory.device.hwInfo} Mode-${deviceAccessory.device.outputMode}) created - ${deviceAccessory.id}`);

            // Add Accessories
            this.platform.addAccessory(deviceAccessory);
            this.platform.addAccessory(sceneAccessory);
        };

        return
    }
}