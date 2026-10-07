# Format planu

Plan to jeden obiekt JSON przechowywany w `.storage/fns_floorplan`. Edytor go odczytuje i zapisuje; możesz też odczytać go przez `fns_floorplan/plan/get` i zastąpić przez `fns_floorplan/plan/save` ([Websocket API](websocket-api.md)).

- Współrzędne są w **metrach**, `x` w prawo, `z` w dół.
- `rev` to licznik rewizji, zarządzany przez integrację; nie ustawiaj go ręcznie.
- Pomieszczenia i elementy pierwszego piętra nie mają `level`.

## Najwyższy poziom

| Klucz | Typ | Domyślnie | Opis |
|-----|------|---------|-------------|
| `rev` | integer | 0 | Rewizja, zwiększana przy każdym zapisie |
| `levels` | lista | jedno piętro | Piętra `[{id, name}]`. Bez niej plan ma jedno piętro |
| `rooms` | lista | `[]` | [Pomieszczenia](#rooms) |
| `openings` | lista | `[]` | [Drzwi i okna](#openings) |
| `furniture` | lista | `[]` | [Meble i światła](#furniture) |
| `sensors` | lista | `[]` | [Czujniki binarne](#sensors) |
| `devices` | lista | `[]` | [Urządzenia](#devices) |
| `texts` | lista | `[]` | [Elementy tekstowe](#texts) |
| `labels` | obiekt | `{}` | `{room_id: [x, z]}`: ręczna pozycja etykiety pomieszczenia |
| `outdoor` | string | brak | Id pomieszczenia, którego temperatura jest pokazywana jako temperatura zewnętrzna |
| `backgrounds` | obiekt | `{}` | Podkład do obrysowania dla piętra `{level_id: {url, left, top, width, opacity}}`, tylko w edytorze |
| `vacuum` | obiekt | brak | Przestarzałe: `entity`, `room_sensor`; edytor przekształca w stację dokującą |
| `style` | obiekt | `{}` | Kolory planu z zakładki Wygląd edytora, zobacz [Wygląd](../editor/look.md) |

## Styl { #style }

Kolory planu z zakładki [Wygląd](../editor/look.md) edytora. Każdy klucz jest opcjonalny i zawiera `"#rrggbb"`; nieustawiony klucz zachowuje wartość domyślną.

| Klucz | Co koloruje | Domyślnie |
|---|---|---|
| `wall_day` / `wall_night` | Ściany (dzień / noc) | kolor podstawowy motywu |
| `floor_day` / `floor_night` | Podłoga (dzień / noc) | biały / ciemnoniebieski |
| `text_day` / `text_night` | Etykiety pomieszczeń i teksty (dzień / noc) | ciemny / jasny |
| `accent` | Akcent przycisków i wyróżnień | kolor podstawowy motywu |
| `lamp` | Światło, które nie zgłasza własnego koloru | kolor aktywnego światła z motywu, rozjaśniony |
| `open` | Otwarte drzwi lub okno, otwarty zamek, oczekujący alarm | kolor aktywnego czujnika binarnego z motywu, w przeciwnym razie pomarańczowy |
| `alarm` | Wyzwolony alarm | kolor wyzwolonego alarmu z motywu, w przeciwnym razie czerwony |
| `blind` | Rolety | kolor zamkniętej osłony z motywu, w przeciwnym razie akcent |
| `cold` / `hot` | Zimna i ciepła temperatura na etykietach pomieszczeń | niebieski / pomarańczowy |

## Piętra { #levels }

| Klucz | Typ | Opis |
|-----|------|-------------|
| `id` | string | Id piętra |
| `name` | string | Nazwa pokazywana na zakładkach |

Pomieszczenia, meble, urządzenia, czujniki i teksty przyjmują `level` z id piętra; bez niego należą do pierwszego piętra. Otwory podążają za swoim pomieszczeniem.

## Pomieszczenia { #rooms }

| Klucz | Typ | Domyślnie | Opis |
|-----|------|---------|-------------|
| `id` | string | | Unikalne id |
| `name` | string | | Nazwa |
| `points` | lista `[x, z]` | | Narożniki wielokąta, co najmniej 3 |
| `level` | string | pierwsze piętro | Id piętra |
| `icon` | string | brak | Ikona `mdi:` dla nagłówka panelu pomieszczenia |
| `temperature` | encja | null | Czujnik temperatury |
| `humidity` | encja | null | Czujnik wilgotności |
| `sheet_extra` | lista encji | `[]` | Dodatkowe encje dla panelu pomieszczenia |
| `label_info` | lista | `temperature`, `humidity` | Co pokazuje etykieta: `temperature`, `humidity`, id encji lub szablony |
| `label_name` | boolean | `true` | `false` ukrywa nazwę |
| `label_hidden` | boolean | `false` | `true` ukrywa etykietę |
| `label_rotation` | liczba | 0 | Obrót etykiety w stopniach |
| `rules` | lista | `[]` | [Reguły](#rules) |

## Otwory (drzwi i okna) { #openings }

| Klucz | Typ | Domyślnie | Opis |
|-----|------|---------|-------------|
| `id` | string | | Unikalne id |
| `room_id` | string | | Pomieszczenie, którego ściana go niesie |
| `edge` | integer | | Indeks ściany: od `points[edge]` do następnego punktu |
| `offset` | liczba | | Środek otworu, metry od początku ściany |
| `width` | liczba | | Szerokość w metrach |
| `type` | `door` / `window` | | |
| `style` | string | normalny | `passage` = sam otwór (drzwi) |
| `hinge` | `left` / `right` | | Patrząc z wnętrza pomieszczenia |
| `swing` | `in` / `out` | | |
| `contact` | encja | null | Czujnik kontaktowy. Bez niego drzwi są uchylone pod kątem 45 stopni, okno zamknięte |
| `lock` | encja | null | Encja `lock` pokazywana przy drzwiach |
| `lock_size` | rozmiar | `s` | Rozmiar znacznika zamka |
| `blind` | encja | null | Encja `cover` rysowana wzdłuż okna |
| `blind_side` | `in` / `out` | `in` | `out` = na zewnątrz ściany |
| `blind_invert` | boolean | `false` | Cover zgłasza 100 jako zamknięte |
| `tap_action`, `double_tap_action`, `hold_action` | akcja | szczegóły czujnika | [Akcje](../editor/items.md#actions) |
| `sheet_hide` | boolean | `false` | Pomiń w panelu pomieszczenia |

## Meble { #furniture }

Meble, światła i stacja dokująca robota dzielą tę listę.

| Klucz | Typ | Domyślnie | Opis |
|-----|------|---------|-------------|
| `id` | string | | Unikalne id |
| `type` | string | | Typ mebla ([lista](../editor/items.md#furniture)), typ światła (`lamp_ceiling`, `lamp_pendant`, `lamp_panel`, `lamp_spot`, `lamp_table`, `lamp_wall`, `led_strip`) albo `robot_vacuum` |
| `x`, `z` | liczba | | Środek w metrach |
| `rotation` | liczba | 0 | Stopnie; 0 = w prawo, 90 = w dół |
| `w`, `d` | liczba | | Szerokość i głębokość w metrach |
| `level` | string | pierwsze piętro | Id piętra |
| `entity` | encja | null | Encja światła (światła), odtwarzacz multimedialny (`tv_wall`), odkurzacz (stacja) |
| `room_light` | liczba / false | ułamek | Część poświaty pomieszczenia od światła, `1` = 100 %, `false` = prawie nic |
| `beam` | liczba | 40 | `lamp_spot`: szerokość stożka w stopniach |
| `glow_side` | `1` / `-1` | dookoła | `led_strip`: świeci na jedną stronę |
| `color` | kolor | | Domyślny kolor mebla (reguła ma pierwszeństwo) |
| `icon`, `size`, `layer` | | | Wspólne pola elementów |
| `group` | string | | Id grupy (ustawiane przyciskiem **Grupuj**) |
| `room_sensor`, `room_map`, `battery` | | | Stacja: zobacz [Odkurzacz](../robot-vacuum.md) |
| `color_on`, `fx`, `progress`, `progress_total` | | | Stacja: wygląd podczas sprzątania |
| `rules`, `tap_action`, `double_tap_action`, `hold_action`, `sheet_hide` | | | |

## Czujniki { #sensors }

| Klucz | Typ | Opis |
|-----|------|-------------|
| `entity` | encja | Czujnik binarny; `motion`, `occupancy`, `presence` = fale, `moisture` = czerwony puls |
| `x`, `z` | liczba | Pozycja |
| `layer` | integer | Kolejność wśród czujników w edytorze |
| `level` | string | Id piętra |

## Urządzenia { #devices }

| Klucz | Typ | Domyślnie | Opis |
|-----|------|---------|-------------|
| `id` | string | | Unikalne id |
| `kind` | string | | `fan`, `purifier`, `dishwasher`, `dryer`, `boiler`, `radiator`, `alarm`, `media`, `aquarium`, `camera`, `fridge`, `fireplace`, `lock`, `generic` |
| `name` | string | | Nazwa (podpowiedź) |
| `entity` | encja | | Encja |
| `x`, `z` | liczba | | Pozycja |
| `level` | string | pierwsze piętro | Id piętra |
| `active` | lista / `{"above": n}` | według rodzaju / domeny | Stany, które liczą się jako „pracuje” |
| `text` | string | | Tekst pod ikoną, zawsze; może być szablonem |
| `text_on` | string | | Tekst podczas pracy; może być szablonem |
| `label_position` | string | `bottom` | Położenie etykiety: `bottom` (domyślnie), `top`, `left`, `right` |
| `label_vertical` | bool | `false` | Obraca etykietę o 90 stopni (czytana od dołu do góry) |
| `color`, `color_on` | kolor | kolor stanu | Kolor w spoczynku / podczas pracy |
| `fx` | string | według rodzaju | Animacja pierścienia |
| `progress`, `progress_total` | encja / minuty | | Źródło odliczania |
| `cover` | boolean | `true` | `media`: `false` wyłącza okładkę |
| `battery` | encja | bateria urządzenia | Odkurzacze |
| `icon`, `size`, `layer` | | | Wspólne pola elementów |
| `rules`, `tap_action`, `double_tap_action`, `hold_action`, `sheet_hide` | | | |

## Teksty { #texts }

| Klucz | Typ | Domyślnie | Opis |
|-----|------|---------|-------------|
| `id` | string | | Unikalne id |
| `entity` | encja | | Jej stan jest pokazywany |
| `text` | string | | Stały tekst lub szablon `{{ }}` |
| `x`, `z` | liczba | | Pozycja |
| `rotation` | liczba | 0 | Stopnie |
| `size` | rozmiar | `m` | od `xs` do `xxl` |
| `color` | kolor | | Kolor tekstu |
| `background` | string | styl znacznika | `none` = bez tła |
| `level` | string | pierwsze piętro | Id piętra |
| `rules`, akcje | | | |

## Wspólne pola elementów

| Klucz | Typ | Opis |
|-----|------|-------------|
| `icon` | string | Dowolna ikona `mdi:`; `none` oznacza brak ikony |
| `size` | string | `xs`, `s`, `m`, `l`, `xl`, `xxl` |
| `layer` | integer | Kolejność w obrębie rodzaju |
| `sheet_hide` | boolean | Pomiń w panelu pomieszczenia |
| `tap_action`, `double_tap_action`, `hold_action` | obiekt | `action`: `toggle`, `more-info`, `perform-action` (`perform_action`, `data`), `navigate` (`navigation_path`), `url` (`url_path`), `none` |

## Reguły { #rules }

Uporządkowana lista na pomieszczeniach, meblach, urządzeniach, tekstach i światłach. Dla każdego pola wyjściowego wygrywa pierwsza pasująca reguła; zobacz [Reguły](../editor/rules.md).

| Klucz | Typ | Opis |
|-----|------|-------------|
| `if` | lista | Warunki (wszystkie muszą być spełnione); reguła bez `if` jest domyślna |
| `color`, `glow`, `animate`, `wave`, `text`, `tint`, `opacity`, `hide`, `icon`, `background` | | Wyjścia |
| `fx`, `progress`, `progress_total` | | Animacja pierścienia i odliczanie |

Warunek ma jedną z postaci:

| Postać | Opis |
|------|-------------|
| `{entity, attribute?, state}` | `state` może być listą |
| `{entity, attribute?, state_not}` | Negacja, może być listą |
| `{entity, attribute?, above}` / `below` | Porównanie liczbowe |
| `{template: "{{ ... }}"}` | Jinja, prawdziwy dla `true`, `on`, `yes`, `1`, liczb niezerowych |
| `{any: [conditions]}` | OR |

## Kompletny przykład

Małe mieszkanie z trzema pomieszczeniami.

```json
{
  "levels": [{"id": "0", "name": "Parter"}],
  "outdoor": "balcony",
  "rooms": [
    {"id": "living_room", "name": "Salon", "icon": "mdi:sofa",
     "points": [[0, 0], [5, 0], [5, 4], [0, 4]],
     "temperature": "sensor.living_room_temperature", "humidity": "sensor.living_room_humidity",
     "sheet_extra": ["media_player.tv"]},
    {"id": "kitchen", "name": "Kuchnia",
     "points": [[5, 0], [8, 0], [8, 4], [5, 4]],
     "temperature": "sensor.kitchen_temperature",
     "rules": [{"if": [{"entity": "binary_sensor.kitchen_leak", "state": "on"}], "tint": "red", "opacity": 0.3}]},
    {"id": "bedroom", "name": "Sypialnia",
     "points": [[0, 4], [5, 4], [5, 7], [0, 7]],
     "temperature": "sensor.bedroom_temperature"}
  ],
  "openings": [
    {"id": "d_front", "room_id": "living_room", "edge": 3, "offset": 2.0, "width": 0.9, "type": "door",
     "hinge": "left", "swing": "in", "contact": "binary_sensor.front_door", "lock": "lock.front_door"},
    {"id": "d_kitchen", "room_id": "living_room", "edge": 1, "offset": 2.0, "width": 0.8, "type": "door",
     "style": "passage"},
    {"id": "d_bedroom", "room_id": "living_room", "edge": 2, "offset": 2.5, "width": 0.8, "type": "door",
     "hinge": "right", "swing": "in"},
    {"id": "w_living", "room_id": "living_room", "edge": 0, "offset": 2.5, "width": 1.6, "type": "window",
     "contact": "binary_sensor.living_room_window", "blind": "cover.living_room_blind"}
  ],
  "furniture": [
    {"id": "f_sofa", "type": "sofa", "x": 2.5, "z": 3.1, "rotation": 0, "w": 2.0, "d": 0.9},
    {"id": "f_tv", "type": "tv_wall", "x": 2.5, "z": 0.1, "rotation": 0, "w": 1.4, "d": 0.1, "entity": "media_player.tv"},
    {"id": "f_bed", "type": "bed", "x": 2.5, "z": 5.6, "rotation": 0, "w": 1.8, "d": 2.0},
    {"id": "l_living", "type": "lamp_ceiling", "x": 2.5, "z": 2.0, "entity": "light.living_room", "room_light": 1},
    {"id": "l_strip", "type": "led_strip", "x": 2.5, "z": 3.9, "w": 3.0, "d": 0.05, "entity": "light.living_room_strip"},
    {"id": "dock", "type": "robot_vacuum", "x": 0.4, "z": 3.4, "entity": "vacuum.robot",
     "room_sensor": "sensor.robot_current_room", "room_map": {"Salon": "living_room"}}
  ],
  "sensors": [
    {"id": "s_motion", "entity": "binary_sensor.living_room_motion", "x": 4.6, "z": 0.4}
  ],
  "devices": [
    {"id": "dev_radiator", "kind": "radiator", "entity": "climate.living_room", "x": 4.7, "z": 2.0},
    {"id": "dev_dishwasher", "kind": "dishwasher", "name": "Zmywarka", "entity": "sensor.dishwasher_state",
     "x": 7.4, "z": 0.8, "active": ["run"], "text_on": "{{ states('sensor.dishwasher_remaining') }} min"}
  ],
  "texts": [
    {"id": "t_out", "text": "{{ states('sensor.outdoor_temperature') }} °C", "x": 6.5, "z": 5.0, "background": "none"}
  ],
  "labels": {"kitchen": [6.5, 3.4]}
}
```
