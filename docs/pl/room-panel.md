# Panel pomieszczenia

Dotknij pomieszczenia na karcie, a **panel wysuwany** wsunie się od prawej krawędzi ekranu. Wygląda jak pulpit obszaru w Home Assistancie: tło motywu, nagłówek z ikoną pomieszczenia, nazwą, temperaturą i wilgotnością oraz kafelki w dwóch kolumnach. Zamkniesz go krzyżykiem, ++esc++ lub kliknięciem poza panelem.

| Ciemny motyw | Jasny motyw |
|---|---|
| ![Panel salonu: termostat, światła, okno, przełącznik i odkurzacz](../assets/screenshots/pl/room-panel.png){ loading=lazy } | ![Ten sam panel w jasnym motywie](../assets/screenshots/pl/room-panel-light.png){ loading=lazy } |

![Panel przedpokoju: światła, kamera, drzwi, alarm i zamek](../assets/screenshots/pl/room-panel-hall.png){ loading=lazy }

![Otwieranie panelu, ustawianie jasności światła i zamykanie.](../assets/screenshots/gif/room-panel-open.gif){ loading=lazy }

*Otwieranie panelu, ustawianie jasności światła i zamykanie.*

## Sekcje

Panel jest zbudowany z własnych kart kafelkowych Home Assistanta, więc wygląda jak reszta twoich pulpitów. Kliknięcie kafelka otwiera szczegóły, a ikona przełącza to, co da się przełączyć.

| Sekcja | Co się tam znajduje |
|---------|-----------------|
| **Termostat** | encje `climate`: temperatura docelowa minus i plus (wysyłana po 0,7 s), temperatura bieżąca, stan, tryby HVAC |
| **Światła** | Światła umieszczone w pomieszczeniu, z jasnością obok nazwy |
| **Kamery** | Kamery pomieszczenia, obraz na żywo otwiera się w szczegółach |
| **Okna i drzwi** | Otwory pomieszczenia z czujnikiem kontaktowym |
| **Przełączniki** | `switch` i `input_boolean` |
| **Urządzenia** | Urządzenia (zamek dostaje polecenia zamka, odkurzacz polecenia odkurzacza) |
| **Czujniki** | Czujniki pomieszczenia |
| **Inne** | Cała reszta |

Pokazywane są tylko elementy **umieszczone w pomieszczeniu** oraz encje z `sheet_extra`. Obszary Home Assistanta nie są dodawane automatycznie. Odkurzacz pojawia się w pomieszczeniu ze swoją stacją dokującą.

## Wybór tego, co się pokazuje

- `sheet_extra`: lista dodatkowych encji pomieszczenia (pole w formularzu pomieszczenia). `light`, `switch`, `fan`, `input_boolean`, `humidifier` i `siren` dostają przełącznik, pozostałe encje wiersz ze stanem.
- `sheet_hide: true` na dowolnym elemencie (światło, urządzenie, okno, drzwi, zamek, odkurzacz) pomija go.
- `icon` pomieszczenia pojawia się w nagłówku.

```yaml
rooms:
  - id: living_room
    name: Living room
    icon: mdi:sofa
    temperature: sensor.living_room_temperature
    sheet_extra:
      - climate.living_room
      - camera.living_room
      - switch.tv_plug
```

Powrót do [Karta](card.md).
