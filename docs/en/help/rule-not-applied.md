# A rule does not apply

## What you see

An item ignores a rule you wrote, or shows another colour, icon or text than expected.

## Why it happens

For each output field the **first** rule that matches and sets that field wins. Entity states are strings, so `on` without quotes in YAML is read as a boolean. Templates are rendered live by Home Assistant, but they are not computed in the editor preview.

## What to do

1. Check the order of the rules, the first match wins for each field.
2. In YAML write `state: "on"` in quotes.
3. Judge templates on the real card, not in the editor preview.

## Related

- [Rules](../editor/rules.md)
- [A light does not glow in the colour I expect](light-wrong-colour.md)
