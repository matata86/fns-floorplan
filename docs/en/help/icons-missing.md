# Icons are missing

## What you see

Some items show no icon, or an empty square instead.

## Why it happens

The card brings a set of Material Design Icons. Any other `mdi:` icon is read from Home Assistant's own icon element, so it appears only after the frontend has loaded it. Custom icon sets must be provided by Home Assistant itself.

## What to do

1. Reload the page once.
2. Check the icon name, it has to look like `mdi:lightbulb`.
3. For icons from a custom set make sure Home Assistant itself provides that set.

## Related

- [Items](../editor/items.md)
- [Rules](../editor/rules.md)
