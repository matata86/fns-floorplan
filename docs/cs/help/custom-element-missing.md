# Občas se objeví „Custom element doesn't exist“ nebo chyba konfigurace

## Co vidíš

Karta na chvíli (nebo do dalšího načtení stránky) hlásí „Custom element doesn't exist: fns-floorplan-card“ nebo chybu konfigurace, přestože dřív fungovala.

## Proč se to děje

Některé doplňky dashboardu nahrazují registr vlastních prvků v prohlížeči, takže je karta zaregistrovaná v registru, který se už nepoužívá. Karta, její editor i panel kontrolují svou registraci znovu po 0,5, 2, 5 a 10 sekundách a opraví ji samy.

## Co s tím

1. Počkej asi deset sekund, karta se obvykle opraví sama.
2. Pokud chyba zůstane, znovu načti stránku.
3. Pokud jde chyba reprodukovat, založ issue a uveď seznam doplňků frontendu, které používáš.

## Související

- [Po instalaci se karta nenajde](card-not-found.md)
- [Issues na GitHubu](https://github.com/matata86/fns-floorplan/issues)
