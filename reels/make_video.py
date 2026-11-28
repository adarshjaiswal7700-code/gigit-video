#!/usr/bin/env python3
"""Render a dark-theme kinetic-caption reel from build/<id>/voice.wav + words.json.

Usage: python3 make_video.py scripts/<id>.json
Output: build/<id>/<id>.mp4 (1080x1920, 30 fps, H.264 + AAC)
"""
import json
import math
import os
import subprocess
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H, FPS = 1080, 1920, 30
SR = 44100
BG = (7, 7, 8)
WHITE = (240, 238, 232)
GOLD = (242, 184, 75)
FONT_DIR = "/usr/share/fonts/opentype/inter"
F_REG = ImageFont.truetype(f"{FONT_DIR}/Inter-SemiBold.otf", 92)
F_HL = ImageFont.truetype(f"{FONT_DIR}/Inter-ExtraBold.otf", 100)
F_TAG = ImageFont.truetype(f"{FONT_DIR}/Inter-SemiBold.otf", 30)
F_RUPEE = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 1150)
PUNCT = ",.!?।…\"'—-"
MAX_CHUNK_WORDS = 3
MAX_LINE_W = 920
FINAL_SCALE = 1.25


def ease_out(x):
    x = min(max(x, 0.0), 1.0)
    return 1 - (1 - x) ** 3


# ---------------------------------------------------------------- background
def make_vignette():
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    d = np.sqrt(((x - W / 2) / (W * 0.62)) ** 2 + ((y - H * 0.48) / (H * 0.55)) ** 2)
    return np.clip(1.0 - 0.85 * d ** 1.6, 0.0, 1.0)


def make_glow():
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    d2 = ((x - W / 2) / 520) ** 2 + ((y - H * 0.47) / 700) ** 2
    return np.exp(-d2)


def make_grain(n=6, seed=7):
    rng = np.random.default_rng(seed)
    out = []
    for _ in range(n):
        g = rng.normal(0, 1, (H // 2, W // 2)).astype(np.float32)
        g = np.array(Image.fromarray(((g * 40) + 128).clip(0, 255).astype(np.uint8)).resize((W, H)),
                     dtype=np.float32) - 128
        out.append(g)
    return out


def make_rupee():
    img = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(img)
    d.text((W / 2, H * 0.47), "₹", font=F_RUPEE, fill=255, anchor="mm")
    return img.filter(ImageFilter.GaussianBlur(2))


# ---------------------------------------------------------------- captions
def clean(word):
    return word.strip(PUNCT)


def chunk_words(words):
    """Group words into on-screen chunks: <=3 words, break on punctuation/line."""
    chunks, cur = [], []
    for i, w in enumerate(words):
        cur.append(w)
        nxt = words[i + 1] if i + 1 < len(words) else None
        end_punct = w["word"][-1] in PUNCT
        new_line = nxt is None or nxt["line"] != w["line"]
        gap = nxt is not None and nxt["start"] - w["end"] > 0.35
        if len(cur) >= MAX_CHUNK_WORDS or end_punct or new_line or gap:
            chunks.append(cur)
            cur = []
    if cur:
        chunks.append(cur)
    return chunks


_word_cache = {}


def word_sprite(text, hl):
    key = (text, hl)
    if key in _word_cache:
        return _word_cache[key]
    font = F_HL if hl else F_REG
    l, t, r, b = font.getbbox(text)
    pad = 40
    w, h = r - l + pad * 2, (b - t) + pad * 2
    color = GOLD if hl else WHITE
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(img).text((pad - l, pad - t), text, font=font, fill=color + (255,))
    shadow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).text((pad - l, pad - t + 4), text, font=font, fill=(0, 0, 0, 200))
    shadow = shadow.filter(ImageFilter.GaussianBlur(10))
    if hl:
        glow = img.filter(ImageFilter.GaussianBlur(18))
        ga = np.array(glow, dtype=np.float32)
        ga[..., 3] *= 0.85
        glow = Image.fromarray(ga.astype(np.uint8))
        base = Image.alpha_composite(shadow, glow)
    else:
        base = shadow
    sprite = Image.alpha_composite(base, img)
    _word_cache[key] = (sprite, r - l, pad, font.getmetrics())
    return _word_cache[key]


def layout_chunk(chunk, scale=1.0):
    """Return [(word_dict, x_center, y_center)] for a chunk, wrapped to lines."""
    space = 26 * scale
    items = []
    for w in chunk:
        sprite, tw, pad, _ = word_sprite(clean(w["word"]), w["hl"])
        items.append((w, tw * scale))
    lines, cur, cur_w = [], [], 0
    for w, tw in items:
        add = tw + (space if cur else 0)
        if cur and cur_w + add > MAX_LINE_W:
            lines.append((cur, cur_w))
            cur, cur_w = [], 0
            add = tw
        cur.append((w, tw))
        cur_w += add
    if cur:
        lines.append((cur, cur_w))
    line_h = 126 * scale
    y0 = H * 0.5 - (len(lines) - 1) * line_h / 2
    out = []
    for li, (ws, lw) in enumerate(lines):
        x = W / 2 - lw / 2
        for w, tw in ws:
            out.append((w, x + tw / 2, y0 + li * line_h))
            x += tw + space
    return out


# ---------------------------------------------------------------- main
def main(script_path):
    spec = json.load(open(script_path))
    root = os.path.dirname(os.path.abspath(__file__))
    bdir = os.path.join(root, "build", spec["id"])
    data = json.load(open(os.path.join(bdir, "words.json")))
    words = data["words"]
    voice_dur = data["duration"]
    dur = voice_dur + 0.7
    nframes = int(math.ceil(dur * FPS))
    tag = spec.get("tag", "PAISA  ·  MINDSET")
    handle = spec.get("handle", "")

    # voice envelope per frame (drives the background glow)
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(bdir, "voice.wav"),
                          "-f", "f32le", "-ac", "1", "-ar", str(SR), "pipe:1"],
                         capture_output=True, check=True).stdout
    pcm = np.frombuffer(pcm, dtype=np.float32)
    hop = SR // FPS
    env = np.array([np.sqrt(np.mean(pcm[i * hop:(i + 1) * hop] ** 2)) if i * hop < len(pcm) else 0.0
                    for i in range(nframes)])
    env = env / (env.max() or 1)
    sm = np.zeros_like(env)
    for i in range(nframes):  # attack/release smoothing
        prev = sm[i - 1] if i else 0
        k = 0.45 if env[i] > prev else 0.08
        sm[i] = prev + k * (env[i] - prev)

    vign = make_vignette()[..., None]
    glow = make_glow()[..., None]
    grain = make_grain()
    rupee = make_rupee()

    chunks = chunk_words(words)
    spans = []
    for ci, ch in enumerate(chunks):
        start = ch[0]["start"] - 0.06
        nxt = chunks[ci + 1][0]["start"] - 0.06 if ci + 1 < len(chunks) else dur
        end = min(nxt, ch[-1]["end"] + 0.55)
        spans.append((start, end, layout_chunk(ch, FINAL_SCALE if ch[0]["line"] == words[-1]["line"] else 1.0)))
    last_line = words[-1]["line"]

    # tag line sprite
    tag_img = Image.new("RGBA", (W, 80), (0, 0, 0, 0))
    ImageDraw.Draw(tag_img).text((W / 2, 40), tag, font=F_TAG, fill=GOLD + (150,), anchor="mm")

    out = os.path.join(bdir, f"{spec['id']}-video.mp4")
    enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
                            "-s", f"{W}x{H}", "-r", str(FPS), "-i", "pipe:0",
                            "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-maxrate", "9M", "-bufsize", "18M",
                            "-pix_fmt", "yuv420p", out], stdin=subprocess.PIPE)
    base = np.empty((H, W, 3), np.float32)
    for f in range(nframes):
        t = f / FPS
        p = t / dur
        # background: base + breathing gold glow + slowly growing rupee
        intensity = 0.10 + 0.22 * sm[f]
        base[:] = BG
        base += glow * np.array(GOLD, np.float32) * intensity * 0.35
        scale = 1.0 + 0.10 * p
        rw, rh = int(W * scale), int(H * scale)
        r = rupee.resize((rw, rh), Image.BILINEAR).crop(((rw - W) // 2, (rh - H) // 2,
                                                          (rw - W) // 2 + W, (rh - H) // 2 + H))
        ra = np.asarray(r, np.float32)[..., None] / 255.0
        base += ra * np.array(GOLD, np.float32) * (0.045 + 0.05 * sm[f])
        base *= vign
        base += grain[(f // 2) % len(grain)][..., None] * 0.06
        frame = Image.fromarray(base.clip(0, 255).astype(np.uint8), "RGB").convert("RGBA")

        # captions
        for start, end, items in spans:
            if not (start <= t < end):
                continue
            fade_out = 1.0 - ease_out((t - (end - 0.12)) / 0.12) if t > end - 0.12 else 1.0
            final = items[0][0]["line"] == last_line
            for w, cx, cy in items:
                k = (t - (w["start"] - 0.06)) / 0.16
                if k < 0:
                    continue
                a = ease_out(k) * fade_out
                s = 0.82 + 0.18 * ease_out(k)
                if w["hl"]:
                    s *= 1.0 + 0.06 * math.exp(-max(0, t - w["start"]) * 6)
                if final:
                    s *= FINAL_SCALE
                sprite, tw, pad, _ = word_sprite(clean(w["word"]), w["hl"])
                if abs(s - 1) > 0.005:
                    sw, sh = max(1, int(sprite.width * s)), max(1, int(sprite.height * s))
                    sp = sprite.resize((sw, sh), Image.BICUBIC)
                else:
                    sp = sprite
                if a < 0.999:
                    arr = np.array(sp)
                    arr[..., 3] = (arr[..., 3] * a).astype(np.uint8)
                    sp = Image.fromarray(arr)
                frame.alpha_composite(sp, (int(cx - sp.width / 2), int(cy - sp.height / 2)))

        # chrome: tag line, handle, progress bar
        top_a = min(1.0, t / 0.6)
        if top_a > 0:
            ta = np.array(tag_img)
            ta[..., 3] = (ta[..., 3] * top_a).astype(np.uint8)
            frame.alpha_composite(Image.fromarray(ta), (0, 150))
        d = ImageDraw.Draw(frame)
        if handle:
            d.text((W / 2, H - 170), handle, font=F_TAG, fill=WHITE + (110,), anchor="mm")
        d.rectangle([0, H - 8, int(W * p), H], fill=GOLD + (200,))

        # final fade to black
        if t > dur - 0.35:
            k = (t - (dur - 0.35)) / 0.35
            frame = Image.blend(frame, Image.new("RGBA", (W, H), (0, 0, 0, 255)), min(1, k))
        enc.stdin.write(frame.convert("RGB").tobytes())
        if f % 150 == 0:
            print(f"frame {f}/{nframes}", flush=True)
    enc.stdin.close()
    enc.wait()

    # audio: voice + ducked music, then mux
    final = os.path.join(bdir, f"{spec['id']}.mp4")
    music = os.path.join(bdir, "music.mp3")
    voice = os.path.join(bdir, "voice.wav")
    mvol = spec.get("music_volume", 0.30)
    if os.path.exists(music):
        fc = (f"[2:a]atrim=0:{dur:.3f},asetpts=PTS-STARTPTS,volume={mvol},"
              f"afade=t=in:d=0.8,afade=t=out:st={dur - 1.5:.3f}:d=1.5[m];"
              f"[1:a]asplit=2[v][vsc];"
              f"[m][vsc]sidechaincompress=threshold=0.03:ratio=6:attack=15:release=350[md];"
              f"[v][md]amix=inputs=2:duration=first:normalize=0,"
              f"apad=whole_dur={dur:.3f},loudnorm=I=-14:TP=-1.0:LRA=9[a]")
        cmd = ["ffmpeg", "-v", "error", "-y", "-i", out, "-i", voice, "-i", music,
               "-filter_complex", fc, "-map", "0:v", "-map", "[a]"]
    else:
        cmd = ["ffmpeg", "-v", "error", "-y", "-i", out, "-i", voice,
               "-filter_complex", f"[1:a]apad=whole_dur={dur:.3f},loudnorm=I=-14:TP=-1.0[a]",
               "-map", "0:v", "-map", "[a]"]
    cmd += ["-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-shortest",
            "-movflags", "+faststart", final]
    subprocess.run(cmd, check=True)
    os.remove(out)
    print("done ->", final)


if __name__ == "__main__":
    main(sys.argv[1])
