# Änderungen

Jede Version ist mit Hinweisen in den [GitHub-Releases](https://github.com/matata86/fns-floorplan/releases) aufgeführt. Diese Seite fasst die Reihe 0.6.x nach Themen zusammen.

## 1.0.11 – 1.0.18

- Raumpanel: Mediaplayer und Fernbedienungen haben einen eigenen Abschnitt **Medien** (mit Lautstärkeregler), Saug- und Mähroboter den Abschnitt **Roboter**.
- Editor: Ein nach der Suche im Symbolwähler einer Regel gewähltes Symbol bleibt erhalten, und das Formular behält seine Scrollposition, auch wenn sich die Seitenhöhe nach einer Änderung in die eine oder andere Richtung ändert.
- Regeln: Eine Regel, die einen Ringeffekt setzt (z. B. einen von einem Timer gesteuerten Countdown), startet ihn jetzt auch bei ausgeschaltetem Gerät.
- Raumpanel: Mediaplayer und Saugroboter nehmen die volle Breite in einer Zeile ein (Lautstärke und Schaltflächen neben dem Namen); Fenster und Türen zeigen, wann sie zuletzt offen waren, statt ihres Zustands; die im Raum platzierten PIR- und Wasserleck-Sensoren stehen unter Sensoren (mit Zustand und Zeit der letzten Änderung).
- Raumpanel: Fenster, Türen und platzierte Sensoren mit der Zeit der letzten Änderung nehmen die volle Breite ein, damit der Text nicht abgeschnitten wird.
- Raumpanel: Fenster, Türen und platzierte Sensoren zeigen nur die Zeit der letzten Änderung (den Zustand zeigt das Symbol) und sitzen wieder zu zweit in einer Reihe.
- Möbel mit Entität verhalten sich wie ein Geräte-Badge: Symbolfarbe (`color_on`), Symbol- und Kreisanimation, solange die Entität läuft; siehe [Elemente](editor/items.md#furniture).

## 1.0.1 bis 1.0.9

- Raum-Panel: Kameras zeigen ihr Bild über die ganze Breite des Panels; Rollläden der Türen und Fenster des Raums (und der weiteren Entitäten) mit Öffnen / Stopp / Schließen neben dem Namen und einem Positionsregler darunter.
- Raumlisten (Details der Beschriftung und weitere Entitäten): Auswahl **Entität hinzufügen** unter jedem Feld, ein vorangestelltes `- ` wird akzeptiert, und ein Eintrag kann eine Vorlage sein, die Entitäts-IDs ausgibt, auch über mehrere Zeilen (`{% if %} … {% endif %}`).
- Editor: „Aktion aufrufen“ wählt die Aktion aus den Aktionen, die Home Assistant kennt, mit Suche; Auswahlfelder mit Suche zeigen den übersetzten Namen statt des Rohwerts.
- Editor: das Formular springt nach einer Änderung nicht mehr nach oben.
- Editor: ein kurzer Hinweis unter den Raumlisten erklärt Einträge und Vorlagen.

## 1.0.0 (Reihe 0.7.x)

- Editor-Reiter **Aussehen**: Farben des Plans (Wände, Boden und Beschriftungen für Tag und Nacht, Akzent, Lichter, offene Türen und Fenster, Alarm, Rollläden, Temperatur) mit Live-Vorschau der Karte. Standardfarben für Licht, Offen und Alarm folgen dem Home-Assistant-Design.
- Raum-Panel: Karten liegen in `hui-card` wie auf einem Dashboard, Design-Stile (UIX / card-mod) greifen; Abschnittsüberschriften sind Überschriftenkarten im Untertitel-Stil mit Symbolen; Lichter als Mushroom-Karte, falls installiert, sonst Kacheln mit Steuerung.
- Gerätebeschriftungen: Position (oben, unten, links, rechts) und senkrechter Text.
- Editor auf dem Smartphone: das Formular öffnet sich in einem fast bildschirmhohen Blatt wie More-Info, mit festem Kopf; runder Speichern-Knopf.
- Korrekturen: Symbolauswahl in HA 2026.9, Temperatureinheit in Raumbeschriftungen, flüssigere Ring-Animationen auf Smartphones.

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
