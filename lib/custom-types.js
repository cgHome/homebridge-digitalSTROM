const inherits = require('util').inherits;

// Based on :       Elgato Eve HomeKit Services & Characteristics: (https://gist.github.com/gomfunkel/b1a046d729757120907c) 
// Generate UUID:   UUID.generate('cgHome:customchar:TotalConsumption')

module.exports = function (homebridge) {
    const Service = homebridge.hap.Service;
    const Characteristic = homebridge.hap.Characteristic;

    const CustomTypes = require('hap-nodejs-community-types')(homebridge);

    ////////////////////////////// Custom characteristics //////////////////////////////

    // (not)Overwrite the Eve Energy kWh characteristic
    CustomTypes.TotalConsumption = function () {
        Characteristic.call(this, 'Total Consumption', CustomTypes.TotalConsumption.UUID);
        this.setProps({
            format: Characteristic.Formats.FLOAT,   // Deviation from Eve Energy observed type
            unit: "kilowatthours",
            maxValue: 1000000000,
            minValue: 0,
            minStep: 0.01,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
        });
        this.value = this.getDefaultValue();
    };
    CustomTypes.TotalConsumption.UUID = 'E863F10C-079E-48FF-8F27-9C2605A29F52';
    inherits(CustomTypes.TotalConsumption, Characteristic);

    ////////////////////////////// Custom services //////////////////////////////

    CustomTypes.EnergyMeterService = function (displayName, subtype) {
        Service.call(this, displayName, CustomTypes.EnergyMeterService.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(CustomTypes.Watts);
        // Optional Characteristics
        this.addOptionalCharacteristic(CustomTypes.KilowattHours);
    };
    CustomTypes.EnergyMeterService.UUID = '00000001-0000-1777-8000-775D67EC4377';
    inherits(CustomTypes.EnergyMeterService, Service);

    return CustomTypes
}  
