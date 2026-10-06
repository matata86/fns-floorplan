# The card says it is waiting for the integration

## What you see

Instead of the floor plan the card shows a message that it is waiting for the integration.

## Why it happens

The card subscribes to the plan over the websocket. Right after a restart the integration may not be loaded yet. The card retries for some seconds and again after the connection is restored.

## What to do

1. Wait a few seconds after a restart.
2. Open **Settings, Devices & services** and check that the integration is added and loaded.
3. Look into the Home Assistant log for errors from `fns_floorplan`.
4. If the message stays, reload the page.

## Related

- [Installation](../installation.md)
- [The card is not found after the installation](card-not-found.md)
