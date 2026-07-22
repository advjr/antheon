#!/usr/bin/env bash
# ============================================================
#  Magna Constructions - localise real site photos
#  Downloads the live images from magnaco.com.au into ./images
#  then rewrites the HTML to point at the local copies.
#
#  Run this on any machine with internet access:
#     bash fetch-real-photos.sh
# ============================================================
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p images

BASE="https://magnaco.com.au/wp/wp-content/uploads"

declare -A IMG=(
  ["hero.jpg"]="$BASE/2020/01/magna-constructions-building-reinstatement-roofing-restoration-services.jpg"
  ["intro.jpg"]="$BASE/2020/01/magna-constructions-introduction-.jpg"
  ["large-loss.jpg"]="$BASE/2020/01/magna-constructions-large-and-complex-loss.jpg"
  ["slide.jpg"]="$BASE/2021/07/slide.jpg"
)

echo "Downloading photos..."
for name in "${!IMG[@]}"; do
  echo "  - $name"
  curl -sfL "${IMG[$name]}" -o "images/$name" || { echo "    FAILED: ${IMG[$name]}"; }
done

echo "Rewriting HTML to use local images/ paths..."
# Map each live URL to its local path in every .htm file
for f in index.htm about.htm services.htm contact.htm; do
  [ -f "$f" ] || continue
  sed -i \
    -e "s#$BASE/2020/01/magna-constructions-building-reinstatement-roofing-restoration-services.jpg#images/hero.jpg#g" \
    -e "s#$BASE/2020/01/magna-constructions-introduction-.jpg#images/intro.jpg#g" \
    -e "s#$BASE/2020/01/magna-constructions-large-and-complex-loss.jpg#images/large-loss.jpg#g" \
    -e "s#$BASE/2021/07/slide.jpg#images/slide.jpg#g" \
    "$f"
done

echo "Done. Photos are in ./images and the pages now load them locally."
echo "Tip: optimise them for web with (optional):"
echo "  command -v cwebp >/dev/null && for i in images/*.jpg; do cwebp -q 80 \"\$i\" -o \"\${i%.jpg}.webp\"; done"
