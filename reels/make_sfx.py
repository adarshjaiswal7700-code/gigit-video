#!/usr/bin/env python3
"""Generate the reusable UI sound effects into assets/sfx/ with ElevenLabs."""
import json, os, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor

SFX = {
    "whoosh": ("Quick soft clean airy whoosh, modern UI card sliding in, short, no music", 0.7),
    "pop": ("Single short soft bubbly UI pop click, clean and crisp, no reverb", 0.5),
    "strike": ("Quick thick marker swipe across paper, single stroke, crisp", 0.6),
    "zoom": ("Cinematic fast camera zoom-in whoosh with a short riser, clean", 1.0),
    "rise": ("Soft deep swoosh rising upward ending in a subtle bass thump, clean transition", 1.0),
    "sweep": ("Smooth rising soft synth sweep, positive, clean, short", 1.5),
    "logo": ("Elegant minimal logo reveal hit, deep soft cinematic boom with a gentle shimmer tail", 2.5),
}
ROOT = os.path.dirname(os.path.abspath(__file__))


def gen(item):
    name, (prompt, secs) = item
    out = os.path.join(ROOT, "assets", "sfx", f"{name}.mp3")
    if os.path.exists(out) and "--force" not in sys.argv:
        return name, "exists"
    req = urllib.request.Request(
        "https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_192",
        data=json.dumps({"text": prompt, "duration_seconds": secs, "prompt_influence": 0.6}).encode(),
        headers={"xi-api-key": os.environ.get("ELEVENLABS_API_KEY", "proxy-injected"),
                 "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=120) as r:
        open(out, "wb").write(r.read())
    return name, os.path.getsize(out)


if __name__ == "__main__":
    with ThreadPoolExecutor(4) as ex:
        for name, res in ex.map(gen, SFX.items()):
            print(name, res)
