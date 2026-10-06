# Brakuje ikon

## Co widzisz

Niektóre elementy nie mają ikony albo pokazują pusty kwadrat.

## Dlaczego tak się dzieje

Karta zawiera własny zestaw ikon Material Design Icons. Każda inna ikona `mdi:` jest odczytywana z własnego elementu ikony Home Assistanta, więc pojawia się dopiero po jej załadowaniu przez frontend. Niestandardowe zestawy ikon musi dostarczyć sam Home Assistant.

## Co zrobić

1. Odśwież stronę jeden raz.
2. Sprawdź nazwę ikony, powinna wyglądać jak `mdi:lightbulb`.
3. W przypadku ikon z niestandardowego zestawu upewnij się, że ten zestaw dostarcza sam Home Assistant.

## Zobacz też

- [Elementy](../editor/items.md)
- [Reguły](../editor/rules.md)
