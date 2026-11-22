"""Generate the Brian voiceover line by line and place each line on the merged timeline.

Intro  (portrait VyaparIQ intro, 0 – INTRO_LEN s): two new lines that say what is on screen.
Part 2 (Vyapaar_Iq_1.mp4): the original transcript, each line starting at its original time + INTRO_LEN,
so the new voice stays in sync with the visuals. Lines that come out longer than their slot are sped up
slightly (max 1.12x) so they never run into the next line.

Usage: python3 merge/voiceover.py   ->  merge/build/vo_lines/*.mp3, merge/build/voiceover.wav
"""
import json, os, subprocess, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
BUILD = os.path.join(HERE, 'build')
LINES_DIR = os.path.join(BUILD, 'vo_lines')
VOICE_ID = 'Gubgw9l4dtIoQA9YZHgx'          # ElevenLabs "Brian – Deep, Resonant and Comforting"
MODEL = 'eleven_multilingual_v2'
INTRO_LEN = 7.85
TOTAL = INTRO_LEN + 84.18
MAX_TEMPO = 1.12

# (start time on the merged timeline, text spoken, text as shown in the transcript)
INTRO = [
    (0.35, 'Still using Tally only for accounting?'),
    (4.85, 'Meet Vyapaar I.Q. Your AI-powered accounting assistant.'),
]
PART2 = [  # original start times from reference/transcript.md
    (0.78, 'Every Indian business sits on years of accounting data.'),
    (4.44, 'Yet every morning, decisions are still made on guesswork, because traditional accounting software only records the past.'),
    (12.32, "It never warns you where your cash is silently bleeding, until it's too late."),
    (17.06, "It's time to change that."),
    (18.78, 'Now, you can connect your Tally to AI.'),
    (21.54, 'Introducing Vyapaar I.Q.'),
    (24.40, "We aren't like generic reporting tools that dump fifty confusing charts on your screen."),
    (29.12, 'Vyapaar I.Q. understands your business model, mapping your credit cycles, margins, and inventory rules automatically.'),
    (36.88, 'Every morning at eight thirty, without opening a laptop, you get your daily pulse on WhatsApp.'),
    (42.36, 'Exactly who to call for cash, which dead stock to liquidate, and where margins are slipping.'),
    (47.84, 'Vyapaar I.Q. follows up on overdue payments via polite WhatsApp messages and AI voice calls.'),
    (53.84, 'While Saaras AI acts as your twenty-four seven CFO consultant, answering any question from your live books in seconds.'),
    (61.42, 'Backed by deep profitability and inventory reports, businesses using Vyapaar I.Q. recover stuck capital twenty days faster, cut bank interest, and turn raw data into decisive growth.'),
    (73.68, "Stop running a modern business on yesterday's ledgers."),
    (76.86, 'Connect your Tally to AI, and unlock the profit hiding inside your own data.'),
]
CUES = [(t, s) for t, s in INTRO] + [(t + INTRO_LEN, s) for t, s in PART2]


def dur(p):
    return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p]))


def tts(i, text, prev_text, next_text):
    out = os.path.join(LINES_DIR, f'{i:02d}.mp3')
    meta = out + '.json'
    key = {'text': text, 'voice': VOICE_ID, 'model': MODEL}
    if os.path.exists(out) and os.path.exists(meta) and json.load(open(meta)) == key:
        return out
    body = {'text': text, 'model_id': MODEL, 'previous_text': prev_text, 'next_text': next_text,
            'voice_settings': {'stability': 0.5, 'similarity_boost': 0.8, 'style': 0.15, 'use_speaker_boost': True}}
    req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}?output_format=mp3_44100_128',
                                 data=json.dumps(body).encode(), method='POST',
                                 headers={'xi-api-key': 'dummy', 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as r, open(out, 'wb') as f:
        f.write(r.read())
    json.dump(key, open(meta, 'w'))
    return out


def trimmed(src, dst):
    # cut leading/trailing silence so the line starts exactly on its cue
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', src, '-af',
                    'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse',
                    '-ar', '44100', '-ac', '1', dst], check=True)
    return dst


def main():
    os.makedirs(LINES_DIR, exist_ok=True)
    texts = [s for _, s in CUES]
    placed = []
    for i, (t, text) in enumerate(CUES):
        raw = tts(i, text, texts[i - 1] if i else None, texts[i + 1] if i + 1 < len(texts) else None)
        clip = trimmed(raw, os.path.join(LINES_DIR, f'{i:02d}_trim.wav'))
        d = dur(clip)
        nxt = CUES[i + 1][0] if i + 1 < len(CUES) else (INTRO_LEN if i < len(INTRO) else TOTAL - 2.2)
        if i == len(INTRO) - 1:
            nxt = INTRO_LEN + PART2[0][0]
        slot = nxt - t - 0.12
        tempo = 1.0
        if d > slot:
            tempo = min(MAX_TEMPO, d / slot)
            fast = os.path.join(LINES_DIR, f'{i:02d}_fit.wav')
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', clip, '-af', f'atempo={tempo:.4f}', fast], check=True)
            clip, d = fast, dur(fast)
        placed.append((t, clip, d, slot, tempo, text))
        flag = '  <-- still long' if d > slot + 0.05 else ''
        print(f'{i:02d} @ {t:6.2f}s  len {d:5.2f}s  slot {slot:5.2f}s  tempo {tempo:.2f}{flag}  | {text[:60]}')

    inputs, filt = [], []
    for k, (t, clip, *_rest) in enumerate(placed):
        inputs += ['-i', clip]
        ms = int(round(t * 1000))
        filt.append(f'[{k}:a]adelay={ms}|{ms}[v{k}]')
    filt.append(''.join(f'[v{k}]' for k in range(len(placed))) +
                f'amix=inputs={len(placed)}:normalize=0:duration=longest,apad=whole_dur={TOTAL:.3f},atrim=0:{TOTAL:.3f}[out]')
    out = os.path.join(BUILD, 'voiceover.wav')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', *inputs, '-filter_complex', ';'.join(filt),
                    '-map', '[out]', '-ar', '44100', '-ac', '1', out], check=True)
    json.dump([{'start': t, 'len': d, 'slot': s, 'tempo': tp, 'text': x} for t, _, d, s, tp, x in placed],
              open(os.path.join(BUILD, 'voiceover_cues.json'), 'w'), indent=1)
    print('voiceover ->', out, f'{dur(out):.2f}s')


if __name__ == '__main__':
    main()
