# The card is slow or choppy

## What you see

A big plan responds slowly, animations stutter or the dashboard feels heavy.

## Why it happens

Animations run only while something moves and while the card is on the screen, hidden cards do not animate, and the icon animations respect `prefers-reduced-motion`. A very large plan with many items and templates that are rendered every second can still be heavy.

## What to do

1. Hide items you do not need with `hide` rules.
2. Avoid templates that are rendered every second.
3. Check the tips in the performance section of the card page.

## Related

- [Card: Performance](../card.md)
- [Rules](../editor/rules.md)
