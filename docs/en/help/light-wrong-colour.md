# A light does not glow in the colour I expect

## What you see

The glow of a light is warm white or another colour than the lamp really shows.

## Why it happens

The glow uses `rgb_color`, otherwise `color_temp_kelvin`, otherwise a warm white. A rule with `color` overrides all of that.

## What to do

1. Open the light's entity in Home Assistant and check its attributes `rgb_color` and `color_temp_kelvin`.
2. Check whether a rule with `color` is set on the item.
3. If the lamp reports neither attribute, the warm white is expected, set a `color` rule if you want something else.

## Related

- [Rules](../editor/rules.md)
- [Items](../editor/items.md)
- [A rule does not apply](rule-not-applied.md)
