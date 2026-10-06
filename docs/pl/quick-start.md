# Szybki start

Od zera do działającego planu w dziesięciu krokach. Zakładamy, że integracja jest [zainstalowana](installation.md).

1. **Otwórz edytor.** Kliknij **Plan piętra** w pasku bocznym albo otwórz `/fns-floorplan`.
2. **Przełącz na Pomieszczenia.** Przełącznik trybu u góry ma opcje **Elementy** i **Pomieszczenia**. Wybierz **Pomieszczenia**.
3. **Dodaj pomieszczenie.** Otwórz **Dodaj** i wybierz **Pomieszczenie**. Pojawi się kwadrat 2 na 2 metry. Przeciągaj jego niebieskie punkty narożne, aż nada kształt twojemu pomieszczeniu; przeciągnij półprzezroczyste punkty między narożnikami, aby dodać nowy narożnik. Szczegóły w [Pomieszczenia](editor/rooms.md).
4. **Nazwij je.** W panelu bocznym wpisz nazwę pomieszczenia i opcjonalnie encję temperatury i wilgotności.
5. **Dodaj kolejne pomieszczenia.** Przeciągnij je obok siebie, narożniki przyciągają się do narożników sąsiadów w odległości do 15 cm.
6. **Dodaj drzwi i okna.** Zaznacz pomieszczenie, wybierz ścianę w panelu bocznym i dodaj drzwi lub okno; przesuń je wzdłuż ściany. Zobacz [Drzwi i okna](editor/openings.md).
7. **Przełącz na Elementy.** Dodaj światła, urządzenia, czujniki i meble przyciskiem **Dodaj**. Do każdego wybierz encję. Zobacz [Elementy](editor/items.md).
8. **Zapisz.** Kliknij **Zapisz**. Plan jest przechowywany w Home Assistancie, a każda otwarta karta sama się przerysuje.
9. **Dodaj kartę.** Edytuj pulpit, **Dodaj kartę**, wyszukaj **FNS Floorplan** albo użyj YAML:

    ```yaml
    type: custom:fns-floorplan-card
    mode: auto
    rotate: auto
    ```

10. **Wypróbuj.** Włącz światło, otwórz czujnik drzwi, uruchom zmywarkę. Dotknij pomieszczenia, aby otworzyć [panel pomieszczenia](room-panel.md).

![Edytor z planem trzypokojowego mieszkania, otwarty panel boczny](../assets/screenshots/pl/editor-overview.png){ loading=lazy }

## Przechodzisz z NeonPlan 3D? { #coming-from-neonplan-3d }

FNS Floorplan powstał z inspiracji [NeonPlan 3D](https://github.com/Mastershort/neonplan3d). Jeśli swój dom narysowałeś już tam, możesz go jednorazowo przekonwertować zamiast zaczynać od zera:

1. Pobierz budynek z NeonPlan poleceniem websocket `neonplan3d/building/get` i zapisz wynik jako `building.json`.
2. Przekonwertuj go:

    ```bash
    python3 tools/import_neonplan.py building.json > plan.json
    ```

    Opcjonalny drugi plik (`extras.json`) dodaje to, czego NeonPlan nie zna: urządzenia, pozycje etykiet i reguły. Zobacz komentarz na początku skryptu.

3. Zapisz `plan.json` przez `fns_floorplan/plan/save` (zobacz [Websocket API](reference/websocket-api.md)) i dopracuj wynik w edytorze.

!!! warning
    Import zastępuje cały plan. Uruchom go raz na początku, nie po tym, jak edytowałeś plan.

## Dobre następne kroki

- Spraw, by urządzenie reagowało na coś więcej niż swój stan, za pomocą [Reguł](editor/rules.md).
- Dodaj odkurzacz: [Odkurzacz](robot-vacuum.md).
- Podłóż pod plan obraz rzutu i obrysuj go: [Przegląd edytora](editor/index.md#tracing-image).
- Kilka pięter: [Przegląd edytora](editor/index.md#levels-floors).
