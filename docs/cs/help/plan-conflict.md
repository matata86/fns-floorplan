# Při ukládání se hlásí, že se půdorys mezitím změnil (konflikt)

## Co vidíš

Uložení v editoru selže se zprávou, že se půdorys mezitím změnil.

## Proč se to děje

Někdo, nebo jiná karta prohlížeče, uložil novější revizi půdorysu. Půdorys se ukládá celý, takže uložení tvé starší kopie by tu novější revizi přepsalo. Editor to nedovolí.

## Co s tím

1. V editoru zvol **Zahodit změny**, půdorys se znovu načte v nejnovější revizi.
2. Svou úpravu zopakuj a znovu ulož.
3. Zavři ostatní karty s editorem, ať se vzájemně nepřepisují.

## Související

- [Websocket API: revize a konflikty](../reference/websocket-api.md#revisions-and-conflicts)
- [Historie a kontrola](../history.md)
