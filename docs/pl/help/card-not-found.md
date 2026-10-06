# Karta nie jest znaleziona po instalacji

## Co widzisz

Selektor kart nie wyświetla FNS Floorplan albo pulpit pokazuje błąd zamiast karty.

## Dlaczego tak się dzieje

Integracja rejestruje kartę podczas uruchamiania Home Assistanta, a przeglądarka trzyma stare pliki frontendu w pamięci podręcznej, dopóki ich nie wyczyścisz. Nie potrzebujesz zasobu pulpitu, integracja dodaje kartę sama.

## Co zrobić

1. Zrestartuj Home Assistanta po instalacji.
2. Odśwież stronę w przeglądarce z wyczyszczeniem pamięci podręcznej (++ctrl+shift+r++). W aplikacji mobilnej wyczyść pamięć podręczną w ustawieniach aplikacji.
3. Otwórz **Ustawienia, Urządzenia oraz usługi** i sprawdź, czy FNS Floorplan jest na liście i załadowany bez błędów.
4. Jeśli go tam nie ma, dodaj go zgodnie z przewodnikiem instalacji.

## Zobacz też

- [Instalacja](../installation.md)
- [Pojawia się „Custom element doesn't exist” lub błąd konfiguracji](custom-element-missing.md)
- [Karta pokazuje starą wersję po aktualizacji](old-version-after-update.md)
