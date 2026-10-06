# The card is not found after the installation

## What you see

The card picker does not list FNS Floorplan, or the dashboard shows an error instead of the card.

## Why it happens

The integration registers the card when Home Assistant starts, and your browser keeps the old frontend files in its cache until you clear them. You do not need a dashboard resource, the integration adds the card by itself.

## What to do

1. Restart Home Assistant after the installation.
2. Reload the browser page with a cleared cache (++ctrl+shift+r++). In the companion app clear the app cache in the app settings.
3. Open **Settings, Devices & services** and check that FNS Floorplan is listed and loaded without errors.
4. If it is missing there, add it as described in the installation guide.

## Related

- [Installation](../installation.md)
- ["Custom element doesn't exist" or a configuration error appears](custom-element-missing.md)
- [The card shows the old version after an update](old-version-after-update.md)
