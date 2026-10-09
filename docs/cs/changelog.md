# Změny

Každé vydání je s poznámkami uvedeno na [GitHub releases](https://github.com/matata86/fns-floorplan/releases). Tato stránka shrnuje řadu 0.6.x podle témat.

## 1.0.11 – 1.0.31

- Panel místnosti: světlo s teplotou barvy nebo barvou má pod názvem opět jas, teplotu a oblíbené barvy.

- Karta: radar zastřeženého alarmu se na Androidu už neslévá do plného kotouče (výseč se posouvá přes odsazení tahu, ne rotací skupiny). Animace stojí, když je karta mimo obrazovku nebo je otevřený panel místnosti, obyčejný prstenec prvku se animuje jen tehdy, když je opravdu zobrazený, a záře LED pásků rozmazává jen svou oblast. Plynulejší na telefonech.

- Prvky: „Text, když běží“ se řídí skutečným stavem entity; efekt z pravidla (třeba odpočet u vypnutého zařízení) ho už nezobrazí.

- Prvky: velikost kolečka (`size`) a popisku (`label_size`) se nastavuje zvlášť.

- Místnosti: jde nastavit velikost jmenovky (`label_size`, od XS po XXL).

- Editor: po čerstvé instalaci (prázdný plán) jde zase přidat místnost; dřív se nic nestalo. Panel místnosti: binární senzory ukazují jen čas poslední změny a každá sekce je seřazená podle typu.

- Panel místnosti: cílová teplota termostatu je v řádku dlaždice; světla jsou vždy obyčejné dlaždice (žádná karta Mushroom; spínač mezi světly se teď přepíná ikonou); dlaždice se obnoví jen při změně vlastní entity, panel už nelaguje.

- Panel místnosti: přehrávače médií a ovladače mají vlastní sekci **Média** (s posuvníkem hlasitosti), robotické vysavače a sekačky sekci **Roboti**.
- Editor: ikona vybraná po hledání ve výběru ikony pravidla se uloží a formulář drží pozici posunu, i když se po změně pole stránka zvětší nebo zmenší.
- Pravidla: pravidlo, které nastaví prstenec (např. odpočet řízený časovačem), ho teď spustí i když je samotné zařízení vypnuté.
- Panel místnosti: přehrávače médií a robotické vysavače zabírají celou šířku v jednom řádku (hlasitost a tlačítka vedle názvu); okna a dveře ukazují, kdy byly naposledy otevřené, místo svého stavu; senzory pohybu (PIR) a úniku vody umístěné v místnosti jsou v Senzorech (se stavem a časem poslední změny).
- Panel místnosti: okna, dveře a umístěné senzory s časem poslední změny zabírají celou šířku, aby se text neořezával.
- Panel místnosti: okna, dveře a umístěné senzory ukazují jen čas poslední změny (stav ukazuje ikona) a jsou zase po dvou v řadě.

## 1.0.1 až 1.0.9

- Panel místnosti: kamery ukazují obraz přes celou šířku panelu; rolety dveří a oken místnosti (i rolety z dalších entit) s tlačítky otevřít / stop / zavřít vedle názvu a posuvníkem polohy pod nimi.
- Seznamy místnosti (podrobnosti jmenovky a další entity): výběr **Přidat entitu** pod každým polem, úvodní `- ` se přijme a záznam může být šablona, která vypíše id entit, i přes víc řádků (`{% if %} … {% endif %}`).
- Editor: „Zavolat akci“ vybírá akci z akcí, které Home Assistant zná, s vyhledáváním; výběry s vyhledáváním ukazují přeložený název místo surové hodnoty.
- Editor: formulář po změně už neskočí nahoru.
- Editor: krátká nápověda pod seznamy místnosti vysvětluje záznamy a šablony.

## 1.0.0 (řada 0.7.x)

- Záložka editoru **Vzhled**: barvy půdorysu (stěny, podlaha a popisky pro den a noc, akcent, světla, otevřené dveře a okna, alarm, rolety, teplota) s živým náhledem karty. Výchozí barvy světla, otevření a alarmu se řídí motivem Home Assistantu.
- Panel místnosti: karty jsou v `hui-card` jako na dashboardu, takže na ně platí styly motivu (UIX / card-mod); nadpisy sekcí jsou nadpisové karty ve stylu podtitulku s ikonami; světla jako Mushroom karta, je-li nainstalovaná, jinak dlaždice s ovládáním.
- Popisky zařízení: umístění (nahoře, dole, vlevo, vpravo) a svislý text.
- Editor na telefonu: formulář se otevře v listu skoro přes celou výšku jako more-info, s pevnou hlavičkou; kulaté tlačítko Uložit.
- Opravy: výběr ikony v HA 2026.9, jednotka teploty v popiscích místností, plynulejší animace kruhů na telefonu.

## Panel místnosti (0.6.44 až 0.6.50)

- Panel místnosti se nejdřív vysouval jako boční obrazovka a pak se stal panelem podobným dashboardu: dlaždice Home Assistantu, dva sloupce, pozadí z motivu, hlavička s ikonou místnosti, teplotou a vlhkostí.
- Sekce: termostat, světla s jasem přímo v řádku, kamery, okna a dveře, spínače, zařízení, senzory, ostatní. Ovládání zámků a vysavačů.
- Ikona místnosti, `sheet_hide` pro robotický vysavač.
- Řazené a vyhledávatelné výběry typů s typem „Jiný“.

## Robotický vysavač (0.6.14 až 0.6.42)

- Párování místností vysavače s místnostmi půdorysu, kruh baterie a stav nabíjení, barvy motivu podle stavu.
- Zastavený robot stojí ve své místnosti na volném místě a bliká, chyby jsou červené.
- Robot si drží orientaci doku, po načtení stránky se objeví ve své místnosti, jezdí pod entitami a nad nábytkem.
- Obchůzka celého patra, když není známá jeho místnost; sekce „Když běží“ a vrstva pro dok.

## Editor (0.6.9 až 0.6.43)

- Lišta nástrojů, nabídky a boční panel z nativních prvků Home Assistantu, boční panel s měnitelnou šířkou, výběr barvy napojený na proměnné motivu.
- Rozvržení pro telefon se spodním listem.
- Úpravy místností: tažení celých stěn, přichytávání k sousedům, sdílené stěny, délky stěn, úhly po 15 stupních, značky rovnosti, rohová sedačka.
- Přetahování dveří a oken na jiné stěny; Ctrl+X; YAML u každého pravidla; režim šablon Jinja pro podmínky; tlačítka ikon „Bez ikony“ a „Vrátit výchozí“.

## Pravidla a animace (0.6.1 až 0.6.43)

- Animace ikon podle názvu ikony, efekty kruhu (radar, kometa, odpočet a další), výstup pravidla `fx`.
- Odpočet z časovače, senzoru doby nebo časového razítka, procentuální entity (plní se jako baterie) nebo pevné délky.
- Barvy pravidel a kruhy pro světla, LED pásky, dok a nábytek.
- Návrhy pravidel od AI Task; YAML pravidel v editoru kódu Home Assistantu; výběr ikon v pravidlech.
- „Jiné zařízení“ se chová podle domény své entity; avatary osob; blikání scén a tlačítek.

## Vzhled (0.6.5 až 0.6.19)

- Zdi a pozadí karty v barvách motivu, lišta odznaků vrstev nad půdorysem s legendou tepla, plynulé vlnky pohybu, žádný šev v tmavém režimu, lišta přehrávání pod půdorysem.

Starší verze než 0.6 najdeš na GitHub releases a v historii repozitáře.
