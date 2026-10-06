# Pojawia się „Custom element doesn't exist” lub błąd konfiguracji

## Co widzisz

Przez chwilę (albo do następnego odświeżenia) karta pokazuje „Custom element doesn't exist: fns-floorplan-card” lub błąd konfiguracji, choć wcześniej działała.

## Dlaczego tak się dzieje

Niektóre dodatki do pulpitu podmieniają rejestr custom elementów przeglądarki, więc karta jest zarejestrowana w rejestrze, który nie jest już używany. Karta, jej edytor i panel sprawdzają swoją rejestrację ponownie po 0,5, 2, 5 i 10 sekundach i same ją naprawiają.

## Co zrobić

1. Poczekaj około dziesięciu sekund, karta zwykle sama się naprawia.
2. Jeśli błąd zostaje, odśwież stronę.
3. Jeśli da się go odtworzyć, otwórz zgłoszenie i wypisz używane dodatki do frontendu.

## Zobacz też

- [Karta nie jest znaleziona po instalacji](card-not-found.md)
- [Zgłoszenia na GitHubie](https://github.com/matata86/fns-floorplan/issues)
