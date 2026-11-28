# Reels pipeline (Adarsh voice, dark money-motivation theme)

Script → ElevenLabs voice (Adarsh – Hindi & English, professional clone) → word-timed
captions → dark 1080×1920 reel.

## Make a reel

1. Copy `scripts/001-paisa-control.json` to `scripts/NNN-<name>.json` and edit:
   - `tts`: what the voice says (Hindi in Devanagari, English words in English letters, which gives the best pronunciation)
   - `cap`: the on-screen Hinglish caption. **It must have the same number of words as `tts`.**
   - `hl`: caption words shown in gold
   - `pause`: optional silence after the line, in seconds (default 0.35)
   - optional: `handle` (e.g. `"@yourhandle"`), `tag`, `music_volume`
2. Generate the voice:
   ```bash
   python3 make_voice.py scripts/NNN-<name>.json
   ```
3. Optional: put a background track at `build/<id>/music.mp3` (ElevenLabs `/v1/music`).
4. Render:
   ```bash
   python3 make_video.py scripts/NNN-<name>.json
   ```
   Output: `build/<id>/<id>.mp4`

The ElevenLabs key is injected by the cloud environment's proxy, so no key is needed in code.
`build/` is not committed.
