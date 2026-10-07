# Aussehen

Im Tab **Aussehen** stellst du die Farben des Plans ein. Er zeigt den Plan als Live-Karte, sodass du jede Änderung sofort siehst; oben im Formular wechselst du zwischen einer Tag- und einer Nachtvorschau. Die Farben werden als `style` im Plan gespeichert und gelten für jede Karte, die diesen Plan anzeigt. Eine nicht gesetzte Farbe folgt dem Home-Assistant-Design oder dem Standard, **Standard wiederherstellen** löscht alle.

| Farbe | Was sie einfärbt | Standard |
|---|---|---|
| `wall_day` / `wall_night` | Wände (Tag / Nacht) | Primärfarbe des Designs |
| `floor_day` / `floor_night` | Boden (Tag / Nacht) | weiß / dunkelblau |
| `text_day` / `text_night` | Raumbeschriftungen und Texte (Tag / Nacht) | dunkel / hell |
| `accent` | Akzent von Schaltflächen und Hervorhebungen | Primärfarbe des Designs |
| `lamp` | Ein Licht, das keine eigene Farbe meldet | die Designfarbe eines aktiven Lichts, aufgehellt |
| `open` | Offene Tür oder Fenster, entsperrtes Schloss, ausstehender Alarm | die Designfarbe eines aktiven Binärsensors, sonst Orange |
| `alarm` | Ausgelöster Alarm | die Designfarbe eines ausgelösten Alarms, sonst Rot |
| `blind` | Rollläden | die Designfarbe einer geschlossenen Abdeckung, sonst der Akzent |
| `cold` / `hot` | Kalte und warme Temperatur auf Raumbeschriftungen | blau / orange |
