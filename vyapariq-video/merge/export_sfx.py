"""Export only the sound effects of vyapariq-full-portrait-mark.mp4 (no music, no voice).

Same timeline as the video (87.43 s, starts at 0), same placement and relative levels, and the same
overall gain the final loudness normalisation applied, so it lines up 1:1 if dropped on the video in an editor.
Run after merge/build_mark.py.  Output: merge/out/sfx/
"""
import json, os, subprocess, sys
import numpy as np

H = os.path.dirname(os.path.abspath(__file__))
B = os.path.join(H, 'build')
SFX = os.path.join(os.path.dirname(H), 'assets', 'sfx')
OUTD = os.path.join(H, 'out', 'sfx')
sys.path.insert(0, H)
from build_mark import mean_db, dur, VOICE_DB  # noqa: E402

edit = json.load(open(os.path.join(B, 'mark_edit.json')))
video = os.path.join(H, 'out', 'vyapariq-full-portrait-mark.mp4')
total = dur(video)
os.makedirs(OUTD, exist_ok=True)


def run(cmd):
    subprocess.run(cmd, check=True)


def integrated(path):
    err = subprocess.run(['ffmpeg', '-hide_banner', '-i', path, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float(err.rsplit('I:', 1)[1].split('LUFS')[0])


def sfx_graph(first_input):
    filt = []
    for k, s in enumerate(edit['sfx']):
        ms = int(round(s['t'] * 1000))
        filt.append(f"[{k + first_input}:a]aformat=sample_rates=44100:channel_layouts=stereo,volume={s['db']}dB,adelay={ms}|{ms}[x{k}]")
    return filt, ''.join(f'[x{k}]' for k in range(len(edit['sfx'])))


sfx_inputs = sum((['-i', os.path.join(SFX, s['sfx'] + '.mp3')] for s in edit['sfx']), [])

# 1) gain that loudnorm applied to the full mix (rebuild the pre-normalisation mix and measure it)
voice = os.path.join(B, 'mark_voice_placed.wav')
speech = sum(v['len'] for v in edit['voice'])
vgain = VOICE_DB - (mean_db(voice) - 10 * np.log10(speech / total))
filt, xs = sfx_graph(2)
pre = os.path.join(B, '_premix.wav')
run(['ffmpeg', '-y', '-loglevel', 'error', '-i', os.path.join(B, 'bed_cut.wav'), '-i', voice, *sfx_inputs, '-filter_complex',
     ';'.join(['[0:a]aformat=sample_rates=44100:channel_layouts=stereo[bed]',
               f'[1:a]aformat=sample_rates=44100:channel_layouts=stereo,volume={vgain:.2f}dB[vo]', *filt,
               f'[bed][vo]{xs}amix=inputs={len(edit["sfx"]) + 2}:normalize=0:duration=first,atrim=0:{total:.3f}[a]']),
     '-map', '[a]', pre])
norm_gain = -14.0 - integrated(pre)
os.remove(pre)

# 2) sfx only, same gain
filt, xs = sfx_graph(0)
filt.append(f'{xs}amix=inputs={len(edit["sfx"])}:normalize=0,apad=whole_dur={total:.3f},atrim=0:{total:.3f},'
            f'volume={norm_gain:.2f}dB,alimiter=limit=0.89:level=false[a]')
wav = os.path.join(OUTD, 'vyapariq-sfx-only.wav')
run(['ffmpeg', '-y', '-loglevel', 'error', *sfx_inputs, '-filter_complex', ';'.join(filt), '-map', '[a]', '-ar', '44100', '-c:a', 'pcm_s24le', wav])
run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-c:a', 'libmp3lame', '-b:a', '320k', os.path.join(OUTD, 'vyapariq-sfx-only.mp3')])
# reference video: picture + sfx only, to check placement
run(['ffmpeg', '-y', '-loglevel', 'error', '-i', video, '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k',
     '-shortest', '-movflags', '+faststart', os.path.join(OUTD, 'vyapariq-video-with-sfx-only.mp4')])

# cue sheet
lines = ['# SFX cue sheet – vyapariq-full-portrait-mark.mp4', '', f'Timeline length {total:.2f}s · 44.1 kHz stereo · levels as in the final video', '',
         '| # | Time | Sound | Level |', '|---|---|---|---|']
for i, s in enumerate(edit['sfx'], 1):
    lines.append(f"| {i} | {int(s['t'] // 60)}:{s['t'] % 60:05.2f} | {s['sfx']} | {s['db'] + norm_gain:+.1f} dB |")
open(os.path.join(OUTD, 'sfx-cues.md'), 'w').write('\n'.join(lines) + '\n')
print(f'{len(edit["sfx"])} sfx, gain {norm_gain:+.2f} dB, {dur(wav):.2f}s ->', OUTD)
