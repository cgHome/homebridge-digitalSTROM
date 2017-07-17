"use strict";
const Scene = require('./scene');

module.exports = class ApartmentScenes extends Scene {
    constructor(homebridge, scenes = {}, category) {
        scenes.id = scenes.zoneName = 'Apartment';
        super(homebridge, scenes, category);

        // Create scenes    
        this.scenePresets = scenePresets;
        this.createScenes('/apartment/callScene?force=true');
    }

    // Define getter/setter
    get id() { return `SC-${this.scenes.id}` }
    get name() { return `${this.i18n(this.scenes.zoneName)}` }

    isMySceneEvent(event) {
        return event.source.isApartment || event.source.isGroup && event.source.zoneID == 0 && event.properties.sceneID >= 64 && event.properties.sceneID <= 99
    }
}

const scenePresets = {
    '68': 'Deep Off',
    '67': 'Standby',
    '75': 'Zone Active',
    '64': 'Auto Standby',
    '72': 'Absent',
    '71': 'Present',
    '69': 'Sleeping',
    '70': 'Wake Up',
    '73': 'Door Bell',
    '65': 'Panic',
    '76': 'Fire',
    '74': 'Alarm-1',
    '83': 'Alarm-2',
    '84': 'Alarm-3',
    '85': 'Alarm-4',
    '86': 'Wind',
    '87': 'No-Wind',
    '88': 'Rain',
    '89': 'No-Rain',
    '90': 'Hail',
    '91': 'No-Hail'
}