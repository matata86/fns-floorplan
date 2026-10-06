# Karta pisze, że czeka na integrację

## Co widzisz

Zamiast planu piętra karta pokazuje komunikat, że czeka na integrację.

## Dlaczego tak się dzieje

Karta subskrybuje plan przez websocket. Zaraz po restarcie integracja może jeszcze nie być załadowana. Karta ponawia próbę przez kilka sekund oraz ponownie po przywróceniu połączenia.

## Co zrobić

1. Poczekaj kilka sekund po restarcie.
2. Otwórz **Ustawienia, Urządzenia oraz usługi** i sprawdź, czy integracja jest dodana i załadowana.
3. Przejrzyj log Home Assistanta pod kątem błędów z `fns_floorplan`.
4. Jeśli komunikat zostaje, odśwież stronę.

## Zobacz też

- [Instalacja](../installation.md)
- [Karta nie jest znaleziona po instalacji](card-not-found.md)
