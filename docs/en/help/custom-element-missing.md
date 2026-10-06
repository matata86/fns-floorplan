# "Custom element doesn't exist" or a configuration error appears

## What you see

For a moment (or until the next reload) the card shows "Custom element doesn't exist: fns-floorplan-card" or a configuration error, although it worked before.

## Why it happens

Some dashboard add-ons replace the browser's custom element registry, so the card is registered in a registry that is no longer used. The card, its editor and the panel check their registration again after 0.5, 2, 5 and 10 seconds and fix it themselves.

## What to do

1. Wait about ten seconds, the card usually repairs itself.
2. If the error stays, reload the page.
3. If it is reproducible, open an issue and list the frontend add-ons you use.

## Related

- [The card is not found after the installation](card-not-found.md)
- [GitHub issues](https://github.com/matata86/fns-floorplan/issues)
