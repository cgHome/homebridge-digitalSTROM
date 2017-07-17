"use strict";
const Device = require('./device');

module.exports = class DummyDevice extends Device{
    constructor(homebridge, device, category) {
        // Initialize the parent
        super(homebridge, device, category);
    }

    callSceneEvent(event) {}
}
