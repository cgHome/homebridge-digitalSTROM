# homebridge-digitalSTROM - Development-Nodes

Node: Just for internal use..

## dSS - Verbesserungsvorschläge

* testrack2.aizo.com
  * Täglicher oder Wöchentlicher Restore der Konfiguration

* dSS-Configurator
  * Logout-App

## Offene Punkte/Fragen

* Best practice für dSS-Installation/Configuration
* Error: dSS - dssRequest Error: connect EHOSTUNREACH 192.168.188.34:8080: /circuit/getConsumption?dsuid=3035...
  * dss -> /event/subscribe?subscriptionID no response
  * Log-File (dSS - dssRequest (403) not logged in)

### Scene

* Named-Scene
  * Was sind Named-Scenes

### TerminalBlock's (Device)

* Generell
  * changeNameEvent
  * Add & Remove Devices
  * Devices den Zonen zuweisen
  * Kann bei den einzelnen Devices (zb. Licht) der aktuelle Stromverbrauch ausgelesen werden

* Shade (GR-) Grey
  * Check getTarget[Horizontal/Vertical]TiltAngle -> shadeOpeningAngleOutside/shadeOpeningAngleIndoor funktioniert nicht
    * "(500) invalid channel name: 'shadeOpeningAngleOutside'"
    * "(500) invalid channel name: 'shadeOpeningAngleIndoor'"
  * HowTo setTarget[Horizontal/Vertical]TiltAngle -> ??

* Climate (BL-) Blue
  * Funktionen
  * Event
  * Sensor-Werte

* Security (RT-) Red
  * Funktionen
  * Event
  * Sensor-Werte

* AccessDevice (GN-) Green
  * Was passiert wenn man den Taster drückt (ON/OFF)
  * Kann man die Lautstärke des Klingeltons einstellen
  * Gibt es eine Variante mit Gegesprechanlage und/oder Video

* Joker (SW-) Black
  * Was sind Jocker TerminalBlock's
  * Funktionen
  * Event
  * Sensor-Werte

### Sensor

* Was für Sensoren gibt es ?
* Wie kann ich Sensor-Werte (iSens200, Präsenzmelder, etc) auslesen ?
* Sensor-Comando für Blinken dsMETER ?

## Test