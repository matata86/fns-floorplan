#!/usr/bin/env python3
"""Build the static live demo into docs/demo/ (a build output, gitignored).

Copies the real card (and its i18n file) next to a page that mocks `hass` with an invented plan.
"""
import json
import re
import shutil
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
FRONT = ROOT / "custom_components" / "fns_floorplan" / "frontend"
OUT = ROOT / "docs" / "demo"

OUT.mkdir(parents=True, exist_ok=True)
for name in ("fns-floorplan-card.js", "fns-floorplan-i18n.js"):
    if (FRONT / name).exists():
        shutil.copy2(FRONT / name, OUT / name)
shutil.copy2(HERE / "plan.json", OUT / "plan.json")

template = (HERE / "template.html").read_text(encoding="utf-8")
icons = json.loads((HERE / "icons.json").read_text(encoding="utf-8"))
used = set(re.findall(r"mdi:[a-z0-9-]+", template + (HERE / "plan.json").read_text(encoding="utf-8")))
missing = sorted(n for n in used if n not in icons)
if missing:
    print("warning: no icon path for", ", ".join(missing))
html = template.replace("__HA_THEME__", (HERE / "theme.css").read_text(encoding="utf-8")).replace(
    "__ICONS__", json.dumps({n: icons[n] for n in sorted(used) if n in icons}))
(OUT / "index.html").write_text(html, encoding="utf-8")
print(f"demo built in {OUT.relative_to(ROOT)} ({len(used) - len(missing)} icons)")
