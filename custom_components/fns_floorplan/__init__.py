"""FNS Floorplan: an animated 2D floor plan card that shows the home's live state.

The plan (rooms, openings, furniture, lights, devices) is kept in the integration's
own storage and read by the card over the websocket API.
"""

from __future__ import annotations

import json
import logging
import os

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.storage import Store

_LOGGER = logging.getLogger(__name__)

DOMAIN = "fns_floorplan"
STORAGE_VERSION = 1
CARD_URL = "/fns_floorplan/fns-floorplan-card.js"
DATA_STORE = "store"
DATA_PLAN = "plan"


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Load the stored plan, serve the card and register the websocket commands."""
    store: Store = Store(hass, STORAGE_VERSION, DOMAIN)
    plan = await store.async_load() or {}
    hass.data[DOMAIN] = {DATA_STORE: store, DATA_PLAN: plan}

    manifest = await hass.async_add_executor_job(_read_manifest)
    path = os.path.join(os.path.dirname(__file__), "frontend", "fns-floorplan-card.js")
    try:
        await hass.http.async_register_static_paths([StaticPathConfig(CARD_URL, path, True)])
    except RuntimeError:  # already registered after a reload of the entry
        pass
    # the version in the query drops the browser cache whenever the integration updates
    add_extra_js_url(hass, f"{CARD_URL}?v={manifest.get('version', '0')}")

    websocket_api.async_register_command(hass, ws_plan_get)
    websocket_api.async_register_command(hass, ws_plan_save)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Nothing to tear down: the card's static path and commands live until restart."""
    return True


def _read_manifest() -> dict:
    with open(os.path.join(os.path.dirname(__file__), "manifest.json"), encoding="utf-8") as f:
        return json.load(f)


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/plan/get"})
@callback
def ws_plan_get(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict) -> None:
    """Return the stored plan (an empty dict before the first import)."""
    data = hass.data.get(DOMAIN)
    connection.send_result(msg["id"], data[DATA_PLAN] if data else {})


@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/plan/save", vol.Required("plan"): dict}
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_plan_save(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict) -> None:
    """Replace the whole plan; open cards pick it up on the next page load."""
    data = hass.data.get(DOMAIN)
    if not data:
        connection.send_error(msg["id"], "not_loaded", "FNS Floorplan is not set up")
        return
    data[DATA_PLAN] = msg["plan"]
    await data[DATA_STORE].async_save(msg["plan"])
    connection.send_result(msg["id"], {"ok": True})
