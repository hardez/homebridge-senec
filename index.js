//'use strict';
var inherits = require('util').inherits;
var request = require('request');
var Service, Characteristic;

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    Accessory = homebridge.hap.Accessory;
    homebridge.registerAccessory("homebridge-senec", "SENEC", SENEC);
};

function SENEC(log, config) {
    this.log = log;
    this.name = config['name'];
    this.hostname = config['hostname'];
    this.refreshInterval = config['refreshInterval'] * 1000 || 60000;

    this.GridPower = 0;
    this.SolarPower = 0;
    this.BatteryLevel = 76;

    var GridPowerConsumption = function() {
        Characteristic.call(this, 'Power to Grid', '7C89C7F0-6A17-4693-98FE-D015481CC082');
        this.setProps({
            format: Characteristic.Formats.FLOAT,
            unit: 'watts',
            maxValue: 32000,
            minValue: -32000,
            minStep: 1,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
        });
        this.value = this.getDefaultValue();
    };
    inherits(GridPowerConsumption, Characteristic);

    var SolarPower = function() {
        Characteristic.call(this, 'Power from Solar', '20576730-5BAF-4EA4-87DB-6CA806AFA1E2');
        this.setProps({
            format: Characteristic.Formats.FLOAT,
            unit: 'watts',
            maxValue: 32000,
            minValue: 0,
            minStep: 1,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
        });
        this.value = this.getDefaultValue();
    };
    inherits(SolarPower, Characteristic);


    var PowerMeterService = function(displayName, subtype) {
        Service.call(this, displayName, '00000001-0000-1777-8000-775D67EC4377', subtype);
        this.addCharacteristic(GridPowerConsumption);
        this.addOptionalCharacteristic(SolarPower);
    };

    inherits(PowerMeterService, Service);

    this.service = new PowerMeterService(this.name, null);
    this.service.getCharacteristic(GridPowerConsumption).on('get', this.getGridPowerConsumption.bind(this));
    this.service.getCharacteristic(SolarPower).on('get', this.getSolarPower.bind(this));
    this.service.getCharacteristic(Characteristic.BatteryLevel).on('get', this.getBatteryLevelCharacteristic.bind(this)); 



	function getReq(callback) {
	  request.post('http://senecspeicher.fritz.box/lala.cgi', {
	    json: {
	       ENERGY: {
	          "GUI_INVERTER_POWER": "",
              "GUI_BAT_DATA_FUEL_CHARGE": "",
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
	}

	function hex2float(hexNum) {
        var bytes = new Uint8Array(hexNum.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

        var bits = (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | (bytes[3]);
        var sign = ((bits >>> 31) == 0) ? 1.0 : -1.0;
        var e = ((bits >>> 23) & 0xff);
        var m = (e == 0) ? (bits & 0x7fffff) << 1 : (bits & 0x7fffff) | 0x800000;
        var f = sign * m * Math.pow(2, e - 150);

        number = Number(f.toFixed(0));

        return number
	}


	var self = this;

	getReq(
		function(data){

			self.GridPower = parseFloat(data["GUI_GRID_POW"] * -1);
	    	self.SolarPower = parseFloat(data["GUI_INVERTER_POWER"] / 1000 );
            self.BatteryLevel = parseInt(data["GUI_BAT_DATA_FUEL_CHARGE"]);

	    	self.service.getCharacteristic(GridPowerConsumption).setValue(self.GridPower, undefined, undefined);
	    	self.service.getCharacteristic(SolarPower).setValue(self.SolarPower, undefined, undefined);
            self.service.getCharacteristic(Characteristic.BatteryLevel).setValue(this.BatteryLevel, undefined, undefined);
		}
	);

	setInterval(function() { 
		getReq(
			function(data){

				self.GridPower = parseFloat(data["GUI_GRID_POW"] * -1);
		    	self.SolarPower = parseFloat(data["GUI_INVERTER_POWER"] / 1000 );

		    	self.service.updateCharacteristic(GridPowerConsumption, self.GridPower);
		    	self.service.updateCharacteristic(SolarPower, self.SolarPower);
                self.service.updateCharacteristic(Characteristic.BatteryLevel, self.BatteryLevel);
			}
	);
	}, this.refreshInterval);

}

SENEC.prototype.getGridPowerConsumption = function (callback) {
    callback(null, this.GridPower);
};

SENEC.prototype.getSolarPower = function (callback) {
    callback(null, this.SolarPower);
};

SENEC.prototype.getBatteryLevelCharacteristic = function (callback) {
    callback(null, this.BatteryLevel);
};

SENEC.prototype.getServices = function () {
    return [this.service];
};


