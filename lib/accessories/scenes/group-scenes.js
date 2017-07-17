"use strict";
const _ = require('lodash');
const Scene = require('./scene');

module.exports = class GroupScenes extends Scene {
    constructor(homebridge, scenes, category) {
        super(homebridge, scenes, category);

        // Create scenes
        this._yellowPresets = yellowPresets;
        this._grayPresets = grayPresets;
        this._bluePresets = bluePresets;
        this._cyanPresets = cyanPresets;
        this._magentaPresets = magentaPresets;
        this._blackPresets = blackPresets;

        this.scenePresets = this[this.applicationType.presets];
        this.createScenes(`/zone/callScene?force=true&id=${scenes.zoneID}&groupID=${scenes.group.group}`);
    }

    // Define getter/setter
    get id() { return `SC-Zone${this.scenes.zoneID}-Group${this.scenes.group.group}` }
    get name() { return `${this.scenes.zoneName}-${this.i18n(this.applicationType.name || "$" + this.scenes.group.name + "$")}`}
    get applicationType() { return applicationTypes.get(this.scenes.group.applicationType) }

    isMySceneEvent(event) {
        return event.source.isGroup && event.source.zoneID == this.scenes.zoneID && event.source.groupID == this.scenes.group.group
    }

    getScenes() {
        const scenes = _.merge({}, this.scenePresets);
        // Merge group-scenes with presets
        _.values(this.scenes.group.scenes).forEach(scene => {
            if (scene.name) scenes[scene.scene] = scene.name;
        });
        return scenes
    }

}

const applicationTypes = new Map([
    [1, { 'name': 'Lights', 'presets': '_yellowPresets' }],
    [2, { 'name': 'Blinds', 'presets': '_grayPresets' }],
    [12, { 'name': 'Curtains', 'presets': '_grayPresets' }],
    [3, { 'name': 'Heating', 'presets': '_bluePresets' }],
    [9, { 'name': 'Cooling', 'presets': '_bluePresets' }],
    [10, { 'name': 'Ventilation', 'presets': '_bluePresets' }],
    [11, { 'name': 'Window', 'presets': '_bluePresets' }],
    [48, { 'name': 'Temperature Control', 'presets': '_bluePresets' }],
    [4, { 'name': 'Audio', 'presets': '_cyanPresets' }],
    [5, { 'name': 'Video', 'presets': '_magentaPresets' }],
    [8, { 'name': 'Joker', 'presets': '_blackPresets' }]
]);

const yellowPresets = {
    '0': 'Off',
    '40': 'Fade off',
    '5': 'Preset 1',
    '17': 'Preset 2',
    '18': 'Preset 3',
    '19': 'Preset 4',
    '6': 'Area 1 on',
    '7': 'Area 2 on'
};
const grayPresets = {
    '0': 'Down',
    '5': 'Up',
    '17': 'Preset 2',
    '18': 'Preset 3',
    '19': 'Preset 4',
    '56': 'Sun protection'
};
const bluePresets = {
    '0': '?Off',
};
const cyanPresets = {
    // '0': 'Off',
    '5': 'Preset 1',
    '17': 'Preset 2',
    '18': 'Preset 3',
    '19': 'Preset 4',
};
const magentaPresets = {
    // '0': 'Off',
    '5': 'Preset 1',
    '17': 'Preset 2',
    '18': 'Preset 3',
    '19': 'Preset 4',
};
const blackPresets = {
    '0': '?Off'
};
