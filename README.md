# homebridge-senec
ein Homebridge Plugin für SENEC Speicher.

Das Spericher wird in der Home App als Outlet (Steckdose) angezeigt. In der Eve App sieht man zusätzliche Werte wie
 * Grid Power (Einspeisung / Netzbezug) => Positiver Wert = Einspeisung
 * House Power (aktueller Hausverbrauch)
 * Solar Power (aktuelle Stromerzeugung)
 * Battery Level (aktueller Füllstand des Speichers)

Nach der Installation muss das Plugin als Accessories hinzugefügt werden

```
"accessories": [
        {
                "accessory": "SENEC",
                "name": "SENEC Home",
                "hostname": "IP oder Hostname(FQDN)",
		"refreshInterval": (Zeit in Sekunden, Standard ist 60)
        }
     ],
```

beim Hostname am besten den FQDN also inklusive der Domain.
z.B. speicher.fritz.box
