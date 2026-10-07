# Changelog

Every release is listed with notes in the [GitHub releases](https://github.com/matata86/fns-floorplan/releases). This page summarises the 0.6.x line by theme.

## 1.0.1 to 1.0.9

- Room panel: cameras show their picture across the panel; blinds of the room's doors and windows (and covers among the extra entities) with open / stop / close next to the name and a position slider below.
- Room lists (label details and extra entities): **Add an entity** picker under each field, a leading `- ` is accepted, and an entry can be a template that lists entity ids, also over several lines (`{% if %} … {% endif %}`).
- Editor: "Call an action" picks the action from the actions Home Assistant knows, with search; searchable pickers show the translated name instead of the raw value.
- Editor: the form no longer jumps to the top after a change.
- Editor: a short hint under the room lists explains entries and templates.

## 1.0.0 (0.7.x line)

- Editor tab **Look**: plan colours (walls, floor and labels for day and night, accent, lights, open doors and windows, alarm, blinds, temperature) with a live card preview. Default light, open and alarm colours follow the Home Assistant theme.
- Room panel: cards sit in `hui-card` like on a dashboard, so theme styles (UIX / card-mod) apply; section headings are subtitle heading cards with icons; Mushroom light card when installed, tiles with features otherwise.
- Device labels: position (top, bottom, left, right) and vertical text.
- Phone editor: the form opens in a near full-height sheet like more-info, with a fixed header; round save button.
- Fixes: icon pickers on HA 2026.9, temperature unit in room labels, smoother ring and ripple animations on phones.

## Room panel (0.6.44 to 0.6.50)

- The room panel slid out as an off-canvas screen and then became a dashboard-like panel: Home Assistant tile cards, two columns, the theme background, a header with the room icon, temperature and humidity.
- Sections: thermostat, lights with inline brightness, cameras, windows and doors, switches, devices, sensors, other. Lock and vacuum controls.
- Room icon, `sheet_hide` for the robot vacuum.
- Sorted and searchable type pickers, with an "Other" type.

## Robot vacuum (0.6.14 to 0.6.42)

- Pairing of the vacuum's rooms with plan rooms, battery ring and charging state, theme colours by state.
- A stopped robot stands in its room on a free spot and blinks, errors are red.
- The robot keeps its dock orientation, appears in its room after a page load, drives below the entities and above furniture.
- Whole-floor tour when its room is unknown; a "running" section and layer for the dock.

## Editor (0.6.9 to 0.6.43)

- Toolbar, menus and side panel from native Home Assistant elements, resizable side panel, colour picker mapped to theme variables.
- Phone layout with a bottom sheet.
- Room editing: dragging whole walls, snapping to neighbours, shared walls, wall lengths, 15 degree angles, straight markers, a corner sofa.
- Drag doors and windows to other walls; Ctrl+X; per-rule YAML; Jinja template mode for conditions; icon buttons "No icon" and "Reset".

## Rules and animations (0.6.1 to 0.6.43)

- Icon animations by icon name, ring effects (radar, comet, countdown and more), the `fx` rule output.
- Countdown from a timer, a duration or timestamp sensor, a percentage entity (fills like a battery) or a set length.
- Rule colours and rings for lights, LED strips, the dock and furniture.
- AI Task rule suggestions; rules YAML in the Home Assistant code editor; an icon picker in rules.
- "Other device" behaves by the domain of its entity; person avatars; scene and button blink.

## Look (0.6.5 to 0.6.19)

- Theme-coloured walls and card background, a layer badge bar above the plan with a heat legend, smooth motion ripples, no seam in the dark mode, the replay bar under the plan.

For versions before 0.6, see the GitHub releases and the repository history.
