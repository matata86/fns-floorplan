# Historia i kontrola

Obie funkcje są w menu z trzema kropkami [edytora](editor/index.md).

## Historia { #history }

Integracja przechowuje **ostatnie 20 zapisanych planów** (w `.storage/fns_floorplan.history`). Każdy zapis odkłada poprzedni plan do historii.

1. Otwórz menu, **Historia**.
2. Lista pokazuje każdą rewizję z datą oraz liczbą pomieszczeń i elementów.
3. Wybierz jedną: wczytuje się do edytora jako **niezapisana zmiana**, więc możesz ją obejrzeć, poprawić i **Zapisać** albo **Odrzucić**.

Przywracanie nigdy nie dotyka zapisanego planu, dopóki go nie zapiszesz. Polecenia za tym stojące znajdziesz w [Websocket API](reference/websocket-api.md#history).

![Lista historii z zapisanymi rewizjami](../assets/screenshots/pl/history-list.png){ loading=lazy }

## Kontrola

**Kontrola** wypisuje problemy planu:

- encje, które **już nie istnieją**,
- encje **niedostępne**,
- elementy **bez encji**,
- to samo wewnątrz reguł,
- nazwy pomieszczeń odkurzacza, które nie są sparowane.

Kliknij wiersz, aby przeskoczyć do danego elementu. Kropka na menu pokazuje, że są problemy.

![Lista kontroli z brakującą encją i niedostępną encją](../assets/screenshots/pl/check-list.png){ loading=lazy }
