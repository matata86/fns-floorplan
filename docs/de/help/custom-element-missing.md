# „Custom element doesn't exist“ oder ein Konfigurationsfehler erscheint

## Was du siehst

Die Karte zeigt kurz (oder bis zum nächsten Neuladen) „Custom element doesn't exist: fns-floorplan-card“ oder einen Konfigurationsfehler, obwohl sie vorher funktioniert hat.

## Warum das passiert

Einige Dashboard-Erweiterungen ersetzen die Registry der Custom Elements im Browser, sodass die Karte in einer nicht mehr verwendeten Registry registriert ist. Die Karte, ihr Editor und das Panel prüfen ihre Registrierung nach 0,5, 2, 5 und 10 Sekunden erneut und korrigieren sie selbst.

## Was du tun kannst

1. Warte etwa zehn Sekunden, die Karte repariert sich meist selbst.
2. Bleibt der Fehler bestehen, lade die Seite neu.
3. Ist er reproduzierbar, eröffne ein Issue und nenne die Frontend-Erweiterungen, die du verwendest.

## Siehe auch

- [Die Karte wird nach der Installation nicht gefunden](card-not-found.md)
- [Issues auf GitHub](https://github.com/matata86/fns-floorplan/issues)
