# Drzwi i okna

Drzwi i okna („otwory”) należą do ściany pomieszczenia. Edytujesz je w trybie **Pomieszczenia**.

![Drzwi z łukiem otwierania i okno z roletą w edytorze](../../assets/screenshots/pl/openings-editor.png){ loading=lazy }

## Dodawanie i przesuwanie

1. Zaznacz pomieszczenie i wybierz ścianę w panelu bocznym (albo zaznacz pomieszczenie i użyj przycisków dodawania drzwi / okna na wybranej ścianie).
2. Na tej ścianie pojawia się nowe drzwi lub okno.
3. **Kliknij** je, aby zaznaczyć, i **przeciągnij** wzdłuż ściany, aby je przesunąć. Klawisze strzałek przesuwają je o 5 cm.
4. Przeciągnij je na ścianę **innego pomieszczenia**, a przeniesie się tam (wygrywa najbliższa ściana na piętrze).

Dodanie lub usunięcie narożnika pomieszczenia nigdy nie przesuwa otworu z miejsca, w którym był.

![Przesuwanie drzwi wzdłuż ściany i przeciąganie ich na ścianę innego pomieszczenia.](../../assets/screenshots/gif/drag-opening.gif){ loading=lazy }

*Przesuwanie drzwi wzdłuż ściany i przeciąganie ich na ścianę innego pomieszczenia.*

![Dwa uchwyty zaznaczonych drzwi zamieniają stronę zawiasów i kierunek otwierania.](../../assets/screenshots/gif/flip-door.gif){ loading=lazy }

*Dwa uchwyty zaznaczonych drzwi zamieniają stronę zawiasów i kierunek otwierania.*

## Ustawienia

| Ustawienie | Klucz | Znaczenie |
|---------|-----|---------|
| Typ | `type` | `door` lub `window` |
| Styl drzwi | `style` | Zwykłe drzwi (wewnętrzne, wejściowe, przeszklone) albo `passage` = sam otwór bez skrzydła |
| Szerokość | `width` | W metrach |
| Przesunięcie | `offset` | Odległość środka otworu od początku ściany |
| Zawiasy | `hinge` | `left` lub `right`, patrząc z wnętrza pomieszczenia |
| Kierunek otwierania | `swing` | `in` lub `out` |
| Czujnik | `contact` | Czujnik binarny (kontaktron drzwi / okna) |
| Zamek | `lock` | Encja `lock` pokazywana przy drzwiach |
| Roleta | `blind` | Encja `cover` rysowana jako pasek wzdłuż okna |

Skrzydło i łuk pokazują zawiasy i kierunek otwierania. Gdy otwór jest zaznaczony, przycisk **odwróć zawiasy** odbija stronę zawiasów, a **odwróć kierunek** kierunek otwierania, wprost na planie.

## Czujnik kontaktowy

Z `contact` otwór animuje się jako otwarty (drzwi uchylają się do 90 stopni), świeci na pomarańczowo, gdy jest otwarty, i pulsuje przez pierwsze 6 sekund po otwarciu. Bez czujnika:

- **drzwi** są rysowane uchylone pod kątem 45 stopni,
- **okno** lub przeszklone drzwi balkonowe pozostają zamknięte.

Dotknięcie otworu na karcie otwiera szczegóły czujnika (more-info). Na otworach można też ustawić [akcje dotknięcia](items.md#actions).

## Zamki

`lock` przyjmuje encję zamka i rysuje przy drzwiach, wewnątrz pomieszczenia, mały znacznik zamka. Jest zielony, gdy zamknięty, pomarańczowy, gdy otwarty, czerwony, gdy zablokowany, i niebieski z pierścieniem podczas zamykania lub otwierania. Dotknięcie otwiera tylko szczegóły, więc drzwi nigdy nie zostaną otwarte przez przypadek. Rozmiar to `lock_size` (domyślnie S).

## Rolety

`blind` to encja `cover` (roleta zewnętrzna lub okienna). Jest rysowana jako pasek wzdłuż okna, który wydłuża się, gdy roleta się zamyka, na kropkowanym torze wzdłuż całej szerokości okna: zamknięcie w 50 % wypełnia połowę. Gdy cover się porusza, pasek się animuje. Dotknięcie rolety otwiera jej szczegóły.

| Klucz | Efekt |
|-----|--------|
| `blind_side: out` | Rysuje roletę na zewnątrz ściany zamiast wewnątrz |
| `blind_invert: true` | Dla rolet, które zgłaszają 100 jako „zamknięte” |

Pozycja pochodzi z `current_position` covera, a bez niej z `closed`.

## Przykład

```yaml
openings:
  - id: d_front
    room_id: hall
    edge: 0
    offset: 1.1
    width: 0.9
    type: door
    hinge: left
    swing: in
    contact: binary_sensor.front_door
    lock: lock.front_door
  - id: w_living
    room_id: living_room
    edge: 2
    offset: 1.8
    width: 1.4
    type: window
    contact: binary_sensor.living_room_window
    blind: cover.living_room_blind
    blind_side: out
```

Dalej: [Elementy](items.md). Dokumentacja: [Format planu](../reference/plan-format.md#openings).
