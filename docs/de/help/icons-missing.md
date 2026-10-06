# Symbole fehlen

## Was du siehst

Einige Elemente zeigen kein Symbol oder ein leeres Quadrat.

## Warum das passiert

Die Karte bringt einen Satz Material Design Icons mit. Jedes andere `mdi:`-Symbol wird aus dem eigenen Symbolelement von Home Assistant gelesen und erscheint daher erst, wenn das Frontend es geladen hat. Eigene Symbolsätze muss Home Assistant selbst bereitstellen.

## Was du tun kannst

1. Lade die Seite einmal neu.
2. Prüfe den Symbolnamen, er muss wie `mdi:lightbulb` aussehen.
3. Stelle bei Symbolen aus einem eigenen Satz sicher, dass Home Assistant selbst diesen Satz bereitstellt.

## Siehe auch

- [Elemente](../editor/items.md)
- [Regeln](../editor/rules.md)
