# Die Karte ruckelt oder ist langsam

## Was du siehst

Ein großer Plan reagiert langsam, Animationen ruckeln oder das Dashboard fühlt sich schwerfällig an.

## Warum das passiert

Animationen laufen nur, solange sich etwas bewegt und die Karte auf dem Bildschirm ist, versteckte Karten animieren nicht, und die Symbolanimationen beachten `prefers-reduced-motion`. Ein sehr großer Plan mit vielen Elementen und Vorlagen, die jede Sekunde gerendert werden, kann trotzdem schwer sein.

## Was du tun kannst

1. Blende nicht benötigte Elemente mit `hide`-Regeln aus.
2. Vermeide Vorlagen, die jede Sekunde gerendert werden.
3. Sieh dir die Tipps im Abschnitt Leistung auf der Seite Karte an.

## Siehe auch

- [Karte: Leistung](../card.md)
- [Regeln](../editor/rules.md)
