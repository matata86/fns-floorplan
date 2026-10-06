# Websocket API

Integracja rejestruje poniższe polecenia websocket Home Assistanta. Używają ich karta i edytor, a ty możesz ich używać ze skryptów albo z narzędzi deweloperskich przeglądarki. Polecenia oznaczone **admin** są odrzucane dla użytkowników niebędących administratorami.

Każde polecenie stosuje zwykłą konwencję websocket: wyślij `{"id": <n>, "type": "...", ...}`, odbierz `{"id": <n>, "type": "result", "success": true, "result": ...}` albo `"success": false` z obiektem `error`.

## plan/get

Zwraca zapisany plan; `{}` przed pierwszym zapisem. Nie jest ograniczone do administratorów.

```json
{"id": 1, "type": "fns_floorplan/plan/get"}
```

```json
{"id": 1, "type": "result", "success": true, "result": {"rev": 7, "rooms": [], "levels": []}}
```

## plan/subscribe

Wysyła plan natychmiast i ponownie po każdym zapisie. Dzięki temu otwarte karty same się przerysowują.

```json
{"id": 2, "type": "fns_floorplan/plan/subscribe"}
```

```json
{"id": 2, "type": "result", "success": true, "result": null}
{"id": 2, "type": "event", "event": {"rev": 7, "rooms": []}}
```

## plan/save { #plan-save }

**Admin.** Zastępuje **cały** plan. Zawsze najpierw odczytaj bieżący plan i odeślij go ze swoimi zmianami.

```json
{"id": 3, "type": "fns_floorplan/plan/save", "plan": {"rooms": [], "levels": []}, "rev": 7}
```

```json
{"id": 3, "type": "result", "success": true, "result": {"ok": true, "rev": 8}}
```

### Rewizje i konflikty { #revisions-and-conflicts }

Każdy zapis przechowuje plan z `rev` zwiększonym o jeden. Gdy żądanie zawiera `rev`, zapis powiedzie się tylko wtedy, gdy jest równe zapisanej rewizji. W przeciwnym razie dostajesz błąd i nic nie jest zapisywane:

```json
{"id": 3, "type": "result", "success": false,
 "error": {"code": "conflict", "message": "The plan changed meanwhile (revision 8)"}}
```

Bez `rev` zapis zawsze nadpisuje (przydatne przy importach). Poprzedni plan jest najpierw odkładany do historii, jeśli zawierał pomieszczenia. Jeśli integracja nie jest skonfigurowana, kodem błędu jest `not_loaded`.

## history/list { #history }

**Admin.** Wypisuje ostatnie 20 zapisanych rewizji, od najnowszej.

```json
{"id": 4, "type": "fns_floorplan/history/list"}
```

```json
{"id": 4, "type": "result", "success": true, "result": [
  {"rev": 7, "saved_at": "2026-10-04T12:00:00+00:00", "rooms": 3, "items": 12}
]}
```

`items` liczy meble, urządzenia, czujniki i teksty.

## history/get

**Admin.** Zwraca jeden zapisany plan według jego rewizji albo błąd `not_found`.

```json
{"id": 5, "type": "fns_floorplan/history/get", "rev": 7}
```

## yaml/parse

**Admin.** Parsuje tekst YAML własnym loaderem Home Assistanta. Błąd ma kod `invalid_yaml`.

```json
{"id": 6, "type": "fns_floorplan/yaml/parse", "text": "- if:\n    - entity: light.x\n      state: 'on'\n  color: red"}
```

```json
{"id": 6, "type": "result", "success": true, "result": {"data": [{"if": [{"entity": "light.x", "state": "on"}], "color": "red"}]}}
```

## yaml/dump

**Admin.** Operacja odwrotna: dane (lista lub obiekt) na tekst YAML.

```json
{"id": 7, "type": "fns_floorplan/yaml/dump", "data": [{"color": "red"}]}
```

```json
{"id": 7, "type": "result", "success": true, "result": {"text": "- color: red\n"}}
```

## Podkłady do obrysowania (HTTP)

Podkłady pięter nie są wgrywane przez websocket, lecz przez endpoint HTTP integracji. Potrzebny jest token dostępu użytkownika-administratora.

| Metoda | URL | Treść | Wynik |
|--------|-----|------|--------|
| `POST` | `/api/fns_floorplan/background` | formularz multipart: `level` (id piętra), `file` (png, jpg, jpeg, webp lub svg, najwyżej 15 MB) | `{"url": "/local/fns_floorplan/bg_<level>.<ext>?v=<timestamp>"}` |
| `DELETE` | `/api/fns_floorplan/background?level=<id>` | brak | `{"ok": true}` |

Plik jest przechowywany w `www/fns_floorplan/bg_<level>.<ext>` (nowe wgranie zastępuje stare dla tego piętra). Błędy: 403 dla nie-administratorów, 400 dla nieobsługiwanego typu, 413 dla zbyt dużego pliku. Zwrócony `url` trafia do `backgrounds[level].url` planu, który następnie zapisujesz przez `plan/save`.

```bash
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -F level=0 -F file=@floor.png \
  http://homeassistant.local:8123/api/fns_floorplan/background
```

Zobacz także [Format planu](plan-format.md).
