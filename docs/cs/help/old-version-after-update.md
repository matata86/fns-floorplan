# Po aktualizaci karta zobrazuje starou verzi

## Co vidíš

Aktualizoval jsi integraci, ale karta nebo editor vypadá a chová se jako dřív.

## Proč se to děje

Karta se načítá s verzí v adrese. Dokud se Home Assistant nerestartuje, servíruje starou verzi a prohlížeč nebo aplikace může mít staré soubory v cache.

## Co s tím

1. Po aktualizaci restartuj Home Assistant.
2. Načti stránku natvrdo znovu (++ctrl+shift+r++).
3. V aplikaci Home Assistant vymaž cache v nastavení aplikace.

## Související

- [Instalace: Aktualizace](../installation.md)
- [Po instalaci se karta nenajde](card-not-found.md)
