#!/usr/bin/env python3
"""Build a GitHub wiki from docs/<lang>/**/*.md into build/wiki/ (stdlib only).

    python3 tools/wiki.py           build
    python3 tools/wiki.py --check   build and verify that every relative link target exists
"""
import re
import sys
from pathlib import Path, PurePosixPath

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"
OUT = ROOT / "build" / "wiki"
SITE = "https://matata86.github.io/fns-floorplan/"
REPO = "https://github.com/matata86/fns-floorplan"
RAW = "https://raw.githubusercontent.com/matata86/fns-floorplan/master/docs/"
LANGS = {"en": ("", "English"), "cs": ("CS-", "Česky"), "de": ("DE-", "Deutsch"), "pl": ("PL-", "Polski")}
ORDER = ["index", "installation", "quick-start", "editor/index", "editor/rooms", "editor/openings", "editor/items",
         "editor/rules", "editor/look", "card", "room-panel", "robot-vacuum", "history", "reference/plan-format",
         "reference/websocket-api", "faq", "changelog"]
KEYS = {"ctrl": "Ctrl", "alt": "Alt", "shift": "Shift", "esc": "Esc", "delete": "Delete", "cmd": "Cmd"}


def page_name(lang, rel):
    """docs/<lang>/editor/rooms.md -> Editor-Rooms (CS-/DE- prefix for other languages)."""
    parts = rel.with_suffix("").parts
    if parts[-1] == "index":
        parts = parts[:-1] or ("overview",)
    words = [w for p in parts for w in p.split("-")]
    name = "-".join(w.upper() if w == "faq" else w.capitalize() for w in words)
    return LANGS[lang][0] + name


def title_of(text, fallback):
    m = re.search(r"^#\s+(.+?)\s*$", text, re.M)
    return m.group(1) if m else fallback


def fenced(lines):
    """Yield (line, in_code) where in_code is True for fenced code blocks (fences included)."""
    inside = False
    for ln in lines:
        s = ln.strip()
        if s.startswith("```") or s.startswith("~~~"):
            yield ln, True
            inside = not inside
        else:
            yield ln, inside


def convert(text, lang, rel, pages, errors):
    base = PurePosixPath("docs") / lang / PurePosixPath(rel.as_posix()).parent

    def link(m):
        pre, target = m.group(1), m.group(2)
        if re.match(r"^(https?:|mailto:|#)", target):
            return m.group(0)
        path, _, anchor = target.partition("#")
        full = PurePosixPath(str(base / path))
        parts = []
        for p in full.parts:  # normalise ../
            if p == "..":
                parts.pop()
            elif p != ".":
                parts.append(p)
        norm = PurePosixPath(*parts)
        if path.endswith(".md"):
            key = norm.relative_to(PurePosixPath("docs") / lang).as_posix()
            if key not in pages[lang]:
                errors.append(f"{lang}/{rel}: unknown page {target}")
                return m.group(0)
            return f"{pre}({pages[lang][key]}{'#' + anchor if anchor else ''})"
        if norm.parts[:1] == ("docs",):
            return f"{pre}({RAW}{PurePosixPath(*norm.parts[1:])}{'#' + anchor if anchor else ''})"
        return m.group(0)

    out = []
    lines = text.split("\n")
    i = 0
    while i < len(lines):
        ln = lines[i]
        i += 1
        # admonitions and content tabs: header line, then an indented block
        m = re.match(r"^(!!!|\?\?\?\+?)\s+(\w+)(?:\s+\"(.*)\")?\s*$", ln)
        t = re.match(r"^===\s+\"(.*)\"\s*$", ln)
        if m or t:
            body = []
            while i < len(lines) and (lines[i].startswith("    ") or not lines[i].strip()):
                body.append(lines[i][4:] if lines[i].startswith("    ") else "")
                i += 1
            while body and not body[-1].strip():
                body.pop()
            if t:
                out += [f"#### {t.group(1)}", ""] + body + [""]
            else:
                title = m.group(3) or m.group(2).capitalize()
                out += [f"> **{title}:**"] + ["> " + b if b else ">" for b in body] + [""]
            continue
        out.append(ln)
    res = []
    for ln, code in fenced(out):
        if not code:
            if re.match(r"^\s*</?div\b[^>]*>\s*$", ln):
                continue
            ln = re.sub(r"(\]\([^)]*\))\{[^}]*\}", r"\1", ln)  # { loading=lazy }, { .md-button }
            ln = re.sub(r"\s*\{\s*#[\w-]+\s*\}\s*$", "", ln)  # heading ids
            ln = re.sub(r":(?:material|fontawesome|octicons|simple)-[a-z0-9-]+:\s?", "", ln)
            ln = re.sub(r"\+\+([a-z0-9]+(?:\+[a-z0-9]+)*)\+\+",
                        lambda k: "+".join(f"<kbd>{KEYS.get(x, x.upper() if len(x) == 1 else x.capitalize())}</kbd>"
                                           for x in k.group(1).split("+")), ln)
            ln = re.sub(r"(!?\[[^\]]*\])\(([^)\s]+)\)", link, ln)
        res.append(ln)
    return "\n".join(res)


def build():
    errors = []
    pages = {}  # lang -> {rel posix: wiki page name}
    for lang in LANGS:
        d = DOCS / lang
        if not d.is_dir():
            continue
        rels = sorted((p.relative_to(d) for p in d.rglob("*.md")),
                      key=lambda r: (ORDER.index(r.with_suffix("").as_posix()) if r.with_suffix("").as_posix() in ORDER
                                     else len(ORDER), r.as_posix()))
        pages[lang] = {r.as_posix(): page_name(lang, r) for r in rels}
    if OUT.exists():
        for f in OUT.glob("*.md"):
            f.unlink()
    OUT.mkdir(parents=True, exist_ok=True)
    titles = {}
    for lang, mp in pages.items():
        for rel, name in mp.items():
            text = (DOCS / lang / rel).read_text(encoding="utf-8")
            titles[name] = title_of(text, name)
            (OUT / f"{name}.md").write_text(convert(text, lang, Path(rel), pages, errors).rstrip() + "\n", encoding="utf-8")

    def listing(lang):
        return "\n".join(f"- [{titles[n]}]({n})" for n in pages[lang].values())

    home = ["# FNS Floorplan wiki", "",
            "FNS Floorplan is an animated 2D floor plan card and editor for Home Assistant.", "",
            f"The full documentation with the live demo is on the site: **{SITE}**", ""]
    side = ["**[FNS Floorplan](Home)**", ""]
    for lang, (_, label) in LANGS.items():
        if lang in pages:
            home += [f"## {label}", "", listing(lang), ""]
            side += [f"**{label}**", "", listing(lang), ""]
    footer = (f"[Documentation site]({SITE}) | [Repository]({REPO}) | [Issues]({REPO}/issues) | "
              "Support: [Ko-fi](https://ko-fi.com/matata86) · [PayPal](https://paypal.me/matata86) · "
              f"[Bitcoin]({SITE}support/)\n")
    (OUT / "Home.md").write_text("\n".join(home).rstrip() + "\n", encoding="utf-8")
    (OUT / "_Sidebar.md").write_text("\n".join(side).rstrip() + "\n", encoding="utf-8")
    (OUT / "_Footer.md").write_text(footer, encoding="utf-8")
    return errors


def check():
    errors = build()
    for f in OUT.glob("*.md"):
        text = f.read_text(encoding="utf-8")
        for ln, code in fenced(text.split("\n")):
            if code:
                continue
            for target in re.findall(r"\]\(([^)\s]+)\)", ln):
                if re.match(r"^(https?:|mailto:|#)", target):
                    continue
                page = target.partition("#")[0]
                if not (OUT / f"{page}.md").exists():
                    errors.append(f"{f.name}: broken link {target}")
    return errors


if __name__ == "__main__":
    errs = check() if "--check" in sys.argv else build()
    for e in errs:
        print("ERROR", e)
    n = len(list(OUT.glob("*.md")))
    print(f"wiki: {n} files in {OUT.relative_to(ROOT)}" + (" (links OK)" if "--check" in sys.argv and not errs else ""))
    sys.exit(1 if errs else 0)
