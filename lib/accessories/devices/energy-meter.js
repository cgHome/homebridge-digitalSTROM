"use strict";
const Sensor = require('./sensor');

module.exports = class EnergyMeter extends Sensor {
    constructor(homebridge, sensor, category) {
        sensor.zoneName = 'dSMeter';
        super(homebridge, sensor, category);

        // Configure service
        this.service = this.getService(this.CustomTypes.EnergyMeterService, this.name);
        this.service.getCharacteristic(this.CustomTypes.Watts)
            .on('get', this.getConsumption.bind(this));
        this.service.getCharacteristic(this.CustomTypes.KilowattHours)
            .on('get', this.getTotalConsumption.bind(this));

        this.platform.on('refreshEvent', () => {
            //! this.log.debug(`${this.logPrefix} Event - refreshEvent received`);
            this.service.getCharacteristic(this.CustomTypes.Watts).getValue();
            this.service.getCharacteristic(this.CustomTypes.KilowattHours).getValue();
        });
    }

    callSceneEvent(event) {
        if (event.source.isDevice && event.source.dSUID === this.sensor.dSUID) {
            this.log.debug(`${this.logPrefix} Event '${event.name}' - id: ${event.properties.sceneID} received`);
            // this.service.getCharacteristic(this.CustomTypes.Watts).setValue(this.state);
        };
    }
    getConsumption(callback) {
        this.dssRequest('/circuit/getConsumption', result => {
            const consumption = result.consumption;
            this.log.debug(`${this.logPrefix} getConsumption: ${consumption} W`);
            callback(null, consumption);
        });
    }

    getTotalConsumption(callback) {
        this.dssRequest('/circuit/getEnergyMeterValue', result => {
            const consumption = parseInt(result.meterValue / 3600000);
            this.log.debug(`${this.logPrefix} getTotalConsumption: ${consumption} kWh (${result.meterValue} Ws)`);
            callback(null, consumption);
        });

    }
}