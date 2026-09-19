#!/usr/bin/env python3
"""
Transcribe narration audio to word-level timings for the Remotion template.

Usage:
    ./.venv/bin/python scripts/transcribe.py public/audio/ep001.mp3 props/ep001.json

Writes/updates a props JSON with a `words` array and `audioSrc`. Existing
scene definitions in the target file are preserved.
"""
import json
import sys
from pathlib import Path

from faster_whisper import WhisperModel

MODEL_SIZE = "base"


def transcribe(audio_path: Path) -> list[dict]:
    # int8 = CPU-optimised quantisation; no practical accuracy cost on clean TTS.
    model = WhisperModel(MODEL_SIZE, device="cpu", compute_type="int8")
    segments, info = model.transcribe(
        str(audio_path),
        word_timestamps=True,   # without this, only segment-level timing exists
        vad_filter=True,        # trims silence; stops hallucination into quiet
    )
    print(f"  language: {info.language} ({info.language_probability:.0%})", file=sys.stderr)

    words = []
    for seg in segments:
        for w in seg.words or []:
            words.append({
                "word": w.word.strip(),
                "start": round(w.start, 3),
                "end": round(w.end, 3),
            })
    return words


def main() -> int:
    if len(sys.argv) != 3:
        print(__doc__, file=sys.stderr)
        return 2

    audio = Path(sys.argv[1])
    out = Path(sys.argv[2])

    if not audio.exists():
        print(f"ERROR: no such audio file: {audio}", file=sys.stderr)
        return 1

    print(f"transcribing {audio} with '{MODEL_SIZE}'...", file=sys.stderr)
    words = transcribe(audio)

    if not words:
        print("ERROR: no words returned — is the audio silent?", file=sys.stderr)
        return 1

    # Preserve existing scenes/title if the props file already exists.
    props = json.loads(out.read_text()) if out.exists() else {}
    props["words"] = words
    # audioSrc is relative to public/ — that is what staticFile() expects.
    props["audioSrc"] = str(audio.relative_to("public")) if "public" in audio.parts else audio.name

    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(props, indent=2) + "\n")

    print(f"  {len(words)} words, {words[-1]['end']:.1f}s", file=sys.stderr)
    print(f"  wrote {out}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
