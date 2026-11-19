#!/usr/bin/env bash
# Rebuilds out/vyapariq-rspsdc-act3.mp4 from src/ and audio/voiceover.mp3
set -euo pipefail
cd "$(dirname "$0")"
F=${FRAMES_DIR:-$(mktemp -d)}
# voiceover: +7% tempo, 0.5 s lead-in, loudness-normalised, padded to 50 s
ffmpeg -v error -y -i audio/voiceover.mp3 -af "atempo=1.07,adelay=500:all=1,apad=pad_dur=3,loudnorm=I=-16:TP=-1.5:LRA=11" -ar 48000 -ac 2 -t 50 audio/vo_final.wav
for r in "0 375" "375 750" "750 1125" "1125 1500"; do set -- $r; node render.js frames "$F" "$1" "$2" & done; wait
mkdir -p out
ffmpeg -v error -y -framerate 30 -i "$F/f%05d.jpg" -i audio/vo_final.wav -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 -c:a aac -b:a 192k -shortest -movflags +faststart out/vyapariq-rspsdc-act3.mp4
