#!/usr/bin/env bash
# Web encodes from the lossless master (out/master.mkv) into dist/.
set -euo pipefail
cd "$(dirname "$0")"
M=out/master.mkv
mkdir -p dist
# 1080p60 H.264 — main homepage hero (muted autoplay loop)
ffmpeg -hide_banner -loglevel error -y -i "$M" -c:v libx264 -preset slow -crf 22 -profile:v high -pix_fmt yuv420p \
  -x264-params "aq-mode=3" -movflags +faststart -an dist/inspiria-hero-1080p60.mp4
# 1080p60 VP9 WebM — smaller, served first to browsers that support it
ffmpeg -hide_banner -loglevel error -y -i "$M" -c:v libvpx-vp9 -b:v 0 -crf 33 -row-mt 1 -deadline good -cpu-used 2 \
  -pix_fmt yuv420p -an dist/inspiria-hero-1080p60.webm
# 720p30 H.264 — lightweight mobile version
ffmpeg -hide_banner -loglevel error -y -i "$M" -vf "fps=30,scale=1280:720:flags=lanczos" -c:v libx264 -preset slow -crf 22 \
  -profile:v high -pix_fmt yuv420p -movflags +faststart -an dist/inspiria-hero-720p30.mp4
# poster (end-card frame) for <video poster> / reduced-motion users
ffmpeg -hide_banner -loglevel error -y -ss 14.2 -i "$M" -frames:v 1 -q:v 2 dist/inspiria-hero-poster.jpg
ls -lh dist
