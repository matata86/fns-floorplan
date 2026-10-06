# FNS Floorplan

FNS Floorplan promění dashboard v Home Assistantu v živý půdorys domova. Světla září svou skutečnou barvou, dveře a okna se otevírají, pohybové senzory vysílají vlnky, robotický vysavač jezdí po místnosti, ve které zrovna uklízí, a pračka ukazuje, jak dlouho ještě poběží. Půdorys si nakreslíš ve vestavěném editoru, bez YAML a bez práce s obrázky.

!!! info "Inspirováno NeonPlan 3D"
    FNS Floorplan vznikl z inspirace kartou [NeonPlan 3D](https://github.com/Mastershort/neonplan3d), 3D půdorysem pro Home Assistant. Jeho myšlenku převádí do animovaného 2D plánu s vlastním editorem. [Přicházíš z NeonPlan 3D?](quick-start.md#coming-from-neonplan-3d)

![Animovaná karta s půdorysem bytu se zapnutými světly, otevřenými dveřmi a robotickým vysavačem](../assets/screenshots/cs/card-overview.png){ loading=lazy }

| Tmavý motiv | Světlý motiv |
|---|---|
| ![Karta v tmavém motivu](../assets/screenshots/cs/card-dark.png){ loading=lazy } | ![Karta ve světlém motivu](../assets/screenshots/cs/card-light.png){ loading=lazy } |

Skládá se ze dvou částí, které se přes HACS instalují jako jedna integrace:

- **karta** `custom:fns-floorplan-card`, kterou vložíš na libovolný dashboard,
- **editor**, panel v postranním menu s názvem **Půdorys** (adresa `/fns-floorplan`, jen pro administrátory), kde kreslíš místnosti, rozmísťuješ prvky a nastavuješ pravidla.

[Vyzkoušej živé demo :material-open-in-new:](https://matata86.github.io/fns-floorplan/demo/){ .md-button .md-button--primary }
[Instalace](installation.md){ .md-button }

## Co umí

<div class="grid cards" markdown>

- :material-vector-polygon: **Nakresli si půdorys sám**

    Tahej rohy místností i celé stěny, přichytávej je k sousedům, přidávej dveře a okna. Viz [Místnosti](editor/rooms.md) a [Dveře a okna](editor/openings.md).

- :material-lightbulb-on: **Živá světla a zařízení**

    Světla, LED pásky, spotřebiče, senzory i nábytek sledují stav svých entit. Viz [Položky](editor/items.md).

- :material-script-text: **Pravidla**

    Podmíněné barvy, ikony, texty, kruhy a odpočty podle stavů entit nebo šablon Jinja. Viz [Pravidla](editor/rules.md).

- :material-robot-vacuum: **Robotický vysavač**

    Robot jezdí po místnosti, kterou hlásí, a mezi místnostmi projíždí dveřmi. Viz [Robotický vysavač](robot-vacuum.md).

- :material-gesture-tap: **Panel místnosti**

    Klepni na místnost a vysune se panel s termostatem, světly, kamerami a zařízeními. Viz [Panel místnosti](room-panel.md).

- :material-history: **Historie a přehrávání**

    Obnov jeden z posledních 20 uložených plánů nebo si přehraj posledních 24 hodin ve svém domě. Viz [Historie a kontrola](history.md) a [Karta](card.md).

</div>

## Kam dál

- Jsi tu poprvé? Projdi si [Instalaci](installation.md) a pak [Rychlý start](quick-start.md), funkční půdorys budeš mít asi za deset kroků.
- Chceš to nejdřív vidět? Otevři [živé demo](https://matata86.github.io/fns-floorplan/demo/), běží v něm skutečná karta s vymyšlenými stavy.
- Hledáš konkrétní volbu v YAML? Podívej se do [Karty](card.md) a do [Formátu plánu](reference/plan-format.md).
- Něco nefunguje? Mrkni do [Častých otázek](faq.md).
