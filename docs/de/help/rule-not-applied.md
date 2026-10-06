# Eine Regel greift nicht

## Was du siehst

Ein Element ignoriert eine Regel, die du geschrieben hast, oder zeigt eine andere Farbe, ein anderes Symbol oder einen anderen Text als erwartet.

## Warum das passiert

Für jedes Ausgabefeld gewinnt die **erste** Regel, die zutrifft und dieses Feld setzt. Entitätszustände sind Zeichenketten, `on` ohne Anführungszeichen wird in YAML als Boolean gelesen. Vorlagen werden von Home Assistant live gerendert, in der Editor-Vorschau aber nicht berechnet.

## Was du tun kannst

1. Prüfe die Reihenfolge der Regeln, pro Feld gewinnt der erste Treffer.
2. Schreibe in YAML `state: "on"` in Anführungszeichen.
3. Beurteile Vorlagen auf der echten Karte, nicht in der Editor-Vorschau.

## Siehe auch

- [Regeln](../editor/rules.md)
- [Ein Licht leuchtet nicht in der erwarteten Farbe](light-wrong-colour.md)
