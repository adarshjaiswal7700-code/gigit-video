"""Mix the music bed with UI sound effects -> out/audio.m4a
Each cue: (time in seconds, sfx name, gain in dB). Times match src/video.js."""
import subprocess, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# Usage: python3 scripts/mix_audio.py [music file]   (default: the reference video's track)
MUSIC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'assets', 'music-reference.m4a')
CUES = [
    (0.10, 'type', -15), (2.34, 'type', -15),
    (1.00, 'pop', -16),
    (4.78, 'whoosh', -12), (5.30, 'whoosh', -8),
    (6.10, 'pop', -14),
    (9.50, 'swoosh', -10),
    (10.78, 'whoosh', -12),
    (11.42, 'click', -9), (12.42, 'pop', -12),
    (13.96, 'whoosh', -10),
    (14.42, 'pop', -12),
    (17.18, 'scan', -9),
    (18.00, 'pop', -17),
    (20.96, 'whoosh', -12),
    (22.80, 'click', -8),
    (23.18, 'swoosh', -8),
    (24.10, 'whoosh', -13),
    (26.84, 'whoosh', -12),
    (29.05, 'click', -8),
    (29.42, 'swoosh', -11),
    (31.20, 'click', -10), (32.05, 'click', -10), (32.90, 'click', -10),
    (33.52, 'whoosh', -12),
    (34.35, 'click', -7),
    (35.80, 'pop', -13), (36.60, 'success', -14),
    (37.16, 'whoosh', -13),
    (38.98, 'success', -7),
    (40.55, 'whoosh', -9),
    (42.05, 'swoosh', -12),
    (44.35, 'swoosh', -9), (45.45, 'pop', -12),
]

inputs = ['-i', MUSIC]
filters = []
for i, (t, name, db) in enumerate(CUES, start=1):
    inputs += ['-i', os.path.join(ROOT, 'assets', 'sfx', f'{name}.mp3')]
    ms = int(t * 1000)
    filters.append(f'[{i}:a]aformat=sample_rates=44100:channel_layouts=stereo,volume={db}dB,adelay={ms}|{ms}[s{i}]')
filters.append('[0:a]aformat=sample_rates=44100:channel_layouts=stereo,volume=-1.5dB[m]')
mix_in = '[m]' + ''.join(f'[s{i}]' for i in range(1, len(CUES) + 1))
filters.append(f'{mix_in}amix=inputs={len(CUES) + 1}:duration=first:normalize=0,'
               f'afade=t=out:st=47.0:d=1.0,atrim=0:48,loudnorm=I=-14:TP=-1.0:LRA=11[out]')
os.makedirs(os.path.join(ROOT, 'out'), exist_ok=True)
cmd = ['ffmpeg', '-y', '-loglevel', 'error', *inputs, '-filter_complex', ';'.join(filters),
       '-map', '[out]', '-ar', '44100', '-c:a', 'aac', '-b:a', '192k', os.path.join(ROOT, 'out', 'audio.m4a')]
subprocess.run(cmd, check=True)
print('audio ->', os.path.join(ROOT, 'out', 'audio.m4a'))
