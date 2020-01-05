'use strict';
var inherits = require('util').inherits;
var request = require('request');
var Service, Characteristic;

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-senec", "SENEC", SENEC);
};

function SENEC(log, config) {
    this.log = log;
    this.name = config['name'];
    this.hostname = config['hostname'];
    this.refreshInterval = config['refreshInterval'] * 1000 || 60000;

    this.GridPower = 0;
    this.SolarPower = 0;
    this.HousPower = 0;
    this.BatteryLevel = 0;

    var GridPowerConsumption = function() {
        Characteristic.call(this, 'Power to Grid', '7C89C7F0-6A17-4693-98FE-D015481CC082');
        this.setProps({
            format: Characteristic.Formats.FLOAT,
            unit: 'watts',
            maxValue: 10000,
            minValue: -10000,
            minStep: 1,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
        });
        this.value = this.getDefaultValue();
    };
    inherits(GridPowerConsumption, Characteristic);

    var HousPowerConsumption = function() {
        Characteristic.call(this, 'House Power Consumption', 'C6A07A7E-ECD2-426B-89D7-E8664CF782C1');
        this.setProps({
            format: Characteristic.Formats.FLOAT,
            unit: 'watts',
            maxValue: 10000,
            minValue: 0,
            minStep: 1,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
        });
        this.value = this.getDefaultValue();
    };
    inherits(HousPowerConsumption, Characteristic);

    var SolarPower = function() {
        Characteristic.call(this, 'Power from Solar', '20576730-5BAF-4EA4-87DB-6CA806AFA1E2');
        this.setProps({
            format: Characteristic.Formats.FLOAT,
            unit: 'watts',
            maxValue: 10000,
            minValue: 0,
            minStep: 1,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
        });
        this.value = this.getDefaultValue();
    };
    inherits(SolarPower, Characteristic);

    var BatteryPower = function() {
        Characteristic.call(this, 'Load of Battery', '20576730-5BAF-4EA4-87DB-6CA806AFA1E2');
        this.setProps({
            format: Characteristic.Formats.FLOAT,
            unit: '%',
            maxValue: 100,
            minValue: 0,
            minStep: 1,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
        });
        this.value = this.getDefaultValue();
    };
    inherits(BatteryPower, Characteristic);

    var GridService = function(displayName, subtype) {
        Service.call(this, displayName, '1D854997-4519-46A3-B5E2-A6ACBE9B90EF', subtype);
        this.addCharacteristic(GridPowerConsumption);
    };
    inherits(GridService, Service);

    var SolarService = function(displayName, subtype) {
        Service.call(this, displayName, '4AC33194-9AAB-4360-A07F-EFA701F4B7FF', subtype);
        this.addCharacteristic(SolarPower);
    };
    inherits(SolarService, Service);

    var HouseService = function(displayName, subtype) {
        Service.call(this, displayName, 'D9C50529-BC9A-4324-8E79-E17C85FCAC62', subtype);
        this.addCharacteristic(HousPowerConsumption);
    };
    inherits(HouseService, Service);

    var BatteryService = function(displayName, subtype) {
        Service.call(this, displayName, '04E7A9B1-7230-4B96-921E-FEFCC703AF61', subtype);
        this.addCharacteristic(BatteryPower);
    };
    inherits(BatteryService, Service);

    this.gridsvc = new GridService("Grid Power", null);
    this.gridsvc.getCharacteristic(GridPowerConsumption).on('get', this.getGridPowerConsumption.bind(this));

    this.solarsvc = new SolarService("Solar Power", null);
    this.solarsvc.getCharacteristic(SolarPower).on('get', this.getSolarPower.bind(this));

    this.housesvc = new HouseService("House Power", null);
    this.housesvc.getCharacteristic(HousPowerConsumption).on('get', this.getHousePowerConsumption.bind(this));

    this.mainservice = new Service.Outlet(this.name);

    this.batterysvc = new BatteryService("Battery Power", null);
    this.batterysvc.getCharacteristic(BatteryPower).on('get', this.getBatteryLevelCharacteristic.bind(this)); 


    this.informationService = new Service.AccessoryInformation();
    this.informationService
        .setCharacteristic(Characteristic.Name, this.name)
        .setCharacteristic(Characteristic.Manufacturer, "SENEC GmbH")
        .setCharacteristic(Characteristic.Model, "SENEC Home v2.1")
        .setCharacteristic(Characteristic.SerialNumber, "123-456-789");


	function getReq(callback) {
        try{
    	  request.post('http://'+self.hostname+'/lala.cgi', {
    	    json: {
    	       ENERGY: {
                    "GUI_BAT_DATA_FUEL_CHARGE": "",
                    "GUI_INVERTER_POWER": "",
                    "GUI_HOUSE_POW": "",
                    "GUI_GRID_POW": ""
        }
    	    }
    	  }, (error, res, body) => {
    	    if (error) {
    	      console.error(error);
    	      return;
    	    }
    	    
    	    var result = {};
    	    for(var attributename in body.ENERGY){
    	        var attributeVal = (body.ENERGY[attributename]).replace("fl_","");
    	        result[attributename] = hex2float(attributeVal);
    	    }
    	    return callback(result);
    	  })
    } catch (error) {
        this.log(error);
    }
	}

	function hex2float(hexNum) {
        var bytes = new Uint8Array(hexNum.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

        var bits = (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | (bytes[3]);
        var sign = ((bits >>> 31) == 0) ? 1.0 : -1.0;
        var e = ((bits >>> 23) & 0xff);
        var m = (e == 0) ? (bits & 0x7fffff) << 1 : (bits & 0x7fffff) | 0x800000;
        var f = sign * m * Math.pow(2, e - 150);

        var number = Number(f.toFixed(0));

        return number
	}


	var self = this;

    /*

	getReq(
		function(data){
            self.log("manually updating SENEC Home values");
			self.GridPower = parseFloat(data["GUI_GRID_POW"] * -1);
	    	self.SolarPower = 0; //parseFloat(data["GUI_INVERTER_POWER"]);
            self.HousPower = parseFloat(data["GUI_HOUSE_POW"]);
            self.BatteryLevel = parseInt(data["GUI_BAT_DATA_FUEL_CHARGE"]);

            self.gridsvc.updateCharacteristic(GridPowerConsumption, self.GridPower);
            self.housesvc.updateCharacteristic(HousPowerConsumption, self.HousPower);
            self.solarsvc.updateCharacteristic(SolarPower, self.SolarPower);
            self.batterysvc.updateCharacteristic(BatteryPower, self.BatteryLevel);
            

            if (this.SolarPower == 0){
                this.log("")
                this.isActiv = 0;
            } else {
                this.isActiv = 1;
            }

            self.mainservice.getCharacteristic(Characteristic.On).updateValue(this.isActiv);
            self.mainservice.getCharacteristic(Characteristic.OutletInUse).updateValue(this.isActiv);
		}
	);

    */

	setInterval(function() { 
		getReq(
			function(data){
                self.log("updating SENEC Home values");
				self.GridPower = parseFloat(data["GUI_GRID_POW"] * -1);
		    	self.SolarPower = parseFloat(data["GUI_INVERTER_POWER"]);
                self.HousPower = parseFloat(data["GUI_HOUSE_POW"]);
                self.BatteryLevel = parseInt(data["GUI_BAT_DATA_FUEL_CHARGE"]);

		    	self.gridsvc.updateCharacteristic(GridPowerConsumption, self.GridPower);
                self.housesvc.updateCharacteristic(HousPowerConsumption, self.HousPower);
                self.solarsvc.updateCharacteristic(SolarPower, self.SolarPower);
                self.batterysvc.updateCharacteristic(BatteryPower, self.BatteryLevel);

                self.mainservice.getCharacteristic(Characteristic.On).updateValue(1);
                self.mainservice.getCharacteristic(Characteristic.OutletInUse).updateValue(1);
			}
	);
	}, this.refreshInterval);

}

SENEC.prototype.getGridPowerConsumption = function (callback) {
    callback(null, this.GridPower);
};

SENEC.prototype.getHousePowerConsumption = function (callback) {
    callback(null, this.HousPower);
};

SENEC.prototype.getSolarPower = function (callback) {
    callback(null, this.SolarPower);
};

SENEC.prototype.getBatteryLevelCharacteristic = function (callback) {
    callback(null, this.BatteryLevel);
};

SENEC.prototype.getServices = function () {
    return [this.mainservice, this.batterysvc, this.gridsvc, this.solarsvc, this.housesvc, this.informationService];
};



