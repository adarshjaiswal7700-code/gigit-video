# Inspiria — Homepage Hero Motion Graphic (15s)

A 15-second motion graphic for the homepage of [inspiria.edu.in](https://inspiria.edu.in/), built with
kinetic typography, fast-moving graphic elements and an animated gradient background. No text is centred:
every type block is anchored left or right.

It uses Inspiria's own brand system: navy `#051586`, yellow `#FFD306`, Poppins, the Inspiria logo, and
copy and figures taken from the live homepage.

## Deliverables (`dist/`)

| File | Use |
| --- | --- |
| `inspiria-hero-1080p60.mp4` | Main hero video. H.264, 1920×1080, 60fps, no audio |
| `inspiria-hero-1080p60.webm` | VP9 version of the main video. Smaller, for browsers that support it |
| `inspiria-hero-720p30.mp4` | Lighter version for mobile |
| `inspiria-hero-poster.jpg` | End-card still, for the `poster` attribute and reduced-motion users |

The last frame wipes to the same deep navy as frame 0, so the video loops without a visible seam.

### Embed

```html
<video class="hero-video" autoplay muted loop playsinline preload="auto"
       poster="/video/inspiria-hero-poster.jpg">
  <source src="/video/inspiria-hero-720p30.mp4"  type="video/mp4"  media="(max-width: 768px)">
  <source src="/video/inspiria-hero-1080p60.webm" type="video/webm">
  <source src="/video/inspiria-hero-1080p60.mp4"  type="video/mp4">
</video>
<style>
  .hero-video { width: 100%; height: 100%; object-fit: cover; }
  @media (prefers-reduced-motion: reduce) { .hero-video { display: none; } }
</style>
```

## Storyboard

| Time | Beat | Motion |
| --- | --- | --- |
| 0.0–2.6s | **GET / LIFE— / READY.** | Speed lines streak in from black. "GET" slams in with a skewed stretch, "LIFE—" drops in letter by letter, and "READY." rises as an outline, then fills with yellow. A ring of rotating tick marks and orbiting text locks in on the right |
| 2.4–5.2s | **4 SCHOOLS. ONE CAMPUS.** | A whip-pan with chromatic aberration leads into tilted rows of programme names scrolling at high speed. A glass panel lists the four schools, aligned right |
| 5.2–9.0s | **Outcomes** | A yellow ring wipe opens onto counters that rack up fast: 3000+ internships, 2000+ placements, 200+ hiring partners, 35+ international offers. The camera snaps between them over a moving perspective grid, with vertical streaks |
| 9.0–10.4s | **LEARN WITH INDUSTRY. GROW WITH EXPERIENCE.** | Yellow slices slam across the screen, and the palette flips to a yellow-orange gradient with navy type and a fast-moving ticker strip |
| 10.4–11.7s | **ONE CAMPUS. ONE FEE. TWO QUALIFICATIONS.** | A flash cut, then an oversized "TWO" and CFA® / ACCA / CPA / CA Foundation chips that fly in and spring into place |
| 11.7–15.0s | **GET LIFE-READY. with Inspiria.** | Layered bands shaped like feathers from the Inspiria wing sweep across the screen. Then the end card: the logo, the 4.6/5 Google rating, MAKAUT-affiliated, Siliguri · East India, and a wipe back to navy for the loop |

## How it's built

- `index.html` is the whole animation. Every element is a pure function of time `t`, so it can be
  scrubbed or rendered frame by frame:
  - open it in a browser to watch it play live
  - add `?t=6.2` to the URL to freeze it on a single moment
- `render.mjs` uses headless Chromium (Playwright) to render each output frame as the average of several
  subframes across a 180° shutter, which gives real motion blur. It uses 3 subframes normally and 10
  during whip-pans and slams. It encodes a lossless master in parallel segments.
- `encode.sh` creates the web encodes in `dist/` from that master.

```bash
npm install
node render.mjs stills 1.6,3.9,7.4   # quick PNG checks -> out/stills/
npm run build                        # out/master.mkv -> dist/*
```
