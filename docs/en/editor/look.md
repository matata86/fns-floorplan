# Look

The **Look** tab sets the colours of the plan. It shows the plan as a live card, so you see every change right away; switch between a day and a night preview at the top of the form. The colours are stored in the plan as `style` and apply to every card that shows this plan. A colour you did not set follows the Home Assistant theme or the default, and **Reset to defaults** clears them all.

| Colour | What it colours | Default |
|---|---|---|
| `wall_day` / `wall_night` | Walls (day / night) | theme primary colour |
| `floor_day` / `floor_night` | Floor (day / night) | white / dark blue |
| `text_day` / `text_night` | Room labels and text (day / night) | dark / light |
| `accent` | Accent of buttons and highlights | theme primary colour |
| `lamp` | A light that reports no colour of its own | the theme colour of an active light, paled |
| `open` | Open door or window, unlocked lock, pending alarm | the theme colour of an active binary sensor, else orange |
| `alarm` | Triggered alarm | the theme colour of a triggered alarm, else red |
| `blind` | Blinds | the theme colour of a closed cover, else the accent |
| `cold` / `hot` | Cold and warm temperature in room labels | blue / orange |
