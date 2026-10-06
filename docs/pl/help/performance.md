# Karta działa wolno lub się zacina

## Co widzisz

Duży plan reaguje powoli, animacje się zacinają albo pulpit wydaje się ciężki.

## Dlaczego tak się dzieje

Animacje działają tylko wtedy, gdy coś się porusza i gdy karta jest na ekranie, ukryte karty się nie animują, a animacje ikon respektują `prefers-reduced-motion`. Bardzo duży plan z wieloma elementami i szablonami renderowanymi co sekundę może mimo to być ciężki.

## Co zrobić

1. Ukryj elementy, których nie potrzebujesz, regułami `hide`.
2. Unikaj szablonów renderowanych co sekundę.
3. Sprawdź wskazówki w sekcji o wydajności na stronie karty.

## Zobacz też

- [Karta: Wydajność](../card.md)
- [Reguły](../editor/rules.md)
