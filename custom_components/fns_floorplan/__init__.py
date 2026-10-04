"""FNS Floorplan: an animated 2D floor plan card that shows the home's live state.

The plan (rooms, openings, furniture, lights, devices) is kept in the integration's
own storage, read by the card over the websocket API and edited in the sidebar
panel "Půdorys".
"""

from __future__ import annotations

import json
import logging
import os

import voluptuous as vol

from homeassistant.components import frontend, panel_custom, websocket_api
from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect, async_dispatcher_send
from homeassistant.helpers.storage import Store
from homeassistant.util import yaml as yaml_util

_LOGGER = logging.getLogger(__name__)

DOMAIN = "fns_floorplan"
STORAGE_VERSION = 1
CARD_URL = "/fns_floorplan/fns-floorplan-card.js"
PANEL_URL = "/fns_floorplan/fns-floorplan-panel.js"
PANEL_PATH = "fns-floorplan"
DATA_STORE = "store"
DATA_PLAN = "plan"
SIGNAL_PLAN = f"{DOMAIN}_plan"


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Load the stored plan, serve the card and register the websocket commands."""
    store: Store = Store(hass, STORAGE_VERSION, DOMAIN)
    plan = await store.async_load() or {}
    hass.data[DOMAIN] = {DATA_STORE: store, DATA_PLAN: plan}

    manifest = await hass.async_add_executor_job(_read_manifest)
    version = manifest.get("version", "0")
    base = os.path.join(os.path.dirname(__file__), "frontend")
    try:
        await hass.http.async_register_static_paths(
            [
                StaticPathConfig(CARD_URL, os.path.join(base, "fns-floorplan-card.js"), True),
                StaticPathConfig(PANEL_URL, os.path.join(base, "fns-floorplan-panel.js"), True),
            ]
        )
        # the version in the query drops the browser cache whenever the integration updates
        add_extra_js_url(hass, f"{CARD_URL}?v={version}")
    except RuntimeError:  # already registered after a reload of the entry
        pass
    await panel_custom.async_register_panel(
        hass,
        frontend_url_path=PANEL_PATH,
        webcomponent_name="fns-floorplan-panel",
        sidebar_title="Půdorys",
        sidebar_icon="mdi:floor-plan",
        module_url=f"{PANEL_URL}?v={version}",
        require_admin=True,
    )

    websocket_api.async_register_command(hass, ws_plan_get)
    websocket_api.async_register_command(hass, ws_plan_save)
    websocket_api.async_register_command(hass, ws_plan_subscribe)
    websocket_api.async_register_command(hass, ws_yaml_parse)
    websocket_api.async_register_command(hass, ws_yaml_dump)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Remove the sidebar panel; static paths and commands live until restart."""
    frontend.async_remove_panel(hass, PANEL_PATH)
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


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/plan/subscribe"})
@callback
def ws_plan_subscribe(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict) -> None:
    """Send the plan now and again after every save, so open cards redraw without a reload."""

    @callback
    def forward(plan: dict) -> None:
        connection.send_message(websocket_api.event_message(msg["id"], plan))

    connection.subscriptions[msg["id"]] = async_dispatcher_connect(hass, SIGNAL_PLAN, forward)
    connection.send_result(msg["id"])
    data = hass.data.get(DOMAIN)
    forward(data[DATA_PLAN] if data else {})


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/plan/save",
        vol.Required("plan"): dict,
        vol.Optional("rev"): int,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_plan_save(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict) -> None:
    """Replace the whole plan; open cards pick it up on the next page load."""
    data = hass.data.get(DOMAIN)
    if not data:
        connection.send_error(msg["id"], "not_loaded", "FNS Floorplan is not set up")
        return
    # the editor sends the revision it loaded; a newer plan saved meanwhile is not overwritten
    current = data[DATA_PLAN].get("rev", 0)
    if "rev" in msg and msg["rev"] != current:
        connection.send_error(msg["id"], "conflict", f"The plan changed meanwhile (revision {current})")
        return
    plan = {**msg["plan"], "rev": current + 1}
    data[DATA_PLAN] = plan
    await data[DATA_STORE].async_save(plan)
    async_dispatcher_send(hass, SIGNAL_PLAN, plan)
    connection.send_result(msg["id"], {"ok": True, "rev": plan["rev"]})


# the editor shows rules and action data as YAML; HA's own loader and dumper do the conversion


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/yaml/parse", vol.Required("text"): str})
@websocket_api.require_admin
@callback
def ws_yaml_parse(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict) -> None:
    """Parse YAML typed in the editor."""
    try:
        data = yaml_util.parse_yaml(msg["text"])
    except Exception as err:  # noqa: BLE001 - any parse error goes back to the editor
        connection.send_error(msg["id"], "invalid_yaml", str(err))
        return
    connection.send_result(msg["id"], {"data": json.loads(json.dumps(data))})


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/yaml/dump", vol.Required("data"): vol.Any(dict, list)})
@websocket_api.require_admin
@callback
def ws_yaml_dump(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict) -> None:
    """Turn plan data into YAML for the editor."""
    connection.send_result(msg["id"], {"text": yaml_util.dump(msg["data"])})
