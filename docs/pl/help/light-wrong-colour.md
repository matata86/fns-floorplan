# Światło nie świeci w kolorze, jakiego oczekuję

## Co widzisz

Poświata światła jest ciepłą bielą albo ma inny kolor, niż faktycznie pokazuje lampa.

## Dlaczego tak się dzieje

Poświata używa `rgb_color`, w przeciwnym razie `color_temp_kelvin`, a w ostateczności ciepłej bieli. Reguła z `color` nadpisuje to wszystko.

## Co zrobić

1. Otwórz encję światła w Home Assistancie i sprawdź jej atrybuty `rgb_color` i `color_temp_kelvin`.
2. Sprawdź, czy na elemencie nie ustawiono reguły z `color`.
3. Jeśli lampa nie zgłasza żadnego z tych atrybutów, ciepła biel jest oczekiwanym efektem; ustaw regułę `color`, jeśli chcesz czegoś innego.

## Zobacz też

- [Reguły](../editor/rules.md)
- [Elementy](../editor/items.md)
- [Reguła nie działa](rule-not-applied.md)
