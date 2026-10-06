# Chybí ikony

## Co vidíš

Některé položky nemají ikonu nebo ukazují prázdný čtverec.

## Proč se to děje

Karta obsahuje sadu Material Design Icons. Jakákoli jiná ikona `mdi:` se čte z vlastního prvku ikon Home Assistantu, takže se objeví, až ji frontend načte. Vlastní sady ikon musí zajistit sám Home Assistant.

## Co s tím

1. Jednou znovu načti stránku.
2. Zkontroluj název ikony, musí vypadat jako `mdi:lightbulb`.
3. U ikon z vlastní sady zajisti, aby tu sadu poskytoval sám Home Assistant.

## Související

- [Položky](../editor/items.md)
- [Pravidla](../editor/rules.md)
