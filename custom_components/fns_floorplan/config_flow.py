"""Config flow: one entry, nothing to ask."""

from homeassistant.config_entries import ConfigFlow

from . import DOMAIN


class FloorplanConfigFlow(ConfigFlow, domain=DOMAIN):
    """Add FNS Floorplan from the UI."""

    VERSION = 1

    async def async_step_user(self, user_input=None):
        if user_input is not None:
            return self.async_create_entry(title="FNS Floorplan", data={})
        return self.async_show_form(step_id="user")
