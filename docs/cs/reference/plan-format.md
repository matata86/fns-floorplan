# Formát plánu

Půdorys je jeden objekt JSON uložený v `.storage/fns_floorplan`. Editor ho čte a zapisuje; můžeš ho také přečíst příkazem `fns_floorplan/plan/get` a nahradit příkazem `fns_floorplan/plan/save` ([Websocket API](websocket-api.md)).

- Souřadnice jsou v **metrech**, `x` doprava, `z` dolů.
- `rev` je počítadlo revizí, spravuje ho integrace; nenastavuj ho ručně.
- Místnosti a prvky prvního patra nemají `level`.

## Nejvyšší úroveň

| Klíč | Typ | Výchozí | Popis |
|------|-----|---------|-------|
| `rev` | integer | 0 | Revize, zvyšuje se každým uložením |
| `levels` | list | jedno patro | Patra `[{id, name}]`. Bez něj má půdorys jedno patro |
| `rooms` | list | `[]` | [Místnosti](#rooms) |
| `openings` | list | `[]` | [Dveře a okna](#openings) |
| `furniture` | list | `[]` | [Nábytek a světla](#furniture) |
| `sensors` | list | `[]` | [Binární senzory](#sensors) |
| `devices` | list | `[]` | [Spotřebiče](#devices) |
| `texts` | list | `[]` | [Textové položky](#texts) |
| `labels` | object | `{}` | `{room_id: [x, z]}`: ruční poloha jmenovky místnosti |
| `outdoor` | string | žádné | Id místnosti, jejíž teplota se zobrazuje jako venkovní teplota |
| `backgrounds` | object | `{}` | Podkladový obrázek pro každé patro `{level_id: {url, left, top, width, opacity}}`, jen v editoru |
| `vacuum` | object | žádné | Zastaralé: `entity`, `room_sensor`; editor ho převede na dok |

## Patra { #levels }

| Klíč | Typ | Popis |
|------|-----|-------|
| `id` | string | Id patra |
| `name` | string | Název zobrazený na záložkách |

Místnosti, nábytek, zařízení, senzory a texty berou `level` s id patra; bez něj patří k prvnímu patru. Dveře a okna následují svou místnost.

## Místnosti { #rooms }

| Klíč | Typ | Výchozí | Popis |
|------|-----|---------|-------|
| `id` | string | | Jedinečné id |
| `name` | string | | Název |
| `points` | list of `[x, z]` | | Rohy mnohoúhelníku, nejméně 3 |
| `level` | string | první patro | Id patra |
| `icon` | string | žádná | Ikona `mdi:` pro hlavičku panelu místnosti |
| `temperature` | entity | null | Senzor teploty |
| `humidity` | entity | null | Senzor vlhkosti |
| `sheet_extra` | list of entities | `[]` | Další entity pro panel místnosti |
| `label_info` | list | `temperature`, `humidity` | Co jmenovka ukazuje: `temperature`, `humidity`, id entit nebo šablony |
| `label_name` | boolean | `true` | `false` skryje název |
| `label_hidden` | boolean | `false` | `true` skryje jmenovku |
| `label_rotation` | number | 0 | Otočení jmenovky ve stupních |
| `rules` | list | `[]` | [Pravidla](#rules) |

## Otvory (dveře a okna) { #openings }

| Klíč | Typ | Výchozí | Popis |
|------|-----|---------|-------|
| `id` | string | | Jedinečné id |
| `room_id` | string | | Místnost, na jejíž stěně otvor je |
| `edge` | integer | | Index stěny: od `points[edge]` k dalšímu bodu |
| `offset` | number | | Střed otvoru, metry od začátku stěny |
| `width` | number | | Šířka v metrech |
| `type` | `door` / `window` | | |
| `style` | string | běžné | `passage` = jen otvor (dveře) |
| `hinge` | `left` / `right` | | Při pohledu z místnosti |
| `swing` | `in` / `out` | | |
| `contact` | entity | null | Kontaktní senzor. Bez něj jsou dveře pootevřené o 45 stupňů, okno zavřené |
| `lock` | entity | null | Entita `lock` zobrazená u dveří |
| `lock_size` | size | `s` | Velikost odznaku zámku |
| `blind` | entity | null | Entita `cover` vykreslená podél okna |
| `blind_side` | `in` / `out` | `in` | `out` = vně zdi |
| `blind_invert` | boolean | `false` | Cover hlásí pro zavřeno 100 |
| `tap_action`, `double_tap_action`, `hold_action` | action | detail kontaktu | [Akce](../editor/items.md#actions) |
| `sheet_hide` | boolean | `false` | Vynechat z panelu místnosti |

## Nábytek { #furniture }

Nábytek, světla a dok robota sdílejí tento seznam.

| Klíč | Typ | Výchozí | Popis |
|------|-----|---------|-------|
| `id` | string | | Jedinečné id |
| `type` | string | | Typ nábytku ([seznam](../editor/items.md#furniture)), typ světla (`lamp_ceiling`, `lamp_pendant`, `lamp_panel`, `lamp_spot`, `lamp_table`, `lamp_wall`, `led_strip`), nebo `robot_vacuum` |
| `x`, `z` | number | | Střed v metrech |
| `rotation` | number | 0 | Stupně; 0 = doprava, 90 = dolů |
| `w`, `d` | number | | Šířka a hloubka v metrech |
| `level` | string | první patro | Id patra |
| `entity` | entity | null | Entita světla (světla), přehrávač (`tv_wall`), vysavač (dok) |
| `room_light` | number / false | podíl | Podíl záře světla v místnosti, `1` = 100 %, `false` = téměř nic |
| `beam` | number | 40 | `lamp_spot`: šířka kužele ve stupních |
| `glow_side` | `1` / `-1` | všemi směry | `led_strip`: svítí na jednu stranu |
| `color` | colour | | Výchozí barva nábytku (pravidlo má přednost) |
| `icon`, `size`, `layer` | | | Společná pole položek |
| `group` | string | | Id skupiny (nastavuje tlačítko **Seskupit**) |
| `room_sensor`, `room_map`, `battery` | | | Dok: viz [Robotický vysavač](../robot-vacuum.md) |
| `color_on`, `fx`, `progress`, `progress_total` | | | Dok: vzhled při úklidu |
| `rules`, `tap_action`, `double_tap_action`, `hold_action`, `sheet_hide` | | | |

## Senzory { #sensors }

| Klíč | Typ | Popis |
|------|-----|-------|
| `entity` | entity | Binární senzor; `motion`, `occupancy`, `presence` = vlnky, `moisture` = červený puls |
| `x`, `z` | number | Pozice |
| `layer` | integer | Pořadí mezi senzory v editoru |
| `level` | string | Id patra |

## Zařízení { #devices }

| Klíč | Typ | Výchozí | Popis |
|------|-----|---------|-------|
| `id` | string | | Jedinečné id |
| `kind` | string | | `fan`, `purifier`, `dishwasher`, `dryer`, `boiler`, `radiator`, `alarm`, `media`, `aquarium`, `camera`, `fridge`, `fireplace`, `lock`, `generic` |
| `name` | string | | Název (tooltip) |
| `entity` | entity | | Entita |
| `x`, `z` | number | | Pozice |
| `level` | string | první patro | Id patra |
| `active` | list / `{"above": n}` | podle druhu / domény | Stavy, které se počítají jako „běží“ |
| `text` | string | | Text pod ikonou, vždy; může být šablona |
| `text_on` | string | | Text, když běží; může být šablona |
| `color`, `color_on` | colour | barva stavu | Barva v klidu / za běhu |
| `fx` | string | podle druhu | Animace kruhu |
| `progress`, `progress_total` | entity / minutes | | Zdroj odpočtu |
| `cover` | boolean | `true` | `media`: `false` vypne obal alba |
| `battery` | entity | baterie zařízení | Zařízení typu vysavač |
| `icon`, `size`, `layer` | | | Společná pole položek |
| `rules`, `tap_action`, `double_tap_action`, `hold_action`, `sheet_hide` | | | |

## Texty { #texts }

| Klíč | Typ | Výchozí | Popis |
|------|-----|---------|-------|
| `id` | string | | Jedinečné id |
| `entity` | entity | | Zobrazí se její stav |
| `text` | string | | Pevný text nebo šablona `{{ }}` |
| `x`, `z` | number | | Pozice |
| `rotation` | number | 0 | Stupně |
| `size` | size | `m` | `xs` až `xxl` |
| `color` | colour | | Barva textu |
| `background` | string | styl odznaku | `none` = bez pozadí |
| `level` | string | první patro | Id patra |
| `rules`, actions | | | |

## Společná pole položek

| Klíč | Typ | Popis |
|------|-----|-------|
| `icon` | string | Libovolná ikona `mdi:`; `none` = bez ikony |
| `size` | string | `xs`, `s`, `m`, `l`, `xl`, `xxl` |
| `layer` | integer | Pořadí překrytí v rámci druhu |
| `sheet_hide` | boolean | Vynechat z panelu místnosti |
| `tap_action`, `double_tap_action`, `hold_action` | object | `action`: `toggle`, `more-info`, `perform-action` (`perform_action`, `data`), `navigate` (`navigation_path`), `url` (`url_path`), `none` |

## Pravidla { #rules }

Uspořádaný seznam u místností, nábytku, zařízení, textů a světel. U každého výstupního pole vyhrává první odpovídající pravidlo; viz [Pravidla](../editor/rules.md).

| Klíč | Typ | Popis |
|------|-----|-------|
| `if` | list | Podmínky (musí platit všechny); pravidlo bez `if` je výchozí |
| `color`, `glow`, `animate`, `wave`, `text`, `tint`, `opacity`, `hide`, `icon`, `background` | | Výstupy |
| `fx`, `progress`, `progress_total` | | Animace kruhu a odpočet |

Podmínka má jednu z těchto podob:

| Podoba | Popis |
|--------|-------|
| `{entity, attribute?, state}` | `state` může být seznam |
| `{entity, attribute?, state_not}` | Negace, může být seznam |
| `{entity, attribute?, above}` / `below` | Číselné porovnání |
| `{template: "{{ ... }}"}` | Jinja, platí pro `true`, `on`, `yes`, `1`, nenulová čísla |
| `{any: [conditions]}` | OR |

## Úplný příklad

Malý byt se třemi místnostmi.

```json
{
  "levels": [{"id": "0", "name": "Přízemí"}],
  "outdoor": "balcony",
  "rooms": [
    {"id": "living_room", "name": "Obývací pokoj", "icon": "mdi:sofa",
     "points": [[0, 0], [5, 0], [5, 4], [0, 4]],
     "temperature": "sensor.living_room_temperature", "humidity": "sensor.living_room_humidity",
     "sheet_extra": ["media_player.tv"]},
    {"id": "kitchen", "name": "Kuchyň",
     "points": [[5, 0], [8, 0], [8, 4], [5, 4]],
     "temperature": "sensor.kitchen_temperature",
     "rules": [{"if": [{"entity": "binary_sensor.kitchen_leak", "state": "on"}], "tint": "red", "opacity": 0.3}]},
    {"id": "bedroom", "name": "Ložnice",
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
     "room_sensor": "sensor.robot_current_room", "room_map": {"Obývací pokoj": "living_room"}}
  ],
  "sensors": [
    {"id": "s_motion", "entity": "binary_sensor.living_room_motion", "x": 4.6, "z": 0.4}
  ],
  "devices": [
    {"id": "dev_radiator", "kind": "radiator", "entity": "climate.living_room", "x": 4.7, "z": 2.0},
    {"id": "dev_dishwasher", "kind": "dishwasher", "name": "Myčka", "entity": "sensor.dishwasher_state",
     "x": 7.4, "z": 0.8, "active": ["run"], "text_on": "{{ states('sensor.dishwasher_remaining') }} min"}
  ],
  "texts": [
    {"id": "t_out", "text": "{{ states('sensor.outdoor_temperature') }} °C", "x": 6.5, "z": 5.0, "background": "none"}
  ],
  "labels": {"kitchen": [6.5, 3.4]}
}
```
