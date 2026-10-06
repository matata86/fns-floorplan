# Beim Speichern heißt es, der Plan habe sich inzwischen geändert (Konflikt)

## Was du siehst

Speichern im Editor schlägt mit einer Meldung fehl, dass sich der Plan inzwischen geändert hat.

## Warum das passiert

Jemand, oder ein anderer Browser-Tab, hat eine neuere Revision des Plans gespeichert. Der Plan wird als Ganzes gespeichert, das Speichern deiner älteren Kopie würde diese neuere Revision überschreiben. Der Editor verweigert das.

## Was du tun kannst

1. Wähle im Editor **Änderungen verwerfen**, der Plan wird in der neuesten Revision neu geladen.
2. Wiederhole deine Änderung und speichere erneut.
3. Schließe andere Tabs mit dem Editor, damit sie sich nicht gegenseitig überschreiben.

## Siehe auch

- [Websocket-API: Revisionen und Konflikte](../reference/websocket-api.md#revisions-and-conflicts)
- [Verlauf und Prüfung](../history.md)
