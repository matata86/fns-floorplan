# Planformat

Der Plan ist ein JSON-Objekt, das in `.storage/fns_floorplan` gespeichert wird. Der Editor liest und schreibt es; du kannst es auch mit `fns_floorplan/plan/get` lesen und mit `fns_floorplan/plan/save` ersetzen ([Websocket-API](websocket-api.md)).

- Koordinaten sind in **Metern**, `x` nach rechts, `z` nach unten.
- `rev` ist der Revisionszähler, von der Integration verwaltet; setze ihn nicht von Hand.
- Räume und Elemente der ersten Etage tragen kein `level`.

## Oberste Ebene

| Schlüssel | Typ | Standard | Beschreibung |
|-----------|-----|----------|--------------|
| `rev` | integer | 0 | Revision, wird bei jedem Speichern erhöht |
| `levels` | list | eine Etage | Etagen `[{id, name}]`. Ohne sie hat der Plan eine Etage |
| `rooms` | list | `[]` | [Räume](#rooms) |
| `openings` | list | `[]` | [Türen und Fenster](#openings) |
| `furniture` | list | `[]` | [Möbel und Lichter](#furniture) |
| `sensors` | list | `[]` | [Binärsensoren](#sensors) |
| `devices` | list | `[]` | [Geräte](#devices) |
| `texts` | list | `[]` | [Textelemente](#texts) |
| `labels` | object | `{}` | `{room_id: [x, z]}`: manuelle Position einer Raumbeschriftung |
| `outdoor` | string | keiner | ID des Raums, dessen Temperatur als Außentemperatur angezeigt wird |
| `backgrounds` | object | `{}` | Vorlagenbild pro Etage `{level_id: {url, left, top, width, opacity}}`, nur im Editor |
| `vacuum` | object | keiner | Veraltet: `entity`, `room_sensor`; wird vom Editor in eine Station umgewandelt |
| `style` | object | `{}` | Farben des Plans aus dem Tab Aussehen des Editors, siehe [Aussehen](../editor/look.md) |

## Stil { #style }

Farben des Plans aus dem Tab [Aussehen](../editor/look.md) des Editors. Jeder Schlüssel ist optional und enthält `"#rrggbb"`; ein nicht gesetzter Schlüssel behält seinen Standard.

| Schlüssel | Was er einfärbt | Standard |
|---|---|---|
| `wall_day` / `wall_night` | Wände (Tag / Nacht) | Primärfarbe des Designs |
| `floor_day` / `floor_night` | Boden (Tag / Nacht) | weiß / dunkelblau |
| `text_day` / `text_night` | Raumbeschriftungen und Texte (Tag / Nacht) | dunkel / hell |
| `accent` | Akzent von Schaltflächen und Hervorhebungen | Primärfarbe des Designs |
| `lamp` | Ein Licht, das keine eigene Farbe meldet | die Designfarbe eines aktiven Lichts, aufgehellt |
| `open` | Offene Tür oder Fenster, entsperrtes Schloss, ausstehender Alarm | die Designfarbe eines aktiven Binärsensors, sonst Orange |
| `alarm` | Ausgelöster Alarm | die Designfarbe eines ausgelösten Alarms, sonst Rot |
| `blind` | Rollläden | die Designfarbe einer geschlossenen Abdeckung, sonst der Akzent |
| `cold` / `hot` | Kalte und warme Temperatur auf Raumbeschriftungen | blau / orange |

## Etagen { #levels }

| Schlüssel | Typ | Beschreibung |
|-----------|-----|--------------|
| `id` | string | ID der Etage |
| `name` | string | In den Tabs angezeigter Name |

Räume, Möbel, Geräte, Sensoren und Texte nehmen `level` mit der Etagen-ID; ohne sie gehören sie zur ersten Etage. Öffnungen folgen ihrem Raum.

## Räume { #rooms }

| Schlüssel | Typ | Standard | Beschreibung |
|-----------|-----|----------|--------------|
| `id` | string | | Eindeutige ID |
| `name` | string | | Name |
| `points` | list of `[x, z]` | | Ecken des Polygons, mindestens 3 |
| `level` | string | erste Etage | Etagen-ID |
| `icon` | string | keines | `mdi:`-Symbol für die Kopfzeile des Raum-Panels |
| `temperature` | entity | null | Temperatursensor |
| `humidity` | entity | null | Feuchtigkeitssensor |
| `sheet_extra` | list of entities | `[]` | Zusätzliche Entitäten für das Raum-Panel; ein Eintrag kann eine Vorlage sein, die Entitäts-IDs ausgibt ([Räume](../editor/rooms.md)) |
| `label_info` | list | `temperature`, `humidity` | Was die Beschriftung zeigt: `temperature`, `humidity`, Entitäts-IDs oder Vorlagen |
| `label_name` | boolean | `true` | `false` blendet den Namen aus |
| `label_hidden` | boolean | `false` | `true` blendet die Beschriftung aus |
| `label_rotation` | number | 0 | Drehung der Beschriftung in Grad |
| `label_size` | string | `m` | Größe der Beschriftung: `xs`, `s`, `m`, `l`, `xl`, `xxl` |
| `rules` | list | `[]` | [Regeln](#rules) |

## Öffnungen (Türen und Fenster) { #openings }

| Schlüssel | Typ | Standard | Beschreibung |
|-----------|-----|----------|--------------|
| `id` | string | | Eindeutige ID |
| `room_id` | string | | Der Raum, an dessen Wand sie sitzt |
| `edge` | integer | | Index der Wand: von `points[edge]` zum nächsten Punkt |
| `offset` | number | | Mitte der Öffnung, Meter ab Wandanfang |
| `width` | number | | Breite in Metern |
| `type` | `door` / `window` | | |
| `style` | string | normal | `passage` = nur eine Öffnung (Türen) |
| `hinge` | `left` / `right` | | Vom Raum aus gesehen |
| `swing` | `in` / `out` | | |
| `contact` | entity | null | Kontaktsensor. Ohne ihn ist eine Tür um 45 Grad angelehnt, ein Fenster geschlossen |
| `lock` | entity | null | Eine `lock`-Entität, die an der Tür angezeigt wird |
| `lock_size` | size | `s` | Größe des Schloss-Badges |
| `blind` | entity | null | Eine `cover`-Entität, die am Fenster entlang gezeichnet wird |
| `blind_side` | `in` / `out` | `in` | `out` = außerhalb der Wand |
| `blind_invert` | boolean | `false` | Die Entität meldet für geschlossen 100 |
| `tap_action`, `double_tap_action`, `hold_action` | action | Kontaktdetails | [Aktionen](../editor/items.md#actions) |
| `sheet_hide` | boolean | `false` | Im Raum-Panel weglassen |

## Möbel { #furniture }

Möbel, Lichter und die Station des Roboters teilen sich diese Liste.

| Schlüssel | Typ | Standard | Beschreibung |
|-----------|-----|----------|--------------|
| `id` | string | | Eindeutige ID |
| `type` | string | | Möbeltyp ([Liste](../editor/items.md#furniture)), Lichttyp (`lamp_ceiling`, `lamp_pendant`, `lamp_panel`, `lamp_spot`, `lamp_table`, `lamp_wall`, `led_strip`) oder `robot_vacuum` |
| `x`, `z` | number | | Mitte in Metern |
| `rotation` | number | 0 | Grad; 0 = rechts, 90 = unten |
| `w`, `d` | number | | Breite und Tiefe in Metern |
| `level` | string | erste Etage | Etagen-ID |
| `entity` | entity | null | Lichtentität (Lichter), Mediaplayer (`tv_wall`), Staubsauger (Station) |
| `room_light` | number / false | Anteil | Anteil am Raumleuchten eines Lichts, `1` = 100 %, `false` = fast nichts |
| `beam` | number | 40 | `lamp_spot`: Kegelbreite in Grad |
| `glow_side` | `1` / `-1` | rundum | `led_strip`: strahlt zu einer Seite |
| `color` | colour | | Standardfarbe von Möbeln (eine Regel hat Vorrang) |
| `icon`, `size`, `layer` | | | Gemeinsame Elementfelder |
| `group` | string | | Gruppen-ID (gesetzt durch die Schaltfläche **Gruppieren**) |
| `room_sensor`, `room_map`, `battery` | | | Station: siehe [Saugroboter](../robot-vacuum.md) |
| `color_on`, `fx`, `progress`, `progress_total` | | | Station: Aussehen beim Saugen |
| `rules`, `tap_action`, `double_tap_action`, `hold_action`, `sheet_hide` | | | |

## Sensoren { #sensors }

| Schlüssel | Typ | Beschreibung |
|-----------|-----|--------------|
| `entity` | entity | Ein Binärsensor; `motion`, `occupancy`, `presence` = Wellen, `moisture` = roter Puls |
| `x`, `z` | number | Position |
| `layer` | integer | Reihenfolge unter Sensoren und Möbeln im Editor |
| `level` | string | Etagen-ID |

## Geräte { #devices }

| Schlüssel | Typ | Standard | Beschreibung |
|-----------|-----|----------|--------------|
| `id` | string | | Eindeutige ID |
| `kind` | string | | `fan`, `purifier`, `dishwasher`, `dryer`, `boiler`, `radiator`, `alarm`, `media`, `aquarium`, `camera`, `fridge`, `fireplace`, `lock`, `generic` |
| `name` | string | | Name (Tooltip) |
| `entity` | entity | | Die Entität |
| `x`, `z` | number | | Position |
| `level` | string | erste Etage | Etagen-ID |
| `active` | list / `{"above": n}` | nach Art / Domain | Zustände, die als „läuft“ zählen |
| `text` | string | | Text unter dem Symbol, immer; kann eine Vorlage sein |
| `text_on` | string | | Text, solange es läuft; kann eine Vorlage sein |
| `label_position` | string | `bottom` | Position der Beschriftung: `bottom` (Standard), `top`, `left`, `right` |
| `label_vertical` | bool | `false` | Dreht die Beschriftung um 90 Grad (von unten nach oben lesbar) |
| `color`, `color_on` | colour | Zustandsfarbe | Farbe im Ruhezustand / beim Laufen |
| `fx` | string | nach Art | Ringanimation |
| `progress`, `progress_total` | entity / minutes | | Quelle des Countdowns |
| `cover` | boolean | `true` | `media`: `false` schaltet das Cover aus |
| `battery` | entity | Gerätebatterie | Staubsaugergeräte |
| `icon`, `size`, `layer` | | | Gemeinsame Elementfelder |
| `rules`, `tap_action`, `double_tap_action`, `hold_action`, `sheet_hide` | | | |

## Texte { #texts }

| Schlüssel | Typ | Standard | Beschreibung |
|-----------|-----|----------|--------------|
| `id` | string | | Eindeutige ID |
| `entity` | entity | | Ihr Zustand wird angezeigt |
| `text` | string | | Fester Text oder eine `{{ }}`-Vorlage |
| `x`, `z` | number | | Position |
| `rotation` | number | 0 | Grad |
| `size` | size | `m` | `xs` bis `xxl` |
| `color` | colour | | Textfarbe |
| `background` | string | Badge-Stil | `none` = kein Hintergrund |
| `level` | string | erste Etage | Etagen-ID |
| `rules`, actions | | | |

## Gemeinsame Elementfelder

| Schlüssel | Typ | Beschreibung |
|-----------|-----|--------------|
| `icon` | string | Jedes `mdi:`-Symbol; `none` für kein Symbol |
| `size` | string | `xs`, `s`, `m`, `l`, `xl`, `xxl` |
| `layer` | integer | Stapelreihenfolge innerhalb der Art |
| `sheet_hide` | boolean | Im Raum-Panel weglassen |
| `tap_action`, `double_tap_action`, `hold_action` | object | `action`: `toggle`, `more-info`, `perform-action` (`perform_action`, `data`), `navigate` (`navigation_path`), `url` (`url_path`), `none` |

## Regeln { #rules }

Eine geordnete Liste bei Räumen, Möbeln, Geräten, Texten und Lichtern. Pro Ausgabefeld gewinnt die erste passende Regel; siehe [Regeln](../editor/rules.md).

| Schlüssel | Typ | Beschreibung |
|-----------|-----|--------------|
| `if` | list | Bedingungen (alle müssen zutreffen); eine Regel ohne `if` ist der Standard |
| `color`, `glow`, `animate`, `wave`, `text`, `tint`, `opacity`, `hide`, `icon`, `background` | | Ausgaben |
| `fx`, `progress`, `progress_total` | | Ringanimation und Countdown |

Eine Bedingung hat eine dieser Formen:

| Form | Beschreibung |
|------|--------------|
| `{entity, attribute?, state}` | `state` darf eine Liste sein |
| `{entity, attribute?, state_not}` | Negation, darf eine Liste sein |
| `{entity, attribute?, above}` / `below` | Numerischer Vergleich |
| `{template: "{{ ... }}"}` | Jinja, wahr bei `true`, `on`, `yes`, `1`, Zahlen ungleich null |
| `{any: [conditions]}` | ODER |

## Vollständiges Beispiel

Eine kleine Wohnung mit drei Räumen.

```json
{
  "levels": [{"id": "0", "name": "Erdgeschoss"}],
  "outdoor": "balcony",
  "rooms": [
    {"id": "living_room", "name": "Wohnzimmer", "icon": "mdi:sofa",
     "points": [[0, 0], [5, 0], [5, 4], [0, 4]],
     "temperature": "sensor.living_room_temperature", "humidity": "sensor.living_room_humidity",
     "sheet_extra": ["media_player.tv"]},
    {"id": "kitchen", "name": "Küche",
     "points": [[5, 0], [8, 0], [8, 4], [5, 4]],
     "temperature": "sensor.kitchen_temperature",
     "rules": [{"if": [{"entity": "binary_sensor.kitchen_leak", "state": "on"}], "tint": "red", "opacity": 0.3}]},
    {"id": "bedroom", "name": "Schlafzimmer",
     "points": [[0, 4], [5, 4], [5, 7], [0, 7]],
     "temperature": "sensor.bedroom_temperature"}
  ],
  "openings": [
    {"id": "d_front", "room_id": "living_room", "edge": 3, "offset": 2.0, "width": 0.9, "type": "door",
     "hinge": "left", "swing": "in", "contact": "binary_sensor.front_door", "lock": "lock.front_door"},
    {"id": "d_kitchen", "room_id": "living_room", "edge": 1, "offset": 2.0, "width": 0.8, "type": "door",
     "style": "passage"},
    {"id": "d_bedroom", "room_id": "living_room", "edge": 2, "offset": 2.5, "width": 0.8, "type": "door",
     "hinge": "right", "swing": "in"},
    {"id": "w_living", "room_id": "living_room", "edge": 0, "offset": 2.5, "width": 1.6, "type": "window",
     "contact": "binary_sensor.living_room_window", "blind": "cover.living_room_blind"}
  ],
  "furniture": [
    {"id": "f_sofa", "type": "sofa", "x": 2.5, "z": 3.1, "rotation": 0, "w": 2.0, "d": 0.9},
    {"id": "f_tv", "type": "tv_wall", "x": 2.5, "z": 0.1, "rotation": 0, "w": 1.4, "d": 0.1, "entity": "media_player.tv"},
    {"id": "f_bed", "type": "bed", "x": 2.5, "z": 5.6, "rotation": 0, "w": 1.8, "d": 2.0},
    {"id": "l_living", "type": "lamp_ceiling", "x": 2.5, "z": 2.0, "entity": "light.living_room", "room_light": 1},
    {"id": "l_strip", "type": "led_strip", "x": 2.5, "z": 3.9, "w": 3.0, "d": 0.05, "entity": "light.living_room_strip"},
    {"id": "dock", "type": "robot_vacuum", "x": 0.4, "z": 3.4, "entity": "vacuum.robot",
     "room_sensor": "sensor.robot_current_room", "room_map": {"Wohnzimmer": "living_room"}}
  ],
  "sensors": [
    {"id": "s_motion", "entity": "binary_sensor.living_room_motion", "x": 4.6, "z": 0.4}
  ],
  "devices": [
    {"id": "dev_radiator", "kind": "radiator", "entity": "climate.living_room", "x": 4.7, "z": 2.0},
    {"id": "dev_dishwasher", "kind": "dishwasher", "name": "Geschirrspüler", "entity": "sensor.dishwasher_state",
     "x": 7.4, "z": 0.8, "active": ["run"], "text_on": "{{ states('sensor.dishwasher_remaining') }} min"}
  ],
  "texts": [
    {"id": "t_out", "text": "{{ states('sensor.outdoor_temperature') }} °C", "x": 6.5, "z": 5.0, "background": "none"}
  ],
  "labels": {"kitchen": [6.5, 3.4]}
}
```
