#!/usr/bin/env python3
"""Make, render and check a deck from deck.json and facts.json. Free tools only.

  python3 deck.py setup --dir <deck folder>              makes the Python tools folder, writes <deck folder>/tools.json
  <py> deck.py read-start <file> --out <folder>         a start deck (.pptx or .pdf): text, look and one picture per slide
  <py> deck.py make --dir <deck folder>                  deck.json + facts.json -> out/deck.html, out/deck.pptx
  <py> deck.py render --dir <deck folder>                one picture per slide of every output, and out/deck.pdf
  <py> deck.py sheet --dir <deck folder> [--kind pptx|html]   6 slide pictures per sheet, to look at side by side
  <py> deck.py merge-facts --dir <deck folder>           research/*.md fact lines -> facts.json (ids f1, f2, ...), then the facts check
  <py> deck.py facts --dir <deck folder>                 facts.json alone: every fact has a link, a 'how' or comes from the person
  <py> deck.py claims --dir <deck folder>                every piece of slide text next to the facts it cites -> claims.md, then the claims check
  <py> deck.py check --dir <deck folder> [--only count,figures,claims,fit,open,looked]
                                                        the stop-fact checks -> check.md (or check-<keys>.md); exit 1 when one fails

<py> is the "python" path that setup writes to tools.json. Works on Python 3.8 and later.
It writes only to the deck folder and to ~/.cache/product-deck-loop (the Python tools; PRODUCT_DECK_TOOLS moves it).
setup downloads python-pptx and pymupdf from PyPI once. Nothing else leaves the laptop.
"""
import glob
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
TOOLS_DIR = os.environ.get("PRODUCT_DECK_TOOLS", os.path.join(os.path.expanduser("~"), ".cache", "product-deck-loop"))
PACKAGES = ["python-pptx==1.0.2", "pymupdf==1.24.11"]
EMU = 914400  # per inch

SIZES = {"slides": (13.333, 7.5), "web": (13.333, 7.5), "page-a4": (8.27, 11.69), "page-letter": (8.5, 11.0)}
DEFAULT_BRAND = {"title_font": "Arial", "body_font": "Arial", "background": "FFFFFF", "text": "1F2328",
                 "muted": "59636E", "accent": "1F4E79", "accent_soft": "E8EEF5"}


def read_json(path, default=None):
    try:
        with open(path, encoding="utf-8") as handle:
            return json.load(handle)
    except FileNotFoundError:
        if default is not None:
            return default
        raise SystemExit("deck.py: %s is missing" % path)


def write_json(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as handle:
        json.dump(data, handle, indent=2, ensure_ascii=False)


def write_text(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as handle:
        handle.write(text)


def item_text(item):
    """A point is a string or {"text": ..., "facts": [...]}."""
    return str(item.get("text", "")) if isinstance(item, dict) else str(item)


# ---------- setup ----------

def find_chrome():
    names = ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
             "/Applications/Chromium.app/Contents/MacOS/Chromium",
             "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
             "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"]
    names += sorted(glob.glob(os.path.expanduser("~/Library/Caches/ms-playwright/chromium-*/chrome-mac*/*.app/Contents/MacOS/*")), reverse=True)
    names += [shutil.which(n) or "" for n in ["google-chrome", "chromium", "chromium-browser", "microsoft-edge"]]
    return next((n for n in names if n and os.path.isfile(n) and os.access(n, os.X_OK)), None)


def cmd_setup(args):
    run = args["--dir"]
    venv = os.path.join(TOOLS_DIR, "venv")
    python = os.path.join(venv, "bin", "python")
    notes = []
    if not os.path.exists(python):
        made = subprocess.run([sys.executable, "-m", "venv", venv], capture_output=True, text=True)
        if made.returncode:
            notes.append("could not make the Python tools folder: " + made.stderr.strip()[-300:])
    has_packages = False
    if os.path.exists(python):
        probe = [python, "-c", "import pptx, fitz"]
        if subprocess.run(probe, capture_output=True).returncode:
            got = subprocess.run([python, "-m", "pip", "install", "-q", "--disable-pip-version-check"] + PACKAGES, capture_output=True, text=True)
            if got.returncode:
                notes.append("pip could not install %s (no network?): %s" % (" ".join(PACKAGES), got.stderr.strip()[-300:]))
        has_packages = subprocess.run(probe, capture_output=True).returncode == 0
    tools = {
        "python": python if has_packages else sys.executable,
        "pptx": has_packages,
        "pdf_reader": has_packages,
        "chrome": find_chrome(),
        "quicklook": shutil.which("qlmanage"),
        "notes": notes,
    }
    if not tools["chrome"]:
        tools["notes"].append("no Chrome, Chromium or Edge found: no HTML pictures and no PDF")
    if not tools["quicklook"]:
        tools["notes"].append("no Quick Look (not a Mac): PowerPoint slides cannot be turned into pictures here")
    write_json(os.path.join(run, "tools.json"), tools)
    print(json.dumps(tools, indent=2))
    return 0 if has_packages else 1


# ---------- reading a start deck ----------

def quicklook_png(pptx_path, out_png, width=1600):
    work = tempfile.mkdtemp()
    try:
        # 60 seconds: one slide takes about 1 second; a longer wait means Quick Look is stuck on this file.
        subprocess.run(["qlmanage", "-t", "-s", str(width), "-o", work, pptx_path], capture_output=True, timeout=60)
    except subprocess.TimeoutExpired:
        return False
    made = os.path.join(work, os.path.basename(pptx_path) + ".png")
    if os.path.exists(made):
        os.makedirs(os.path.dirname(out_png), exist_ok=True)
        shutil.move(made, out_png)
        return True
    return False


def pptx_slide_pictures(pptx_path, out_dir):
    """One picture per slide: a copy holding only that slide, drawn by macOS Quick Look (it draws slide 1 only)."""
    from pptx import Presentation
    if not shutil.which("qlmanage"):
        return []
    count = len(Presentation(pptx_path).slides)
    made = []
    work = tempfile.mkdtemp()
    for number in range(1, count + 1):
        prs = Presentation(pptx_path)
        ids = prs.slides._sldIdLst
        for index, sld in reversed(list(enumerate(list(ids)))):
            if index != number - 1:
                prs.part.drop_rel(sld.rId)
                ids.remove(sld)
        prs.part.rename_slide_parts([sld.rId for sld in ids])
        # Quick Look hangs on speaker notes made by python-pptx, so the picture copy drops them. The real file keeps them.
        for slide in prs.slides:
            for rel_id, rel in list(slide.part.rels.items()):
                if rel.reltype.endswith("/notesSlide"):
                    slide.part.drop_rel(rel_id)
        one = os.path.join(work, "slide-%02d.pptx" % number)
        prs.save(one)
        png = os.path.join(out_dir, "slide-%02d.png" % number)
        if quicklook_png(one, png):
            made.append(png)
    return made


def theme_of(pptx_path):
    import zipfile
    look = {}
    with zipfile.ZipFile(pptx_path) as archive:
        names = sorted(n for n in archive.namelist() if re.match(r"ppt/theme/theme\d+\.xml$", n))
        if not names:
            return look
        xml = archive.read(names[0]).decode("utf-8", "replace")
    for role in ["dk1", "lt1", "dk2", "lt2", "accent1", "accent2"]:
        found = re.search(r"<a:%s>.*?(?:srgbClr val|lastClr)=\"([0-9A-Fa-f]{6})\"" % role, xml, re.S)
        if found:
            look[role] = found.group(1).upper()
    for role, tag in [("title_font", "majorFont"), ("body_font", "minorFont")]:
        found = re.search(r"<a:%s>\s*<a:latin typeface=\"([^\"]*)\"" % tag, xml)
        if found:
            look[role] = found.group(1)
    return look


def used_look(prs):
    """The fonts and fill colours the slides really use, most used first (the theme often says something else)."""
    from collections import Counter
    fonts, fills = Counter(), Counter()
    for slide in prs.slides:
        try:
            if slide.background.fill.type == 1:
                fills[str(slide.background.fill.fore_color.rgb)] += 3
        except Exception:
            pass
        for shape in slide.shapes:
            try:
                if shape.fill.type == 1:
                    fills[str(shape.fill.fore_color.rgb)] += 1
            except Exception:
                pass
            if shape.has_text_frame:
                for para in shape.text_frame.paragraphs:
                    for run in para.runs:
                        if run.font.name:
                            fonts[run.font.name] += len(run.text)
    return {"fonts_used": [f for f, _ in fonts.most_common(4)], "fills_used": [c for c, _ in fills.most_common(5)]}


def cmd_read_start(args):
    source, out = args["_"][0], args["--out"]
    os.makedirs(out, exist_ok=True)
    slides, lines = [], []
    if source.lower().endswith(".pptx"):
        from pptx import Presentation
        prs = Presentation(source)
        for number, slide in enumerate(prs.slides, 1):
            texts, pictures = [], 0
            for shape in slide.shapes:
                if shape.has_text_frame and shape.text_frame.text.strip():
                    texts.append(shape.text_frame.text.strip())
                if shape.shape_type == 13:
                    pictures += 1
            title = slide.shapes.title.text_frame.text.strip() if slide.shapes.title is not None and slide.shapes.title.has_text_frame else (texts[0].split("\n")[0] if texts else "")
            notes = slide.notes_slide.notes_text_frame.text.strip() if slide.has_notes_slide else ""
            slides.append({"slide": number, "layout": slide.slide_layout.name, "title": title, "text": texts, "pictures": pictures, "notes": notes})
        look = theme_of(source)
        look.update(used_look(prs))
        size ={"width_in": round(prs.slide_width / EMU, 3), "height_in": round(prs.slide_height / EMU, 3)}
        pictures = pptx_slide_pictures(source, os.path.join(out, "renders"))
    elif source.lower().endswith(".pdf"):
        import fitz
        doc = fitz.open(source)
        pictures = []
        for number, page in enumerate(doc, 1):
            text = page.get_text().strip()
            png = os.path.join(out, "renders", "slide-%02d.png" % number)
            os.makedirs(os.path.dirname(png), exist_ok=True)
            page.get_pixmap(dpi=110).save(png)
            pictures.append(png)
            slides.append({"slide": number, "title": text.split("\n")[0] if text else "", "text": [text] if text else [],
                           "text_in_picture": len(text) < 40, "pictures": len(page.get_images())})
        look = {}
        size = {"width_in": round(doc[0].rect.width / 72, 3), "height_in": round(doc[0].rect.height / 72, 3)}
    else:
        raise SystemExit("deck.py read-start: give a .pptx or .pdf file")
    result = {"file": os.path.abspath(source), "size": size, "look": look, "slides": slides,
              "pictures": [os.path.relpath(p, out) for p in pictures]}
    write_json(os.path.join(out, "slides.json"), result)
    lines.append("# Start deck: %s\n\nSize %s x %s in. Look: %s\n" % (os.path.basename(source), size["width_in"], size["height_in"], json.dumps(look)))
    for slide in slides:
        flag = " (text sits in a picture: read the slide picture, not the text)" if slide.get("text_in_picture") else ""
        lines.append("## Slide %d: %s%s\n%s\n" % (slide["slide"], slide["title"] or "(no title)", flag, "\n".join(slide["text"])[:1500]))
    write_text(os.path.join(out, "slides.md"), "\n".join(lines))
    print("ok read-start: %d slides, %d pictures -> %s" % (len(slides), len(pictures), out))
    return 0


# ---------- measuring text ----------

_FONT_CACHE = {}


def font_file(family, bold=False):
    key = (family, bold)
    if key in _FONT_CACHE:
        return _FONT_CACHE[key]
    dirs = ["/System/Library/Fonts", "/System/Library/Fonts/Supplemental", "/Library/Fonts",
            os.path.expanduser("~/Library/Fonts"), "C:/Windows/Fonts", "/usr/share/fonts"]
    want = re.sub(r"\s+", "", family).lower()
    found = None
    for folder in dirs:
        for path in glob.glob(os.path.join(folder, "**", "*.tt[fc]"), recursive=True):
            name = re.sub(r"[\s_-]+", "", os.path.splitext(os.path.basename(path))[0]).lower()
            if name == want + ("bold" if bold else "") or (not bold and name in (want, want + "regular")):
                found = path
                break
        if found:
            break
    _FONT_CACHE[key] = found
    return found


def text_width_in(text, family, pt, bold=False):
    path = font_file(family, bold) or font_file(family)
    if path:
        try:
            from PIL import ImageFont
            font = ImageFont.truetype(path, size=int(pt * 10))
            return font.getlength(text) / 10.0 / 72.0
        except Exception:
            pass
    return len(text) * pt * (0.56 if bold else 0.52) / 72.0


def wrap_lines(text, family, pt, width_in, bold=False):
    lines, current = 0, ""
    for word in str(text).split():
        wide = text_width_in(word, family, pt, bold)
        if wide > width_in:
            # A word wider than the box (a long link) breaks over several lines.
            if current:
                lines += 1
            pieces = int(wide / width_in)
            lines += pieces
            current = word[int(len(word) * pieces * width_in / wide):]
            continue
        trial = (current + " " + word).strip()
        if current and text_width_in(trial, family, pt, bold) > width_in:
            lines += 1
            current = word
        else:
            current = trial
    return lines + (1 if current else 0) or 1


def text_height_in(paragraphs, family, pt, width_in, bold=False, bullet=False):
    indent = 0.3 if bullet else 0.0
    total_lines = sum(wrap_lines(p, family, pt, width_in - indent, bold) for p in paragraphs)
    gaps = max(0, len(paragraphs) - 1) * pt * 0.6 / 72.0
    return total_lines * pt * 1.2 / 72.0 + gaps, total_lines


def fit_size(paragraphs, family, pt_max, pt_min, w, h, bold=False, bullet=False):
    pt = pt_max
    while pt >= pt_min:
        need, lines = text_height_in(paragraphs, family, pt, w, bold, bullet)
        if need <= h:
            return pt, lines, True
        pt -= 1
    need, lines = text_height_in(paragraphs, family, pt_min, w, bold, bullet)
    return pt_min, lines, False


# ---------- layouts: one slide -> a list of drawing steps ----------

def text_op(x, y, w, h, paragraphs, font, pt_max, pt_min, color, bold=False, bullet=False, align="left", valign="top", role="body", one_line=False):
    paragraphs = [str(p) for p in paragraphs if str(p).strip()]
    if one_line:
        pt = pt_max
        while pt > pt_min and text_width_in(" ".join(paragraphs), font, pt, bold) > w:
            pt -= 1
        lines = wrap_lines(" ".join(paragraphs), font, pt, w, bold)
        fits = lines == 1 and pt * 1.2 / 72.0 <= h + 0.01
    else:
        pt, lines, fits = fit_size(paragraphs, font, pt_max, pt_min, w, h, bold, bullet)
    return {"op": "text", "x": x, "y": y, "w": w, "h": h, "paragraphs": paragraphs, "font": font, "pt": pt,
            "color": color, "bold": bold, "bullet": bullet, "align": align, "valign": valign, "role": role,
            "lines": lines, "fits": fits, "one_line": one_line}


def rect_op(x, y, w, h, fill):
    return {"op": "rect", "x": x, "y": y, "w": w, "h": h, "fill": fill}


def lay_title(slide, b, W, M):
    return [text_op(M, 0.55, W - 2 * M, 0.75, [slide.get("title", "")], b["title_font"], 30, 22, b["text"], bold=b.get("title_bold", True), role="title", one_line=True)]


def lay_block(block, b, x, y, w, h, deck_dir):
    """Draw one block (points, numbers, columns, steps, image) inside a box."""
    kind = block.get("layout", "points")
    ops = []
    if block.get("heading"):
        ops.append(text_op(x, y, w, 0.45, [block["heading"]], b["title_font"], 20, 14, b["accent"], bold=b.get("title_bold", True), role="heading", one_line=True))
        y, h = y + 0.6, h - 0.6
    if kind == "points":
        small = 9 if block.get("auto") == "sources" else 14
        points = [item_text(p) for p in block.get("points", [])]
        ops.append(text_op(x, y, w, h, points, b["body_font"], 22, small, b["text"], bullet=len(points) > 1))
    elif kind == "numbers":
        items = block.get("numbers", [])[:4] or [{}]
        gap = 0.35
        cw = (w - gap * (len(items) - 1)) / len(items)
        bh = min(h, 2.4)  # a taller box leaves empty colour under a one-line label
        for i, item in enumerate(items):
            cx = x + i * (cw + gap)
            ops.append(rect_op(cx, y, cw, bh, b["accent_soft"]))
            ops.append(text_op(cx + 0.25, y + 0.3, cw - 0.5, 1.0, [item.get("value", "")], b["title_font"], 44, 24, b["accent"], bold=b.get("title_bold", True), role="figure", one_line=True))
            ops.append(text_op(cx + 0.25, y + 1.45, cw - 0.5, bh - 1.65, [item.get("label", "")], b["body_font"], 18, 11, b["text"]))
    elif kind in ("columns", "steps"):
        items = block.get("columns" if kind == "columns" else "steps", [])[:5] or [{}]
        gap = 0.35
        cw = (w - gap * (len(items) - 1)) / len(items)
        if kind == "steps":
            h = min(h, 3.4)  # taller step boxes leave empty colour under short text
        for i, item in enumerate(items):
            cx = x + i * (cw + gap)
            top = y
            if kind == "steps":
                ops.append(rect_op(cx, y, cw, h, b["accent_soft"]))
                ops.append(rect_op(cx, y, cw, 0.08, b["accent"]))
                top = y + 0.3
                cx, inner = cx + 0.2, cw - 0.4
            else:
                inner = cw
            heading = item.get("heading", "")
            if kind == "steps":
                heading = "%d. %s" % (i + 1, heading)
            head = text_op(cx, top, inner, 0.9, [heading], b["title_font"], 19, 13, b["accent"], bold=b.get("title_bold", True), role="heading")
            ops.append(head)
            body = [item_text(p) for p in item.get("points") or []] or ([item["text"]] if item.get("text") else [])
            ops.append(text_op(cx, top + 1.0, inner, h - (top - y) - 1.2, body, b["body_font"], 17, 11, b["text"], bullet=kind == "columns" and len(body) > 1))
    elif kind == "image":
        path = block.get("image", "")
        full = path if os.path.isabs(path) else os.path.join(deck_dir, path)
        caption_h = 0.45 if block.get("caption") else 0
        iw, ih = w, h - caption_h
        try:
            from PIL import Image
            with Image.open(full) as img:
                ratio = img.width / float(img.height)
            if iw / ih > ratio:
                iw = ih * ratio
            else:
                ih = iw / ratio
            ops.append({"op": "image", "x": x + (w - iw) / 2, "y": y, "w": iw, "h": ih, "path": full, "fits": True})
        except Exception:
            ops.append({"op": "image", "x": x, "y": y, "w": iw, "h": ih, "path": full, "fits": False, "error": "image not found or unreadable"})
        if caption_h:
            ops.append(text_op(x, y + ih + 0.1, w, 0.4, [block["caption"]], b["body_font"], 14, 10, b["muted"], align="center"))
    return ops


def lay_slide(slide, b, size, deck_dir):
    W, H = size
    M = 0.75 if W > H else 0.6
    kind = slide.get("layout", "points")
    ops = []
    if kind == "title":
        ops.append(rect_op(M, H * 0.3, 1.2, 0.08, b["accent"]))
        ops.append(text_op(M, H * 0.3 + 0.3, W - 2 * M, 1.6, [slide.get("title", "")], b["title_font"], 44, 28, b["text"], bold=b.get("title_bold", True), role="title"))
        ops.append(text_op(M, H * 0.3 + 2.1, W - 2 * M, 1.2, [slide.get("subtitle", "")], b["body_font"], 22, 14, b["muted"]))
    elif kind == "section":
        ops.append(rect_op(M, H * 0.4 - 0.25, 1.2, 0.08, b["accent"]))
        ops.append(text_op(M, H * 0.4, W - 2 * M, 1.2, [slide.get("title", "")], b["title_font"], 38, 24, b["text"], bold=b.get("title_bold", True), role="title", one_line=True))
        if slide.get("subtitle"):
            ops.append(text_op(M, H * 0.4 + 1.3, W - 2 * M, 1.0, [slide["subtitle"]], b["body_font"], 20, 14, b["muted"]))
    elif kind == "stack":
        ops += lay_title(slide, b, W, M) if slide.get("title") else []
        top = 1.6 if slide.get("title") else M
        blocks = slide.get("blocks", [])
        weights = [float(x.get("weight", 1)) for x in blocks] or [1]
        room = H - top - M - 0.3 * max(0, len(blocks) - 1)
        y = top
        for block, weight in zip(blocks, weights):
            bh = room * weight / sum(weights)
            ops += lay_block(block, b, M, y, W - 2 * M, bh, deck_dir)
            y += bh + 0.3
    else:
        ops += lay_title(slide, b, W, M)
        ops += lay_block(slide, b, M, 1.65, W - 2 * M, H - 1.65 - 0.6, deck_dir)
    return ops


def sources_slides(deck, facts):
    used = []
    for slide in deck["slides"]:
        for fact_id in cited_facts(slide):
            if fact_id not in used:
                used.append(fact_id)
    by_id = {f["id"]: f for f in facts}
    lines = []
    for fact_id in used:
        fact = by_id.get(fact_id)
        if not fact:
            continue
        where = fact.get("source") if fact.get("kind") == "public" else ("Our estimate: " + fact.get("how", "") if fact.get("kind") == "estimate" else "Given by the presenter")
        lines.append("%s. %s %s" % (fact_id, fact.get("text", ""), "(" + where + ")" if where else ""))
    pages = [lines[i:i + 6] for i in range(0, len(lines), 6)]  # 6 per slide keeps full links readable
    return [{"layout": "points", "title": "Sources" if i == 0 else "Sources (continued)", "points": page, "part": "appendix", "auto": "sources"} for i, page in enumerate(pages)]


def plan(deck_dir):
    deck = read_json(os.path.join(deck_dir, "deck.json"))
    facts = read_json(os.path.join(deck_dir, "facts.json"), {"facts": []}).get("facts", [])
    fmt = deck.get("format", "slides")
    if fmt == "page":
        fmt = "page-" + deck.get("page_size", "a4").lower()
    size = SIZES.get(fmt, SIZES["slides"])
    brand = dict(DEFAULT_BRAND)
    brand.update(deck.get("brand") or {})
    slides = [s for s in deck["slides"] if s.get("auto") != "sources"]
    if deck.get("sources_slide", True):
        slides += sources_slides({"slides": slides}, facts)
    planned = []
    for number, slide in enumerate(slides, 1):
        ops = [] if slide.get("layout") == "keep" else lay_slide(slide, brand, size, deck_dir)
        planned.append({"slide": number, "layout": slide.get("layout", "points"), "part": slide.get("part", "main"), "source": slide, "ops": ops})
    return deck, facts, brand, size, fmt, planned


# ---------- writers ----------

def esc(text):
    return str(text).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def data_uri(path):
    """A picture inside the HTML itself, so deck.html still works when moved or sent on its own."""
    import base64
    kind = "jpeg" if path.lower().endswith((".jpg", ".jpeg")) else "png"
    try:
        with open(path, "rb") as handle:
            return "data:image/%s;base64,%s" % (kind, base64.b64encode(handle.read()).decode("ascii"))
    except OSError:
        return ""


def write_html(deck_dir, deck, brand, size, fmt, planned, start, keep_pictures=None):
    """keep_pictures: slide number -> picture of that slide in the final PowerPoint, so word swaps show in the HTML."""
    W, H = size
    out = os.path.join(deck_dir, "out")
    sections = []
    for item in planned:
        parts = []
        if item["layout"] == "keep":
            number = int(item["source"].get("from_slide", 0))
            pic = (keep_pictures or {}).get(item["slide"]) or os.path.join(deck_dir, "start", "renders", "slide-%02d.png" % number)
            parts.append('<img src="%s" style="position:absolute;left:0;top:0;width:100%%;height:100%%;object-fit:contain" alt="Slide %d of the start deck">' % (data_uri(pic), number))
        for op in item["ops"]:
            box = "left:%.3fin;top:%.3fin;width:%.3fin;height:%.3fin" % (op["x"], op["y"], op["w"], op["h"])
            if op["op"] == "rect":
                parts.append('<div style="position:absolute;%s;background:#%s"></div>' % (box, op["fill"]))
            elif op["op"] == "image":
                parts.append('<img src="%s" style="position:absolute;%s;object-fit:contain" alt="">' % (data_uri(op["path"]), box))
            else:
                style = "position:absolute;%s;font-family:'%s',Arial,sans-serif;font-size:%dpt;line-height:1.2;color:#%s;font-weight:%s;text-align:%s;display:flex;flex-direction:column;justify-content:%s" % (
                    box, op["font"], op["pt"], op["color"], 700 if op["bold"] else 400, op["align"], "center" if op["valign"] == "middle" else "flex-start")
                if op["one_line"]:
                    style += ";white-space:nowrap"
                if op["bullet"]:
                    inner = "<ul style='margin:0;padding-left:0.3in'>" + "".join("<li style='margin:0 0 %.1fpt'>%s</li>" % (op["pt"] * 0.6, esc(p)) for p in op["paragraphs"]) + "</ul>"
                else:
                    inner = "".join("<p style='margin:0 0 %.1fpt'>%s</p>" % (op["pt"] * 0.6, esc(p)) for p in op["paragraphs"])
                parts.append('<div style="%s">%s</div>' % (style, inner))
        notes = item["source"].get("notes", "")
        sections.append('<section class="slide" data-slide="%d" data-part="%s"%s>%s</section>' % (
            item["slide"], item["part"], ' data-notes="%s"' % esc(notes).replace('"', "&quot;") if notes else "", "".join(parts)))
    gap = "0" if fmt == "web" else "24px"
    html = """<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>%(title)s</title>
<style>
@page { size: %(W)sin %(H)sin; margin: 0 }
html { background: %(page_bg)s } body { margin: 0; padding: %(gap)s 0 }
.slide { position: relative; width: %(W)sin; height: %(H)sin; overflow: hidden; background: #%(bg)s; margin: 0 auto %(gap)s;
  box-shadow: %(shadow)s; break-after: page; page-break-after: always; transform-origin: top left }
.slide li { padding-left: 0.05in }
@media print { html { background: none } body { padding: 0 } .slide { margin: 0; box-shadow: none; transform: none !important } }
</style></head><body>
%(sections)s
<script>
function fit(){var s=document.querySelectorAll('.slide');for(var i=0;i<s.length;i++){var w=s[i].offsetWidth,k=Math.min(1,(window.innerWidth-32)/w);
s[i].style.transform=k<1?'scale('+k+')':'';s[i].style.marginBottom=k<1?(-(1-k)*s[i].offsetHeight+16)+'px':'';s[i].style.marginLeft=k<1?'16px':'auto'}}
if(!window.matchMedia('print').matches){window.addEventListener('resize',fit);fit()}
</script>
</body></html>
""" % {"title": esc(deck.get("title", "Deck")), "W": W, "H": H, "bg": brand["background"], "sections": "\n".join(sections),
       "page_bg": "#" + brand["background"] if fmt == "web" else "#E6E8EB", "gap": gap, "shadow": "none" if fmt == "web" else "0 2px 12px rgba(0,0,0,.15)"}
    write_text(os.path.join(out, "deck.html"), html)


def write_pptx(deck_dir, deck, brand, size, planned, start):
    from pptx import Presentation
    from pptx.dml.color import RGBColor
    from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
    from pptx.oxml.ns import qn
    from pptx.util import Emu, Pt

    start_file = (start or {}).get("file")
    keep_native = bool(start_file and start_file.lower().endswith(".pptx"))
    prs = Presentation(start_file) if keep_native else Presentation()
    if not keep_native:
        prs.slide_width, prs.slide_height = Emu(int(size[0] * EMU)), Emu(int(size[1] * EMU))
    sx = prs.slide_width / float(size[0] * EMU)
    sy = prs.slide_height / float(size[1] * EMU)
    originals = list(prs.slides._sldIdLst)
    layouts = list(prs.slide_layouts)
    blank = next((l for l in layouts if "blank" in l.name.lower()), None) or min(layouts, key=lambda l: len(l.placeholders))
    inch = lambda v, s: Emu(int(v * EMU * s))
    order = []
    for item in planned:
        if item["layout"] == "keep" and keep_native:
            number = int(item["source"].get("from_slide", 0))
            if not 1 <= number <= len(originals):
                raise SystemExit("deck.py make: slide %d keeps start slide %d, which does not exist" % (item["slide"], number))
            sld = originals[number - 1]
            slide = prs.slides.get(int(sld.get("id")))
            for change in item["source"].get("replace", []):
                for shape in slide.shapes:
                    if not shape.has_text_frame:
                        continue
                    for para in shape.text_frame.paragraphs:
                        if change["old"] in para.text and para.runs:
                            para.runs[0].text = para.text.replace(change["old"], change["new"])
                            for extra in para.runs[1:]:
                                extra.text = ""
            order.append(sld)
            continue
        slide = prs.slides.add_slide(blank)
        for ph in list(slide.placeholders):
            ph._element.getparent().remove(ph._element)
        if brand.get("background"):
            fill = slide.background.fill
            fill.solid()
            fill.fore_color.rgb = RGBColor.from_string(brand["background"])
        if item["layout"] == "keep":
            number = int(item["source"].get("from_slide", 0))
            pic = os.path.join(deck_dir, "start", "renders", "slide-%02d.png" % number)
            slide.shapes.add_picture(pic, 0, 0, prs.slide_width, prs.slide_height)
        for op in item["ops"]:
            x, y, w, h = inch(op["x"], sx), inch(op["y"], sy), inch(op["w"], sx), inch(op["h"], sy)
            if op["op"] == "rect":
                shape = slide.shapes.add_shape(1, x, y, w, h)
                shape.fill.solid()
                shape.fill.fore_color.rgb = RGBColor.from_string(op["fill"])
                shape.line.fill.background()
                shape.shadow.inherit = False
            elif op["op"] == "image":
                if os.path.exists(op["path"]):
                    slide.shapes.add_picture(op["path"], x, y, w, h)
            else:
                box = slide.shapes.add_textbox(x, y, w, h)
                frame = box.text_frame
                frame.word_wrap = not op["one_line"]
                frame.margin_left = frame.margin_right = frame.margin_top = frame.margin_bottom = 0
                frame.vertical_anchor = MSO_ANCHOR.MIDDLE if op["valign"] == "middle" else MSO_ANCHOR.TOP
                for i, text in enumerate(op["paragraphs"] or [""]):
                    para = frame.paragraphs[0] if i == 0 else frame.add_paragraph()
                    para.alignment = {"center": PP_ALIGN.CENTER, "right": PP_ALIGN.RIGHT}.get(op["align"], PP_ALIGN.LEFT)
                    para.space_after = Pt(op["pt"] * 0.6)
                    run = para.add_run()
                    run.text = text
                    run.font.size = Pt(op["pt"])
                    run.font.bold = op["bold"]
                    run.font.name = op["font"]
                    run.font.color.rgb = RGBColor.from_string(op["color"])
                    if op["bullet"]:
                        ppr = para._p.get_or_add_pPr()
                        ppr.set("marL", str(int(0.3 * EMU)))
                        ppr.set("indent", str(int(-0.3 * EMU)))
                        bullet = ppr.makeelement(qn("a:buChar"), {"char": "\u2022"})
                        ppr.append(bullet)
        notes = item["source"].get("notes", "")
        if notes:
            slide.notes_slide.notes_text_frame.text = notes
        order.append(prs.slides._sldIdLst[-1])
    ids = prs.slides._sldIdLst
    for sld in list(ids):
        if sld not in order:
            prs.part.drop_rel(sld.rId)
        ids.remove(sld)
    for sld in order:
        ids.append(sld)
    # Number the slide files 1..N again: Quick Look hangs on a deck whose slide files skip numbers.
    prs.part.rename_slide_parts([sld.rId for sld in order])
    prs.save(os.path.join(deck_dir, "out", "deck.pptx"))


def cmd_make(args):
    deck_dir = args["--dir"]
    deck, facts, brand, size, fmt, planned = plan(deck_dir)
    start = read_json(os.path.join(deck_dir, "start", "slides.json"), {}) if os.path.exists(os.path.join(deck_dir, "start", "slides.json")) else None
    outputs = deck.get("outputs", ["html", "pptx"])
    os.makedirs(os.path.join(deck_dir, "out"), exist_ok=True)
    write_html(deck_dir, deck, brand, size, fmt, planned, start)
    made = ["out/deck.html"]
    try:
        import pptx  # noqa: F401
        can_pptx = True
    except ImportError:
        can_pptx = False
        print("no PowerPoint: python-pptx is not installed here (run setup); the check will fail on it")
    if "pptx" in outputs and fmt == "slides" and can_pptx:
        write_pptx(deck_dir, deck, brand, size, planned, start)
        made.append("out/deck.pptx")
    write_json(os.path.join(deck_dir, "out", "layout.json"), {"format": fmt, "size": size, "slides": [
        {k: v for k, v in item.items() if k != "source"} for item in planned]})
    bad = [(item["slide"], op.get("role"), op.get("paragraphs", [op.get("path")])[0]) for item in planned for op in item["ops"] if not op.get("fits", True)]
    print("ok make: %d slides -> %s" % (len(planned), ", ".join(made)))
    for slide, role, text in bad:
        print("does not fit: slide %d %s: %s" % (slide, role, str(text)[:80]))
    return 0


# ---------- render ----------

def cmd_render(args):
    deck_dir = args["--dir"]
    tools = read_json(os.path.join(deck_dir, "tools.json"), {})
    deck = read_json(os.path.join(deck_dir, "deck.json"))
    out = os.path.join(deck_dir, "out")
    renders = os.path.join(deck_dir, "renders")
    shutil.rmtree(renders, ignore_errors=True)
    index = {"html": [], "pptx": [], "notes": []}
    pptx = os.path.join(out, "deck.pptx")
    if os.path.exists(pptx):
        if shutil.which("qlmanage"):
            index["pptx"] = [os.path.relpath(p, deck_dir) for p in pptx_slide_pictures(pptx, os.path.join(renders, "pptx"))]
        else:
            index["notes"].append("no Quick Look: PowerPoint slides not drawn")
    deck_, facts, brand, size, fmt, planned = plan(deck_dir)
    if any(item["layout"] == "keep" for item in planned):
        start = read_json(os.path.join(deck_dir, "start", "slides.json"), {})
        if len(index["pptx"]) == len(planned):
            # Kept slides in the HTML and PDF are drawn from the final PowerPoint, so their word swaps show.
            pictures = {i + 1: os.path.join(deck_dir, p) for i, p in enumerate(index["pptx"])}
            write_html(deck_dir, deck_, brand, size, fmt, planned, start, keep_pictures=pictures)
        elif any(item["source"].get("replace") for item in planned):
            index["notes"].append("kept slides in the HTML show the start deck before its word swaps")
    chrome = tools.get("chrome") or find_chrome()
    html = os.path.join(out, "deck.html")
    if chrome and os.path.exists(html):
        pdf = os.path.join(out, "deck.pdf")
        subprocess.run([chrome, "--headless=new", "--disable-gpu", "--no-pdf-header-footer", "--allow-file-access-from-files",
                        "--print-to-pdf=" + pdf, "file://" + os.path.abspath(html)], capture_output=True, timeout=180)
        try:
            import fitz
            doc = fitz.open(pdf)
            for number, page in enumerate(doc, 1):
                png = os.path.join(renders, "html", "slide-%02d.png" % number)
                os.makedirs(os.path.dirname(png), exist_ok=True)
                page.get_pixmap(dpi=110).save(png)
                index["html"].append(os.path.relpath(png, deck_dir))
        except Exception as error:
            index["notes"].append("could not turn the PDF into pictures: %s" % error)
        if "pdf" not in deck.get("outputs", ["html", "pptx"]):
            shutil.move(pdf, os.path.join(renders, "html", "deck.pdf")) if os.path.exists(pdf) else None
    else:
        index["notes"].append("no Chrome: HTML pages not drawn")
    write_json(os.path.join(renders, "index.json"), index)
    print("ok render: %d HTML pictures, %d PowerPoint pictures%s" % (len(index["html"]), len(index["pptx"]), ("; " + "; ".join(index["notes"])) if index["notes"] else ""))
    kind = "pptx" if index["pptx"] else "html"
    if index[kind]:
        try:
            cmd_sheet({"--dir": deck_dir, "--kind": kind})
        except Exception as error:  # a sheet is a help for looking, never a reason for render to fail
            print("no sheets: %s" % error)
    return 0


# ---------- check ----------

NUMBER = re.compile(r"\d[\d,]*(?:\.\d+)?")
FACT_ID = re.compile(r"\(?\bf\d+\b\)?")


def cited_facts(slide):
    ids = list(slide.get("facts", []))
    for point in slide.get("points", []) or []:
        if isinstance(point, dict):
            ids += point.get("facts", [])
    for key in ("numbers", "columns", "steps", "blocks"):
        for item in slide.get(key, []) or []:
            if isinstance(item, dict):
                if item.get("fact"):
                    ids.append(item["fact"])
                ids += cited_facts(item)
    return ids


def visible_text(slide):
    parts = [slide.get(k, "") for k in ("title", "subtitle", "heading", "caption", "value", "label", "text")]
    parts += [item_text(p) for p in slide.get("points", []) or []]
    for key in ("numbers", "columns", "steps", "blocks"):
        for item in slide.get(key, []) or []:
            parts.append(visible_text(item) if isinstance(item, dict) else str(item))
    return " ".join(str(p) for p in parts if p)


def figures_in(text):
    text = FACT_ID.sub(" ", text)  # a fact id such as "(f12)" is not a figure; the claims check flags it
    found = []
    for match in NUMBER.finditer(text):
        token = match.group(0).rstrip(".,")
        tail = text[match.end():match.end() + 1]
        plain = token.replace(",", "")
        try:
            value = float(plain)
        except ValueError:
            continue
        after = text[match.end():match.end() + 12].lower()
        has_unit = re.match(r"\s?(%|x\b|hours?|days?|weeks?|months?|years?|people|times|k\b|m\b|bn?\b)", after)
        # A lone digit under 10 with no unit is a list number or "3 steps"; with a unit ("2 hours") it is a claim.
        if "." not in plain and not has_unit and value < 10:
            continue
        if "." not in plain and tail != "%" and 1990 <= value <= 2100:
            continue
        found.append(plain)
    return found


def claim_rows(slide, number):
    """One row per piece of text on a new slide: what it says and the facts that back it.
    need=True: the row states something, so it must cite a fact. need=False: a label, a cover line or the notes;
    no fact is required, but the claim checker still reads it and its figures must be in the slide's facts."""
    rows = []
    every = list(dict.fromkeys(cited_facts(slide)))
    own = list(slide.get("facts", []))

    def add(where, text, facts, need):
        text = str(text or "").strip()
        if text:
            rows.append({"id": "s%d.%s" % (number, where), "slide": number, "text": text,
                         "facts": list(dict.fromkeys(facts)), "need": need and not text.endswith("?")})

    def block(item, prefix, parent_facts):
        kind = item.get("layout", "points")
        add(prefix + "heading", item.get("heading"), parent_facts, False)
        for i, point in enumerate(item.get("points", []) or [], 1):
            facts = point.get("facts", []) if isinstance(point, dict) else []
            add("%sp%d" % (prefix, i), item_text(point), facts or (parent_facts if prefix else []), True)
        for i, num in enumerate(item.get("numbers", []) or [], 1):
            add("%sn%d" % (prefix, i), ("%s: %s" % (num.get("value", ""), num.get("label", ""))).strip(": "),
                ([num["fact"]] if num.get("fact") else []) + list(num.get("facts", [])), True)
        for key, short in (("columns", "c"), ("steps", "st")):
            for i, col in enumerate(item.get(key, []) or [], 1):
                facts = list(col.get("facts", []))
                if key == "steps":
                    add("%s%s%d" % (prefix, short, i), ("%s: %s" % (col.get("heading", ""), col.get("text", ""))).strip(": "), facts, True)
                else:
                    block(col, "%s%s%d." % (prefix, short, i), facts)
        for i, sub in enumerate(item.get("blocks", []) or [], 1):
            block(sub, "%sb%d." % (prefix, i), list(sub.get("facts", [])))
        add(prefix + "caption", item.get("caption"), parent_facts, False)

    layout = slide.get("layout", "points")
    if layout == "section":
        return rows
    if layout == "title":
        add("title", slide.get("title"), own, False)
        add("subtitle", slide.get("subtitle"), own, False)
    else:
        add("title", slide.get("title"), own or every, True)
        block(slide, "", own)
    add("notes", slide.get("notes"), every, False)
    return rows


def kept_rows(item, start, person_facts):
    """A kept start-deck slide is the presenter's word, but it may not claim more about our product than need 6.
    Each of its lines, after its word swaps, is checked against every from-person fact."""
    number = int(item["source"].get("from_slide", 0))
    slide = next((x for x in (start or {}).get("slides", []) if x.get("slide") == number), None)
    rows = []
    for text in "\n".join((slide or {}).get("text", [])).split("\n"):
        for change in item["source"].get("replace", []):
            text = text.replace(change["old"], change["new"])
        if text.strip():
            rows.append({"id": "s%d.k%d" % (item["slide"], len(rows) + 1), "slide": item["slide"], "text": text.strip(),
                         "facts": list(person_facts), "need": False, "kept": True})
    return rows


def deck_claim_rows(planned, deck_dir=None, facts=()):
    rows = []
    start = None
    if deck_dir and os.path.exists(os.path.join(deck_dir, "start", "slides.json")):
        start = read_json(os.path.join(deck_dir, "start", "slides.json"))
    person = [f.get("id") for f in facts if f.get("kind") == "from-person"]
    for item in planned:
        if item["source"].get("auto") == "sources":
            continue
        if item["layout"] == "keep":
            rows += kept_rows(item, start, person)
            continue
        rows += claim_rows(item["source"], item["slide"])
    return rows


def rows_hash(rows, facts=()):
    """Changes when any slide line, its cited ids, or any fact's text changes: each needs a new claim check."""
    import hashlib
    data = [[r["id"], r["text"], r["facts"]] for r in rows] + [[f.get("id"), f.get("text")] for f in facts]
    return hashlib.sha1(json.dumps(data, ensure_ascii=False).encode("utf-8")).hexdigest()[:12]


def figure_problems(rows, by_id):
    problems = []
    for row in rows:
        if row.get("kept"):
            continue  # a kept slide's numbers are the presenter's word; the claim checker reads its product claims
        backing = " ".join(str(by_id[i].get("text", "")) + " " + str(by_id[i].get("value", "")) for i in row["facts"] if i in by_id)
        tokens = set(m.group(0).rstrip(".,").replace(",", "") for m in NUMBER.finditer(backing))
        for figure in dict.fromkeys(figures_in(row["text"])):
            if figure not in tokens:
                problems.append("%s shows %s, which is in none of its facts (%s)" % (row["id"], figure, ", ".join(row["facts"]) or "none cited"))
    return problems


def claim_problems(rows, by_id, deck_dir, facts=()):
    problems = []
    for row in rows:
        if row["need"] and not row["facts"]:
            problems.append("%s cites no fact: \"%s\"" % (row["id"], row["text"][:70]))
        missing = [i for i in row["facts"] if i not in by_id]
        if missing:
            problems.append("%s cites %s, not in facts.json" % (row["id"], ", ".join(missing)))
        if not row["id"].endswith("notes") and FACT_ID.search(row["text"]):
            problems.append("%s shows a fact id in its words: put it in \"facts\" only" % row["id"])
    claims_md = os.path.join(deck_dir, "claims.md")
    verdict = os.path.join(deck_dir, "claims-verdict.md")
    if not os.path.exists(claims_md):
        problems.append("claims.md is missing: run DECK claims")
    else:
        head = open(claims_md, encoding="utf-8").read(400)
        if "Rows: %s" % rows_hash(rows, facts) not in head:
            problems.append("the slide words changed after claims.md was made: run DECK claims and the claim checker again")
        elif not os.path.exists(verdict):
            problems.append("claims-verdict.md is missing: run the claim checker on claims.md")
        elif os.path.getmtime(verdict) < os.path.getmtime(claims_md):
            problems.append("claims-verdict.md is older than claims.md: run the claim checker again")
        elif not open(verdict, encoding="utf-8").read().lstrip().upper().startswith("PASS"):
            problems.append("claims-verdict.md does not say PASS: fix the rows it names, run DECK claims, then a new checker")
    return problems


def cmd_claims(args):
    """Write claims.md: every piece of new-slide text with the full text of the facts it cites."""
    deck_dir = args["--dir"]
    deck, facts, brand, size, fmt, planned = plan(deck_dir)
    by_id = {f.get("id"): f for f in facts}
    rows = deck_claim_rows(planned, deck_dir, facts)
    digest = rows_hash(rows, facts)
    target = os.path.join(deck_dir, "claims.md")
    old = open(target, encoding="utf-8").read(400) if os.path.exists(target) else ""
    if "Rows: %s" % digest not in old:  # unchanged rows keep the file's time, so a verdict on them stays good
        lines = ["# Claims to check", "", "Rows: %s. %d rows from %d new slides." % (digest, len(rows), len({r["slide"] for r in rows})), "",
                 "Each row is one piece of slide text, then the facts it cites, in full. A row marked",
                 "(label or cover) needs no fact; every other row states something and must cite one. A (notes) row",
                 "is what the presenter will say, shown with every fact its slide cites. A (kept slide) row is a line",
                 "of the presenter's own start deck, shown with every fact the presenter gave. The facts no slide",
                 "cites are listed at the end.", ""]
        for row in rows:
            mark = " (kept slide)" if row.get("kept") else " (notes)" if row["id"].endswith(".notes") else "" if row["need"] else " (label or cover)"
            lines.append("## %s%s" % (row["id"], mark))
            lines.append("> " + row["text"].replace("\n", " "))
            for fact_id in row["facts"]:
                fact = by_id.get(fact_id, {})
                extra = fact.get("how") if fact.get("kind") == "estimate" else fact.get("date", "")
                lines.append("- %s [%s] %s%s" % (fact_id, fact.get("kind", "missing"), fact.get("text", "NOT IN facts.json"), (" (%s)" % extra) if extra else ""))
            if not row["facts"]:
                lines.append("- no fact cited")
            lines.append("")
        cited = {i for row in rows if not row.get("kept") for i in row["facts"]}
        lines.append("## Facts no slide cites")
        for fact in facts:
            if fact.get("id") not in cited:
                extra = fact.get("how") if fact.get("kind") == "estimate" else fact.get("date", "")
                lines.append("- %s [%s] %s%s" % (fact.get("id"), fact.get("kind"), fact.get("text", ""), (" (%s)" % extra) if extra else ""))
        write_text(target, "\n".join(lines) + "\n")
    problems = claim_problems(rows, by_id, deck_dir, facts)
    # claims.md itself is fresh here, so only the rows' own problems decide this command's answer
    own = [p for p in problems if "claims-verdict" not in p]
    print("%s: %d rows in claims.md (%d need a fact)." % ("PASS" if not own else "FAIL", len(rows), sum(r["need"] for r in rows)))
    for problem in own:
        print("- " + problem)
    return 1 if own else 0


def fact_problems(facts):
    problems, seen = [], set()
    for fact in facts:
        kind, fact_id = fact.get("kind"), fact.get("id")
        if not fact_id or fact_id in seen:
            problems.append("a fact has no id or a repeated id: %r" % fact_id)
        seen.add(fact_id)
        if not str(fact.get("text", "")).strip():
            problems.append("fact %s has no text" % fact_id)
        if kind == "public" and not str(fact.get("source", "")).startswith("http"):
            problems.append("fact %s is public but has no source link" % fact_id)
        elif kind == "estimate" and not fact.get("how"):
            problems.append("fact %s is an estimate with no 'how'" % fact_id)
        elif kind not in ("public", "estimate", "from-person"):
            problems.append("fact %s has kind %r (public, estimate or from-person)" % (fact_id, kind))
    return problems


def cmd_merge_facts(args):
    """research/*.md fact lines -> facts.json. The person's file first, then company, industry, people, the rest."""
    deck_dir = args["--dir"]
    order = {"person.md": 0, "company.md": 1, "industry.md": 2, "people.md": 3, "added.md": 10}
    files = sorted(glob.glob(os.path.join(deck_dir, "research", "*.md")), key=lambda f: (order.get(os.path.basename(f), 9), f))
    line_re = re.compile(r"^\s*[-*]\s*\[(public|estimate|from-person)\]\s*(.+?)\s*$")
    facts, skipped = [], 0
    for path in files:
        if os.path.basename(path) == "spot-check.md":
            continue
        for line in open(path, encoding="utf-8"):
            found = line_re.match(line)
            if not found:
                skipped += line.lstrip().startswith("- [")
                continue
            kind, rest = found.group(1), [part.strip() for part in found.group(2).split(" | ")]
            fact = {"id": "f%d" % (len(facts) + 1), "kind": kind, "text": rest[0], "from": os.path.basename(path)}
            if kind == "public":
                fact["source"] = next((x for x in rest[1:] if x.startswith("http")), "")
                dates = [x for x in rest[1:] if not x.startswith("http")]
                if dates:
                    fact["date"] = dates[0]
            elif kind == "estimate":
                fact["how"] = " | ".join(rest[1:]).replace("how:", "", 1).strip()
            elif len(rest) > 1:
                fact["where"] = " | ".join(rest[1:])
            facts.append(fact)
    write_json(os.path.join(deck_dir, "facts.json"), {"facts": facts})
    print("ok merge-facts: %d facts from %d files -> facts.json%s" % (len(facts), len(files), "; %d lines starting '- [' were not in the fact shape" % skipped if skipped else ""))
    return cmd_facts(args)


def cmd_facts(args):
    """The research check: facts.json alone, before any deck exists."""
    deck_dir = args["--dir"]
    facts = read_json(os.path.join(deck_dir, "facts.json")).get("facts", [])
    problems = fact_problems(facts)
    kinds = {}
    for fact in facts:
        kinds[fact.get("kind")] = kinds.get(fact.get("kind"), 0) + 1
    if not facts:
        problems.append("facts.json holds no facts")
    lines = ["# Facts check", "", "%s: %d facts (%s)." % ("PASS" if not problems else "FAIL", len(facts), ", ".join("%s %d" % kv for kv in sorted(kinds.items(), key=str)))]
    lines += ["- " + p for p in problems]
    write_text(os.path.join(deck_dir, "facts-check.md"), "\n".join(lines) + "\n")
    print("\n".join(lines))
    return 1 if problems else 0


def cmd_check(args):
    deck_dir = args["--dir"]
    deck, facts, brand, size, fmt, planned = plan(deck_dir)
    by_id = {f.get("id"): f for f in facts}
    results = []

    only = [k for k in args.get("--only", "").split(",") if k]

    def add(key, name, ok, detail):
        if not only or key in only:
            results.append({"key": key, "name": name, "pass": bool(ok), "detail": detail})

    main = [p for p in planned if p["part"] != "appendix"]
    low, high = (deck.get("slide_count") or [1, 999])[:2]
    add("count", "slide count in the asked range", low <= len(main) <= high, "%d main slides, asked %s to %s; %d in the appendix" % (len(main), low, high, len(planned) - len(main)))

    rows = deck_claim_rows(planned, deck_dir, facts)
    problems = fact_problems(facts) + figure_problems(rows, by_id)
    add("figures", "every figure has a source", not problems, "; ".join(problems[:12]) or "%d facts, every figure on a slide is in a fact its line cites" % len(facts))
    if not only or "claims" in only:
        claims = claim_problems(rows, by_id, deck_dir, facts)
        add("claims", "every line cites facts that say it", not claims, "; ".join(claims[:12]) or "%d rows, each cites a fact, claim checker PASS" % len(rows))

    layout_file = os.path.join(deck_dir, "out", "layout.json")
    fit = []
    if os.path.exists(layout_file):
        for item in read_json(layout_file)["slides"]:
            for op in item["ops"]:
                if not op.get("fits", True):
                    fit.append("slide %d %s: %s" % (item["slide"], op.get("role", op["op"]), (op.get("paragraphs") or [op.get("path", "")])[0][:60]))
    add("fit", "all text fits its box, titles on one line", not fit, "; ".join(fit[:10]) or "every box fits")

    outputs = deck.get("outputs", ["html", "pptx"])
    opened = []
    html = os.path.join(deck_dir, "out", "deck.html")
    if not os.path.exists(html):
        opened.append("out/deck.html is missing")
    else:
        sections = open(html, encoding="utf-8").read().count('<section class="slide"')
        if sections != len(planned):
            opened.append("deck.html has %d slides, the plan has %d" % (sections, len(planned)))
    if "pptx" in outputs and fmt == "slides":
        pptx = os.path.join(deck_dir, "out", "deck.pptx")
        try:
            from pptx import Presentation
            prs = Presentation(pptx)
            ratio = prs.slide_width / float(prs.slide_height)
            if abs(ratio - 16 / 9.0) > 0.02:
                opened.append("deck.pptx is %.2f:1, not 16:9" % ratio)
            if len(prs.slides) != len(planned):
                opened.append("deck.pptx has %d slides, the plan has %d" % (len(prs.slides), len(planned)))
            area = prs.slide_width * prs.slide_height
            for number, (slide, item) in enumerate(zip(prs.slides, planned), 1):
                if item["layout"] == "keep":
                    continue
                words = sum(len(s.text_frame.text.split()) for s in slide.shapes if s.has_text_frame)
                big_pictures = [s for s in slide.shapes if s.shape_type == 13 and s.width * s.height > 0.8 * area]
                if not words:
                    opened.append("deck.pptx slide %d has no real text" % number)
                if big_pictures:
                    opened.append("deck.pptx slide %d is a picture of a slide" % number)
        except Exception as error:
            opened.append("deck.pptx does not open: %s" % error)
    if "pdf" in outputs:
        try:
            import fitz
            pages = len(fitz.open(os.path.join(deck_dir, "out", "deck.pdf")))
            if pages != len(planned):
                opened.append("deck.pdf has %d pages, the plan has %d" % (pages, len(planned)))
        except Exception as error:
            opened.append("deck.pdf does not open: %s" % error)
    add("open", "each output file opens, with real text at the right size", not opened, "; ".join(opened) or "opened: " + ", ".join(outputs))

    index = read_json(os.path.join(deck_dir, "renders", "index.json"), {"html": [], "pptx": []})
    looked_file = os.path.join(deck_dir, "looked.md")
    seen = []
    renders = index.get("html", []) + index.get("pptx", [])
    if not renders:
        seen.append("no slide pictures at all: run render")
    if index.get("html") and len(index["html"]) != len(planned):
        seen.append("%d HTML pictures for %d slides" % (len(index["html"]), len(planned)))
    if "pptx" in outputs and fmt == "slides" and shutil.which("qlmanage") and len(index.get("pptx", [])) != len(planned):
        seen.append("%d PowerPoint pictures for %d slides" % (len(index.get("pptx", [])), len(planned)))
    if not os.path.exists(looked_file):
        seen.append("looked.md is missing")
    else:
        text = open(looked_file, encoding="utf-8").read().lower()
        missing = [str(i) for i in range(1, len(planned) + 1) if not re.search(r"slide %d\b" % i, text)]
        if missing:
            seen.append("looked.md has no line for slide " + ", ".join(missing))
        made = [p for p in [os.path.join(deck_dir, "out", "layout.json")] if os.path.exists(p)]
        oldest_render = min([os.path.getmtime(os.path.join(deck_dir, r)) for r in renders if os.path.exists(os.path.join(deck_dir, r))] or [0])
        if made and oldest_render < max(os.path.getmtime(m) for m in made):
            seen.append("the slide pictures are older than the deck files: run render again")
        newest = max([os.path.getmtime(os.path.join(deck_dir, r)) for r in renders if os.path.exists(os.path.join(deck_dir, r))] or [0])
        if os.path.getmtime(looked_file) < newest:
            seen.append("looked.md is older than the newest slide picture: look again")
    add("looked", "every slide was drawn and looked at", not seen, "; ".join(seen) or "%d pictures, looked.md covers all %d slides" % (len(renders), len(planned)))

    failed = [r for r in results if not r["pass"]]
    lines = ["# Deck check", "", "%s: %d of %d checks pass." % ("PASS" if not failed else "FAIL", len(results) - len(failed), len(results)), ""]
    lines += ["- %s %s: %s" % ("PASS" if r["pass"] else "FAIL", r["name"], r["detail"]) for r in results]
    name = args.get("--out") or ("check.md" if not only else "check-%s.md" % "-".join(only))
    write_text(os.path.join(deck_dir, name), "\n".join(lines) + "\n")
    write_json(os.path.join(deck_dir, os.path.splitext(name)[0] + ".json"), results)
    print("\n".join(lines))
    return 1 if failed else 0


def cmd_sheet(args):
    """Put every slide picture of one kind on one or more sheets, 6 slides a sheet, for a quick side-by-side look."""
    from PIL import Image, ImageDraw
    deck_dir = args["--dir"]
    kind = args.get("--kind", "pptx")
    files = sorted(glob.glob(os.path.join(deck_dir, "renders", kind, "slide-*.png")))
    if not files:
        print("deck.py sheet: no %s pictures; run render first" % kind)
        return 1
    made = []
    for start in range(0, len(files), 6):
        group = files[start:start + 6]
        thumbs = [Image.open(f).convert("RGB") for f in group]
        tw = 640
        th = int(tw * thumbs[0].height / float(thumbs[0].width))
        # A grey sheet so white slides show their edges; the slide number sits under each picture.
        sheet = Image.new("RGB", (tw * 2 + 30, (th + 30) * ((len(thumbs) + 1) // 2) + 10), (200, 203, 208))
        draw = ImageDraw.Draw(sheet)
        for i, thumb in enumerate(thumbs):
            x, y = 10 + (i % 2) * (tw + 10), 10 + (i // 2) * (th + 30)
            sheet.paste(thumb.resize((tw, th)), (x, y))
            draw.text((x, y + th + 6), "slide %d" % (start + i + 1), fill=(20, 20, 20))
        target = os.path.join(deck_dir, "renders", "%s-sheet-%d.png" % (kind, start // 6 + 1))
        sheet.save(target)
        made.append(target)
    print("ok sheet: " + ", ".join(made))
    return 0


def parse(argv):
    args = {"_": []}
    i = 0
    while i < len(argv):
        if argv[i].startswith("--"):
            args[argv[i]] = argv[i + 1] if i + 1 < len(argv) else ""
            i += 2
        else:
            args["_"].append(argv[i])
            i += 1
    return args


def main():
    if len(sys.argv) < 2 or sys.argv[1] in ("help", "-h", "--help"):
        print(__doc__)
        return 0
    command, args = sys.argv[1], parse(sys.argv[2:])
    commands = {"setup": cmd_setup, "read-start": cmd_read_start, "make": cmd_make, "render": cmd_render, "check": cmd_check,
                "facts": cmd_facts, "merge-facts": cmd_merge_facts, "claims": cmd_claims, "sheet": cmd_sheet}
    if command not in commands:
        print("deck.py: unknown command %s" % command)
        return 2
    return commands[command](args)


if __name__ == "__main__":
    sys.exit(main())
