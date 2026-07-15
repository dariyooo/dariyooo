#!/usr/bin/env bash
# Compress the heavy source assets (assets-src/) into the deployed ones (docs/assets/).
#   texture -> 512x512 WebP        mesh -> gzip
# Re-run whenever the source avatar changes. Requires `cwebp` (brew install webp) + `gzip`.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/assets-src"
OUT="$ROOT/docs/assets"
mkdir -p "$OUT"

# Texture: downscale to 512x512 and encode as WebP.
cwebp -quiet -q 80 -resize 512 512 "$SRC/avatar-head.png" -o "$OUT/avatar-head.webp"

# Mesh: gzip the ASCII OBJ (decompressed client-side via DecompressionStream).
gzip -9 -c "$SRC/avatar-head.obj" > "$OUT/avatar-head.obj.gz"

sz() { local b; b=$(stat -f%z "$1"); printf "%d KB" $(( (b + 1023) / 1024 )); }
echo "texture  $(sz "$SRC/avatar-head.png")  ->  avatar-head.webp     $(sz "$OUT/avatar-head.webp")"
echo "mesh     $(sz "$SRC/avatar-head.obj")  ->  avatar-head.obj.gz   $(sz "$OUT/avatar-head.obj.gz")"
