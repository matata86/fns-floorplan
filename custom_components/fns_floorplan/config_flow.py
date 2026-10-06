"""Config flow: one entry, nothing to ask; options pick whether the editor sits in the sidebar."""

import voluptuous as vol

from homeassistant.config_entries import ConfigEntry, ConfigFlow, OptionsFlow
from homeassistant.core import callback

from . import CONF_SIDEBAR, DOMAIN, PANEL_PATH


class FloorplanConfigFlow(ConfigFlow, domain=DOMAIN):
    """Add FNS Floorplan from the UI."""

    VERSION = 1

    async def async_step_user(self, user_input=None):
        if user_input is not None:
            return self.async_create_entry(title="FNS Floorplan", data={})
        return self.async_show_form(step_id="user")

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        return FloorplanOptionsFlow()


class FloorplanOptionsFlow(OptionsFlow):
    """Show or hide the Floor plan editor in the sidebar."""

    async def async_step_init(self, user_input=None):
        if user_input is not None:
            return self.async_create_entry(data=user_input)
        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(
                {vol.Required(CONF_SIDEBAR, default=self.config_entry.options.get(CONF_SIDEBAR, True)): bool}
            ),
            description_placeholders={"url": f"/{PANEL_PATH}"},
        )
