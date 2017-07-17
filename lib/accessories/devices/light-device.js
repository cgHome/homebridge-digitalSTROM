"use strict";
const Device = require('./device');

module.exports = class LightDevice extends Device {
    constructor(homebridge, device, category) {
        super(homebridge, device, category || homebridge.HKCategories.LIGHTBULB);

        this.scenePresets = scenePresets;
        this.brightness = 0;

        // Configure service
        this.service = this.getService(this.Service.Lightbulb, this.name);
        this.service.getCharacteristic(this.Characteristic.On)
            .on('get', this.getOnState.bind(this))
            .on('set', this.setOnState.bind(this));

        if (!(device.hwInfo.includes('GE-KL')) && device.outputMode !== 16) {
            this.service.getCharacteristic(this.Characteristic.Brightness)
                .on('get', this.getBrightness.bind(this))
                .on('set', this.setBrightness.bind(this));
        };
    }

    callSceneEvent(event) {
        if (this.isMySceneEvent(event)) {
            this.log.debug(`${this.logPrefix} Event '${event.name}' - id: ${event.properties.sceneID} received`);
            switch (event.properties.sceneID) {
                case '13':        // Scene - Minimum
                    this.brightness = 0;
                    break;
                case '14':        // Scene - Maximum
                    this.brightness = 100;
                    break;
            };
            this.service.getCharacteristic(this.Characteristic.On).updateValue(this.brightness > 0);

            if (!(this.device.hwInfo.includes('GE-KL')) && this.device.outputMode !== 16) {
                this.service.getCharacteristic(this.Characteristic.Brightness).updateValue(this.brightness);
            }
        } else if (!event.source.isDevice && event.source.zoneID == this.device.zoneID) {
            this.service.getCharacteristic(this.Characteristic.On).getValue();

            if (!(this.device.hwInfo.includes('GE-KL')) && this.device.outputMode !== 16) {
                this.service.getCharacteristic(this.Characteristic.Brightness).getValue();
            }
        };
    }

    getOnState(callback) {
        const state = this.brightness > 0;
        this.log.debug(`${this.logPrefix} getOnState: ${state}`);
        callback(null, state);
    }

    setOnState(value, callback) {
        const state = value ? true : false;
        this.dssRequest(`/device/turn${state ? 'On' : 'Off'}`, () => {
            this.log.info(`${this.logPrefix} setOnState: ${state}`);
            callback(null);
            // Set brightness
            if (this.device.outputMode !== 16) {
                this.service.getCharacteristic(this.Characteristic.Brightness).updateValue(state ? 100 : 0);
            }
        });
    }

    getBrightness(callback) {
        this.dssRequest(`/device/getOutputValue?offset=0`, result => {
            this.brightness = Math.round(result.value * 100 / 255);
            this.log.debug(`${this.logPrefix} getBrightness: ${this.brightness}`);
            callback(null, this.brightness);
            // Set on-state
            const state = this.brightness > 0;
            this.service.getCharacteristic(this.Characteristic.On).updateValue(state);
        });
    }

    setBrightness(value, callback) {
        this.dssRequest(`/device/setValue?value=${Math.round(value * 255 / 100)}`, () => {
            this.brightness = value;
            this.log.info(`${this.logPrefix} setBrightness: ${this.brightness}`);
            callback(null);
            // Set on-state
            const state = this.brightness > 0;
            this.service.getCharacteristic(this.Characteristic.On).updateValue(state);
        });
    }
}

const scenePresets = {
    '13': 'Minimum',
    '14': 'Maximum',
    '15': 'Stop',
    '40': 'Auto-Off'
}