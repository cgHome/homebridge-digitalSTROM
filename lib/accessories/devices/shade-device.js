"use strict";
const Device = require('./device');

module.exports = class ShadeDevice extends Device {
    constructor(homebridge, device, category) {
        super(homebridge, device, category || homebridge.HKCategories.WINDOW_COVERING);

        this.scenePresets = scenePresets;

        this.positionState = this.Characteristic.PositionState.STOPPED;
        this.currentPosition = this.targetPosition = 0;
        this.currentVerticalTiltAngle = this.targetVerticalTiltAngle = 0;
        this.currentHorizontalTiltAngle = this.targetHorizontalTiltAngle = 0;

        // Configure service
        this.service = this.getService(this.Service.WindowCovering, this.name);
        this.service.getCharacteristic(this.Characteristic.CurrentPosition)
            .on('get', this.getCurrentPosition.bind(this));
        this.service.getCharacteristic(this.Characteristic.TargetPosition)
            .on('set', this.setTargetPosition.bind(this));
        this.service.getCharacteristic(this.Characteristic.PositionState)
            .on('get', this.getPositionState.bind(this))
            .setValue(this.Characteristic.PositionState.STOPPED);

        // Blinds/Rolladen (Outside) addOn
        if (device.hwInfo.includes('GR-KL200')) {
            this.service.getCharacteristic(this.Characteristic.CurrentHorizontalTiltAngle)
                .on('get', this.getCurrentHorizontalTiltAngle.bind(this));
            this.service.getCharacteristic(this.Characteristic.TargetHorizontalTiltAngle)
                .on('set', this.setTargetHorizontalTiltAngle.bind(this));
        };

        // Curtains/Jalousie (Indoor) addOn
        if (device.hwInfo.includes('GR-KL220')) {
            this.service.getCharacteristic(this.Characteristic.CurrentVerticalTiltAngle)
                .on('get', this.getCurrentVerticalTiltAngle.bind(this));
            this.service.getCharacteristic(this.Characteristic.TargetVerticalTiltAngle)
                .on('set', this.setTargetVerticalTiltAngle.bind(this));
        };
    }

    callSceneEvent(event) {
        if (this.isMySceneEvent(event)) {
            this.log.debug(`${this.logPrefix} Event '${event.name}' - id: ${event.properties.sceneID} received`);
            switch (event.properties.sceneID) {
                case '0':       // Scene - Down
                case '13':      // Scene - Down
                    this.currentPosition = 0;
                    this.service.getCharacteristic(this.Characteristic.CurrentPosition).updateValue(this.currentPosition);
                    break;
                case '5':       // Scene - Up
                case '14':      // Scene - Up
                    this.currentPosition = 100;
                    this.service.getCharacteristic(this.Characteristic.CurrentPosition).updateValue(this.currentPosition);
                    break;
                default:
                    this.service.getCharacteristic(this.Characteristic.CurrentPosition).getValue();
                    break;
            };
            this.targetPosition = this.currentPosition;
            this.service.getCharacteristic(this.Characteristic.TargetPosition).updateValue(this.targetPosition);
        } else if (!event.source.isDevice && event.source.zoneID == this.device.zoneID) {
            this.service.getCharacteristic(this.Characteristic.CurrentPosition).getValue();
            this.targetPosition = this.currentPosition;
            this.service.getCharacteristic(this.Characteristic.TargetPosition).updateValue(this.targetPosition);
        };
    }

    getCurrentPosition(callback) {
        this.dssRequest(`/device/getOutputValue?offset=0`, result => {
            this.currentPosition = Math.round(result.value * 100 / 255);
            this.log.debug(`${this.logPrefix} getCurrentPosition: ${this.currentPosition}`);
            callback(null, this.currentPosition);
            // Set targetPosition
            this.targetPosition = this.currentPosition
            this.service.getCharacteristic(this.Characteristic.TargetPosition).updateValue(this.targetPosition);
        });
    }

    setTargetPosition(value, callback) {
        this.targetPosition = value;

        if (this.targetPosition > this.currentPosition) {
            this.service.setCharacteristic(this.Characteristic.PositionState, this.Characteristic.PositionState.INCREASING);
        } else if (this.targetPosition < this.currentPosition) {
            this.service.setCharacteristic(this.Characteristic.PositionState, this.Characteristic.PositionState.DECREASING);
        } else if (this.targetPosition = this.currentPosition) {
            this.service.setCharacteristic(this.Characteristic.PositionState, this.Characteristic.PositionState.STOPPED);
        };

        this.dssRequest(`/device/setValue?value=${Math.round(this.targetPosition * 255 / 100)}`, () => {
            this.log.debug(`${this.logPrefix} setTargetPosition: ${this.targetPosition}`);
            this.currentPosition = this.targetPosition;
            this.service.getCharacteristic(this.Characteristic.CurrentPosition).updateValue(this.currentPosition);
            this.service.setCharacteristic(this.Characteristic.PositionState, this.Characteristic.PositionState.STOPPED);
            callback(null);
        })
    }

    getPositionState(callback) {
        this.log.debug(`${this.logPrefix} getPositionState: ${this.positionState}`);
        callback(null, this.positionState);
    }

    // HorizontalAngle
    getCurrentHorizontalTiltAngle(callback) {
        //? this.dssRequest(`/device/getOutputChannelValue?channels=shadeOpeningAngleOutside`, result => {
        this.dssRequest(`/device/getConfig?class=64&index=4`, result => {
            this.currentHorizontalTiltAngle = Math.round(result.value * 90 / 255);
            this.log.debug(`${this.logPrefix} getCurrentHorizontalTiltAngle: ${this.currentHorizontalTiltAngle}`);
            callback(null, this.currentHorizontalTiltAngle);
            // Set targetHorizontalTiltAngle
            this.targetHorizontalTiltAngle = this.currentHorizontalTiltAngle;
            this.service.getCharacteristic(this.Characteristic.TargetHorizontalTiltAngle).updateValue(this.targetHorizontalTiltAngle);
        });
    }

    setTargetHorizontalTiltAngle(value, callback) {
        this.log.info(`${this.logPrefix} setTargetHorizontalTiltAngle: ${this.targetHorizontalTiltAngle} to ${value}`);
        this.targetHorizontalTiltAngle = value;
        // this.dssRequest(`/device/setConfig?class=64&index=4&value=${Math.round(this.targetHorizontalTiltAngle * 255 / 90)`)
        this.currentHorizontalTiltAngle = this.targetHorizontalTiltAngle;
        this.service.getCharacteristic(this.Characteristic.CurrentHorizontalTiltAngle).updateValue(this.currentHorizontalTiltAngle);
        this.log.warn(`${this.logPrefix} setTargetHorizontalTiltAngle: Set angel on dSS not implemented yet`);
        callback(null);
    }

    // VerticalAngle
    getCurrentVerticalTiltAngle(callback) {
        //? this.dssRequest(`/device/getOutputChannelValue?channels=shadeOpeningAngleIndoor`, result => {
        this.dssRequest(`/device/getConfig?class=64&index=4`, result => {
            this.currentVerticalTiltAngle = Math.round(result.value * 90 / 255);
            this.log.debug(`${this.logPrefix} getCurrentVerticalTiltAngle: ${this.currentVerticalTiltAngle}`);
            callback(null, this.currentVerticalTiltAngle);
            // Set targetVerticalTiltAngle
            this.targetVerticalTiltAngle = this.currentVerticalTiltAngle;
            this.service.getCharacteristic(this.Characteristic.TargetVerticalTiltAngle).updateValue(this.targetVerticalTiltAngle);
        });
    }

    setTargetVerticalTiltAngle(value, callback) {
        this.log.info(`${this.logPrefix} setTargetVerticalTiltAngle: ${this.targetVerticalTiltAngle} to ${value}`);
        this.targetVerticalTiltAngle = value;
        // this.dssRequest(`/device/setConfig?class=64&index=4&value=${Math.round(this.targetVerticalTiltAngle * 255 / 90)`)
        this.currentVerticalTiltAngle = this.targetVerticalTiltAngle;
        this.service.getCharacteristic(this.Characteristic.CurrentVerticalTiltAngle).updateValue(this.currentVerticalTiltAngle);
        this.log.warn(`${this.logPrefix} setTargetVerticalTiltAngle: Set angel on dSS not implemented yet`);
        callback(null);
    }
}

const scenePresets = {
    '11': 'Decrease',
    '12': 'Increase',
    '13': 'Down',
    '14': 'Up',
    '15': 'Stop'
}