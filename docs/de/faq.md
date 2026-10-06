# Häufige Fragen und Fehlerbehebung

## Die Karte wird nach der Installation nicht gefunden

Starte Home Assistant nach der Installation neu und **lade dann die Browserseite mit geleertem Cache neu** (++ctrl+shift+r++; in der Companion-App leere den App-Cache in den App-Einstellungen). Die Integration registriert die Karte selbst, du brauchst keine Dashboard-Ressource. Prüfe, dass unter **Einstellungen, Geräte & Dienste** FNS Floorplan aufgeführt ist.

## „Custom element doesn't exist“ oder ein Konfigurationsfehler erscheint manchmal

Einige Dashboard-Erweiterungen ersetzen die Registry der Custom Elements im Browser. Die Karte, ihr Editor und das Panel prüfen ihre Registrierung nach 0,5, 2, 5 und 10 Sekunden erneut und korrigieren sie. Bleibt der Fehler bestehen, lade die Seite neu; ist er reproduzierbar, eröffne ein Issue mit der Liste deiner Frontend-Erweiterungen.

## Die Karte zeigt nach einem Update die alte Version { #the-card-shows-the-old-version-after-an-update }

Die Karte wird mit der Version in ihrer URL geladen. Starte Home Assistant nach dem Update neu und lade die Seite hart neu. In der Home-Assistant-App leere den Cache.

## Die Karte meldet, dass sie auf die Integration wartet

Die Karte abonniert den Plan über den Websocket. Direkt nach einem Neustart ist die Integration möglicherweise noch nicht geladen; die Karte versucht es einige Sekunden lang und noch einmal, wenn die Verbindung wiederhergestellt ist. Bleibt die Meldung, prüfe, ob die Integration hinzugefügt und ohne Fehler im Log geladen ist.

## Der Plan ist leer

Eine leere Karte bedeutet, dass noch kein Plan gespeichert wurde. Öffne **Grundriss** in der Seitenleiste, zeichne Räume und drücke **Speichern**. Wenn du schon gespeichert hattest und der Plan weg ist, sieh dir den **Speicherverlauf** im Editor an, die letzten 20 Speicherstände lassen sich wiederherstellen.

## Der Seitenleisten-Eintrag fehlt

Er ist optional: **Einstellungen, Geräte & Dienste, FNS Floorplan, Konfigurieren**. Der Editor ist immer unter `/fns-floorplan` erreichbar. Er ist nur für Administratoren.

## Symbole fehlen

Die Karte bringt einen Satz Material Design Icons mit. Jedes andere `mdi:`-Symbol wird aus dem eigenen Symbolelement von Home Assistant gelesen und erscheint daher, wenn das Frontend es geladen hat; lade die Seite einmal neu. Eigene Symbolsätze muss Home Assistant selbst bereitstellen.

## Beim Speichern heißt es, der Plan habe sich inzwischen geändert (Konflikt)

Jemand (oder ein anderer Browser-Tab) hat eine neuere Revision gespeichert. Wähle im Editor **Änderungen verwerfen**, um neu zu laden und deine Änderung zu wiederholen. Siehe [Websocket-API](reference/websocket-api.md#revisions-and-conflicts).

## Leistung

Animationen laufen nur, solange sich etwas bewegt und die Karte auf dem Bildschirm ist; versteckte Karten animieren nicht, und die Symbolanimationen beachten `prefers-reduced-motion`. Ist ein sehr großer Plan langsam, blende nicht benötigte Elemente mit `hide`-Regeln aus und vermeide Vorlagen, die jede Sekunde gerendert werden.

## Ein Licht leuchtet nicht in der erwarteten Farbe

Das Leuchten nutzt `rgb_color`, sonst `color_temp_kelvin`, sonst ein warmes Weiß. Eine Regel mit `color` überschreibt es.

## Eine Regel greift nicht

Für jedes Ausgabefeld gewinnt die **erste** Regel, die zutrifft und dieses Feld setzt, prüfe also die Reihenfolge. Entitätszustände sind Zeichenketten: Schreibe in YAML `state: "on"` in Anführungszeichen. Vorlagen werden von Home Assistant live gerendert, in der Editor-Vorschau aber nicht berechnet.

## Sprachen

Karte und Editor folgen der Sprache deines Home-Assistant-Profils (Englisch, Tschechisch und Deutsch). Die Dokumentation gibt es ebenfalls in allen drei Sprachen, nutze den Sprachumschalter oben auf der Seite. Texte, die du selbst geschrieben hast (Raumnamen, `text`), werden nicht übersetzt.

## Etwas anderes

Eröffne ein Issue auf [GitHub](https://github.com/matata86/fns-floorplan/issues) mit der Version (Einstellungen, Geräte & Dienste), dem, was du erwartet hast, und dem, was passiert ist, sowie dem Log der Browserkonsole, falls die Karte nicht lädt.
