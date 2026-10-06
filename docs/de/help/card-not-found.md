# Die Karte wird nach der Installation nicht gefunden

## Was du siehst

Der Karten-Auswahldialog zeigt FNS Floorplan nicht an, oder das Dashboard zeigt statt der Karte einen Fehler.

## Warum das passiert

Die Integration registriert die Karte beim Start von Home Assistant, und dein Browser behält die alten Frontend-Dateien im Cache, bis du ihn leerst. Du brauchst keine Dashboard-Ressource, die Integration fügt die Karte selbst hinzu.

## Was du tun kannst

1. Starte Home Assistant nach der Installation neu.
2. Lade die Browserseite mit geleertem Cache neu (++ctrl+shift+r++). In der Companion-App leere den App-Cache in den App-Einstellungen.
3. Öffne **Einstellungen, Geräte & Dienste** und prüfe, dass FNS Floorplan aufgeführt und ohne Fehler geladen ist.
4. Fehlt er dort, füge ihn hinzu, wie in der Installationsanleitung beschrieben.

## Siehe auch

- [Installation](../installation.md)
- [„Custom element doesn't exist“ oder ein Konfigurationsfehler erscheint](custom-element-missing.md)
- [Die Karte zeigt nach einem Update die alte Version](old-version-after-update.md)
