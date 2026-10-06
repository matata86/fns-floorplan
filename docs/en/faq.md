# FAQ and troubleshooting

## The card is not found after the installation

Restart Home Assistant after installing, then **reload the browser page with a cleared cache** (++ctrl+shift+r++; in the companion app clear the app cache in the app settings). The integration registers the card by itself; you do not need a dashboard resource. Check that **Settings, Devices & services** lists FNS Floorplan.

## "Custom element doesn't exist" or a configuration error appears sometimes

Some dashboard add-ons replace the browser's custom element registry. The card, its editor and the panel check their registration again after 0.5, 2, 5 and 10 seconds and fix it. If the error stays, reload the page; if it is reproducible, open an issue with the list of your frontend add-ons.

## The card shows the old version after an update { #the-card-shows-the-old-version-after-an-update }

The card is loaded with the version in its URL. Restart Home Assistant after the update and hard-reload the page. In the Home Assistant app clear the cache.

## The card says it is waiting for the integration

The card subscribes to the plan over the websocket. Right after a restart the integration may not be loaded yet; the card retries for some seconds and again after the connection is restored. If the message stays, check that the integration is added and loaded without errors in the log.

## The plan is empty

An empty card means no plan was saved yet. Open **Floor plan** in the sidebar, draw rooms and press **Save**. If you saved before and the plan is gone, look at the **History** in the editor, the last 20 saves can be restored.

## The sidebar entry is missing

It is optional: **Settings, Devices & services, FNS Floorplan, Configure**. The editor is always available at `/fns-floorplan`. It is for admins only.

## Icons are missing

The card brings a set of Material Design Icons. Any other `mdi:` icon is read from Home Assistant's own icon element, so it appears when the frontend has loaded it; reload the page once. Custom icon sets must be provided by Home Assistant itself.

## Saving says the plan changed meanwhile (conflict)

Someone (or another browser tab) saved a newer revision. In the editor use **Discard changes** to reload and repeat your edit. See [Websocket API](reference/websocket-api.md#revisions-and-conflicts).

## Performance

Animations run only while something moves and while the card is on the screen; hidden cards do not animate, and the icon animations respect `prefers-reduced-motion`. If a very large plan is slow, hide items you do not need with `hide` rules and avoid templates that render every second.

## A light does not glow in the colour I expect

The glow uses `rgb_color`, otherwise `color_temp_kelvin`, otherwise a warm white. A rule with `color` overrides it.

## A rule does not apply

For each output field the **first** rule that matches and sets that field wins, so check the order. Entity states are strings: write `state: "on"` in quotes in YAML. Templates are rendered live by Home Assistant but are not computed in the editor preview.

## Languages

The card and the editor follow the language of your Home Assistant profile (English, Czech and German). The documentation is also available in all three languages, use the language switch at the top of the site. Texts that you wrote yourself (room names, `text`) are not translated.

## Something else

Open an issue on [GitHub](https://github.com/matata86/fns-floorplan/issues) with the version (Settings, Devices & services), what you expected and what happened, and the browser console log if the card does not load.
