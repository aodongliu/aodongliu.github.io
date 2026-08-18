#!/usr/bin/env python3
"""
Give html_blocks descriptive names so the markdown reads like a document
instead of a pile of pNN_bK ids.

Blocks live at <blog>/source/_html_blocks/pNN/slug.html, referenced in the
markdown as {% htmlblock pNN/slug %}. Derives a slug per block from its content:
  - tables: the title <p> inside the wrapper
  - cards:  the name <div> (player / team / "#1 · X")
  - repeated names (several Westbrook cards): the hero stat line
  - panel-title divs (post 02) / iframe titles (video embeds)
  - fallback: keep the current name

Renames are applied in two phases (stage -> final) so no file is ever
overwritten, and a block never steals another block's current name.
Re-runnable: it re-derives names from current blocks and converges.
"""

import os
import re
import tempfile


BLOG = os.path.dirname(os.path.abspath(__file__))
POSTS_DIR = os.path.join(BLOG, "source", "_posts")
BLOCKS_DIR = os.path.join(BLOG, "source", "_html_blocks")

TAG_RE = re.compile(r"{% htmlblock (\S+) %}")
TABLE_TITLE = re.compile(
    r'<p style=["\']margin: 0\.5rem 0; font-weight: 600[^>]*>([^<]+)</p>')
CARD_TITLE = re.compile(
    r'<div style=["\']font-size:\s*1\.[0-9]+em;\s*font-weight:\s*7[0-9]{2}[^"\']*["\']>([^<]+)</div>')
PANEL_TITLE = re.compile(
    r'<div class=["\']panel-title["\']>([^<]+)</div>')
IFRAME_TITLE = re.compile(
    r'<iframe[^>]*title=["\']([^"\']+)["\']')
HERO_LINE = re.compile(
    r'font-weight:\s*800[^>]*>([^<]+)</span>')

UML = {"ö": "o", "ü": "u", "ä": "a", "é": "e", "è": "e", "à": "a", "ç": "c"}


def slugify(text: str, maxlen=60) -> str:
    for k, v in UML.items():
        text = text.replace(k, v)
    text = re.sub(r"[#·|&/]", " ", text)
    text = re.sub(r"[^A-Za-z0-9]+", "_", text).strip("_")
    text = re.sub(r"_+", "_", text).lower()
    return text[:maxlen].rstrip("_")


def derive_slugs(html: str):
    """Return (primary_slug, hero_slug)."""
    primary = ""
    hero = ""
    m = TABLE_TITLE.search(html)
    if m:
        primary = slugify(m.group(1))
    else:
        m = CARD_TITLE.search(html)
        if m:
            primary = slugify(m.group(1))
    if not primary:
        m = PANEL_TITLE.search(html)
        if m:
            primary = slugify(m.group(1))
    if not primary:
        m = IFRAME_TITLE.search(html)
        if m:
            primary = slugify(m.group(1))
    m = HERO_LINE.search(html)
    if m:
        hero = slugify(m.group(1))
    return primary, hero


def main():
    for fname in sorted(os.listdir(POSTS_DIR)):
        if not fname.startswith("strangerStats") or not fname.endswith(".md"):
            continue
        m = re.match(r"strangerStats(\d+)_", fname)
        if not m:
            continue
        path = os.path.join(POSTS_DIR, fname)
        text = open(path, encoding="utf-8").read()
        old_names = list(dict.fromkeys(TAG_RE.findall(text)))  # doc order, unique
        if not old_names:
            continue

        current = set(old_names)
        used = set()
        mapping = {}
        for old in old_names:
            current_others = current - {old}
            pm = re.match(r"(?:p)?(\d+)/", old)
            post_num = "p" + pm.group(1) if pm else ""
            html_path = os.path.join(BLOCKS_DIR, old + ".html")
            if not os.path.exists(html_path):
                continue
            primary, hero = derive_slugs(
                open(html_path, encoding="utf-8").read())
            chosen = None
            candidates = ([primary, hero] if primary else [hero])
            for cand in candidates:
                if not cand:
                    continue
                cand_name = f"{post_num}/{cand}"
                if cand_name not in used and cand_name not in current_others:
                    chosen = cand_name
                    break
            if chosen is None and primary:
                n = 2
                while True:
                    cand_name = f"{post_num}/{primary}_{n}"
                    if cand_name not in used and cand_name not in current_others:
                        chosen = cand_name
                        break
                    n += 1
            mapping[old] = chosen or old
            used.add(mapping[old])

        if not any(o != n for o, n in mapping.items()):
            continue

        # stage all files, then rename to finals — no overwrites possible
        tmp = tempfile.mkdtemp(dir=BLOCKS_DIR)
        staged = {}
        for i, old in enumerate(old_names):
            src = os.path.join(BLOCKS_DIR, old + ".html")
            if os.path.exists(src):
                os.rename(src, os.path.join(tmp, f"f{i}.html"))
                staged[i] = old
        for i, old in staged.items():
            new = mapping[old]
            dst = os.path.join(BLOCKS_DIR, new + ".html")
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            os.rename(os.path.join(tmp, f"f{i}.html"), dst)
        os.rmdir(tmp)

        for old, new in mapping.items():
            if new != old:
                text = text.replace("{% htmlblock " + old + " %}",
                                    "{% htmlblock " + new + " %}")
        with open(path, "w", encoding="utf-8") as f:
            f.write(text)
        print(fname)
        for old, new in mapping.items():
            if new != old:
                print(f"   {old} -> {new}")
    print("done")


if __name__ == "__main__":
    main()
