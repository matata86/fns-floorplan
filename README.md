<p align="center"><img src="https://raw.githubusercontent.com/matata86/fns-floorplan/master/custom_components/fns_floorplan/brand/icon.png" alt="FNS Floorplan logo" width="96"></p>

# FNS Floorplan

[![HACS Custom](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://hacs.xyz)
[![GitHub release](https://img.shields.io/github/v/release/matata86/fns-floorplan)](https://github.com/matata86/fns-floorplan/releases)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/matata86/fns-floorplan/blob/master/LICENSE)
[![Home Assistant](https://img.shields.io/badge/Home%20Assistant-2025.1%2B-blue.svg)](https://www.home-assistant.io)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-support-ff5e5b?logo=ko-fi&logoColor=white)](https://ko-fi.com/matata86)
[![PayPal](https://img.shields.io/badge/PayPal-donate-00457C?logo=paypal&logoColor=white)](https://paypal.me/matata86)
[![Bitcoin](https://img.shields.io/badge/Bitcoin-donate-F7931A?logo=bitcoin&logoColor=white)](#support)

[![Open your Home Assistant instance and open the repository inside HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=matata86&repository=fns-floorplan&category=integration)
[![Open your Home Assistant instance and start setting up FNS Floorplan](https://my.home-assistant.io/badges/config_flow_start.svg)](https://my.home-assistant.io/redirect/config_flow_start/?domain=fns_floorplan)

An animated 2D floor plan for Home Assistant that shows the live state of your home: lights glowing in their colour, doors and windows swinging open, motion ripples, water leaks, a robot vacuum driving through the room it reports, appliances with animated icons, an alarm that tints the whole flat when triggered, media players with the playing title, cameras, free text items and room climate. You draw the plan in a built-in editor, no YAML needed.

> Inspired by [NeonPlan 3D](https://github.com/Mastershort/neonplan3d), a 3D floor plan card for Home Assistant. FNS Floorplan takes the idea to an animated 2D plan with its own editor, and a NeonPlan 3D building can be imported (see [Quick start](https://matata86.github.io/fns-floorplan/quick-start/#coming-from-neonplan-3d)).

![An animated floor plan with lights, doors and a robot vacuum](https://raw.githubusercontent.com/matata86/fns-floorplan/master/docs/assets/screenshots/en/card-overview.png)

**[Live demo](https://matata86.github.io/fns-floorplan/demo/)** (the real card with fake states, no Home Assistant needed)

**Documentation:** [English](https://matata86.github.io/fns-floorplan/) | [Česky](https://matata86.github.io/fns-floorplan/cs/) | [Deutsch](https://matata86.github.io/fns-floorplan/de/) | [Polski](https://matata86.github.io/fns-floorplan/pl/)

## See it move

![A door opening on the plan](https://raw.githubusercontent.com/matata86/fns-floorplan/master/docs/assets/screenshots/gif/door-opening.gif)
![Lights switching on in their colour](https://raw.githubusercontent.com/matata86/fns-floorplan/master/docs/assets/screenshots/gif/lights-on.gif)
![Dragging a wall in the editor](https://raw.githubusercontent.com/matata86/fns-floorplan/master/docs/assets/screenshots/gif/drag-wall.gif)

## Features

**Card**
- Lights follow their colour or colour temperature, brightness scales the glow; LED strips glow in the real colour of the light.
- Doors and windows with a contact sensor swing open and pulse for a few seconds after opening; blinds and locks are drawn at the opening.
- Motion, occupancy and presence sensors send out ripples, moisture sensors pulse a water leak chip.
- Appliances with animated icons: fan, air purifier, dishwasher, dryer, boiler, radiator, aquarium, fireplace, fridge, camera, lock, alarm, media player, and "other device" that behaves by the domain of its entity.
- Several floors with floor tabs, day / night look (by the sun or by the Home Assistant theme), automatic rotation on narrow screens.
- Temperature and humidity overlays tint the rooms; a day replay bar replays the last 24 hours from the Home Assistant history.

**Room panel**
- Tap a room: an off-canvas panel slides in and looks like an area dashboard with a thermostat, lights with brightness, cameras, windows and doors, switches, devices, sensors and other entities of that room.

**Editor** (sidebar panel "Floor plan")
- Draw rooms by dragging corners and whole walls, with snapping to neighbours, shared walls, wall length labels and 15 degree angle snap.
- Add, slide and configure doors and windows; drag them to another room's wall.
- Place lights, LED strips, appliances, sensors, text items and over 30 furniture types; resize and rotate with handles.
- Multi-select, copy / cut / paste, groups, layers, undo / redo, snap guides, tracing image under each floor.
- Edit anything as a form or as YAML; native Home Assistant fields and pickers.

**Rules**
- Conditional colours, glow, icons, text, hiding, ring animations and countdowns on any item, by entity states or by Jinja templates.
- Optional AI Task assistant that drafts rules from a sentence.

**Robot vacuum**
- The dock item drives through the room reported by the vacuum, through doors, tours the whole floor when the room is unknown, shows the battery as a ring.

**History and checks**
- The last 20 saved plans can be restored; a check lists missing and unavailable entities.

## Installation

1. In HACS open the three-dot menu, **Custom repositories**, add `https://github.com/matata86/fns-floorplan` with category **Integration**, then install **FNS Floorplan**.
2. Restart Home Assistant.
3. **Settings, Devices & services, Add integration, FNS Floorplan.**
4. Optional: click **Configure** on the integration to show or hide the editor in the sidebar. The editor is always reachable at `/fns-floorplan`.

Requires Home Assistant 2025.1.0 or newer. Manual installation: copy `custom_components/fns_floorplan` into your `config/custom_components` folder. Details: [Installation](https://matata86.github.io/fns-floorplan/installation/).

## Quick start

1. Open **Floor plan** in the sidebar (admins only).
2. Switch to **Rooms**, add a room and drag its corners to the shape you need; add doors and windows.
3. Switch back to the items mode, **Add** lights, appliances, sensors and furniture, assign an entity to each.
4. **Save**.
5. Add the card to a dashboard:

```yaml
type: custom:fns-floorplan-card
mode: auto
rotate: auto
```

Step by step: [Quick start](https://matata86.github.io/fns-floorplan/quick-start/).

## Card options

| Option | Values | Default | Description |
|--------|--------|---------|-------------|
| `mode` | `auto`, `ha`, `day`, `night` | `auto` | `auto` follows `sun.sun`, `ha` follows the Home Assistant light / dark theme |
| `rotate` | `auto`, `true`, `false` | `auto` | `auto` turns a wide plan by 90 degrees on a narrow card (under 600 px) |
| `level` | floor id | first floor | Default floor of a plan with more floors |
| `tools` | `true`, `false` | `true` | `false` hides the temperature / humidity / replay buttons |

More: [Card](https://matata86.github.io/fns-floorplan/card/).

## The plan

The plan lives in the integration's storage (`.storage/fns_floorplan`) and is edited in the panel. Coordinates are metres, `x` to the right and `z` down.

| Key | Content |
|-----|---------|
| `rooms` | `id`, `name`, `points`, `temperature`, `humidity`, `sheet_extra` (more entities for the room panel); label options `label_info`, `label_name: false`, `label_hidden: true`, `label_rotation` |
| `openings` | `id`, `room_id`, `edge`, `offset`, `width`, `type` (door / window), `style` (`passage` = opening only), `hinge`, `swing`, `contact`, `blind`, `blind_side`, `blind_invert`, `lock` |
| `furniture` | `id`, `type`, `x`, `z`, `rotation`, `w`, `d`; lights (`lamp_*`, `led_strip`) carry `entity` and optional `room_light`; `lamp_spot` has `beam`; `tv_wall` with a media player; `robot_vacuum` marks the dock |
| `sensors` | binary sensors with `entity`, `x`, `z` |
| `devices` | `kind`, `name`, `entity`, `x`, `z`, `active`, `text`, `text_on`, `color`, `color_on` |
| `texts` | `entity` or `text` (plain or a `{{ }}` template), `x`, `z`, `rotation`, `size`, `color`, `background` |
| `rules` | on every item: conditional colours, hiding, icons, ring animations |
| `labels` | `{room_id: [x, z]}` to place a room label by hand |
| `outdoor` | room id whose temperature shows as the outside temperature |
| `levels` | floors `[{id, name}]`; rooms and items carry `level` (none = the first floor) |

Optional on any item: `icon` (any `mdi:` icon or `none`), `size` (`xs`, `s`, `m`, `l`, `xl`, `xxl`), `layer`, `sheet_hide`, and `tap_action`, `double_tap_action`, `hold_action` in Home Assistant's action format.

Full reference with types and defaults: [Plan format](https://matata86.github.io/fns-floorplan/reference/plan-format/).

## Websocket API

All commands are Home Assistant websocket commands of the integration.

| Command | Admin | Purpose |
|---------|-------|---------|
| `fns_floorplan/plan/get` | no | Returns the stored plan (`{}` before the first save) |
| `fns_floorplan/plan/save` `{plan, rev?}` | yes | Replaces the whole plan, returns `{ok, rev}` |
| `fns_floorplan/plan/subscribe` | no | Sends the plan now and after every save |
| `fns_floorplan/history/list` | yes | Lists the last 20 saved revisions |
| `fns_floorplan/history/get` `{rev}` | yes | Returns one stored revision |
| `fns_floorplan/yaml/parse` `{text}` | yes | YAML to data |
| `fns_floorplan/yaml/dump` `{data}` | yes | Data to YAML |

With `rev`, a save only succeeds when it matches the stored revision, otherwise the error `conflict` is returned; every save increments `rev`. Details and examples: [Websocket API](https://matata86.github.io/fns-floorplan/reference/websocket-api/).

## Support

Questions, bugs and feature requests: [GitHub issues](https://github.com/matata86/fns-floorplan/issues). The [FAQ](https://matata86.github.io/fns-floorplan/faq/) covers the common problems.

If FNS Floorplan saves you time, you can support its development:

- **Ko-fi:** https://ko-fi.com/matata86
- **PayPal:** https://paypal.me/matata86
- **Bitcoin:** `bc1qhjwt8xxmuym0xsd50yfpvjph00386uz73gqwlc`

## License

[MIT](https://github.com/matata86/fns-floorplan/blob/master/LICENSE)
