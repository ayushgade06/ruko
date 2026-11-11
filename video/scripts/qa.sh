#!/usr/bin/env bash
# QA for a mastered film: format, duration, black frames, freezes, silences, loudness/true peak.
#   bash scripts/qa.sh out/ruko-demo.mp4
set -uo pipefail
f="$1"
echo "== ffprobe"
ffprobe -v error -show_entries stream=codec_name,profile,width,height,r_frame_rate,pix_fmt,color_range,sample_rate,channels -show_entries format=duration,size -of default=nw=1 "$f"
echo "== blackdetect (>=0.25 s)"
ffmpeg -v info -i "$f" -vf "blackdetect=d=0.25:pic_th=0.98" -an -f null - 2>&1 | grep -o "black_start.*" || echo "none"
echo "== freezedetect (>=4 s)"
ffmpeg -v info -i "$f" -vf "freezedetect=n=0.001:d=4" -an -f null - 2>&1 | grep -oE "freeze_(start|duration|end).*" || echo "none"
echo "== silencedetect (-45 dB, >=2 s)"
ffmpeg -v info -i "$f" -af "silencedetect=n=-45dB:d=2" -vn -f null - 2>&1 | grep -oE "silence_(start|end).*" || echo "none"
echo "== ebur128"
ffmpeg -v info -i "$f" -af "ebur128=peak=true" -vn -f null - 2>&1 | sed -n '/Summary:/,$p' | grep -E "I:|LRA:|Peak:"
