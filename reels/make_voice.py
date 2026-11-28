#!/usr/bin/env python3
"""Generate the voiceover for a reel script with ElevenLabs, line by line.

Each line is synthesised separately (with previous/next text for natural
prosody), trimmed to its spoken words, and joined with controlled pauses.
Output: build/<id>/voice.wav and build/<id>/words.json (caption word timings).

The API key is injected by the environment's proxy; the header value below is
only a placeholder.
"""
import base64
import json
import os
import subprocess
import sys
import urllib.request

API = "https://api.elevenlabs.io/v1"
KEY = os.environ.get("ELEVENLABS_API_KEY", "proxy-injected")
SR = 44100
DEFAULT_PAUSE = 0.35
PUNCT = ",.!?।…\"'—-"


def tts(voice_id, model_id, text, prev_text, next_text, settings):
    body = {
        "text": text,
        "model_id": model_id,
        "voice_settings": settings,
    }
    if prev_text:
        body["previous_text"] = prev_text
    if next_text:
        body["next_text"] = next_text
    req = urllib.request.Request(
        f"{API}/text-to-speech/{voice_id}/with-timestamps?output_format=mp3_44100_192",
        data=json.dumps(body).encode(),
        headers={"xi-api-key": KEY, "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.load(r)


def word_spans(alignment):
    """Turn character alignment into [(word, start, end)]."""
    chars = alignment["characters"]
    st = alignment["character_start_times_seconds"]
    en = alignment["character_end_times_seconds"]
    words, cur = [], None
    for c, s, e in zip(chars, st, en):
        if c.isspace():
            if cur:
                words.append(cur)
            cur = None
            continue
        if cur is None:
            cur = [c, None, None]
        else:
            cur[0] += c
        if c not in PUNCT:
            if cur[1] is None:
                cur[1] = s
            cur[2] = e
    if cur:
        words.append(cur)
    out = []
    for w, s, e in words:
        if s is None:  # pure punctuation token: glue onto previous word
            continue
        out.append((w, s, e))
    return out


def decode_mp3(mp3_bytes):
    p = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", "pipe:0", "-f", "f32le", "-ac", "1", "-ar", str(SR), "pipe:1"],
        input=mp3_bytes, capture_output=True, check=True,
    )
    import numpy as np
    return np.frombuffer(p.stdout, dtype=np.float32)


def main(script_path):
    import numpy as np

    spec = json.load(open(script_path))
    out_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "build", spec["id"])
    os.makedirs(out_dir, exist_ok=True)
    settings = spec.get("voice_settings") or {
        "stability": 0.45, "similarity_boost": 0.85, "style": 0.35, "use_speaker_boost": True,
    }
    lines = spec["lines"]
    pieces, words_out, t = [], [], 0.0
    lead = 0.25  # small breath before the first word
    pieces.append(np.zeros(int(lead * SR), dtype=np.float32))
    t = lead
    for i, line in enumerate(lines):
        prev_text = " ".join(l["tts"] for l in lines[max(0, i - 2):i])
        next_text = " ".join(l["tts"] for l in lines[i + 1:i + 2])
        res = tts(spec["voice_id"], spec["model_id"], line["tts"], prev_text, next_text, settings)
        audio = decode_mp3(base64.b64decode(res["audio_base64"]))
        spans = word_spans(res["alignment"])
        caps = line["cap"].split()
        if len(spans) != len(caps):
            sys.exit(f"line {i}: {len(spans)} spoken words vs {len(caps)} caption words: {spans}")
        a = max(0.0, spans[0][1] - 0.04)
        b = min(len(audio) / SR, spans[-1][2] + 0.12)
        seg = audio[int(a * SR):int(b * SR)].copy()
        fade = int(0.01 * SR)
        seg[:fade] *= np.linspace(0, 1, fade)
        seg[-fade:] *= np.linspace(1, 0, fade)
        hl = {h.lower().strip(PUNCT) for h in line.get("hl", [])}
        for (spoken, s, e), cap in zip(spans, caps):
            words_out.append({
                "word": cap, "start": round(t + s - a, 3), "end": round(t + e - a, 3),
                "hl": cap.lower().strip(PUNCT) in hl, "line": i,
            })
        pieces.append(seg)
        t += len(seg) / SR
        pause = line.get("pause", DEFAULT_PAUSE) if i < len(lines) - 1 else 0.8
        pieces.append(np.zeros(int(pause * SR), dtype=np.float32))
        t += pause
        print(f"line {i}: {len(spans)} words, {len(seg)/SR:.2f}s")

    audio = np.concatenate(pieces)
    peak = float(np.max(np.abs(audio))) or 1.0
    audio = audio * (0.89 / peak)
    raw = os.path.join(out_dir, "voice.f32")
    audio.astype(np.float32).tofile(raw)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", raw,
                    os.path.join(out_dir, "voice.wav")], check=True)
    os.remove(raw)
    json.dump({"duration": round(len(audio) / SR, 3), "words": words_out},
              open(os.path.join(out_dir, "words.json"), "w"), ensure_ascii=False, indent=1)
    print(f"voice: {len(audio)/SR:.2f}s -> {out_dir}")


if __name__ == "__main__":
    main(sys.argv[1])
