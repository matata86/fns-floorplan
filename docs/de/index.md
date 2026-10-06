# FNS Floorplan

FNS Floorplan verwandelt dein Home-Assistant-Dashboard in einen lebendigen Grundriss deines Zuhauses. Lichter leuchten in ihrer echten Farbe, Türen und Fenster schwingen auf, Bewegungsmelder senden Wellen aus, ein Saugroboter fährt durch den Raum, den er meldet, und eine Waschmaschine zeigt, wie lange sie noch läuft. Den Grundriss zeichnest du in einem integrierten Editor, ganz ohne YAML und ohne Bildbearbeitung.

!!! info "Inspiriert von NeonPlan 3D"
    FNS Floorplan wurde von [NeonPlan 3D](https://github.com/Mastershort/neonplan3d) inspiriert, einer 3D-Grundrisskarte für Home Assistant. Die Idee wird hier in einen animierten 2D-Plan mit eigenem Editor übertragen. [Du kommst von NeonPlan 3D?](quick-start.md#coming-from-neonplan-3d)

![Eine animierte Grundriss-Karte mit einer Wohnung, eingeschalteten Lichtern, einer offenen Tür und einem Saugroboter](../assets/screenshots/de/card-overview.png){ loading=lazy }

Er besteht aus zwei Teilen, die zusammen als eine HACS-Integration installiert werden:

- **die Karte** `custom:fns-floorplan-card`, die du auf jedes Dashboard legst,
- **der Editor**, ein Seitenleisten-Panel namens **Grundriss** (URL `/fns-floorplan`, nur für Administratoren), in dem du Räume zeichnest, Elemente platzierst und Regeln festlegst.

[Live-Demo ausprobieren :material-open-in-new:](https://matata86.github.io/fns-floorplan/demo/){ .md-button .md-button--primary }
[Installation](installation.md){ .md-button }

## Was er kann

<div class="grid cards" markdown>

- :material-vector-polygon: **Den Grundriss selbst zeichnen**

    Zieh Raumecken und ganze Wände, lass sie an Nachbarn einrasten und füge Türen und Fenster hinzu. Siehe [Räume](editor/rooms.md) und [Türen und Fenster](editor/openings.md).

- :material-lightbulb-on: **Live-Lichter und -Geräte**

    Lichter, LED-Streifen, Geräte, Sensoren und Möbel folgen dem Zustand ihrer Entitäten. Siehe [Elemente](editor/items.md).

- :material-script-text: **Regeln**

    Bedingte Farben, Symbole, Texte, Ringe und Countdowns nach Entitätszuständen oder Jinja-Vorlagen. Siehe [Regeln](editor/rules.md).

- :material-robot-vacuum: **Saugroboter**

    Der Roboter fährt durch den Raum, den er meldet, und durch die Türen. Siehe [Saugroboter](robot-vacuum.md).

- :material-gesture-tap: **Raum-Panel**

    Tippe auf einen Raum und ein Panel mit Thermostat, Lichtern, Kameras und Geräten fährt aus. Siehe [Raum-Panel](room-panel.md).

- :material-history: **Verlauf und Wiedergabe**

    Stelle einen der letzten 20 gespeicherten Pläne wieder her oder spiel die letzten 24 Stunden deines Zuhauses ab. Siehe [Verlauf und Prüfung](history.md) und [Karte](card.md).

</div>

## Wie es weitergeht

- Neu hier? Folge der [Installation](installation.md) und danach dem [Schnellstart](quick-start.md), nach etwa zehn Schritten hast du einen funktionierenden Grundriss.
- Willst du es erst sehen? Öffne die [Live-Demo](https://matata86.github.io/fns-floorplan/demo/), sie führt die echte Karte mit erfundenen Zuständen aus.
- Suchst du eine YAML-Option? Schau in [Karte](card.md) und ins [Planformat](reference/plan-format.md).
- Etwas funktioniert nicht? Wirf einen Blick in die [häufigen Fragen](faq.md).
