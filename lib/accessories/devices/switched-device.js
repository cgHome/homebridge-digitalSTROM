"use strict";
const Device = require('./device');

module.exports = class SwitchedDevice extends Device {
    constructor(homebridge, device, category) {
        super(homebridge, device, category || homebridge.HKCategories.SWITCH);

        // Configure service
        this.service = this.getService(this.Service.Switch, this.name);
        this.service.getCharacteristic(this.Characteristic.On)
            .on('get', this.getOnState.bind(this))
            .on('set', this.setOnState.bind(this));
    }

    callSceneEvent(event) {
        if (this.isMySceneEvent(event)) {
            this.log.debug(`${this.logPrefix} Event '${event.name}' - id: ${event.properties.sceneID} received`);
            switch (event.properties.sceneID) {
                case '13':        // Scene - Off
                    this.state = false;
                    break;
                case '14':        // Scene - On
                    this.state = true;
                    break;
            };
            this.service.getCharacteristic(this.Characteristic.On).updateValue(this.state);
        };
    }
}
