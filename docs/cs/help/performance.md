# Karta se seká nebo je pomalá

## Co vidíš

Velký půdorys reaguje pomalu, animace se zasekávají nebo je dashboard těžkopádný.

## Proč se to děje

Animace běží jen, když se něco hýbe a když je karta na obrazovce, skryté karty se neanimují a animace ikon respektují `prefers-reduced-motion`. Velmi velký půdorys s mnoha položkami a šablonami, které se překreslují každou sekundu, může být i tak těžký.

## Co s tím

1. Nepotřebné položky skryj pravidly `hide`.
2. Nepoužívej šablony, které se překreslují každou sekundu.
3. Mrkni na tipy v sekci Výkon na stránce Karta.

## Související

- [Karta: Výkon](../card.md)
- [Pravidla](../editor/rules.md)
