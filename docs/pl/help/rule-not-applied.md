# Reguła nie działa

## Co widzisz

Element ignoruje napisaną przez ciebie regułę albo pokazuje inny kolor, ikonę lub tekst niż oczekiwano.

## Dlaczego tak się dzieje

Dla każdego pola wyjściowego wygrywa **pierwsza** reguła, która pasuje i ustawia to pole. Stany encji są łańcuchami znaków, więc `on` bez cudzysłowu w YAML jest odczytywane jako wartość logiczna. Szablony są renderowane na żywo przez Home Assistanta, ale nie są obliczane w podglądzie edytora.

## Co zrobić

1. Sprawdź kolejność reguł, dla każdego pola wygrywa pierwsze dopasowanie.
2. W YAML pisz `state: "on"` w cudzysłowie.
3. Oceniaj szablony na prawdziwej karcie, nie w podglądzie edytora.

## Zobacz też

- [Reguły](../editor/rules.md)
- [Światło nie świeci w kolorze, jakiego oczekuję](light-wrong-colour.md)
