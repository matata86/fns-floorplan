# Die Karte meldet, dass sie auf die Integration wartet

## Was du siehst

Statt des Grundrisses zeigt die Karte eine Meldung, dass sie auf die Integration wartet.

## Warum das passiert

Die Karte abonniert den Plan über den Websocket. Direkt nach einem Neustart ist die Integration möglicherweise noch nicht geladen. Die Karte versucht es einige Sekunden lang und noch einmal, wenn die Verbindung wiederhergestellt ist.

## Was du tun kannst

1. Warte nach einem Neustart ein paar Sekunden.
2. Öffne **Einstellungen, Geräte & Dienste** und prüfe, dass die Integration hinzugefügt und geladen ist.
3. Sieh im Home-Assistant-Log nach Fehlern von `fns_floorplan`.
4. Bleibt die Meldung, lade die Seite neu.

## Siehe auch

- [Installation](../installation.md)
- [Die Karte wird nach der Installation nicht gefunden](card-not-found.md)
