# Changelog

Every release is listed with notes in the [GitHub releases](https://github.com/matata86/fns-floorplan/releases). This page summarises the 0.6.x line by theme.

## 1.0.11 – 1.0.37

- Card: the card has an opaque background again (the theme's card colour, white in a light theme) under the see-through primary tint. Badges, lamps and TVs that animate move into a layer of their own on top while they move, so room labels and still icons stay sharp beside them. A robot whose dock sits above lights and appliances is drawn again (an error stopped it).

- Card: room labels, texts and badges are sharp again on ordinary (non-HiDPI) screens; next to a running animation some of them were drawn blurred.

- Card: a device text can count a timer down every second: `{left:timer.x}` shows its time left as m:ss (also a remaining-time or end-time sensor; `{left}` alone that of the countdown ring).

- Card: much lighter, above all on phones. A state change redraws only the parts of the plan that show that entity (before, any change in the house redrew every light, glow, badge and label). Badges, labels and everything that moves sit in a layer of their own over the still plan, so an animation never repaints the light glows under it. The radar of an armed alarm and the countdown rings move a few times a second instead of repainting the card 60 times a second, the breathing ring, a playing TV and motion ripples run on the graphics card, and the robot's trail is drawn in short pieces. A lit lamp keeps a steady ring instead of pulsing (on Android its badge could stay unpainted).

- Room panel: opens faster. Home Assistant's card code is loaded ahead while the dashboard is idle, all cards of a room are made at once, and a room opened before comes back instantly. A door or window contact without a device class now changes its icon while the panel is open. Opening a room no longer logs a "Cannot build card without config" error for every card.

- Card: in daylight a light in colour-temperature mode is drawn no whiter than 5000 K, so it shows on a white floor.

- Room panel: with the Mushroom cards installed a light is a Mushroom light card (brightness bar with colour temperature and colour buttons next to it); without Mushroom a tile with the brightness bar.

- Room panel: light tiles span the panel again, with brightness next to the name and colour temperature and colours below it.

- Room panel: a light with colour temperature or colour has its brightness, temperature and favourite colours below the name again.

- Card: the radar of an armed alarm no longer smears into a solid disc on Android (the sweep moves by stroke offset instead of a rotating group). Animations pause while the card is off screen or the room panel is open, the plain ring of an item animates only when it is the shown effect, and light-strip glows blur only their own area. Smoother on phones.

- Items: "Text when running" now follows the real state of the entity; a rule's effect (e.g. a countdown on a switched-off device) no longer makes it show.

- Items: the size of the circle (`size`) and of the label (`label_size`) are set separately.

- Rooms: the size of the label can be set (`label_size`, from XS to XXL).

- Editor: on a fresh install (empty plan) rooms can be added again; before, nothing happened. Room panel: binary sensors show only when they last changed, and each section is sorted by kind.

- Room panel: the thermostat's target temperature sits in the tile row; lights are always plain tiles (no Mushroom card; a switch among the lights now toggles from its icon); the panel only refreshes a tile when its own entity changed, so it no longer lags.

- Room panel: media players and remotes have their own section **Media** (with a volume slider), robot vacuums and lawn mowers the section **Robots**.
- Editor: an icon chosen in a rule's icon picker after searching is kept, and the form keeps its scroll position when a field changes the page height either way.
- Rules: a rule that sets a ring effect (for example a countdown driven by a timer) now runs it even while the device itself is off.
- Room panel: media players and robot vacuums take the full width in one row (volume and buttons next to the name); windows and doors show when they were last open instead of their state; the PIR and water leak sensors placed in the room are listed under Sensors (with their state and when it last changed).
- Room panel: windows, doors and placed sensors with a time of last change take the full width so the text is not cut off.
- Room panel: windows, doors and placed sensors show only the time of the last change (the icon shows the state) and sit two in a row again.

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
