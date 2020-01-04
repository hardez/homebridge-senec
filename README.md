# homebridge-senec
ein Homebridge Plugin für SENEC Speicher.

Nach der Installation muss das Plugin als Accessories hinzugefügt werden

```
"accessories": [
        {
                "accessory": "SENEC",
                "name": "SENEC Home",
                "hostname": "IP oder Hostname(FQDN)"
        }
     ],
```

beim Hostname am besten den FQDN also inklusive der Domain.
z.B. speicher.fritz.box
