# FNS Floorplan

An animated 2D floor plan card for Home Assistant that shows the live state of the home: lights glowing in their colour, doors and windows swinging open, motion ripples, water leaks, a robot vacuum driving through the room it reports, appliances with animated icons (fan, air purifier, dishwasher, dryer, boiler, radiator, aquarium, fireplace), an alarm panel that tints the whole flat when triggered, media players with the playing title, cameras, free text items and room climate.

## Installation
1. Add this repository to HACS as a custom repository (category *Integration*) and install **FNS Floorplan**.
2. Restart Home Assistant.
3. Settings → Devices & services → Add integration → **FNS Floorplan**.
4. Save a plan (see below) and add the card:

```yaml
type: custom:fns-floorplan-card
mode: auto         # auto (follows sun.sun) | day | night
rotate: auto       # auto | true | false — narrow cards turn a wide plan by 90°
```

## Editing
The integration adds a **Půdorys** (floor plan) panel to the sidebar for admins. Drag lights, LED strips, appliances, sensors, text items, furniture and room labels; select one to set its entity, icon, size, stacking order, tap / double tap / hold actions and rules (a form, or YAML); resize and rotate furniture with handles; add, duplicate or delete items and save. Fixtures of one light in one room are edited as one item. In the **Místnosti** (rooms) mode drag room corners (they snap to neighbouring corners), add or remove corners, move whole rooms, and add, slide and configure windows and doors (flip the hinge side and the swing direction right on the plan).

Ctrl+click selects several items to drag, nudge, copy (Ctrl+C / Ctrl+V) or delete together; **Seskupit** stores a `group` so the items are always picked together. The editor opens from the sidebar (optional, see the integration's options) or from the integration's **Configure** button.

The editor exchanges YAML with Home Assistant over `fns_floorplan/yaml/parse` and `fns_floorplan/yaml/dump`.

## The plan
The plan lives in the integration's storage and is saved over the websocket API:

```json
{"type": "fns_floorplan/plan/save", "plan": { ... }, "rev": 3}
```

With `rev` the save only succeeds when it matches the stored revision (otherwise error `conflict`); every save increments it.

Coordinates are metres, `x` to the right and `z` down.

| Key | Content |
|-----|---------|
| `rooms` | `id`, `name`, `points`, `temperature`, `humidity`, `sheet_extra` (more entities for the room panel); label options `label_info` (list of `temperature`, `humidity`, entity ids or templates), `label_name: false`, `label_hidden: true`, `label_rotation` |
| `openings` | `id`, `room_id`, `edge`, `offset`, `width`, `type` (door/window), `style` (`passage` = opening only), `hinge` (left/right), `swing` (in/out), `contact`, `blind` (a `cover` entity drawn as a bar along the window, as long as the blind is closed; `blind_side: out` puts it outside the wall, `blind_invert` for blinds that report 100 as closed), `lock` (a lock entity shown at the door) |
| `furniture` | `id`, `type`, `x`, `z`, `rotation`, `w`, `d`; lights (`lamp_*`, `led_strip`) carry `entity` and optional `room_light` (share of the room glow, 1 = 100 %); `lamp_spot` shines a cone towards `rotation` (0 = right, 90 = down) `beam` degrees wide (default 40); `tv_wall` with a media player; `robot_vacuum` marks the dock |
| `sensors` | binary sensors with `entity`, `x`, `z` — motion/occupancy/presence ripple, moisture pulses red |
| `vacuum` | `entity`, `room_sensor` (a sensor whose state is the room name) |
| `devices` | `kind`, `name`, `entity`, `x`, `z`, `active` (list of states or `{"above": n}`), `info` (text while running), `prefix`, `text` (always), `text_on` (while running), `color` / `color_on` (idle / running; without them the entity's state colour from the Home Assistant theme) |
| `texts` | `entity` or `text` (plain or a `{{ }}` template), `x`, `z`, `rotation`, `size`, `color`, `background` (`none` for no background) |
| `rules` | on every item: conditional colours, hiding and icons, see below |
| `labels` | `{room_id: [x, z]}` to place a room label by hand |
| `outdoor` | room id whose temperature shows as the outside temperature |
| `levels` | floors `[{id, name}]`; rooms and items carry `level` (none = the first floor), openings follow their room |

Device kinds: `fan`, `purifier`, `dishwasher`, `dryer`, `boiler`, `radiator` (heat waves rise while it animates), `alarm` (shield by state; the flat pulses red when triggered and orange while arming), `media` (TV, speaker or Kodi icon, sound waves and the title while playing, the cover art inside the badge while playing or paused; `cover: false` turns it off), `aquarium`, `camera`, `fridge`, `fireplace`, `generic` (the entity's own icon).

Optional on any item: `icon` (any `mdi:` icon), `size` (`xs`, `s`, `m`, `l`, `xl`, `xxl`), `layer` (stacking order within its kind), `sheet_hide` (leave it out of the room panel), and `tap_action`, `double_tap_action`, `hold_action` in Home Assistant's format (`toggle`, `more-info`, `perform-action` with `perform_action` and `data`, `navigate`, `url`, `none`). Doors and windows take actions too (default: the contact's details). Doors without a contact are drawn ajar at 45°.

### Rules
`rules` is an ordered list of `{if: [conditions], color, glow, animate, wave, text, tint, opacity, hide, icon, background}`. For each field the first rule whose conditions all hold and which sets that field wins; a rule without `if` is the default.

A condition is `{entity, attribute?, state | state_not | above | below}` (`state` may be a list), `{template: "{{ … }}"}` (a Jinja template rendered live by Home Assistant), or `{any: [conditions]}` for OR. A `text` containing `{{ }}` is a template as well. Colours: `red`, `orange`, `yellow`, `green`, `blue`, `purple`, `pink`, `white`, `black` or any CSS colour.

```json
{"kind": "radiator", "entity": "climate.living_room", "x": 9.3, "z": 2.1, "rules": [
  {"if": [{"entity": "switch.boost_living_room", "state": "on"}], "color": "yellow"},
  {"if": [{"any": [{"entity": "binary_sensor.window", "state": "on"}, {"entity": "binary_sensor.door", "state": "on"}]}], "color": "blue"},
  {"if": [{"entity": "switch.valve_living_room", "state": "on"}], "color": "orange", "animate": true, "wave": "red"},
  {"animate": false}
]}
```

On a device `color` tints the icon, `animate` overrides `active`, `wave` colours the radiator's waves and `text` replaces the text under the icon. On a room `tint` shades the floor (`opacity`, default 0.14). On furniture `color` tints the outline. `glow` adds a glow everywhere, `hide` hides the item (a room's label), `icon` swaps its icon.

`tools/import_neonplan.py` converts a [NeonPlan 3D](https://github.com/Mastershort/neonplan3d) building into this format.

## Interaction
- Lights follow their colour temperature or colour; brightness scales the glow.
- Doors and windows with a contact swing open; they pulse for a few seconds after opening.
- Tap a light to toggle it, hold it for its details (unless other actions are set).
- Tap an appliance, the vacuum, a door or a window for its details.
- LED strips glow in the light's real colour.
- Tap a room for a panel with its lights, windows, doors and appliances.
- With more floors the card shows floor tabs; the card option `level` picks the default floor.
- Card option `mode`: `auto` (by the sun), `day`, `night` or `ha` (follows the Home Assistant light/dark theme).
