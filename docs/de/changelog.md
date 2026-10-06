# Änderungen

Jede Version ist mit Hinweisen in den [GitHub-Releases](https://github.com/matata86/fns-floorplan/releases) aufgeführt. Diese Seite fasst die Reihe 0.6.x nach Themen zusammen.

## Raum-Panel (0.6.44 bis 0.6.50)

- Das Raum-Panel fuhr zunächst als seitlicher Bildschirm aus und wurde dann zu einem dashboardähnlichen Panel: Kachelkarten von Home Assistant, zwei Spalten, der Designhintergrund, eine Kopfzeile mit Raumsymbol, Temperatur und Luftfeuchtigkeit.
- Abschnitte: Thermostat, Lichter mit Helligkeit in der Zeile, Kameras, Fenster und Türen, Schalter, Geräte, Sensoren, Sonstige. Steuerung für Schlösser und Staubsauger.
- Raumsymbol, `sheet_hide` für den Saugroboter.
- Sortierte und durchsuchbare Typauswahlen mit einem Typ „Sonstiges“.

## Saugroboter (0.6.14 bis 0.6.42)

- Zuordnung der Räume des Staubsaugers zu Planräumen, Akkuring und Ladezustand, Designfarben nach Zustand.
- Ein angehaltener Roboter steht in seinem Raum auf einer freien Stelle und blinkt, Fehler sind rot.
- Der Roboter behält die Ausrichtung seiner Station, erscheint nach dem Laden der Seite in seinem Raum, fährt unter den Entitäten und über den Möbeln.
- Rundfahrt über die ganze Etage, wenn sein Raum unbekannt ist; ein Abschnitt „Wenn aktiv“ und eine Reihenfolge für die Station.

## Editor (0.6.9 bis 0.6.43)

- Werkzeugleiste, Menüs und Seitenpanel aus nativen Elementen von Home Assistant, in der Breite veränderbares Seitenpanel, Farbwähler mit Zuordnung zu den Designvariablen.
- Smartphone-Layout mit unterem Blatt.
- Raumbearbeitung: Ziehen ganzer Wände, Einrasten an Nachbarn, gemeinsame Wände, Wandlängen, 15-Grad-Winkel, Gerade-Markierungen, ein Ecksofa.
- Türen und Fenster auf andere Wände ziehen; Strg+X; YAML pro Regel; Jinja-Vorlagenmodus für Bedingungen; Symbol-Schaltflächen „Kein Symbol“ und „Standard wiederherstellen“.

## Regeln und Animationen (0.6.1 bis 0.6.43)

- Symbolanimationen nach Symbolname, Ringeffekte (Radar, Komet, Countdown und mehr), die Regelausgabe `fx`.
- Countdown aus einem Timer, einem Dauer- oder Zeitstempelsensor, einer Prozent-Entität (füllt sich wie ein Akku) oder einer festen Länge.
- Regelfarben und Ringe für Lichter, LED-Streifen, die Station und Möbel.
- Regelvorschläge per AI Task; Regel-YAML im Code-Editor von Home Assistant; eine Symbolauswahl in Regeln.
- „Anderes Gerät“ verhält sich nach der Domain seiner Entität; Personen-Avatare; Blinken bei Szenen und Tasten.

## Aussehen (0.6.5 bis 0.6.19)

- Wände und Kartenhintergrund in Designfarben, eine Badge-Leiste für Ebenen über dem Plan mit Wärmelegende, weiche Bewegungswellen, keine Naht im Dunkelmodus, die Wiedergabeleiste unter dem Plan.

Für Versionen vor 0.6 siehe die GitHub-Releases und die Repository-Historie.
