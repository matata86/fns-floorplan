# Lista zmian

Każde wydanie wraz z uwagami znajdziesz w [wydaniach na GitHubie](https://github.com/matata86/fns-floorplan/releases). Ta strona podsumowuje linię 0.6.x tematycznie.

## 1.0.11 – 1.0.13

- Panel pomieszczenia: odtwarzacze multimediów i piloty mają własną sekcję **Multimedia** (z suwakiem głośności), odkurzacze i kosiarki automatyczne sekcję **Roboty**.
- Edytor: ikona wybrana po wyszukaniu w selektorze ikon reguły zostaje zapamiętana, a formularz zachowuje pozycję przewijania, gdy po zmianie pola strona się wydłuża lub skraca.
- Reguły: reguła ustawiająca pierścień (np. odliczanie sterowane timerem) uruchamia go teraz także wtedy, gdy samo urządzenie jest wyłączone.

## 1.0.1 do 1.0.9

- Panel pomieszczenia: kamery pokazują obraz na całą szerokość panelu; rolety drzwi i okien pomieszczenia (i rolety z dodatkowych encji) z przyciskami otwórz / stop / zamknij obok nazwy i suwakiem położenia pod nimi.
- Listy pomieszczenia (szczegóły etykiety i dodatkowe encje): wybór **Dodaj encję** pod każdym polem, początkowe `- ` jest akceptowane, a wpis może być szablonem, który zwraca id encji, także na kilka wierszy (`{% if %} … {% endif %}`).
- Edytor: „Wywołaj akcję” wybiera akcję spośród akcji znanych Home Assistantowi, z wyszukiwaniem; wybierane pola z wyszukiwaniem pokazują przetłumaczoną nazwę zamiast surowej wartości.
- Edytor: formularz po zmianie już nie skacze na górę.
- Edytor: krótka wskazówka pod listami pomieszczenia wyjaśnia wpisy i szablony.

## 1.0.0 (seria 0.7.x)

- Zakładka edytora **Wygląd**: kolory planu (ściany, podłoga i etykiety na dzień i noc, akcent, światła, otwarte drzwi i okna, alarm, rolety, temperatura) z podglądem karty na żywo. Domyślne kolory światła, otwarcia i alarmu wynikają z motywu Home Assistanta.
- Panel pomieszczenia: karty są w `hui-card` jak na dashboardzie, więc działają style motywu (UIX / card-mod); nagłówki sekcji to karty nagłówka w stylu podtytułu z ikonami; światła jako karta Mushroom, jeśli jest zainstalowana, w przeciwnym razie kafelki ze sterowaniem.
- Etykiety urządzeń: położenie (góra, dół, lewo, prawo) i pionowy tekst.
- Edytor na telefonie: formularz otwiera się w arkuszu prawie na całą wysokość jak more-info, ze stałym nagłówkiem; okrągły przycisk Zapisz.
- Poprawki: wybór ikony w HA 2026.9, jednostka temperatury w etykietach pomieszczeń, płynniejsze animacje pierścieni na telefonach.

## Panel pomieszczenia (0.6.44 do 0.6.50)

- Panel pomieszczenia najpierw wysuwał się jako ekran boczny, a potem stał się panelem podobnym do pulpitu: kafelki Home Assistanta, dwie kolumny, tło motywu, nagłówek z ikoną pomieszczenia, temperaturą i wilgotnością.
- Sekcje: termostat, światła z jasnością w wierszu, kamery, okna i drzwi, przełączniki, urządzenia, czujniki, inne. Sterowanie zamkiem i odkurzaczem.
- Ikona pomieszczenia, `sheet_hide` dla odkurzacza.
- Sortowane i przeszukiwalne selektory typów z typem „Inne”.

## Odkurzacz (0.6.14 do 0.6.42)

- Parowanie pomieszczeń odkurzacza z pomieszczeniami planu, pierścień baterii i stan ładowania, kolory motywu według stanu.
- Zatrzymany robot stoi w swoim pomieszczeniu na wolnym miejscu i miga, błędy są czerwone.
- Robot zachowuje orientację ze stacji, po załadowaniu strony pojawia się w swoim pomieszczeniu, jeździ pod encjami i nad meblami.
- Objazd całego piętra, gdy jego pomieszczenie jest nieznane; sekcja „w trakcie pracy” i warstwa dla stacji.

## Edytor (0.6.9 do 0.6.43)

- Pasek narzędzi, menu i panel boczny z natywnych elementów Home Assistanta, panel boczny o zmiennej szerokości, selektor kolorów powiązany ze zmiennymi motywu.
- Układ na telefon z dolnym arkuszem.
- Edycja pomieszczeń: przeciąganie całych ścian, przyciąganie do sąsiadów, wspólne ściany, długości ścian, kąty co 15 stopni, markery prostych linii, sofa narożna.
- Przeciąganie drzwi i okien na inne ściany; Ctrl+X; YAML osobno dla każdej reguły; tryb szablonów Jinja dla warunków; przyciski ikon „Bez ikony” i „Resetuj”.

## Reguły i animacje (0.6.1 do 0.6.43)

- Animacje ikon według nazwy ikony, efekty pierścieni (radar, comet, countdown i inne), wyjście reguły `fx`.
- Odliczanie z timera, z czujnika czasu trwania lub znacznika czasu, z encji procentowej (wypełnia się jak bateria) albo o ustalonej długości.
- Kolory i pierścienie reguł dla świateł, taśm LED, stacji i mebli.
- Propozycje reguł z AI Task; YAML reguł w edytorze kodu Home Assistanta; selektor ikon w regułach.
- „Inne urządzenie” zachowuje się według domeny swojej encji; awatary osób; miganie sceny i przycisku.

## Wygląd (0.6.5 do 0.6.19)

- Ściany i tło karty w kolorach motywu, pasek znaczników warstw nad planem z legendą ciepła, płynne fale ruchu, brak szwu w trybie ciemnym, pasek odtwarzania pod planem.

Wcześniejsze wersje niż 0.6 znajdziesz w wydaniach na GitHubie i w historii repozytorium.
