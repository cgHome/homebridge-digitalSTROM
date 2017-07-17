# homebridge-digitalSTROM

[Homebridge](https://github.com/nfarina/homebridge) platform plugin for the [digitalSTROM Smart Home System](https://www.digitalstrom.com/)

**Notes:**

* Tested and works on [cFlat - Smart Home Gateway](https://github.com/cgHome/cflat)
  cFlat is an docker integration platform on RPI for easy integration of various devices into the Apple Home Kit universe.

* homebridge-digitalSTROM 0.0.x is a preliminary release intended primarily for developers and advanced users only

## Supports the following types

### digitalSTROM-Scenes

| Scene | Description | Note
|:----:|--------|--------------|
|Apartment|Represents a digitalSTROM Apartment-Scene|
|Zone|Represents a digitalSTROM Zone-Scene|
|Group|Represents a digitalSTROM Group-Scene|
|Named|Represents a digitalSTROM Named-Scene|(todo)|
|Device|Represents a digitalSTROM Device-Scene|

---

### digitalSTROM-Devices

| Group | Color | HW-Info | Output-Mode | ModeID | Class |
|-----|:----:|--------|--------|--------|--------|
|-            |(all)    |-TK| Push button interface | - | nop |
|Light        |Yellow   |GE-KL200| Switched | - | LightDevice |
|             |         |GE-*| Switched | 16 | LightDevice |
|             |         |    | Dimmed   | (rest) | LightDevice |
|Shade        |Grey     |GR-KL200| Blinds (Rolladen) | | ShadeDevice (Horizontal noSet)|
|             |         |GR-KL210| Curtains (Markise) | | ShadeDevice |
|             |         |GR-KL220| Shutter (Jalousie) | | ShadeDevice (Vertical noSet)|
|Climate      |Blue     |BL-*|?|?|todo|
|             |         |dS-iSens200|?|?|todo|
|Security     |Red      |RT-* |?|?|todo|
|Access       |Green    |GN-* |?|?|todo|

---

### digitalSTROM-Sensors

|Name|Class|Note
|---|---|---|
|dSMeter|EnergyMeter|only Eve-App|

---

## Installation

1. Install homebridge using: npm install -g homebridge
1. Install this plugin using: npm install -g homebridge-digitalSTROM
1. Update your configuration file. See [config.json](config.json) in this repository for a sample.

## Configuration

Configuration sample:

```json
    "platforms": [
        {
            "platform":     "digitalSTROM",
            "name":         "digitalSTROM",
            "url":          "https://dss.local:8080",
            "caFile":       "cert/cert.pem",
            "appToken":     "myapptoken",
            "lang":         "de",
            "refreshEvent": "60",
            "exclude": []
        }
    ],
```

### i18n Translation

[File-Documentation](https://github.com/mashpie/i18n-node#storage)

File: $HOME/data/locales/XX.json

### Obtaining appToken

```sh
https://dss.local:8080/json/system/requestApplicationToken?applicationName=cFlat
```

### Create Certs

```sh
openssl s_client -connect {HOSTNAME}:{PORT} -showcerts </dev/null 2>/dev/null|openssl x509 -outform PEM >cert.pem

openssl s_client -connect testrack2.aizo.com:58080 -showcerts </dev/null 2>/dev/null|openssl x509 -outform PEM >cert.pem
```

## Siri digitalSTROM Commands (Deutsch)

| Command | Sample | Note |
| :--- | :--- | :---|
| Typen |||
| Schalte mein/e Lampen im [Raum] ein/aus | Schalte meine Lampen im Wohnzimmer ein | Homekit Raum |
| Scene |||
| Schalte mein/e [dSS-Scene-Name] ein | Schalte Wohnung Abwesend ein ||
| Aktiviere [Scene-Name]| Aktiviere Abwesend| Homekit Szene |
| Light-Device |||
| Schalte [dSS-Device-Name] ein/aus | Schalte Wohnzimmer-Sofalampe ein/aus ||
| Dimme mein/e [dSS-Device-Name] auf XX % | Dimme meine Wohnzimmer-Sofalampe auf 50%||
| Shade-Device |||
| Öffne [dSS-Device-Name] | Öffne den den Schlafzimmer-Rolladen ||
| Setze [dSS-Device-Name] auf xx % | Setze den Schlafzimmer-Rolladen auf 50%||

* [Siri Commands - Apple](https://support.apple.com/de-ch/HT204893)
* [Siri Commands - Eve](https://blog.elgato.com/de/hey-siri-whats-new/)
* [Siri Commands - Sample](http://www.macerkopf.de/2015/06/25/homekit-apple-nennt-siri-kommandos/)

## Roadmap / ToDo

* Work with self signed cert (tempfix see dss.js)
* Enhance multi-language support.

Following things are to be developed next:

* Add/Remove device to Homekit-Room
* Change Device-Name
* NamedScenes
* Climate (blue) devices
* Joker (black) devices
* Access (green) devices
* digitalSTROM-Sensor

## Copyright and license

Copyright 2017, 2017 cgHome under [MIT License](LICENSE)