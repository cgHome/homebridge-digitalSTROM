"use strict";
const Scene = require('./scene')

module.exports = class DeviceScenes extends Scene {
    constructor(homebridge, scenes, category) {
        super(homebridge, scenes, category);

        // Create scenes
        this.scenePresets = scenes.device.scenePresets;
        this.createScenes(`/device/callScene?category=manual&dsuid=${scenes.dSUID}`);
    }
    
    // Define getter/setter    
    get id() { return `SC-${this.scenes.dSUID}` }
    get name() { return `${this.scenes.device.name}` }

    isMySceneEvent(event) {
        return event.source.isDevice && event.source.dSUID === this.scenes.dSUID
    }
}
