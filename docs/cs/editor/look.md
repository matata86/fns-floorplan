# Vzhled

Záložka **Vzhled** nastavuje barvy půdorysu. Půdorys ukazuje jako živou kartu, takže každou změnu vidíš hned; nahoře ve formuláři přepínáš mezi náhledem ve dne a v noci. Barvy se ukládají do půdorysu jako `style` a platí pro každou kartu, která tento půdorys zobrazuje. Nenastavená barva se řídí motivem Home Assistantu nebo výchozí hodnotou a **Obnovit výchozí** smaže všechny.

| Barva | Co obarvuje | Výchozí |
|---|---|---|
| `wall_day` / `wall_night` | Stěny (den / noc) | primární barva motivu |
| `floor_day` / `floor_night` | Podlaha (den / noc) | bílá / tmavě modrá |
| `text_day` / `text_night` | Jmenovky místností a texty (den / noc) | tmavá / světlá |
| `accent` | Akcent tlačítek a zvýraznění | primární barva motivu |
| `lamp` | Světlo, které nehlásí vlastní barvu | barva aktivního světla z motivu, zesvětlená |
| `open` | Otevřené dveře nebo okno, odemčený zámek, čekající alarm | barva aktivního binárního senzoru z motivu, jinak oranžová |
| `alarm` | Spuštěný alarm | barva spuštěného alarmu z motivu, jinak červená |
| `blind` | Rolety | barva zavřeného krytu z motivu, jinak akcent |
| `cold` / `hot` | Chladná a teplá teplota na jmenovkách místností | modrá / oranžová |
