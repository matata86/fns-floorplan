# Po instalaci se karta nenajde

## Co vidíš

Ve výběru karet FNS Floorplan není, nebo dashboard místo karty ukazuje chybu.

## Proč se to děje

Integrace kartu zaregistruje při startu Home Assistantu a prohlížeč si staré soubory frontendu drží v cache, dokud je nevymažeš. Zdroj dashboardu nepotřebuješ, integrace kartu přidá sama.

## Co s tím

1. Po instalaci restartuj Home Assistant.
2. Znovu načti stránku v prohlížeči s vymazanou cache (++ctrl+shift+r++). V aplikaci vymaž cache v nastavení aplikace.
3. Otevři **Nastavení, Zařízení a služby** a zkontroluj, že je FNS Floorplan v seznamu a načetl se bez chyb.
4. Pokud tam chybí, přidej ho podle návodu k instalaci.

## Související

- [Instalace](../installation.md)
- [Občas se objeví „Custom element doesn't exist“ nebo chyba konfigurace](custom-element-missing.md)
- [Po aktualizaci karta zobrazuje starou verzi](old-version-after-update.md)
