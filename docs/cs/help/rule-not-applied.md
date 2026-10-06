# Pravidlo se neuplatní

## Co vidíš

Položka ignoruje pravidlo, které sis napsal, nebo ukazuje jinou barvu, ikonu či text, než čekáš.

## Proč se to děje

U každého výstupního pole vyhrává **první** pravidlo, které odpovídá a pole nastavuje. Stavy entit jsou řetězce, takže `on` bez uvozovek se v YAML přečte jako boolean. Šablony Home Assistant vyhodnocuje živě, ale v náhledu editoru se nepočítají.

## Co s tím

1. Zkontroluj pořadí pravidel, pro každé pole vyhrává první shoda.
2. V YAML piš `state: "on"` v uvozovkách.
3. Šablony posuzuj na skutečné kartě, ne v náhledu editoru.

## Související

- [Pravidla](../editor/rules.md)
- [Světlo nesvítí v barvě, kterou čekám](light-wrong-colour.md)
