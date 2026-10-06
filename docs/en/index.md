# FNS Floorplan

FNS Floorplan turns your Home Assistant dashboard into a living floor plan. Lights glow in their real colour, doors and windows swing open, motion sensors send out ripples, a robot vacuum drives through the room it reports and a washing machine shows how long it still runs. You draw the plan in a built-in editor, with no YAML and no image editing.

!!! info "Inspired by NeonPlan 3D"
    FNS Floorplan was inspired by [NeonPlan 3D](https://github.com/Mastershort/neonplan3d), a 3D floor plan card for Home Assistant. It takes the idea to an animated 2D plan with its own editor. [Coming from NeonPlan 3D?](quick-start.md#coming-from-neonplan-3d)

![An animated floor plan card showing a flat with lights on, an open door and a robot vacuum](../assets/screenshots/en/card-overview.png){ loading=lazy }

| Dark theme | Light theme |
|---|---|
| ![The card in the dark theme](../assets/screenshots/en/card-dark.png){ loading=lazy } | ![The card in the light theme](../assets/screenshots/en/card-light.png){ loading=lazy } |

It consists of two parts that are installed together as one HACS integration:

- **the card** `custom:fns-floorplan-card`, which you put on any dashboard,
- **the editor**, a sidebar panel called **Floor plan** (URL `/fns-floorplan`, admins only) where you draw rooms, place items and set up rules.

[Try the live demo :material-open-in-new:](https://matata86.github.io/fns-floorplan/demo/){ .md-button .md-button--primary }
[Install it](installation.md){ .md-button }

## What it can do

<div class="grid cards" markdown>

- :material-vector-polygon: **Draw the plan yourself**

    Drag room corners and whole walls, snap to neighbours, add doors and windows. See [Rooms](editor/rooms.md) and [Doors and windows](editor/openings.md).

- :material-lightbulb-on: **Live lights and devices**

    Lights, LED strips, appliances, sensors and furniture follow the state of their entities. See [Items](editor/items.md).

- :material-script-text: **Rules**

    Conditional colours, icons, texts, rings and countdowns by entity states or Jinja templates. See [Rules](editor/rules.md).

- :material-robot-vacuum: **Robot vacuum**

    The robot drives through the room it reports, through the doors. See [Robot vacuum](robot-vacuum.md).

- :material-gesture-tap: **Room panel**

    Tap a room and a panel with its thermostat, lights, cameras and devices slides in. See [Room panel](room-panel.md).

- :material-history: **History and replay**

    Restore one of the last 20 saved plans, replay the last 24 hours of your home. See [History and check](history.md) and [Card](card.md).

</div>

## Where next

- New here? Follow [Installation](installation.md) and then the [Quick start](quick-start.md), you will have a working plan in about ten steps.
- Want to see it first? Open the [live demo](https://matata86.github.io/fns-floorplan/demo/), it runs the real card with fake states.
- Looking for a YAML option? See [Card](card.md) and the [Plan format](reference/plan-format.md).
- Something does not work? Check the [FAQ](faq.md).
