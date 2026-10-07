# Raum-Panel

Tippe auf der Karte auf einen Raum, und von der rechten Bildschirmkante fährt ein **seitliches Panel** ein. Es sieht aus wie ein Bereichs-Dashboard von Home Assistant: der Designhintergrund, eine Kopfzeile mit Raumsymbol, Name, Temperatur und Luftfeuchtigkeit und Home-Assistant-Karten in zwei Spalten. Schließe es mit dem Kreuz, ++esc++ oder einem Klick außerhalb.

| Dunkles Design | Helles Design |
|---|---|
| ![Das Panel des Wohnzimmers: Thermostat, Lichter, ein Fenster, ein Schalter und der Saugroboter](../assets/screenshots/de/room-panel.png){ loading=lazy } | ![Dasselbe Panel im hellen Design](../assets/screenshots/de/room-panel-light.png){ loading=lazy } |

![Das Panel des Flurs: Lichter, eine Kamera, Türen, ein Alarm und ein Schloss](../assets/screenshots/de/room-panel-hall.png){ loading=lazy }

![Das Panel öffnen, die Helligkeit eines Lichts einstellen und das Panel schließen.](../assets/screenshots/gif/room-panel-open.gif){ loading=lazy }

*Das Panel öffnen, die Helligkeit eines Lichts einstellen und das Panel schließen.*

## Abschnitte

Das Panel ist aus den eigenen Karten von Home Assistant gebaut, jede wie auf einem Dashboard platziert, sodass auch dein Design sie gestaltet (einschließlich card-mod- / UIX-Designs). Jeder Abschnitt hat eine Überschriftenkarte mit Symbol im Untertitel-Stil der Abschnittsüberschriften von Dashboards. Ein Tippen auf eine Karte öffnet die Details, das Symbol schaltet um, was sich umschalten lässt. Thermostate, Lichter mit Steuerung, Kameras und Rollläden nehmen die volle Breite ein, der Rest sitzt zu zweit in einer Reihe.

| Abschnitt | Was dort steht |
|-----------|----------------|
| **Thermostat** | `climate`-Entitäten als Kachel mit der Regelung der Zieltemperatur |
| **Lichter** | Im Raum platzierte Lichter. Mit installierten [Mushroom](https://github.com/piitaya/lovelace-mushroom)-Karten: eine Mushroom-Lichtkarte mit Helligkeitsbalken in der Farbe des Lichts und Schaltflächen für Farbtemperatur und Farbe (wenn das Licht sie hat); ein Tippen auf das Symbol schaltet das Licht. Ohne Mushroom: eine Kachel mit dem Helligkeitsbalken neben dem Namen |
| **Kameras** | Kameras des Raums als Bild über die ganze Breite (ein Schnappschuss, alle paar Sekunden erneuert); ein Tippen öffnet das Livebild in den Details |
| **Fenster und Türen** | Öffnungen des Raums mit Kontakt und ihre Rollläden (auch aus den weiteren Entitäten) mit Öffnen / Stopp / Schließen neben dem Namen und dem Positionsregler darunter; der Kontakt zeigt, wann er sich zuletzt geändert hat (bei einem geschlossenen: wann er zuletzt offen war), ein offener seinen Zustand und seit wann |
| **Schalter** | `switch` und `input_boolean` |
| **Medien** | Mediaplayer und Fernbedienungen (Fernseher, Lautsprecher, Player); ein Player mit einstellbarer Lautstärke erhält einen Lautstärkeregler neben dem Namen; die Kachel nimmt die volle Breite ein |
| **Roboter** | Saugroboter mit Start / Stopp / zur Station, Mähroboter; die Kachel nimmt die volle Breite ein, die Schaltflächen stehen neben dem Namen |
| **Geräte** | Haushaltsgeräte (ein Schloss erhält Schlossbefehle) |
| **Sensoren** | Sensoren des Raums, auch die darin platzierten PIR- und Wasserleck-Sensoren (mit Zustand und Zeit der letzten Änderung) |
| **Sonstige** | Alles andere |

Angezeigt werden nur Elemente, die **im Raum platziert** sind, und die Entitäten in `sheet_extra`. Bereiche von Home Assistant werden nicht automatisch hinzugefügt. Der Saugroboter erscheint in dem Raum, in dem seine Station steht.

## Auswählen, was angezeigt wird

- `sheet_extra`: zusätzliche Entitäten eines Raums (ein Feld im Formular des Raums, eine pro Zeile, ein vorangestelltes `- ` ist erlaubt; **Entität hinzufügen** unter dem Feld wählt eine aus). Ein Eintrag kann auch eine Vorlage sein, die Entitäts-IDs ausgibt, siehe [Räume](editor/rooms.md). Jede Entität erhält die Karte ihres Abschnitts oben (ein Licht seine Lichtkarte, eine Kamera ihr Bild, ein Rollladen die Rollladensteuerung, der Rest eine Kachel).
- `sheet_hide: true` bei einem beliebigen Element (Licht, Gerät, Fenster, Tür, Schloss, Roboter) lässt es weg.
- Das Raumsymbol `icon` erscheint in der Kopfzeile.

```yaml
rooms:
  - id: living_room
    name: Wohnzimmer
    icon: mdi:sofa
    temperature: sensor.living_room_temperature
    sheet_extra:
      - climate.living_room
      - camera.living_room
      - switch.tv_plug
```

Zurück zur [Karte](card.md).
