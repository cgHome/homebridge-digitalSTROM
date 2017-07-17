"use strict";
const Scene = require('./scene');

module.exports = class ZoneScenes extends Scene {
    constructor(homebridge, scenes, category) {
        super(homebridge, scenes, category);

        // Create scenes        
        this.scenePresets = scenePresets;
        this.createScenes(`/zone/callScene?force=true&id=${scenes.zoneID}`);
    }

    // Define getter/setter
    get id() { return `SC-Zone${this.scenes.zoneID}` }
    get name() { return `${this.scenes.zoneName}` }

    isMySceneEvent(event) {
        return event.source.isGroup && event.source.zoneID == this.scenes.zoneID && event.source.groupID === 0
    }
}

const scenePresets = {
    '67': 'Standby',
    '68': 'Deep Off',
    '69': 'Sleeping',
    '70': 'Wake Up'
}