# Karta hlásí, že čeká na integraci

## Co vidíš

Místo půdorysu karta ukazuje zprávu, že čeká na integraci.

## Proč se to děje

Karta odebírá půdorys přes websocket. Hned po restartu nemusí být integrace ještě načtená. Karta to několik sekund zkouší a znovu i po obnovení spojení.

## Co s tím

1. Po restartu pár sekund počkej.
2. Otevři **Nastavení, Zařízení a služby** a zkontroluj, že je integrace přidaná a načtená.
3. Podívej se do logu Home Assistantu, jestli tam nejsou chyby z `fns_floorplan`.
4. Pokud zpráva zůstane, znovu načti stránku.

## Související

- [Instalace](../installation.md)
- [Po instalaci se karta nenajde](card-not-found.md)
