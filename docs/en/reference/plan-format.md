# Plan format

The plan is one JSON object stored in `.storage/fns_floorplan`. The editor reads and writes it; you can also read it with `fns_floorplan/plan/get` and replace it with `fns_floorplan/plan/save` ([Websocket API](websocket-api.md)).

- Coordinates are **metres**, `x` to the right, `z` down.
- `rev` is the revision counter, managed by the integration; do not set it by hand.
- Rooms and items of the first floor carry no `level`.

## Top level

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `rev` | integer | 0 | Revision, increased by every save |
| `levels` | list | one floor | Floors `[{id, name}]`. Without it the plan has one floor |
| `rooms` | list | `[]` | [Rooms](#rooms) |
| `openings` | list | `[]` | [Doors and windows](#openings) |
| `furniture` | list | `[]` | [Furniture and lights](#furniture) |
| `sensors` | list | `[]` | [Binary sensors](#sensors) |
| `devices` | list | `[]` | [Appliances](#devices) |
| `texts` | list | `[]` | [Text items](#texts) |
| `labels` | object | `{}` | `{room_id: [x, z]}`: manual position of a room label |
| `outdoor` | string | none | Id of the room whose temperature is shown as the outside temperature |
| `backgrounds` | object | `{}` | Tracing image per floor `{level_id: {url, left, top, width, opacity}}`, editor only |
| `vacuum` | object | none | Legacy: `entity`, `room_sensor`; converted to a dock by the editor |

## Levels { #levels }

| Key | Type | Description |
|-----|------|-------------|
| `id` | string | Id of the floor |
| `name` | string | Name shown in tabs |

Rooms, furniture, devices, sensors and texts take `level` with the floor id; without it they belong to the first floor. Openings follow their room.

## Rooms

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `id` | string | | Unique id |
| `name` | string | | Name |
| `points` | list of `[x, z]` | | Corners of the polygon, at least 3 |
| `level` | string | first floor | Floor id |
| `icon` | string | none | `mdi:` icon for the room panel header |
| `temperature` | entity | null | Temperature sensor |
| `humidity` | entity | null | Humidity sensor |
| `sheet_extra` | list of entities | `[]` | Extra entities for the room panel |
| `label_info` | list | `temperature`, `humidity` | What the label shows: `temperature`, `humidity`, entity ids or templates |
| `label_name` | boolean | `true` | `false` hides the name |
| `label_hidden` | boolean | `false` | `true` hides the label |
| `label_rotation` | number | 0 | Label rotation in degrees |
| `rules` | list | `[]` | [Rules](#rules) |

## Openings

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `id` | string | | Unique id |
| `room_id` | string | | The room whose wall carries it |
| `edge` | integer | | Index of the wall: from `points[edge]` to the next point |
| `offset` | number | | Centre of the opening, metres from the start of the wall |
| `width` | number | | Width in metres |
| `type` | `door` / `window` | | |
| `style` | string | normal | `passage` = only an opening (doors) |
| `hinge` | `left` / `right` | | Seen from inside the room |
| `swing` | `in` / `out` | | |
| `contact` | entity | null | Contact sensor. Without it a door is ajar at 45 degrees, a window closed |
| `lock` | entity | null | A `lock` entity shown at the door |
| `lock_size` | size | `s` | Size of the lock badge |
| `blind` | entity | null | A `cover` entity drawn along the window |
| `blind_side` | `in` / `out` | `in` | `out` = outside the wall |
| `blind_invert` | boolean | `false` | The cover reports 100 for closed |
| `tap_action`, `double_tap_action`, `hold_action` | action | contact details | [Actions](../editor/items.md#actions) |
| `sheet_hide` | boolean | `false` | Leave out of the room panel |

## Furniture

Furniture, lights and the robot dock share this list.

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `id` | string | | Unique id |
| `type` | string | | Furniture type ([list](../editor/items.md#furniture)), light type (`lamp_ceiling`, `lamp_pendant`, `lamp_panel`, `lamp_spot`, `lamp_table`, `lamp_wall`, `led_strip`), or `robot_vacuum` |
| `x`, `z` | number | | Centre in metres |
| `rotation` | number | 0 | Degrees; 0 = right, 90 = down |
| `w`, `d` | number | | Width and depth in metres |
| `level` | string | first floor | Floor id |
| `entity` | entity | null | Light entity (lights), media player (`tv_wall`), vacuum (dock) |
| `room_light` | number / false | share | Share of the room glow of a light, `1` = 100 %, `false` = almost none |
| `beam` | number | 40 | `lamp_spot`: cone width in degrees |
| `glow_side` | `1` / `-1` | all around | `led_strip`: shine to one side |
| `color` | colour | | Default colour of furniture (a rule wins) |
| `icon`, `size`, `layer` | | | Common item fields |
| `group` | string | | Group id (set by the **Group** button) |
| `room_sensor`, `room_map`, `battery` | | | Dock: see [Robot vacuum](../robot-vacuum.md) |
| `color_on`, `fx`, `progress`, `progress_total` | | | Dock: look while cleaning |
| `rules`, `tap_action`, `double_tap_action`, `hold_action`, `sheet_hide` | | | |

## Sensors

| Key | Type | Description |
|-----|------|-------------|
| `entity` | entity | A binary sensor; `motion`, `occupancy`, `presence` = ripples, `moisture` = red pulse |
| `x`, `z` | number | Position |
| `layer` | integer | Order among sensors in the editor |
| `level` | string | Floor id |

## Devices

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `id` | string | | Unique id |
| `kind` | string | | `fan`, `purifier`, `dishwasher`, `dryer`, `boiler`, `radiator`, `alarm`, `media`, `aquarium`, `camera`, `fridge`, `fireplace`, `lock`, `generic` |
| `name` | string | | Name (tooltip) |
| `entity` | entity | | The entity |
| `x`, `z` | number | | Position |
| `level` | string | first floor | Floor id |
| `active` | list / `{"above": n}` | by kind / domain | States that count as running |
| `text` | string | | Text under the icon, always; may be a template |
| `text_on` | string | | Text while running; may be a template |
| `label_position` | string | `bottom` | Label position: `bottom` (default), `top`, `left`, `right` |
| `label_vertical` | bool | `false` | Turns the label by 90 degrees (reads bottom to top) |
| `color`, `color_on` | colour | state colour | Idle / running colour |
| `fx` | string | by kind | Ring animation |
| `progress`, `progress_total` | entity / minutes | | Countdown source |
| `cover` | boolean | `true` | `media`: `false` turns off the cover art |
| `battery` | entity | device battery | Vacuum devices |
| `icon`, `size`, `layer` | | | Common item fields |
| `rules`, `tap_action`, `double_tap_action`, `hold_action`, `sheet_hide` | | | |

## Texts

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `id` | string | | Unique id |
| `entity` | entity | | Its state is shown |
| `text` | string | | Fixed text or a `{{ }}` template |
| `x`, `z` | number | | Position |
| `rotation` | number | 0 | Degrees |
| `size` | size | `m` | `xs` to `xxl` |
| `color` | colour | | Text colour |
| `background` | string | badge style | `none` = no background |
| `level` | string | first floor | Floor id |
| `rules`, actions | | | |

## Common item fields

| Key | Type | Description |
|-----|------|-------------|
| `icon` | string | Any `mdi:` icon; `none` for no icon |
| `size` | string | `xs`, `s`, `m`, `l`, `xl`, `xxl` |
| `layer` | integer | Stacking order within the kind |
| `sheet_hide` | boolean | Leave out of the room panel |
| `tap_action`, `double_tap_action`, `hold_action` | object | `action`: `toggle`, `more-info`, `perform-action` (`perform_action`, `data`), `navigate` (`navigation_path`), `url` (`url_path`), `none` |

## Rules

An ordered list on rooms, furniture, devices, texts and lights. Per output field the first matching rule wins; see [Rules](../editor/rules.md).

| Key | Type | Description |
|-----|------|-------------|
| `if` | list | Conditions (all must hold); a rule without `if` is the default |
| `color`, `glow`, `animate`, `wave`, `text`, `tint`, `opacity`, `hide`, `icon`, `background` | | Outputs |
| `fx`, `progress`, `progress_total` | | Ring animation and countdown |

A condition is one of:

| Form | Description |
|------|-------------|
| `{entity, attribute?, state}` | `state` may be a list |
| `{entity, attribute?, state_not}` | Negation, may be a list |
| `{entity, attribute?, above}` / `below` | Numeric comparison |
| `{template: "{{ ... }}"}` | Jinja, true for `true`, `on`, `yes`, `1`, non-zero numbers |
| `{any: [conditions]}` | OR |

## Complete example

A small flat with three rooms.

```json
{
  "levels": [{"id": "0", "name": "Ground floor"}],
  "outdoor": "balcony",
  "rooms": [
    {"id": "living_room", "name": "Living room", "icon": "mdi:sofa",
     "points": [[0, 0], [5, 0], [5, 4], [0, 4]],
     "temperature": "sensor.living_room_temperature", "humidity": "sensor.living_room_humidity",
     "sheet_extra": ["media_player.tv"]},
    {"id": "kitchen", "name": "Kitchen",
     "points": [[5, 0], [8, 0], [8, 4], [5, 4]],
     "temperature": "sensor.kitchen_temperature",
     "rules": [{"if": [{"entity": "binary_sensor.kitchen_leak", "state": "on"}], "tint": "red", "opacity": 0.3}]},
    {"id": "bedroom", "name": "Bedroom",
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
     "room_sensor": "sensor.robot_current_room", "room_map": {"Living room": "living_room"}}
  ],
  "sensors": [
    {"id": "s_motion", "entity": "binary_sensor.living_room_motion", "x": 4.6, "z": 0.4}
  ],
  "devices": [
    {"id": "dev_radiator", "kind": "radiator", "entity": "climate.living_room", "x": 4.7, "z": 2.0},
    {"id": "dev_dishwasher", "kind": "dishwasher", "name": "Dishwasher", "entity": "sensor.dishwasher_state",
     "x": 7.4, "z": 0.8, "active": ["run"], "text_on": "{{ states('sensor.dishwasher_remaining') }} min"}
  ],
  "texts": [
    {"id": "t_out", "text": "{{ states('sensor.outdoor_temperature') }} °C", "x": 6.5, "z": 5.0, "background": "none"}
  ],
  "labels": {"kitchen": [6.5, 3.4]}
}
```
