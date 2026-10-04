# FNS Floorplan

An animated 2D floor plan card for Home Assistant that shows the live state of the home: lights glowing in their colour, doors and windows swinging open, motion ripples, water leaks, a robot vacuum driving through the room it reports, appliances with animated icons (fan, air purifier, dishwasher, dryer, boiler) and room climate.

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

## The plan
The plan lives in the integration's storage and is saved over the websocket API:

```json
{"type": "fns_floorplan/plan/save", "plan": { ... }}
```

Coordinates are metres, `x` to the right and `z` down.

| Key | Content |
|-----|---------|
| `rooms` | `id`, `name`, `points`, `temperature`, `humidity` |
| `openings` | `id`, `room_id`, `edge`, `offset`, `width`, `type` (door/window), `style` (`passage` = opening only), `hinge` (left/right), `swing` (in/out), `contact` |
| `furniture` | `id`, `type`, `x`, `z`, `rotation`, `w`, `d`; lights (`lamp_*`, `led_strip`) carry `entity` and optional `room_light`; `tv_wall` with a media player; `robot_vacuum` marks the dock |
| `sensors` | binary sensors with `entity`, `x`, `z` — motion/occupancy/presence ripple, moisture pulses red |
| `vacuum` | `entity`, `room_sensor` (a sensor whose state is the room name) |
| `devices` | `kind` (fan, purifier, dishwasher, dryer, boiler), `name`, `entity`, `x`, `z`, `active` (list of states or `{"above": n}`), `info`, `prefix`, `text` |
| `rules` | on devices, rooms and furniture: conditional colours, see below |
| `labels` | `{room_id: [x, z]}` to place a room label by hand |
| `outdoor` | room id whose temperature shows as the outside temperature |

Device kinds: `fan`, `purifier`, `dishwasher`, `dryer`, `boiler`, `radiator` (heat waves rise while it animates).

### Rules
`rules` is an ordered list of `{if: [conditions], color, glow, animate, wave, text, tint, opacity}`. For each field the first rule whose conditions all hold and which sets that field wins; a rule without `if` is the default.

A condition is `{entity, attribute?, state | state_not | above | below}` (`state` may be a list), or `{any: [conditions]}` for OR. Colours: `red`, `orange`, `yellow`, `green`, `blue`, `purple`, `pink`, `white`, `black` or any CSS colour.

```json
{"kind": "radiator", "entity": "climate.living_room", "x": 9.3, "z": 2.1, "rules": [
  {"if": [{"entity": "switch.boost_living_room", "state": "on"}], "color": "yellow"},
  {"if": [{"any": [{"entity": "binary_sensor.window", "state": "on"}, {"entity": "binary_sensor.door", "state": "on"}]}], "color": "blue"},
  {"if": [{"entity": "switch.valve_living_room", "state": "on"}], "color": "orange", "animate": true, "wave": "red"},
  {"animate": false}
]}
```

On a device `color` tints the icon, `animate` overrides `active`, `wave` colours the radiator's waves and `text` replaces the text under the icon. On a room `tint` shades the floor (`opacity`, default 0.14). On furniture `color` tints the outline. `glow` adds a glow everywhere.

`tools/import_neonplan.py` converts a [NeonPlan 3D](https://github.com/Mastershort/neonplan3d) building into this format.

## Interaction
- Lights follow their colour temperature or colour; brightness scales the glow.
- Doors and windows with a contact swing open; they pulse for a few seconds after opening.
- Tap a light to toggle it, hold it for its details.
- Tap an appliance or the vacuum for its details.
- Tap a room for a panel with its lights, windows, doors and appliances.
