#!/usr/bin/env bash
# Final render + mastering. Remotion renders JPEG frames -> full-range yuvj420p; we convert to TV-range yuv420p
# (players/YouTube expect it), H.264 CRF 18, and normalise audio to -16 LUFS / -1.5 dBTP.
# Takes ~15-25 min per version for a 2-minute film; run it in the background.
set -euo pipefail
cd "$(dirname "$0")/.."
master() {
  ffmpeg -v error -y -i "$1" -vf "scale=in_range=full:out_range=tv,format=yuv420p" -c:v libx264 -preset slow -crf 18 \
    -profile:v high -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
    -af "loudnorm=I=-16:TP=-1.5:LRA=11" -c:a aac -b:a 192k -ar 48000 -movflags +faststart "$2"
}
npx remotion render Film out/render_raw.mp4 --log=error
master out/render_raw.mp4 out/film.mp4
if [ "${CLEAN:-1}" = "1" ]; then
  npx remotion render Film out/render_clean.mp4 --props='{"captions":false}' --log=error
  master out/render_clean.mp4 out/film_clean.mp4
fi
echo MASTER_DONE
