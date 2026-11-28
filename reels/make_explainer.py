#!/usr/bin/env python3
"""16:9 explainer-style reel: white background, person cut-out, animated cards,
CAPS captions (max 2 words), black/red palette, logo at the end.

Usage: python3 make_explainer.py scripts/003-discipline-16x9.json
Voice/music/word timings are taken from build/<audio_from>/ (made by make_voice.py).
The scene cards below are written for the 'discipline' script; new scripts get new cards.
"""
import json
import math
import os
import subprocess
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H, FPS = 1920, 1080, 30
WHITE = (255, 255, 255)
INK = (17, 17, 19)
RED = (229, 27, 36)
GRAY = (128, 133, 142)
MUTED = (165, 170, 177)
LIGHT = (226, 228, 232)
FD = "/usr/share/fonts/opentype/inter"
PUNCT = ",.!?।…\"'—-"
ROOT = os.path.dirname(os.path.abspath(__file__))

_fonts = {}


def font(weight, size):
    key = (weight, size)
    if key not in _fonts:
        _fonts[key] = ImageFont.truetype(f"{FD}/Inter-{weight}.otf", size)
    return _fonts[key]


def clamp01(x):
    return min(1.0, max(0.0, x))


def ease_out(x):
    x = clamp01(x)
    return 1 - (1 - x) ** 3


def ease_in(x):
    x = clamp01(x)
    return x ** 3


def ease_in_out(x):
    x = clamp01(x)
    return 4 * x ** 3 if x < 0.5 else 1 - (-2 * x + 2) ** 3 / 2


def ease_back(x):
    x = clamp01(x)
    c1 = 1.70158
    c3 = c1 + 1
    return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2


def with_alpha(img, a):
    if a >= 0.999:
        return img
    r, g, b, al = img.split()
    al = al.point(lambda v: int(v * a))
    return Image.merge("RGBA", (r, g, b, al))


def stamp(dst, sprite, cx, cy, a=1.0, s=1.0):
    """Composite sprite centred at (cx, cy) with alpha a and scale s."""
    if a <= 0.001 or s <= 0.01:
        return
    if abs(s - 1) > 0.004:
        sprite = sprite.resize((max(1, int(sprite.width * s)), max(1, int(sprite.height * s))), Image.BICUBIC)
    sprite = with_alpha(sprite, a)
    dst.alpha_composite(sprite, (int(round(cx - sprite.width / 2)), int(round(cy - sprite.height / 2))))


def text_sprite(txt, f, color, tracking=0):
    l, t, r, b = f.getbbox(txt)
    width = int(sum(f.getlength(c) for c in txt) + tracking * (len(txt) - 1)) if tracking else r - l
    img = Image.new("RGBA", (width + 8, b - t + 8), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if tracking:
        x = 4
        for c in txt:
            d.text((x, 4 - t), c, font=f, fill=color + (255,))
            x += f.getlength(c) + tracking
    else:
        d.text((4 - l, 4 - t), txt, font=f, fill=color + (255,))
    return img


def put_text(dst, x, y, txt, f, color, a=1.0, tracking=0, dx=0):
    """Left/top anchored text with alpha (safe on RGBA cards)."""
    sp = text_sprite(txt, f, color, tracking)
    if a >= 0.999 and dx == 0:
        dst.alpha_composite(sp, (int(x) - 4, int(y) - 4))
    elif a > 0.001:
        dst.alpha_composite(with_alpha(sp, a), (int(x + dx) - 4, int(y) - 4))
    return sp.width - 8, sp.height - 8


# ------------------------------------------------------------------ sprites
def circle_sprite(r, fill=None, outline=None, width=4, mark=None, mark_color=WHITE):
    S = 4  # supersample
    n = (2 * r + 8) * S
    img = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    box = [4 * S, 4 * S, n - 4 * S, n - 4 * S]
    d.ellipse(box, fill=(fill + (255,)) if fill else None,
              outline=(outline + (255,)) if outline else None, width=width * S)
    c = n / 2
    if mark == "check":
        pts = [(c - r * 0.42 * S, c + r * 0.02 * S), (c - r * 0.1 * S, c + r * 0.34 * S),
               (c + r * 0.45 * S, c - r * 0.3 * S)]
        d.line(pts, fill=mark_color + (255,), width=int(r * 0.2 * S), joint="curve")
    elif mark == "x":
        k = r * 0.32 * S
        d.line([(c - k, c - k), (c + k, c + k)], fill=mark_color + (255,), width=int(r * 0.15 * S))
        d.line([(c - k, c + k), (c + k, c - k)], fill=mark_color + (255,), width=int(r * 0.15 * S))
    return img.resize((n // S, n // S), Image.LANCZOS)


_card_cache = {}


def card_base(w, h, r=30):
    key = (w, h)
    if key not in _card_cache:
        P = 70
        size = (w + 2 * P, h + 2 * P)
        sh = Image.new("L", size, 0)
        ImageDraw.Draw(sh).rounded_rectangle([P, P + 18, P + w, P + h + 18], r, fill=40)
        sh = sh.filter(ImageFilter.GaussianBlur(24))
        img = Image.new("RGBA", size, (15, 18, 30, 0))
        img.putalpha(sh)
        ImageDraw.Draw(img).rounded_rectangle([P, P, P + w, P + h], r, fill=WHITE + (255,),
                                              outline=(234, 235, 238, 255), width=2)
        _card_cache[key] = (img, P)
    img, P = _card_cache[key]
    return img.copy(), P


def place_card(dst, card, P, x, y, t, t_in, t_out):
    """Pop a card in at t_in (back-ease) and fade it out at t_out."""
    if t < t_in or t > t_out + 0.3:
        return
    k_in = (t - t_in) / 0.45
    k_out = (t - t_out) / 0.25
    a = ease_out(k_in) * (1 - ease_out(k_out))
    s = 0.9 + 0.1 * ease_back(k_in)
    dy = (1 - ease_out(k_in)) * 40 + ease_out(k_out) * 12
    cx = x + card.width / 2 - P
    cy = y + card.height / 2 - P + dy
    stamp(dst, card, cx, cy, a, s)


# ------------------------------------------------------------------ captions
def chunk_words(words, max_words=2):
    chunks, cur = [], []
    for i, w in enumerate(words):
        cur.append(w)
        nxt = words[i + 1] if i + 1 < len(words) else None
        if (len(cur) >= max_words or w["word"][-1] in PUNCT or nxt is None
                or nxt["line"] != w["line"] or nxt["start"] - w["end"] > 0.35):
            chunks.append(cur)
            cur = []
    return chunks


def caption_sprite(chunk):
    f = font("ExtraBold", 54)
    parts = [(w["word"].strip(PUNCT).upper(), RED if w["hl"] else INK) for w in chunk]
    space = f.getlength(" ")
    tw = sum(f.getlength(p) for p, _ in parts) + space * (len(parts) - 1)
    asc, desc = f.getmetrics()
    px, py, P = 36, 20, 50
    pw, ph = int(tw + 2 * px), int(asc + desc + 2 * py - 10)
    img = Image.new("RGBA", (pw + 2 * P, ph + 2 * P), (15, 18, 30, 0))
    sh = Image.new("L", img.size, 0)
    ImageDraw.Draw(sh).rounded_rectangle([P, P + 10, P + pw, P + ph + 10], 24, fill=50)
    img.putalpha(sh.filter(ImageFilter.GaussianBlur(16)))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([P, P, P + pw, P + ph], 24, fill=WHITE + (255,), outline=(232, 233, 236, 255), width=2)
    x = P + px
    for p, c in parts:
        d.text((x, P + py - 5), p, font=f, fill=c + (255,))
        x += f.getlength(p) + space
    return img


# ------------------------------------------------------------------ background
def make_bg():
    big = Image.new("RGB", (W + 400, H + 400), WHITE)
    arr = np.asarray(big, np.float32).copy()
    y, x = np.mgrid[0:H + 400, 0:W + 400].astype(np.float32)
    for (bx, by, rad, col, a) in [(380, 360, 620, RED, 0.075), (2000, 1250, 700, (120, 130, 150), 0.10),
                                  (1700, 300, 520, RED, 0.035)]:
        g = np.exp(-(((x - bx) ** 2 + (y - by) ** 2) / (2 * (rad * 0.55) ** 2)))[..., None]
        arr = arr * (1 - g * a) + np.array(col, np.float32) * g * a
    return Image.fromarray(arr.clip(0, 255).astype(np.uint8)).convert("RGBA")


def marquee_strip(text, size, color, outline=False):
    f = font("ExtraBold", size)
    unit = text + "   ·   "
    uw = f.getlength(unit)
    reps = int(math.ceil((W * 2) / uw)) + 2
    full = unit * reps
    l, t, r, b = f.getbbox(full)
    img = Image.new("RGBA", (int(f.getlength(full)) + 10, b - t + 10), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if outline:
        d.text((0, 5 - t), full, font=f, fill=(255, 255, 255, 0), stroke_width=2, stroke_fill=color + (255,))
    else:
        d.text((0, 5 - t), full, font=f, fill=color + (255,))
    return img, uw


# ------------------------------------------------------------------ main
def main(spec_path):
    spec = json.load(open(spec_path))
    adir = os.path.join(ROOT, "build", spec["audio_from"])
    bdir = os.path.join(ROOT, "build", spec["id"])
    os.makedirs(bdir, exist_ok=True)
    words = json.load(open(os.path.join(adir, "words.json")))["words"]
    nlines = max(w["line"] for w in words) + 1
    L = []
    for i in range(nlines):
        ws = [w for w in words if w["line"] == i]
        L.append({"start": ws[0]["start"], "end": ws[-1]["end"], "words": ws})
    for i in range(nlines):
        L[i]["next"] = L[i + 1]["start"] if i + 1 < nlines else L[i]["end"] + 0.6

    def trig(i, name):
        for w in L[i]["words"]:
            if w["word"].strip(PUNCT).lower() == name.lower():
                return w["start"]
        raise KeyError(f"{name} not in line {i}")

    logo_in = words[-1]["end"] + 0.7
    dur = logo_in + spec.get("logo_hold", 2.6)
    nframes = int(math.ceil(dur * FPS))

    # assets
    bg = make_bg()
    person = Image.open(os.path.join(ROOT, spec["person"])).convert("RGBA")
    ph = spec.get("person_height", 1000)
    person = person.resize((round(person.width * ph / person.height), ph), Image.LANCZOS)
    pw = person.width
    face = (0.47, 0.11)  # face position inside the cut-out (fraction of w/h)
    logo = Image.open(os.path.join(ROOT, spec["logo"])).convert("RGBA")
    lw = 640
    logo = logo.resize((lw, round(logo.height * lw / logo.width)), Image.LANCZOS)
    ink_logo = Image.new("RGBA", logo.size, INK + (0,))
    ink_logo.putalpha(logo.getchannel("A"))

    mq_text = spec["marquee"]  # one per line + one for the end
    mq_top = [marquee_strip(s, 210, (234, 235, 239)) for s in mq_text]
    mq_bottom, mq_bottom_w = marquee_strip(spec.get("brand", "AJEX"), 210, (246, 196, 198), outline=True)

    chk_big = circle_sprite(44, fill=RED, mark="check")
    x_big = circle_sprite(44, outline=LIGHT, width=4, mark="x", mark_color=MUTED)
    day_on = circle_sprite(42, fill=RED, mark="check")
    day_off = circle_sprite(42, outline=LIGHT, width=5)
    chk_small = circle_sprite(18, fill=RED, mark="check")

    chunks = chunk_words(words)
    cap_spans = []
    for ci, ch in enumerate(chunks):
        s = ch[0]["start"] - 0.05
        e = chunks[ci + 1][0]["start"] - 0.05 if ci + 1 < len(chunks) else ch[-1]["end"] + 0.45
        cap_spans.append((s, min(e, ch[-1]["end"] + 0.7), caption_sprite(ch)))

    # timings
    T_move = trig(0, "motivation") - 0.35
    T_zoom_in, T_zoom_out = L[3]["start"] - 0.15, L[4]["start"] - 0.1

    # sound effects, timed to the same beats as the animations: (time, name, gain)
    t_c0 = trig(2, "discipline")
    c_span = max(1.2, L[2]["end"] - t_c0 - 0.2)
    sfx_events = [
        (0.0, "rise", 0.55),
        (T_move, "whoosh", 0.35),
        (trig(0, "motivation") - 0.15, "whoosh", 0.45),
        (trig(0, "nahi"), "strike", 0.5),
        (trig(0, "discipline"), "pop", 0.6),
        (L[1]["start"] - 0.2, "whoosh", 0.45),
        (trig(1, "ek"), "pop", 0.6),
        (L[2]["start"] - 0.2, "whoosh", 0.45),
        *[(t_c0 + i * c_span / 6, "pop", 0.4) for i in range(7)],
        (T_zoom_in, "zoom", 0.55),
        (L[3]["start"] + 0.1, "pop", 0.4),
        (T_zoom_out, "whoosh", 0.5),
        (trig(4, "nahi"), "strike", 0.5),
        (trig(5, "daily"), "sweep", 0.3),
        (trig(5, "daily"), "pop", 0.5),
        (trig(5, "decisions"), "pop", 0.5),
        (trig(5, "banti"), "pop", 0.5),
        (logo_in - 0.35, "whoosh", 0.35),
        (logo_in, "logo", 0.75),
    ]
    CX = 990  # card column

    def section(t):
        for i in range(nlines):
            if t < L[i]["next"] - 0.1:
                return i
        return nlines if t >= logo_in - 0.2 else nlines - 1

    # ---------------- cards
    def card_A(t):
        w, h = 840, 470
        img, P = card_base(w, h)
        put_text(img, P + 56, P + 52, "PAISA KAMANE KE LIYE", font("Bold", 30), GRAY, tracking=4)
        f = font("ExtraBold", 96)
        y1 = P + 125
        tw, th = put_text(img, P + 56, y1, "MOTIVATION", f, MUTED)
        k = ease_out((t - trig(0, "nahi")) / 0.35)
        d = ImageDraw.Draw(img)
        if k > 0:
            ym = y1 + th / 2
            d.rounded_rectangle([P + 44, ym - 5, P + 50 + (tw + 12) * k, ym + 5], 5, fill=RED + (255,))
        stamp(img, x_big, P + w - 90, y1 + th / 2, ease_out((t - trig(0, "nahi")) / 0.3),
              0.6 + 0.4 * ease_back((t - trig(0, "nahi")) / 0.4))
        d.line([(P + 56, P + 272), (P + w - 56, P + 272)], fill=(238, 239, 242, 255), width=2)
        td = trig(0, "discipline")
        k2 = ease_out((t - td) / 0.35)
        y2 = P + 318
        if k2 > 0:
            _, th2 = put_text(img, P + 56, y2, "DISCIPLINE", f, INK, a=k2, dx=(1 - k2) * 30)
            stamp(img, chk_big, P + w - 90, y2 + th2 / 2, k2, 0.5 + 0.5 * ease_back((t - td) / 0.45))
        return img, P

    def week_card(t, title, title_color, on_times, footer):
        w, h = 840, 470
        img, P = card_base(w, h)
        put_text(img, P + 56, P + 52, title, font("Bold", 32), title_color, tracking=5)
        x0, step, cy = P + 56 + 46, (w - 112 - 92) / 6, P + 190
        fl = font("SemiBold", 28)
        for i, dname in enumerate("MTWTFSS"):
            cx = x0 + i * step
            stamp(img, day_off, cx, cy)
            if on_times[i] is not None and t >= on_times[i]:
                k = (t - on_times[i]) / 0.35
                stamp(img, day_on, cx, cy, ease_out(k), 0.4 + 0.6 * ease_back(k))
            sw = fl.getlength(dname)
            put_text(img, cx - sw / 2, cy + 66, dname, fl, MUTED)
        ImageDraw.Draw(img).line([(P + 56, P + 320), (P + w - 56, P + 320)], fill=(238, 239, 242, 255), width=2)
        x = P + 56
        for part, col, a in footer:
            if a > 0:
                pw_, _ = put_text(img, x, P + 352, part, font("ExtraBold", 68), col, a=a)
                x += pw_ + 22
        return img, P

    def card_B(t):
        tk = trig(1, "ek")
        n_on = [tk] + [None] * 6
        ka = ease_out((t - trig(1, "din")) / 0.3)
        return week_card(t, "MOTIVATION", GRAY, n_on, [("SIRF", INK, ka), ("1 DIN", RED, ka)])

    def card_C(t):
        t0 = trig(2, "discipline")
        span = max(1.2, L[2]["end"] - t0 - 0.2)
        on = [t0 + i * span / 6 for i in range(7)]
        n = sum(1 for x in on if t >= x)
        return week_card(t, "DISCIPLINE", RED, on, [(f"{n}/7", RED, 1.0 if n else 0), ("DIN", INK, 1.0 if n else 0)])

    def card_mood(t):
        w, h = 640, 320
        img, P = card_base(w, h)
        put_text(img, P + 50, P + 48, "MANN KA MOOD", font("Bold", 30), GRAY, tracking=4)
        k = ease_in_out((t - (L[3]["start"] + 0.3)) / max(0.8, L[3]["end"] - L[3]["start"] - 0.2))
        v = 100 - 98 * k
        put_text(img, P + 50, P + 100, f"{int(round(v))}%", font("ExtraBold", 110), INK if v > 30 else RED)
        d = ImageDraw.Draw(img)
        d.rounded_rectangle([P + 50, P + 252, P + w - 50, P + 274], 11, fill=(238, 239, 242, 255))
        d.rounded_rectangle([P + 50, P + 252, P + 50 + max(22, (w - 100) * v / 100), P + 274], 11, fill=RED + (255,))
        return img, P

    def card_chart(t):
        w, h = 860, 640
        img, P = card_base(w, h)
        is5 = t >= L[5]["start"] - 0.05
        put_text(img, P + 56, P + 52, "DAILY DECISIONS" if is5 else "WEALTH", font("Bold", 32),
                 RED if is5 else GRAY, tracking=5)
        d = ImageDraw.Draw(img)
        left, right, top, bot = P + 56, P + w - 56, P + 120, P + h - 170
        for i in range(4):
            yy = top + i * (bot - top) / 3
            d.line([(left, yy), (right, yy)], fill=(241, 242, 245, 255), width=2)
        base_y = bot - 16
        # flat "ek din" line
        k = ease_out((t - (L[4]["start"] + 0.2)) / 0.9)
        if k > 0:
            d.line([(left, base_y), (left + (right - left) * k, base_y)], fill=LIGHT + (255,), width=8)
        tn = trig(4, "nahi")
        ka = ease_out((t - (L[4]["start"] + 0.3)) / 0.3) * (1 - ease_out((t - L[5]["start"]) / 0.3))
        if ka > 0:
            f = font("ExtraBold", 80)
            tw, th = put_text(img, right - f.getlength("1 DIN") - 6, top + 10, "1 DIN", f, MUTED, a=ka)
            ks = ease_out((t - tn) / 0.3)
            if ks > 0:
                x0 = right - tw - 12
                ym = top + 10 + th / 2
                strike = Image.new("RGBA", img.size, (0, 0, 0, 0))
                ImageDraw.Draw(strike).rounded_rectangle([x0, ym - 5, x0 + (tw + 18) * ks, ym + 5], 5,
                                                         fill=RED + (255,))
                img.alpha_composite(with_alpha(strike, ka))
        # compounding curve
        td = trig(5, "daily")
        kc = ease_in_out((t - td) / max(1.0, L[5]["end"] - td + 0.3))
        if kc > 0:
            pts = []
            n = 60
            for i in range(int(n * kc) + 1):
                x = i / n
                yv = (math.exp(3.2 * x) - 1) / (math.exp(3.2) - 1)
                pts.append((left + (right - left) * x, base_y - (base_y - top - 20) * yv))
            if len(pts) > 1:
                d.line(pts, fill=RED + (255,), width=9, joint="curve")
                ex, ey = pts[-1]
                d.ellipse([ex - 13, ey - 13, ex + 13, ey + 13], fill=RED + (255,))
                d.ellipse([ex - 6, ey - 6, ex + 6, ey + 6], fill=WHITE + (255,))
        # decision chips
        chips = [("SAVE", trig(5, "daily")), ("INVEST", trig(5, "decisions")), ("LEARN", trig(5, "banti"))]
        x = left
        fc = font("ExtraBold", 36)
        for label, tc in chips:
            cw = int(fc.getlength(label)) + 100
            kk = (t - tc) / 0.35
            if kk > 0:
                chip = Image.new("RGBA", (cw + 4, 80), (0, 0, 0, 0))
                cd = ImageDraw.Draw(chip)
                cd.rounded_rectangle([2, 2, cw, 76], 38, fill=(250, 250, 251, 255), outline=(232, 233, 236, 255),
                                     width=2)
                chip.alpha_composite(chk_small, (18, 39 - chk_small.height // 2))
                cd.text((64, 39), label, font=fc, fill=INK + (255,), anchor="lm")
                stamp(img, chip, x + cw / 2, P + h - 98, ease_out(kk), 0.7 + 0.3 * ease_back(kk))
            x += cw + 18
        return img, P

    # ---------------- render
    out = os.path.join(bdir, f"{spec['id']}-video.mp4")
    enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
                            "-s", f"{W}x{H}", "-r", str(FPS), "-i", "pipe:0",
                            "-c:v", "libx264", "-preset", "medium", "-crf", "18",
                            "-pix_fmt", "yuv420p", out], stdin=subprocess.PIPE)
    for fi in range(nframes):
        t = fi / FPS
        # background drift
        ox = 200 + 60 * math.sin(t * 0.35)
        oy = 200 + 40 * math.cos(t * 0.27)
        frame = bg.crop((int(ox), int(oy), int(ox) + W, int(oy) + H))

        # marquee rows (top: section words, bottom: brand outline)
        sec = section(t)
        boundaries = [L[i]["next"] - 0.1 for i in range(nlines - 1)] + [logo_in - 0.2]
        prev_b = max([b for b in boundaries if b <= t], default=-10)
        kx = ease_out((t - prev_b) / 0.4)
        for idx, a in ((sec, kx), (max(0, sec - 1), 1 - kx if sec > 0 else 0)):
            if a <= 0.01:
                continue
            strip, uw = mq_top[min(idx, len(mq_top) - 1)]
            off = (t * 70) % uw
            frame.alpha_composite(with_alpha(strip.crop((int(off), 0, int(off) + W, strip.height)), a), (0, 40))
        off = mq_bottom_w - (t * 55) % mq_bottom_w
        frame.alpha_composite(mq_bottom.crop((int(off), 0, int(off) + W, mq_bottom.height)), (0, H - 330))

        # person: rise from bottom, slide left, idle float, exit at the end
        k_move = ease_in_out((t - T_move) / 0.7)
        pcx = 960 + (560 - 960) * k_move
        rise = (1 - ease_back(t / 0.85)) * 900
        exit_ = ease_in((t - (logo_in - 0.35)) / 0.55) * 1000
        idle = 5 * math.sin(2 * math.pi * t / 3.4)
        ptop = 112 + rise + exit_ + idle
        if ptop < H:
            frame.alpha_composite(person, (int(pcx - pw / 2), int(ptop)))

        # scene cards
        place_card(frame, *card_A(t), CX, 260, t, trig(0, "motivation") - 0.1, L[1]["start"] - 0.2)
        if L[1]["start"] - 0.25 <= t <= L[2]["start"] + 0.2:
            place_card(frame, *card_B(t), CX, 260, t, L[1]["start"] - 0.1, L[2]["start"] - 0.2)
        if L[2]["start"] - 0.25 <= t <= L[3]["start"] + 0.3:
            place_card(frame, *card_C(t), CX, 260, t, L[2]["start"] - 0.1, T_zoom_in)
        if t >= T_zoom_out:
            place_card(frame, *card_chart(t), CX - 10, 160, t, T_zoom_out + 0.15, logo_in - 0.35)

        # camera punch-in on the face for line 3
        z = 1 + 0.5 * (ease_in_out((t - T_zoom_in) / 0.6) - ease_in_out((t - T_zoom_out) / 0.5))
        if z > 1.001:
            fx, fy = pcx - pw / 2 + face[0] * pw, ptop + face[1] * ph + 60
            m = (z - 1) / 0.5
            cx = W / 2 + (fx - W / 2) * m
            cy = H / 2 + (fy - H / 2) * m
            cw, ch = W / z, H / z
            x0 = min(max(cx - cw / 2, 0), W - cw)
            y0 = min(max(cy - ch / 2, 0), H - ch)
            frame = frame.crop((int(x0), int(y0), int(x0 + cw), int(y0 + ch))).resize((W, H), Image.BICUBIC)

        # close-up card (screen space)
        if L[3]["start"] - 0.1 <= t <= T_zoom_out + 0.3:
            place_card(frame, *card_mood(t), 1170, 190, t, L[3]["start"] + 0.15, T_zoom_out - 0.1)

        # end logo
        if t >= logo_in:
            k = (t - logo_in) / 0.8
            stamp(frame, ink_logo, W / 2, H / 2, ease_out(k), 0.94 + 0.06 * ease_out(k))

        # captions
        for s, e, sp in cap_spans:
            if s <= t < e:
                k = (t - s) / 0.14
                a = ease_out(k) * (1 - ease_out((t - (e - 0.08)) / 0.08))
                stamp(frame, sp, W / 2, H - 100, a, 0.94 + 0.06 * ease_back(k))

        # fade out at the very end
        if t > dur - 0.3:
            frame = Image.blend(frame, Image.new("RGBA", (W, H), WHITE + (255,)), clamp01((t - (dur - 0.3)) / 0.3))
        enc.stdin.write(frame.convert("RGB").tobytes())
        if fi % 90 == 0:
            print(f"frame {fi}/{nframes}", flush=True)
    enc.stdin.close()
    enc.wait()

    # audio: voice + sound effects on the animation beats (no music)
    final = os.path.join(bdir, f"{spec['id']}.mp4")
    ASR = 48000

    def load(path):
        raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", str(ASR),
                              "pipe:1"], capture_output=True, check=True).stdout
        return np.frombuffer(raw, np.float32).copy()

    mix = np.zeros(int(dur * ASR) + ASR, np.float32)
    v = load(os.path.join(adir, "voice.wav"))
    mix[:len(v)] += v
    sfx_cache = {}
    for at, name, gain in sfx_events:
        if name not in sfx_cache:
            s = load(os.path.join(ROOT, "assets", "sfx", f"{name}.mp3"))
            sfx_cache[name] = s / (np.max(np.abs(s)) or 1.0)
        s = sfx_cache[name] * gain
        i = max(0, int(at * ASR))
        n = min(len(s), len(mix) - i)
        mix[i:i + n] += s[:n]
    mix = mix[:int(dur * ASR)]
    mix /= max(1.0, float(np.max(np.abs(mix))) / 0.95)
    wav = os.path.join(bdir, "mix.f32")
    mix.tofile(wav)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", out, "-f", "f32le", "-ar", str(ASR), "-ac", "1",
                    "-i", wav, "-filter_complex", "[1:a]loudnorm=I=-14:TP=-1.0:LRA=11[a]",
                    "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
                    "-ar", "48000", "-shortest", "-movflags", "+faststart", final], check=True)
    os.remove(wav)
    os.remove(out)
    print("done ->", final)


if __name__ == "__main__":
    main(sys.argv[1])
