"use strict";
const Accessory = require('../accessory');

module.exports = class Sensor extends Accessory {
    constructor(homebridge, sensor, category) {
        super(homebridge, sensor, category || homebridge.HKCategories.SENSOR);

        // Initialize service
        this.platformAccessory.getService(this.Service.AccessoryInformation)
            .setCharacteristic(this.Characteristic.Model, this.sensor.hwInfo || "none");
    }

    get sensor() { return this.accessory }
    get id() { return `SE-${this.sensor.dSUID}` }
    get name() { return `${this.i18n(this.sensor.zoneName)}-${this.sensor.name}` }

    identifyEvent(paired, callback) {
        this.log.warn(`${this.logPrefix} identified not implemented`);
        callback();
        // ToDo: Implement Sensor identified
        // this.dssRequest(`/device/blink`, () => {
        //     this.log.info(`${this.logPrefix} identified`);
        //     callback();
        // });
    }

    dssRequest(url, callback) {
        const _url = (url.indexOf('?') < 0 ? url + '?' : url + '&') + 'dsuid=' + this.sensor.dSUID;
        return super.dssRequest(_url, callback);
    }
}