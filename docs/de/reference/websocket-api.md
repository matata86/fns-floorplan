# Websocket-API

Die Integration registriert diese Websocket-Befehle von Home Assistant. Karte und Editor verwenden sie, und du kannst sie aus Skripten oder aus den Entwicklerwerkzeugen deines Browsers nutzen. Mit **admin** markierte Befehle werden für Benutzer ohne Administratorrechte abgelehnt.

Jeder Befehl folgt der üblichen Websocket-Konvention: Sende `{"id": <n>, "type": "...", ...}` und erhalte `{"id": <n>, "type": "result", "success": true, "result": ...}` oder `"success": false` mit einem `error`-Objekt.

## plan/get

Gibt den gespeicherten Plan zurück; `{}` vor dem ersten Speichern. Nicht auf Administratoren beschränkt.

```json
{"id": 1, "type": "fns_floorplan/plan/get"}
```

```json
{"id": 1, "type": "result", "success": true, "result": {"rev": 7, "rooms": [], "levels": []}}
```

## plan/subscribe

Sendet den Plan sofort und nach jedem Speichern erneut. So zeichnen sich geöffnete Karten von selbst neu.

```json
{"id": 2, "type": "fns_floorplan/plan/subscribe"}
```

```json
{"id": 2, "type": "result", "success": true, "result": null}
{"id": 2, "type": "event", "event": {"rev": 7, "rooms": []}}
```

## plan/save { #plan-save }

**Admin.** Ersetzt den **gesamten** Plan. Lies immer zuerst den aktuellen Plan und sende ihn mit deinen Änderungen zurück.

```json
{"id": 3, "type": "fns_floorplan/plan/save", "plan": {"rooms": [], "levels": []}, "rev": 7}
```

```json
{"id": 3, "type": "result", "success": true, "result": {"ok": true, "rev": 8}}
```

### Revisionen und Konflikte { #revisions-and-conflicts }

Jedes Speichern legt den Plan mit um eins erhöhter `rev` ab. Enthält die Anfrage `rev`, gelingt das Speichern nur, wenn sie der gespeicherten Revision entspricht. Andernfalls erhältst du einen Fehler und nichts wird geschrieben:

```json
{"id": 3, "type": "result", "success": false,
 "error": {"code": "conflict", "message": "The plan changed meanwhile (revision 8)"}}
```

Ohne `rev` überschreibt das Speichern immer (nützlich für Importe). Der vorherige Plan wird zuvor in den Verlauf geschoben, sofern er Räume enthielt. Ist die Integration nicht eingerichtet, lautet der Fehlercode `not_loaded`.

## history/list { #history }

**Admin.** Listet die letzten 20 gespeicherten Revisionen auf, die neueste zuerst.

```json
{"id": 4, "type": "fns_floorplan/history/list"}
```

```json
{"id": 4, "type": "result", "success": true, "result": [
  {"rev": 7, "saved_at": "2026-10-04T12:00:00+00:00", "rooms": 3, "items": 12}
]}
```

`items` zählt Möbel, Geräte, Sensoren und Texte.

## history/get

**Admin.** Gibt einen gespeicherten Plan anhand seiner Revision zurück oder den Fehler `not_found`.

```json
{"id": 5, "type": "fns_floorplan/history/get", "rev": 7}
```

## yaml/parse

**Admin.** Parst YAML-Text mit dem eigenen Loader von Home Assistant. Ein Fehler hat den Code `invalid_yaml`.

```json
{"id": 6, "type": "fns_floorplan/yaml/parse", "text": "- if:\n    - entity: light.x\n      state: 'on'\n  color: red"}
```

```json
{"id": 6, "type": "result", "success": true, "result": {"data": [{"if": [{"entity": "light.x", "state": "on"}], "color": "red"}]}}
```

## yaml/dump

**Admin.** Das Gegenstück: Daten (eine Liste oder ein Objekt) zu YAML-Text.

```json
{"id": 7, "type": "fns_floorplan/yaml/dump", "data": [{"color": "red"}]}
```

```json
{"id": 7, "type": "result", "success": true, "result": {"text": "- color: red\n"}}
```

## Vorlagenbilder (HTTP)

Vorlagenbilder der Etagen werden nicht über den Websocket hochgeladen, sondern über einen HTTP-Endpunkt der Integration. Er benötigt das Zugriffstoken eines Administrators.

| Methode | URL | Body | Ergebnis |
|---------|-----|------|----------|
| `POST` | `/api/fns_floorplan/background` | Multipart-Formular: `level` (Etagen-ID), `file` (png, jpg, jpeg, webp oder svg, höchstens 15 MB) | `{"url": "/local/fns_floorplan/bg_<level>.<ext>?v=<timestamp>"}` |
| `DELETE` | `/api/fns_floorplan/background?level=<id>` | keiner | `{"ok": true}` |

Die Datei wird in `www/fns_floorplan/bg_<level>.<ext>` gespeichert (ein neuer Upload ersetzt den alten dieser Etage). Fehler: 403 für Nicht-Administratoren, 400 für einen nicht unterstützten Typ, 413 für eine zu große Datei. Die zurückgegebene `url` gehört in `backgrounds[level].url` des Plans, der dann mit `plan/save` gespeichert wird.

```bash
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -F level=0 -F file=@floor.png \
  http://homeassistant.local:8123/api/fns_floorplan/background
```

Siehe auch das [Planformat](plan-format.md).
