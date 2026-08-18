#!/usr/bin/env python3
"""
Move long HTML blocks out of strangerStats posts and into html_blocks/.

Scans every source/_posts/strangerStats*.md, extracts balanced <div>...</div>
blocks into <blog>/source/_html_blocks/pNN/bK.html, and replaces them in the
markdown with {% htmlblock pNN/bK %} tags (rendered by scripts/htmlblock.js).

Idempotent: already-tagged posts contain no <div> blocks and are left alone.
"""

import os
import re


BLOG = os.path.dirname(os.path.abspath(__file__))
POSTS_DIR = os.path.join(BLOG, "source", "_posts")
BLOCKS_DIR = os.path.join(BLOG, "source", "_html_blocks")

DIV_OPEN = re.compile(r"<div\b", re.I)
DIV_CLOSE = re.compile(r"</div\s*>", re.I)
FENCE = re.compile(r"(`{3,}|~{3,})")


def split_body(text: str):
    """Return (frontmatter incl. closing ---, body)."""
    if text.startswith("---"):
        end = text.find("\n---", 3)
        if end != -1:
            return text[:end + 4], text[end + 4:]
    return "", text


def iter_segments(text: str):
    """Yield (is_code, segment) chunks, skipping fenced code blocks."""
    pos = 0
    in_code = False
    mark = None
    for m in FENCE.finditer(text):
        if not in_code:
            yield False, text[pos:m.start()]
            mark = m.group(1)
            in_code = True
        else:
            if m.group(1)[0] == mark[0] and len(m.group(1)) >= len(mark):
                yield True, text[pos:m.end()]
                in_code = False
                mark = None
        pos = m.end()
    yield in_code, text[pos:]


def extract_divs(seg: str, post_num: str, k: int):
    """Extract balanced div blocks from a non-code segment."""
    parts = []
    blocks = []
    i = 0
    while i < len(seg):
        m = DIV_OPEN.search(seg, i)
        if m is None:
            parts.append(seg[i:])
            break
        depth = 1
        j = m.end()
        while depth > 0 and j < len(seg):
            o = DIV_OPEN.search(seg, j)
            c = DIV_CLOSE.search(seg, j)
            if o is None and c is None:
                break
            if c is None or (o is not None and o.start() < c.start()):
                depth += 1
                j = o.end()
            else:
                depth -= 1
                j = c.end()
        if depth != 0:
            parts.append(seg[i:])
            break
        k += 1
        name = f"p{post_num}/b{k}"
        parts.append(seg[i:m.start()])
        parts.append(f"{{% htmlblock {name} %}}")
        blocks.append((name, seg[m.start():j]))
        i = j
    return "".join(parts), blocks, k


def main():
    os.makedirs(BLOCKS_DIR, exist_ok=True)
    total = 0
    for fname in sorted(os.listdir(POSTS_DIR)):
        if not fname.startswith("strangerStats") or not fname.endswith(".md"):
            continue
        m = re.match(r"strangerStats(\d+)_", fname)
        if not m:
            continue
        post_num = m.group(1)
        path = os.path.join(POSTS_DIR, fname)
        text = open(path, encoding="utf-8").read()
        front, body = split_body(text)
        if "<div" not in body:
            print(f"{fname}: no div blocks")
            continue
        out = [front]
        k = 0
        for is_code, seg in iter_segments(body):
            if is_code:
                out.append(seg)
            else:
                new_seg, blocks, k = extract_divs(seg, post_num, k)
                out.append(new_seg)
                for name, block in blocks:
                    folder = os.path.join(BLOCKS_DIR, f"p{post_num}")
                    os.makedirs(folder, exist_ok=True)
                    with open(os.path.join(BLOCKS_DIR, name + ".html"), "w",
                              encoding="utf-8") as f:
                        f.write(block + "\n")
        with open(path, "w", encoding="utf-8") as f:
            f.write("".join(out))
        total += k
        print(f"{fname}: extracted {k} blocks")
    print(f"\nTotal blocks extracted: {total} -> {BLOCKS_DIR}")


if __name__ == "__main__":
    main()
