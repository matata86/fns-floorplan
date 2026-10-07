# Room panel

Tap a room on the card and an **off-canvas panel** slides in from the right edge of the screen. It looks like an area dashboard of Home Assistant: the theme background, a header with the room icon, name, temperature and humidity, and tiles in two columns. Close it with the cross, ++esc++ or a click outside.

| Dark theme | Light theme |
|---|---|
| ![The panel of the living room: thermostat, lights, a window, a switch and the vacuum](../assets/screenshots/en/room-panel.png){ loading=lazy } | ![The same panel in the light theme](../assets/screenshots/en/room-panel-light.png){ loading=lazy } |

![The panel of the hall: lights, a camera, doors, an alarm and a lock](../assets/screenshots/en/room-panel-hall.png){ loading=lazy }

![Opening the panel, setting a light's brightness and closing it.](../assets/screenshots/gif/room-panel-open.gif){ loading=lazy }

*Opening the panel, setting a light's brightness and closing it.*

## Sections

The panel is built from Home Assistant's own tile cards, so it looks like the rest of your dashboards. A tile click opens the details, the icon toggles things that can be toggled.

| Section | What goes there |
|---------|-----------------|
| **Thermostat** | `climate` entities: target temperature minus and plus (sent after 0.7 s), current temperature, state, HVAC modes |
| **Lights** | Lights placed in the room, with brightness inline next to the name |
| **Cameras** | Cameras of the room, the live picture opens in their details |
| **Windows & doors** | Openings of the room with a contact |
| **Switches** | `switch` and `input_boolean` |
| **Devices** | Appliances (a lock gets lock commands, a vacuum gets vacuum commands) |
| **Sensors** | Sensors of the room |
| **Other** | Everything else |

Only items that are **placed in the room** and the entities in `sheet_extra` are shown. Home Assistant areas are not added automatically. The robot vacuum appears in the room with its dock.

## Choosing what shows

- `sheet_extra`: a list of extra entities of a room (a field in the room's form). `light`, `switch`, `fan`, `input_boolean`, `humidifier` and `siren` get a switch, other entities a row with the state.
- `sheet_hide: true` on any item (light, appliance, window, door, lock, robot) leaves it out.
- The room `icon` appears in the header.

```yaml
rooms:
  - id: living_room
    name: Living room
    icon: mdi:sofa
    temperature: sensor.living_room_temperature
    sheet_extra:
      - climate.living_room
      - camera.living_room
      - switch.tv_plug
```

Back to [Card](card.md).
