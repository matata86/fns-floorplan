# Ein Licht leuchtet nicht in der erwarteten Farbe

## Was du siehst

Das Leuchten eines Lichts ist warmweiß oder hat eine andere Farbe, als die Lampe wirklich zeigt.

## Warum das passiert

Das Leuchten nutzt `rgb_color`, sonst `color_temp_kelvin`, sonst ein warmes Weiß. Eine Regel mit `color` überschreibt das alles.

## Was du tun kannst

1. Öffne die Entität des Lichts in Home Assistant und prüfe die Attribute `rgb_color` und `color_temp_kelvin`.
2. Prüfe, ob am Element eine Regel mit `color` gesetzt ist.
3. Meldet die Lampe kein Attribut, ist das warme Weiß erwartet, setze eine `color`-Regel für eine andere Farbe.

## Siehe auch

- [Regeln](../editor/rules.md)
- [Elemente](../editor/items.md)
- [Eine Regel greift nicht](rule-not-applied.md)
