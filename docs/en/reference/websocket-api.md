# Websocket API

The integration registers these Home Assistant websocket commands. They are what the card and the editor use, and you can use them from scripts or from the developer tools of your browser. Commands marked **admin** are refused for non-admin users.

Every command follows the usual websocket convention: send `{"id": <n>, "type": "...", ...}`, receive `{"id": <n>, "type": "result", "success": true, "result": ...}` or `"success": false` with an `error` object.

## plan/get

Returns the stored plan; `{}` before the first save. Not restricted to admins.

```json
{"id": 1, "type": "fns_floorplan/plan/get"}
```

```json
{"id": 1, "type": "result", "success": true, "result": {"rev": 7, "rooms": [], "levels": []}}
```

## plan/subscribe

Sends the plan immediately and again after every save. This is how open cards redraw by themselves.

```json
{"id": 2, "type": "fns_floorplan/plan/subscribe"}
```

```json
{"id": 2, "type": "result", "success": true, "result": null}
{"id": 2, "type": "event", "event": {"rev": 7, "rooms": []}}
```

## plan/save { #plan-save }

**Admin.** Replaces the **whole** plan. Always read the current plan first and send it back with your changes.

```json
{"id": 3, "type": "fns_floorplan/plan/save", "plan": {"rooms": [], "levels": []}, "rev": 7}
```

```json
{"id": 3, "type": "result", "success": true, "result": {"ok": true, "rev": 8}}
```

### Revisions and conflicts { #revisions-and-conflicts }

Every save stores the plan with `rev` increased by one. When the request contains `rev`, the save only succeeds if it equals the stored revision. Otherwise you get an error and nothing is written:

```json
{"id": 3, "type": "result", "success": false,
 "error": {"code": "conflict", "message": "The plan changed meanwhile (revision 8)"}}
```

Without `rev` the save always overwrites (useful for imports). The previous plan is pushed to the history first, when it contained rooms. If the integration is not set up, the error code is `not_loaded`.

## history/list { #history }

**Admin.** Lists the last 20 saved revisions, newest first.

```json
{"id": 4, "type": "fns_floorplan/history/list"}
```

```json
{"id": 4, "type": "result", "success": true, "result": [
  {"rev": 7, "saved_at": "2026-10-04T12:00:00+00:00", "rooms": 3, "items": 12}
]}
```

`items` counts furniture, devices, sensors and texts.

## history/get

**Admin.** Returns one stored plan by its revision, or the error `not_found`.

```json
{"id": 5, "type": "fns_floorplan/history/get", "rev": 7}
```

## yaml/parse

**Admin.** Parses YAML text with Home Assistant's own loader. An error has the code `invalid_yaml`.

```json
{"id": 6, "type": "fns_floorplan/yaml/parse", "text": "- if:\n    - entity: light.x\n      state: 'on'\n  color: red"}
```

```json
{"id": 6, "type": "result", "success": true, "result": {"data": [{"if": [{"entity": "light.x", "state": "on"}], "color": "red"}]}}
```

## yaml/dump

**Admin.** The opposite: data (a list or an object) to YAML text.

```json
{"id": 7, "type": "fns_floorplan/yaml/dump", "data": [{"color": "red"}]}
```

```json
{"id": 7, "type": "result", "success": true, "result": {"text": "- color: red\n"}}
```

## Tracing images (HTTP)

Floor tracing images are not uploaded over the websocket but through an HTTP endpoint of the integration. It needs an admin user's access token.

| Method | URL | Body | Result |
|--------|-----|------|--------|
| `POST` | `/api/fns_floorplan/background` | multipart form: `level` (floor id), `file` (png, jpg, jpeg, webp or svg, at most 15 MB) | `{"url": "/local/fns_floorplan/bg_<level>.<ext>?v=<timestamp>"}` |
| `DELETE` | `/api/fns_floorplan/background?level=<id>` | none | `{"ok": true}` |

The file is stored in `www/fns_floorplan/bg_<level>.<ext>` (a new upload replaces the old one of that floor). Errors: 403 for non-admins, 400 for an unsupported type, 413 for a file that is too large. The returned `url` goes into `backgrounds[level].url` of the plan, which is then saved with `plan/save`.

```bash
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -F level=0 -F file=@floor.png \
  http://homeassistant.local:8123/api/fns_floorplan/background
```

See also the [Plan format](plan-format.md).
