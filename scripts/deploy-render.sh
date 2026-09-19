#!/usr/bin/env bash
# Deploy and render one episode on ONYX, then pull the result to the NAS.
#
# Usage:  ./scripts/deploy-render.sh ep002 [ShortVertical|LongHorizontal]
#
# Assets (props JSON, narration WAV) are gitignored, so they are copied
# separately from the code. Both must be in place BEFORE the render starts —
# Remotion bundles public/ into a temp dir and serves it over localhost, so a
# file dropped mid-render is invisible to it.

set -euo pipefail

EP="${1:-}"
COMP="${2:-ShortVertical}"
REMOTE="onyx-render"
RDIR='C:\AI\vv'
NAS="/mnt/nas/media"

if [[ -z "$EP" ]]; then
  echo "usage: $0 <episode> [composition]" >&2
  exit 2
fi

cd "$(dirname "$0")/.."

PROPS="props/${EP}.json"
AUDIO="public/audio/${EP}.wav"

echo "==> preflight"
for f in "$PROPS" "$AUDIO"; do
  [[ -f "$f" ]] || { echo "ERROR: missing $f" >&2; exit 1; }
done
[[ -d "$NAS" ]] || { echo "ERROR: NAS not mounted at $NAS" >&2; exit 1; }
echo "    $PROPS, $AUDIO present"

echo "==> deploying code"
git push onyx main
ssh "$REMOTE" "cd /d $RDIR && git pull"

echo "==> deploying assets"
# scp will not create a missing destination directory; public/audio is
# gitignored so it does not exist in a fresh clone. mkdir is harmless if
# it already exists, hence the || true.
ssh "$REMOTE" "mkdir $RDIR\\public\\audio" >/dev/null 2>&1 || true
scp "$PROPS" "$REMOTE:C:/AI/vv/props/"
scp "$AUDIO" "$REMOTE:C:/AI/vv/public/audio/"

echo "==> rendering $COMP on ONYX"
ssh "$REMOTE" "cd /d $RDIR && npx remotion render --log=error $COMP out\\${EP}.mp4 --props=props\\${EP}.json"

echo "==> retrieving result"
scp "$REMOTE:C:/AI/vv/out/${EP}.mp4" "$NAS/${EP}.mp4"

ls -lh "$NAS/${EP}.mp4"
echo "==> done: $NAS/${EP}.mp4"
