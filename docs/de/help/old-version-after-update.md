# Die Karte zeigt nach einem Update die alte Version

## Was du siehst

Du hast die Integration aktualisiert, aber Karte oder Editor sehen aus und verhalten sich wie vorher.

## Warum das passiert

Die Karte wird mit der Version in ihrer URL geladen. Bis Home Assistant neu gestartet wird, liefert er noch die alte Version aus, und Browser oder App können die alten Dateien im Cache behalten.

## Was du tun kannst

1. Starte Home Assistant nach dem Update neu.
2. Lade die Seite hart neu (++ctrl+shift+r++).
3. Leere in der Home-Assistant-App den Cache in den App-Einstellungen.

## Siehe auch

- [Installation: Update](../installation.md)
- [Die Karte wird nach der Installation nicht gefunden](card-not-found.md)
