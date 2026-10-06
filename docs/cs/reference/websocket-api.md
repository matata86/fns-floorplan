# Websocket API

Integrace registruje tyto websocketové příkazy Home Assistantu. Používá je karta i editor a můžeš je použít i ze skriptů nebo z vývojářských nástrojů prohlížeče. Příkazy označené **admin** se uživatelům, kteří nejsou administrátoři, odmítnou.

Každý příkaz dodržuje obvyklou konvenci websocketu: pošli `{"id": <n>, "type": "...", ...}` a obdržíš `{"id": <n>, "type": "result", "success": true, "result": ...}` nebo `"success": false` s objektem `error`.

## plan/get

Vrací uložený půdorys; před prvním uložením `{}`. Není omezen na administrátory.

```json
{"id": 1, "type": "fns_floorplan/plan/get"}
```

```json
{"id": 1, "type": "result", "success": true, "result": {"rev": 7, "rooms": [], "levels": []}}
```

## plan/subscribe

Pošle půdorys okamžitě a znovu po každém uložení. Takto se otevřené karty samy překreslují.

```json
{"id": 2, "type": "fns_floorplan/plan/subscribe"}
```

```json
{"id": 2, "type": "result", "success": true, "result": null}
{"id": 2, "type": "event", "event": {"rev": 7, "rooms": []}}
```

## plan/save { #plan-save }

**Admin.** Nahradí **celý** půdorys. Vždy si nejdřív přečti aktuální půdorys a pošli ho zpět se svými změnami.

```json
{"id": 3, "type": "fns_floorplan/plan/save", "plan": {"rooms": [], "levels": []}, "rev": 7}
```

```json
{"id": 3, "type": "result", "success": true, "result": {"ok": true, "rev": 8}}
```

### Revize a konflikty { #revisions-and-conflicts }

Každé uložení zapíše půdorys s `rev` zvýšenou o jedna. Pokud požadavek obsahuje `rev`, uložení uspěje, jen když se rovná uložené revizi. Jinak dostaneš chybu a nic se nezapíše:

```json
{"id": 3, "type": "result", "success": false,
 "error": {"code": "conflict", "message": "The plan changed meanwhile (revision 8)"}}
```

Bez `rev` uložení vždy přepíše (hodí se pro importy). Předchozí půdorys se nejdřív odešle do historie, pokud obsahoval místnosti. Pokud integrace není nastavená, kód chyby je `not_loaded`.

## history/list { #history }

**Admin.** Vypíše posledních 20 uložených revizí, nejnovější první.

```json
{"id": 4, "type": "fns_floorplan/history/list"}
```

```json
{"id": 4, "type": "result", "success": true, "result": [
  {"rev": 7, "saved_at": "2026-10-04T12:00:00+00:00", "rooms": 3, "items": 12}
]}
```

`items` počítá nábytek, zařízení, senzory a texty.

## history/get

**Admin.** Vrátí jeden uložený půdorys podle jeho revize, nebo chybu `not_found`.

```json
{"id": 5, "type": "fns_floorplan/history/get", "rev": 7}
```

## yaml/parse

**Admin.** Zpracuje text YAML pomocí vlastního loaderu Home Assistantu. Chyba má kód `invalid_yaml`.

```json
{"id": 6, "type": "fns_floorplan/yaml/parse", "text": "- if:\n    - entity: light.x\n      state: 'on'\n  color: red"}
```

```json
{"id": 6, "type": "result", "success": true, "result": {"data": [{"if": [{"entity": "light.x", "state": "on"}], "color": "red"}]}}
```

## yaml/dump

**Admin.** Opak: data (seznam nebo objekt) na text YAML.

```json
{"id": 7, "type": "fns_floorplan/yaml/dump", "data": [{"color": "red"}]}
```

```json
{"id": 7, "type": "result", "success": true, "result": {"text": "- color: red\n"}}
```

## Podkladové obrázky (HTTP)

Podkladové obrázky pater se nenahrávají přes websocket, ale přes HTTP endpoint integrace. Potřebuje přístupový token uživatele s právy administrátora.

| Metoda | URL | Tělo | Výsledek |
|--------|-----|------|----------|
| `POST` | `/api/fns_floorplan/background` | formulář multipart: `level` (id patra), `file` (png, jpg, jpeg, webp nebo svg, nejvýše 15 MB) | `{"url": "/local/fns_floorplan/bg_<level>.<ext>?v=<timestamp>"}` |
| `DELETE` | `/api/fns_floorplan/background?level=<id>` | žádné | `{"ok": true}` |

Soubor se ukládá do `www/fns_floorplan/bg_<level>.<ext>` (nové nahrání nahradí starý soubor daného patra). Chyby: 403 pro uživatele bez práv administrátora, 400 pro nepodporovaný typ, 413 pro příliš velký soubor. Vrácená `url` patří do `backgrounds[level].url` v půdorysu, který se pak uloží přes `plan/save`.

```bash
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -F level=0 -F file=@floor.png \
  http://homeassistant.local:8123/api/fns_floorplan/background
```

Viz také [Formát plánu](plan-format.md).
