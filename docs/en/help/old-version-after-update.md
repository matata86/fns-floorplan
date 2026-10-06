# The card shows the old version after an update

## What you see

You updated the integration, but the card or the editor looks and behaves like before.

## Why it happens

The card is loaded with the version in its URL. Until Home Assistant is restarted, it still serves the old version, and a browser or the app may keep the old files in its cache.

## What to do

1. Restart Home Assistant after the update.
2. Hard-reload the page (++ctrl+shift+r++).
3. In the Home Assistant app clear the cache in the app settings.

## Related

- [Installation: Update](../installation.md)
- [The card is not found after the installation](card-not-found.md)
