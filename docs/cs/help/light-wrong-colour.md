# Světlo nesvítí v barvě, kterou čekám

## Co vidíš

Záře světla je teple bílá nebo jiná, než jakou lampa skutečně svítí.

## Proč se to děje

Záře používá `rgb_color`, jinak `color_temp_kelvin`, jinak teple bílou. Pravidlo s `color` to všechno přebije.

## Co s tím

1. Otevři entitu světla v Home Assistantu a zkontroluj atributy `rgb_color` a `color_temp_kelvin`.
2. Zkontroluj, jestli na položce není pravidlo s `color`.
3. Pokud lampa žádný z atributů nehlásí, je teple bílá očekávaná, pro jinou barvu nastav pravidlo `color`.

## Související

- [Pravidla](../editor/rules.md)
- [Položky](../editor/items.md)
- [Pravidlo se neuplatní](rule-not-applied.md)
