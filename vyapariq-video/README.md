# VyaparIQ – 48s product demo video

Ek 48 second ka SaaS demo video (1920×1080, 30fps), jo ek fintech reference video ki
editing structure, pacing aur transition style par bana hai — lekin saara UI, copy, logo aur music VyaparIQ ka apna hai.

**Final video:** `out/vyapariq-demo.mp4`

## Story (timeline)

| Time | Scene |
|---|---|
| 0.0 – 4.8 | Hook: typewriter "Still using Tally / only for accounting??" + floating accounting cards |
| 4.8 – 7.8 | "Meet" → VyaparIQ logo whip-in → "✦ AI-powered accounting assistant" pill |
| 7.8 – 10.8 | "Send one or multiple bills" → pill morphs into "New mail" button (beat drop at 9.6s) |
| 10.8 – 14.4 | 3D mail client, bill PDF drag-drop, "to your VyaparIQ email" |
| 14.4 – 19.8 | GST invoice pops in, "It extracts all key details", AI scan + field highlights |
| 19.8 – 23.4 | "And seconds later" → inbox → "Your purchase entry is ready" → Review entry |
| 23.4 – 27.0 | Sparkle-shaped mask transition to light theme, "Time for a quick ✦ check" |
| 27.0 – 30.0 | Dashboard → row isolate → click DRAFT → iris |
| 30.0 – 35.4 | Purchase voucher form (AI-filled fields), 3 clicks, "Send for approval" |
| 35.4 – 40.2 | Approvers (CA + Owner) → "Entry approved" pill → ring + check → "Entry posted" |
| 40.2 – 44.4 | Card flies away → "Save time. Avoid errors." → "Stay in control" |
| 44.4 – 48.0 | End card: logo + VyaparIQ + vyapariq.com |

Music 100 BPM hai (1 beat = 0.6s) aur saare major cuts usi grid par hain.

## Edit kaise karein

- **Text / naam / URL:** `src/ui.js` ke top par `COPY` object.
- **Timing / animation:** `src/video.js` (GSAP timeline, seconds mein).
- **UI screens:** `src/ui.js` (`invoiceHTML`, `mailWindow`, `dashboardHTML`, `formHTML`).
- **Colours:** `src/style.css` (`--g1/--g2/--g3` = logo arrow gradient).
- **Sound effects timing:** `scripts/mix_audio.py` ka `CUES` list.

## Build

```bash
npm install
python3 scripts/mix_audio.py              # out/audio.m4a  (music + SFX, -14 LUFS)
node scripts/render.cjs                   # out/video_silent.mp4 (Playwright + ffmpeg)
ffmpeg -i out/video_silent.mp4 -i out/audio.m4a -c:v copy -c:a copy -shortest out/vyapariq-demo.mp4
```

Quick check ke liye kuch frames: `node scripts/render.cjs --stills 5,17.5,30`  
Browser preview (audio ke saath): project folder ko kisi static server se serve karke `index.html` kholo.

## Assets

- `assets/logo.svg` — diye gaye logo se vectorize kiya gaya (lines `currentColor`, arrow gradient).
- `assets/music.mp3` — ElevenLabs Music se generate kiya gaya instrumental (100 BPM).
- `assets/sfx/*` — ElevenLabs sound effects (click, whoosh, scan, success, pop, typing).
- Fonts: Plus Jakarta Sans + Inter (Fontsource, OFL).

Video mein saare log, companies, GSTIN, bank details fictional hain.
