const inherits = require("util").inherits,
var Service, Characteristic, Accessory

module.exports = function(homebridge) {
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;
	Accessory = homebridge.hap.Accessory;
	homebridge.registerAccessory("homebridge-senec", "SENEC", SENEC);
};

function SENEC(log, config) {
	this.log = log;
	this.hostname = config["hostname"];
    this.refreshInterval = (config['refreshInterval'] * 60000) || 60000;
	this.debug = config["debug"] || false;

//--------------------

	Characteristic.CustomWatts = function() {
		Characteristic.call(this, 'GUI_BAT_DATA_POWER', 'E863F10D-079E-48FF-8F27-9C2605A29F52');
		this.setProps({
			format: Characteristic.Formats.FLOAT,
			unit: 'W',
			minValue: -32767,
			maxValue: 32767,
			minStep: 0.1,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
		});
		this.value = this.getDefaultValue();
	};
	inherits(Characteristic.CustomWatts, Characteristic);
	Characteristic.CustomWatts.UUID = 'E863F10D-079E-48FF-8F27-9C2605A29F52';

//--------------------
// Hier muss eine andere Characteristic genutz werden, die Prozent unterstützt

/*	
	Characteristic.CustomWatts = function() {
		Characteristic.call(this, 'GUI_BAT_DATA_FUEL_CHARGE', 'E863F10D-079E-48FF-8F27-9C2605A29F52');
		this.setProps({
			format: Characteristic.Formats.FLOAT,
			unit: 'W',
			minValue: 0,
			maxValue: 65535,
			minStep: 0.1,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
		});
		this.value = this.getDefaultValue();
	};
	inherits(Characteristic.CustomWatts, Characteristic);
	Characteristic.CustomWatts.UUID = 'E863F10D-079E-48FF-8F27-9C2605A29F52';
*/

//--------------------

	Characteristic.CustomWatts = function() {
		Characteristic.call(this, 'GUI_INVERTER_POWER', 'E863F10D-079E-48FF-8F27-9C2605A29F52');
		this.setProps({
			format: Characteristic.Formats.FLOAT,
			unit: 'W',
			minValue: 0,
			maxValue: 65535,
			minStep: 0.1,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
		});
		this.value = this.getDefaultValue();
	};
	inherits(Characteristic.CustomWatts, Characteristic);
	Characteristic.CustomWatts.UUID = 'E863F10D-079E-48FF-8F27-9C2605A29F52';

//--------------------

	Characteristic.CustomWatts = function() {
		Characteristic.call(this, 'GUI_HOUSE_POW', 'E863F10D-079E-48FF-8F27-9C2605A29F52');
		this.setProps({
			format: Characteristic.Formats.FLOAT,
			unit: 'W',
			minValue: -32767,
			maxValue: 32767,
			minStep: 0.1,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
		});
		this.value = this.getDefaultValue();
	};
	inherits(Characteristic.CustomWatts, Characteristic);
	Characteristic.CustomWatts.UUID = 'E863F10D-079E-48FF-8F27-9C2605A29F52';

//--------------------

	Characteristic.CustomWatts = function() {
		Characteristic.call(this, 'GUI_GRID_POW', 'E863F10D-079E-48FF-8F27-9C2605A29F52');
		this.setProps({
			format: Characteristic.Formats.FLOAT,
			unit: 'W',
			minValue: -32767,
			maxValue: 32767,
			minStep: 0.1,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
		});
		this.value = this.getDefaultValue();
	};
	inherits(Characteristic.CustomWatts, Characteristic);
	Characteristic.CustomWatts.UUID = 'E863F10D-079E-48FF-8F27-9C2605A29F52';

//--------------------
}

SENEC.prototype = {

	identify: function(callback) {
		this.log("identify");
		callback();
	},

	getServices: function() {
		this.SENEC = new Service.Outlet(this.name);

		this.SENEC.getCharacteristic(Characteristic.On)
		.on('get',this._getValue.bind(this, "On"))
		.on('set', this._setValue.bind(this, "On"));

		this.SENEC.getCharacteristic(Characteristic.OutletInUse)
		.on('get', this._getValue.bind(this, "OutletInUse"));

		this.SENEC.addCharacteristic(Characteristic.CustomWatts);
		this.SENEC.getCharacteristic(Characteristic.CustomWatts)
		.on('get', this._getValue.bind(this, "GUI_BAT_DATA_POWER"));

		this.SENEC.addCharacteristic(Characteristic.CustomWatts);
		this.SENEC.getCharacteristic(Characteristic.CustomWatts)
		.on('get', this._getValue.bind(this, "GUI_INVERTER_POWER"));

		this.SENEC.addCharacteristic(Characteristic.CustomWatts);
		this.SENEC.getCharacteristic(Characteristic.CustomWatts)
		.on('get', this._getValue.bind(this, "GUI_HOUSE_POW"));

		this.SENEC.addCharacteristic(Characteristic.CustomWatts);
		this.SENEC.getCharacteristic(Characteristic.CustomWatts)
		.on('get', this._getValue.bind(this, "GUI_GRID_POW"));

        // Obtain the values
        setInterval(function() {
            try {
            	// Hier muss die SENEC Connection eingebaut werden.


            	/*
            	//Hier werden die Werte zugewiesen, dass muss in den SENEC Code integriert werden

    			client.readHoldingRegisters(30775, 10, function(err, data) {
                    // Check if the value is unrealistic (the inverter is not generating)
                    if(data.buffer.readUInt32BE() > 999999) {
                        this.SENEC.getCharacteristic(Characteristic.On).updateValue(0);
                        this.SENEC.getCharacteristic(Characteristic.OutletInUse).updateValue(0);
                    }
                    else {
        				this.SENEC.getCharacteristic(Characteristic.CustomWatts).updateValue(data.buffer.readUInt32BE());

        				this.loggingService.addEntry({time: moment().unix(), power: data.buffer.readUInt32BE()});

        				if(data.buffer.readUInt32BE() > 0) {
        					this.SENEC.getCharacteristic(Characteristic.On).updateValue(1);
        					this.SENEC.getCharacteristic(Characteristic.OutletInUse).updateValue(1);
        				}
        				else {
        					this.SENEC.getCharacteristic(Characteristic.On).updateValue(0);
        					this.SENEC.getCharacteristic(Characteristic.OutletInUse).updateValue(0);
        				}

                        client.readHoldingRegisters(30977, 10, function(err, data) {this.SENEC.getCharacteristic(Characteristic.CustomAmperes).updateValue(data.buffer.readUInt32BE() / 1000);}.bind(this));
                        client.readHoldingRegisters(30783, 10, function(err, data) {this.SENEC.getCharacteristic(Characteristic.CustomVolts).updateValue(data.buffer.readUInt32BE() / 100);}.bind(this));
            			client.readHoldingRegisters(30529, 10, function(err, data) {this.SENEC.getCharacteristic(Characteristic.CustomKilowattHours).updateValue(data.buffer.readUInt32BE() / 1000);}.bind(this));
                    }
    			}.bind(this));
    			*/
            } catch(err) {
            	this.log("Failed to connect to the Host", err);
            }
		}.bind(this), this.refreshInterval);

		return [this.SENEC];
	}

	let informationService = new Service.AccessoryInformation();
    informationService
      .setCharacteristic(Characteristic.Manufacturer, "SENEC")
      .setCharacteristic(Characteristic.Model, "SENEC Home")

	_getValue: function(CharacteristicName, callback) {
		if(this.debug) {this.log("GET", CharacteristicName);}
		callback(null);
	},

	_setValue: function(CharacteristicName, value, callback) {
		// This does nothing if the user tries to turn it on / off as we cannot action anything on the device
		callback(null, true);
	}

};