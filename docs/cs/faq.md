# Časté otázky a řešení potíží

## Po instalaci se karta nenajde

Po instalaci restartuj Home Assistant a pak **znovu načti stránku v prohlížeči s vymazanou cache** (++ctrl+shift+r++; v aplikaci vymaž cache v nastavení aplikace). Integrace kartu zaregistruje sama, zdroj dashboardu nepotřebuješ. Zkontroluj, že je FNS Floorplan v seznamu **Nastavení, Zařízení a služby**.

## Občas se objeví „Custom element doesn't exist“ nebo chyba konfigurace

Některé doplňky dashboardu nahrazují registr vlastních prvků v prohlížeči. Karta, její editor i panel kontrolují svou registraci znovu po 0,5, 2, 5 a 10 sekundách a opraví ji. Pokud chyba zůstane, znovu načti stránku; pokud jde reprodukovat, založ issue se seznamem svých doplňků frontendu.

## Po aktualizaci karta zobrazuje starou verzi { #the-card-shows-the-old-version-after-an-update }

Karta se načítá s verzí v adrese. Po aktualizaci restartuj Home Assistant a stránku načti natvrdo znovu. V aplikaci Home Assistant vymaž cache.

## Karta hlásí, že čeká na integraci

Karta odebírá půdorys přes websocket. Hned po restartu nemusí být integrace ještě načtená; karta to několik sekund zkouší a znovu i po obnovení spojení. Pokud zpráva zůstane, zkontroluj, že je integrace přidaná a v logu se načetla bez chyb.

## Půdorys je prázdný

Prázdná karta znamená, že se zatím žádný půdorys neuložil. Otevři **Půdorys** v postranním menu, nakresli místnosti a stiskni **Uložit**. Pokud jsi už ukládal a půdorys zmizel, podívej se do **Historie uložení** v editoru, posledních 20 uložení lze obnovit.

## V postranním menu chybí položka

Je volitelná: **Nastavení, Zařízení a služby, FNS Floorplan, Konfigurovat**. Editor je vždy dostupný na adrese `/fns-floorplan`. Je jen pro administrátory.

## Chybí ikony

Karta obsahuje sadu Material Design Icons. Jakákoli jiná ikona `mdi:` se čte z vlastního prvku ikon Home Assistantu, takže se objeví, až ji frontend načte; stránku jednou znovu načti. Vlastní sady ikon musí zajistit sám Home Assistant.

## Při ukládání se hlásí, že se půdorys mezitím změnil (konflikt)

Někdo (nebo jiná karta prohlížeče) uložil novější revizi. V editoru zvol **Zahodit změny**, půdorys se znovu načte a svou úpravu zopakuješ. Viz [Websocket API](reference/websocket-api.md#revisions-and-conflicts).

## Výkon

Animace běží jen, když se něco hýbe a když je karta na obrazovce; skryté karty se neanimují a animace ikon respektují `prefers-reduced-motion`. Pokud je velmi velký půdorys pomalý, skryj nepotřebné položky pravidly `hide` a nepoužívej šablony, které se překreslují každou sekundu.

## Světlo nesvítí v barvě, kterou čekám

Záře používá `rgb_color`, jinak `color_temp_kelvin`, jinak teple bílou. Pravidlo s `color` ji přebije.

## Pravidlo se neuplatní

U každého výstupního pole vyhrává **první** pravidlo, které odpovídá a pole nastavuje, takže zkontroluj pořadí. Stavy entit jsou řetězce: v YAML piš `state: "on"` v uvozovkách. Šablony Home Assistant vyhodnocuje živě, ale v náhledu editoru se nepočítají.

## Jazyky

Karta i editor se řídí jazykem profilu v Home Assistantu (angličtina, čeština a němčina). Dokumentace je také ve všech třech jazycích, použij přepínač jazyka v horní části webu. Texty, které sis napsal sám (názvy místností, `text`), se nepřekládají.

## Něco jiného

Založ issue na [GitHubu](https://github.com/matata86/fns-floorplan/issues) s verzí (Nastavení, Zařízení a služby), tím, co jsi čekal, a co se stalo, a s výpisem z konzole prohlížeče, pokud se karta nenačítá.
