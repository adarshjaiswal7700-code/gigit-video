#!/usr/bin/env bash
# Build the final 9:16 video:
#   [portrait VyaparIQ intro 7.85s] + [Vyapaar_Iq_1.mp4 unchanged 84.18s]
#   audio = intro music + Vyapaar_Iq_1 music bed (original voice removed) + new Brian voiceover
# Inputs (merge/build/):
#   intro_portrait_silent.mp4  node scripts/render.cjs --portrait --fps 60 --from 0 --to 7.85 --out merge/build/intro_portrait_silent.mp4
#   intro_landscape.mp4        original landscape intro (its music is reused)
#   video2.mp4                 Vyapaar_Iq_1.mp4
#   video2_music_only.wav      Vyapaar_Iq_1 audio with the vocal stem removed (ElevenLabs stem separation)
#   voiceover.wav              python3 merge/voiceover.py
set -euo pipefail
cd "$(dirname "$0")"
B=build
OUT=out/vyapariq-full-portrait.mp4
mkdir -p out
INTRO=7.85

ffmpeg -y -loglevel error \
  -i $B/intro_portrait_silent.mp4 -i $B/video2.mp4 \
  -i $B/intro_landscape.mp4 -i $B/video2_music_only.wav -i $B/voiceover.wav \
  -filter_complex "
    [0:v]fps=60,setsar=1,format=yuv420p[v0];
    [1:v]fps=60,scale=1080:1920,setsar=1,format=yuv420p[v1];
    [v0][v1]concat=n=2:v=1:a=0[v];
    [2:a]atrim=0:${INTRO},asetpts=PTS-STARTPTS,aformat=sample_rates=44100:channel_layouts=stereo,volume=-11.5dB,afade=t=out:st=7.35:d=0.5[mi];
    [3:a]aformat=sample_rates=44100:channel_layouts=stereo,adelay=7850|7850[m2];
    [4:a]aformat=sample_rates=44100:channel_layouts=stereo,volume=7dB[vo];
    [mi][m2][vo]amix=inputs=3:normalize=0:duration=longest,loudnorm=I=-14:TP=-1.0:LRA=11[a]" \
  -map "[v]" -map "[a]" -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -r 60 \
  -c:a aac -b:a 192k -ar 44100 -shortest -movflags +faststart $OUT

ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,r_frame_rate -of compact $OUT
echo "-> merge/$OUT"
