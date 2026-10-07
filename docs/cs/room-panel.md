# Panel místnosti

Klepni na místnost na kartě a od pravého okraje obrazovky se vysune **boční panel**. Vypadá jako dashboard oblasti v Home Assistantu: pozadí z motivu, hlavička s ikonou místnosti, názvem, teplotou a vlhkostí a dlaždice ve dvou sloupcích. Zavřeš ho křížkem, ++esc++ nebo klepnutím mimo něj.

| Tmavý motiv | Světlý motiv |
|---|---|
| ![Panel obýváku: termostat, světla, okno, spínač a vysavač](../assets/screenshots/cs/room-panel.png){ loading=lazy } | ![Stejný panel ve světlém motivu](../assets/screenshots/cs/room-panel-light.png){ loading=lazy } |

![Panel chodby: světla, kamera, dveře, alarm a zámek](../assets/screenshots/cs/room-panel-hall.png){ loading=lazy }

![Otevření panelu, nastavení jasu světla a zavření.](../assets/screenshots/gif/room-panel-open.gif){ loading=lazy }

*Otevření panelu, nastavení jasu světla a zavření.*

## Sekce

Panel je postavený z vlastních dlaždic Home Assistantu, takže vypadá jako zbytek tvých dashboardů. Klepnutí na dlaždici otevře detail, ikona přepíná to, co jde přepnout.

| Sekce | Co v ní je |
|-------|-----------|
| **Termostat** | Entity `climate`: cílová teplota mínus a plus (odešle se po 0,7 s), aktuální teplota, stav, režimy HVAC |
| **Světla** | Světla umístěná v místnosti, s jasem přímo vedle názvu |
| **Kamery** | Kamery místnosti, živý obraz se otevře v detailu |
| **Okna a dveře** | Otvory místnosti s kontaktem |
| **Spínače** | `switch` a `input_boolean` |
| **Zařízení** | Spotřebiče (zámek dostane příkazy zámku, vysavač příkazy vysavače) |
| **Senzory** | Senzory místnosti |
| **Ostatní** | Všechno ostatní |

Zobrazí se jen položky, které jsou **umístěné v místnosti**, a entity ze `sheet_extra`. Oblasti Home Assistantu se automaticky nepřidávají. Robotický vysavač se objeví v místnosti, ve které má dok.

## Výběr toho, co se zobrazí

- `sheet_extra`: seznam dalších entit místnosti (pole ve formuláři místnosti). `light`, `switch`, `fan`, `input_boolean`, `humidifier` a `siren` dostanou přepínač, ostatní entity řádek se stavem.
- `sheet_hide: true` u jakékoli položky (světlo, spotřebič, okno, dveře, zámek, robot) ji vynechá.
- Ikona místnosti `icon` se zobrazí v hlavičce.

```yaml
rooms:
  - id: living_room
    name: Obývací pokoj
    icon: mdi:sofa
    temperature: sensor.living_room_temperature
    sheet_extra:
      - climate.living_room
      - camera.living_room
      - switch.tv_plug
```

Zpět na [Kartu](card.md).
