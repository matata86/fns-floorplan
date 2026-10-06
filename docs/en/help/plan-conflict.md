# Saving says the plan changed meanwhile (conflict)

## What you see

Pressing Save in the editor fails with a message that the plan was changed in the meantime.

## Why it happens

Someone, or another browser tab, saved a newer revision of the plan. The plan is saved as a whole, so saving your older copy would overwrite that newer revision. The editor refuses it.

## What to do

1. In the editor choose **Discard changes**, the plan reloads with the newest revision.
2. Repeat your edit and save again.
3. Close other tabs with the editor, so they do not overwrite each other.

## Related

- [Websocket API: revisions and conflicts](../reference/websocket-api.md#revisions-and-conflicts)
- [History and check](../history.md)
