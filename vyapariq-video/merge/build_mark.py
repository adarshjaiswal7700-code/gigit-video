"""Final 9:16 VyaparIQ video with the "Mark" voice, tightened pauses, SFX and a ~4.5 s shorter edit.

Steps
 1. Split merge/build/mark_voice.mp3 into its 17 sentences (word timestamps from ElevenLabs speech-to-text)
    and shrink every pause inside a sentence to at most MAX_PAUSE.
 2. Each sentence is anchored to the visual it belongs to (same cue points as the original voiceover).
 3. The ~4.5 s cut is taken only from frozen frames (no motion) that fall in the silence between two
    sentences, so the cuts are invisible and every gap left between sentences is short.
 4. Video, music bed, voice and SFX are all cut/placed on the same new timeline and mixed to -14 LUFS.

Inputs in merge/build/: intro_portrait_silent.mp4, video2.mp4, intro_landscape.mp4, video2_music_only.wav,
mark_voice.mp3, mark_stt.json, motion.npy (per-frame motion of intro+video2 at 60 fps).
Output: merge/out/vyapariq-full-portrait-mark.mp4
"""
import json, os, subprocess
import numpy as np

H = os.path.dirname(os.path.abspath(__file__))
B = os.path.join(H, 'build')
SFX = os.path.join(os.path.dirname(H), 'assets', 'sfx')
OUT = os.path.join(H, 'out', 'vyapariq-full-portrait-mark.mp4')
INTRO = 7.85
TOTAL = INTRO + 84.1833
TARGET_CUT = 4.6        # seconds to remove
MAX_PAUSE = 0.18        # longest pause allowed inside a sentence
MIN_GAP = 0.32          # shortest silence kept between two sentences
NO_CUT_BEFORE = 3.55    # keep the intro typing ("only for accounting??") intact
# per-sentence freedom around its cue (1-based): how much earlier it may start / fixed shift later
LEAD = {5: 1.6}         # line 5: the bleeding-cash cards are already on screen
DEFAULT_LEAD = 0.45
SHIFT = {8: 0.45, 10: 0.45, 15: 0.45}   # logo / dashboards / impact cards stay on screen a bit longer
VOICE_DB = -19.0        # mean level of the voice while speaking (matches the original mix)

# where each sentence starts on the merged (uncut) timeline
CUES = [1.30, 4.85] + [t + INTRO for t in
        [0.78, 4.44, 12.32, 17.06, 18.78, 21.54, 24.40, 29.12, 36.88, 42.36, 47.84, 53.84, 61.42, 73.68, 76.86]]

# (time on the merged uncut timeline, sfx, gain dB)
SFX_CUES = [
    (0.10, 'type', -15), (1.00, 'pop', -16), (2.34, 'type', -15), (4.78, 'whoosh', -12), (5.30, 'whoosh', -8), (6.10, 'pop', -14),
    (7.90, 'swoosh', -12), (11.20, 'pop', -13), (15.55, 'pop', -13), (16.73, 'pop', -16), (17.27, 'pop', -16),
    (19.80, 'whoosh', -11), (24.27, 'pop', -13), (28.00, 'swoosh', -7), (31.65, 'whoosh', -11), (32.17, 'whoosh', -13),
    (37.37, 'pop', -14), (38.92, 'click', -13), (39.88, 'click', -13), (40.58, 'click', -13),
    (41.50, 'pop', -17), (42.47, 'pop', -17), (43.32, 'pop', -17), (44.80, 'whoosh', -11),
    (50.12, 'pop', -12), (52.07, 'pop', -13), (53.88, 'pop', -13), (55.48, 'whoosh', -11), (57.65, 'click', -10),
    (58.43, 'pop', -15), (61.45, 'pop', -12), (65.25, 'scan', -14), (68.55, 'whoosh', -11), (69.28, 'swoosh', -10),
    (75.17, 'success', -9), (79.82, 'pop', -13), (80.72, 'whoosh', -12), (86.52, 'swoosh', -9),
]


def run(cmd):
    subprocess.run(cmd, check=True)


def dur(p):
    return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p]))


def mean_db(p):
    out = subprocess.run(['ffmpeg', '-hide_banner', '-i', p, '-af', 'volumedetect', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float(out.split('mean_volume:')[1].split('dB')[0])


# ---------- 1. sentences with tightened pauses ----------
def build_lines():
    words = [w for w in json.load(open(os.path.join(B, 'mark_stt.json')))['words'] if w['type'] == 'word']
    sents, cur = [], []
    for w in words:
        cur.append(w)
        if w['text'][-1] in '.?!':
            sents.append(cur); cur = []
    if cur:
        sents.append(cur)
    assert len(sents) == 17, len(sents)
    d = os.path.join(B, 'mark_lines'); os.makedirs(d, exist_ok=True)
    src = os.path.join(B, 'mark_voice.mp3')
    lines = []
    for i, s in enumerate(sents):
        # chunks of speech separated by pauses longer than MAX_PAUSE
        chunks = [[s[0]['start'], s[0]['end']]]
        for w in s[1:]:
            if w['start'] - chunks[-1][1] > MAX_PAUSE:
                chunks.append([w['start'], w['end']])
            else:
                chunks[-1][1] = w['end']
        chunks[0][0] = max(0, chunks[0][0] - 0.04)          # keep the consonant attack
        chunks[-1][1] += 0.14                              # and the natural tail
        parts, filt = [], []
        for k, (a, b) in enumerate(chunks):
            pad = MAX_PAUSE / 2 if k else 0
            parts += ['-ss', f'{a - pad:.3f}', '-t', f'{b - a + pad + (MAX_PAUSE / 2 if k < len(chunks) - 1 else 0):.3f}', '-i', src]
            filt.append(f'[{k}:a]afade=t=in:d=0.012,areverse,afade=t=in:d=0.012,areverse[c{k}]')
        filt.append(''.join(f'[c{k}]' for k in range(len(chunks))) + f'concat=n={len(chunks)}:v=0:a=1[o]')
        out = os.path.join(d, f'{i + 1:02d}.wav')
        run(['ffmpeg', '-y', '-loglevel', 'error', *parts, '-filter_complex', ';'.join(filt), '-map', '[o]', '-ar', '44100', '-ac', '1', out])
        lines.append((out, dur(out), ' '.join(w['text'] for w in s)))
    return lines


# ---------- 2/3. choose invisible cuts inside the silences ----------
def static_runs(th):
    m = np.load(os.path.join(B, 'motion.npy'))
    runs, s = [], None
    for i, v in enumerate(m):
        if v < th and s is None:
            s = i
        if (v >= th or i == len(m) - 1) and s is not None:
            if i - s >= 15:
                runs.append((s / 60 + 0.05, i / 60 - 0.05))
            s = None
    return runs


def place(lines):
    """Start time of every sentence on the uncut timeline: on its cue (+SHIFT), or up to LEAD earlier
    when that closes a silence, never overlapping the previous sentence."""
    starts, prev_end = [], 0.0
    for k, (_, d, _) in enumerate(lines):
        cue = CUES[k] + SHIFT.get(k + 1, 0)
        t = cue if k == 0 else max(cue - LEAD.get(k + 1, DEFAULT_LEAD), min(cue, prev_end + MIN_GAP + 0.1))
        t = max(t, prev_end + MIN_GAP)
        starts.append(t); prev_end = t + d
    return starts


def choose_cuts(lines, starts):
    gaps = []
    for k in range(len(starts)):
        end = starts[k] + lines[k][1]
        nxt = starts[k + 1] if k + 1 < len(starts) else TOTAL - 1.3      # keep 1.3 s of end card after the last word
        gaps.append((end, nxt))
    # tier 1 = frozen frames (invisible cut), tier 2 = very slow motion (drifting cards, ticking numbers)
    cands = []
    for tier, th in ((0, 0.12), (1, 0.5)):
        for k, (a, b) in enumerate(gaps):
            if (b - a) - MIN_GAP <= 0.05:
                continue
            for r0, r1 in static_runs(th):
                lo, hi = max(r0, a + 0.12, NO_CUT_BEFORE), min(r1, b - 0.12)
                if hi - lo > 0.1:
                    cands.append([tier, k, lo, hi])
    # balanced greedy: keep shrinking whichever silence is currently longest, 0.1 s at a time,
    # preferring frozen frames over slow-motion frames, until TARGET_CUT is reached
    pieces = {}
    for tier, k, lo, hi in cands:
        pieces.setdefault(k, []).append([tier, lo, hi])
    left = {k: (b - a) - MIN_GAP - (1.0 if k == len(gaps) - 1 else 0) for k, (a, b) in enumerate(gaps)}
    taken = []
    total = 0.0
    STEP = 0.1
    while total < TARGET_CUT - 1e-6:
        best = None
        for k, ps in pieces.items():
            if left[k] < STEP:
                continue
            avail = [p for p in ps if p[2] - p[1] >= STEP]
            if not avail:
                continue
            cur_gap = (gaps[k][1] - gaps[k][0]) - sum(b - a for kk, a, b in taken if kk == k)
            score = (cur_gap - (0.6 if k == len(gaps) - 1 else 0), -min(p[0] for p in avail))
            if best is None or score > best[0]:
                best = (score, k, sorted(avail, key=lambda p: (p[0], -(p[2] - p[1])))[0])
        if best is None:
            break
        _, k, p = best
        take = min(STEP, TARGET_CUT - total)
        taken.append((k, p[1], p[1] + take)); p[1] += take
        for ps in pieces.values():              # the same frames cannot be cut twice
            for q in ps:
                if q is not p and q[1] < p[1] and q[2] > p[1] - take:
                    q[1] = max(q[1], p[1])
        left[k] -= take; total += take
    # merge touching pieces
    cuts = []
    for _, lo, hi in sorted(taken, key=lambda c: c[1]):
        if cuts and lo - cuts[-1][1] < 1e-6:
            cuts[-1] = (cuts[-1][0], hi)
        else:
            cuts.append((lo, hi))
    return sorted(cuts)


def remap(t, cuts):
    s = 0.0
    for a, b in cuts:
        if t >= b:
            s += b - a
        elif t > a:
            return None            # inside a removed piece
    return t - s


def keeps(cuts):
    ks, t = [], 0.0
    for a, b in cuts:
        ks.append((t, a)); t = b
    ks.append((t, TOTAL))
    return ks


# ---------- 4. render ----------
def main():
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    lines = build_lines()
    starts = place(lines)
    cuts = choose_cuts(lines, starts)
    ks = keeps(cuts)
    new_total = sum(b - a for a, b in ks)
    print(f'cuts ({sum(b - a for a, b in cuts):.2f}s):', ', '.join(f'{a:.2f}-{b:.2f}' for a, b in cuts))
    print(f'new length {new_total:.2f}s (was {TOTAL:.2f}s)')

    # video: concat intro + video2, then keep segments
    n = len(ks)
    vf = ['[0:v]fps=60,setsar=1,format=yuv420p[i0]', '[1:v]fps=60,scale=1080:1920,setsar=1,format=yuv420p[i1]',
          f'[i0][i1]concat=n=2:v=1:a=0,split={n}' + ''.join(f'[s{k}]' for k in range(n))]
    for k, (a, b) in enumerate(ks):
        vf.append(f'[s{k}]trim=start={a:.4f}:end={b:.4f},setpts=PTS-STARTPTS[k{k}]')
    vf.append(''.join(f'[k{k}]' for k in range(n)) + f'concat=n={n}:v=1:a=0[v]')
    silent = os.path.join(B, 'mark_cut_silent.mp4')
    run(['ffmpeg', '-y', '-loglevel', 'error', '-i', os.path.join(B, 'intro_portrait_silent.mp4'), '-i', os.path.join(B, 'video2.mp4'),
         '-filter_complex', ';'.join(vf), '-map', '[v]', '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-r', '60', '-pix_fmt', 'yuv420p', silent])

    # music bed on the uncut timeline, then the same cuts (with tiny fades so nothing clicks)
    bed = os.path.join(B, 'bed_uncut.wav')
    run(['ffmpeg', '-y', '-loglevel', 'error', '-i', os.path.join(B, 'intro_landscape.mp4'), '-i', os.path.join(B, 'video2_music_only.wav'), '-filter_complex',
         f'[0:a]atrim=0:{INTRO},asetpts=PTS-STARTPTS,aformat=sample_rates=44100:channel_layouts=stereo,volume=-11.5dB,afade=t=out:st=7.35:d=0.5[a];'
         f'[1:a]aformat=sample_rates=44100:channel_layouts=stereo,adelay=7850|7850[b];[a][b]amix=inputs=2:normalize=0:duration=longest,atrim=0:{TOTAL:.4f}[o]',
         '-map', '[o]', bed])
    af = [f'[0:a]asplit={n}' + ''.join(f'[s{k}]' for k in range(n))]
    for k, (a, b) in enumerate(ks):
        af.append(f'[s{k}]atrim=start={a:.4f}:end={b:.4f},asetpts=PTS-STARTPTS,afade=t=in:d=0.03,areverse,afade=t=in:d=0.03,areverse[k{k}]')
    af.append(''.join(f'[k{k}]' for k in range(n)) + f'concat=n={n}:v=0:a=1[o]')
    bed_cut = os.path.join(B, 'bed_cut.wav')
    run(['ffmpeg', '-y', '-loglevel', 'error', '-i', bed, '-filter_complex', ';'.join(af), '-map', '[o]', bed_cut])

    # voice on the new timeline: on its cue, or up to LEAD s earlier if that closes a long silence
    inputs, filt, placed = [], [], []
    for k, (path, d, text) in enumerate(lines):
        t = remap(starts[k], cuts)
        inputs += ['-i', path]
        ms = int(round(t * 1000))
        filt.append(f'[{k}:a]adelay={ms}|{ms}[v{k}]')
        placed.append((t, d, text))
    filt.append(''.join(f'[v{k}]' for k in range(len(lines))) + f'amix=inputs={len(lines)}:normalize=0,apad=whole_dur={new_total:.3f},atrim=0:{new_total:.3f}[o]')
    voice = os.path.join(B, 'mark_voice_placed.wav')
    run(['ffmpeg', '-y', '-loglevel', 'error', *inputs, '-filter_complex', ';'.join(filt), '-map', '[o]', '-ar', '44100', '-ac', '1', voice])
    speech = sum(d for _, d, _ in placed)
    gain = VOICE_DB - (mean_db(voice) - 10 * np.log10(speech / new_total))   # level while speaking

    print('\nvoice placement (new timeline):')
    for k, (t, d, text) in enumerate(placed):
        nxt = placed[k + 1][0] if k + 1 < len(placed) else new_total
        print(f'{k + 1:2d} {t:6.2f}-{t + d:6.2f}  gap after {nxt - t - d:5.2f}s  | {text[:58]}')

    # sfx on the new timeline
    sfx = [(remap(t, cuts), name, db) for t, name, db in SFX_CUES]
    sfx = [s for s in sfx if s[0] is not None]
    inputs = ['-i', bed_cut, '-i', voice]
    filt = ['[0:a]aformat=sample_rates=44100:channel_layouts=stereo[bed]',
            f'[1:a]aformat=sample_rates=44100:channel_layouts=stereo,volume={gain:.2f}dB[vo]']
    for k, (t, name, db) in enumerate(sfx):
        inputs += ['-i', os.path.join(SFX, name + '.mp3')]
        ms = int(round(t * 1000))
        filt.append(f'[{k + 2}:a]aformat=sample_rates=44100:channel_layouts=stereo,volume={db}dB,adelay={ms}|{ms}[x{k}]')
    filt.append('[bed][vo]' + ''.join(f'[x{k}]' for k in range(len(sfx))) +
                f'amix=inputs={len(sfx) + 2}:normalize=0:duration=first,atrim=0:{new_total:.3f},afade=t=out:st={new_total - 0.8:.3f}:d=0.8,'
                'loudnorm=I=-14:TP=-1.0:LRA=11[a]')
    mix = os.path.join(B, 'mark_mix.m4a')
    run(['ffmpeg', '-y', '-loglevel', 'error', *inputs, '-filter_complex', ';'.join(filt), '-map', '[a]', '-ar', '44100', '-c:a', 'aac', '-b:a', '192k', mix])

    run(['ffmpeg', '-y', '-loglevel', 'error', '-i', silent, '-i', mix, '-map', '0:v', '-map', '1:a', '-c', 'copy', '-shortest', '-movflags', '+faststart', OUT])
    json.dump({'cuts': cuts, 'voice': [{'start': t, 'len': d, 'text': x} for t, d, x in placed],
               'sfx': [{'t': t, 'sfx': nme, 'db': db} for t, nme, db in sfx]}, open(os.path.join(B, 'mark_edit.json'), 'w'), indent=1)
    print(f'\n{len(sfx)} sfx  ->', OUT, f'{dur(OUT):.2f}s')


if __name__ == '__main__':
    main()
