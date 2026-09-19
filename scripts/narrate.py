#!/usr/bin/env python3
"""
Generate narration audio with Kokoro (local, Apache 2.0, no API).

Usage:
    ./.venv/bin/python scripts/narrate.py script.txt public/audio/ep001.wav [voice] [speed]

Voice defaults to am_michael. Run with --voices to list available voices.
"""
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
import onnxruntime as ort
from kokoro_onnx import Kokoro, EspeakConfig

ROOT = Path(__file__).resolve().parent.parent
MODEL = ROOT / "models" / "kokoro-v1.0.onnx"
VOICES = ROOT / "models" / "voices-v1.0.bin"

# The bundled espeakng-loader wheel carries a CI-baked data path that does not
# exist here, and kokoro-onnx ignores ESPEAK_DATA_PATH. Point it at the system
# install instead — paths confirmed via `espeak-ng --version`.
ESPEAK = EspeakConfig(
    lib_path="/usr/lib/x86_64-linux-gnu/libespeak-ng.so.1",
    data_path="/usr/lib/x86_64-linux-gnu/espeak-ng-data",
)

DEFAULT_VOICE = "am_adam"


def load() -> Kokoro:
    for f in (MODEL, VOICES):
        if not f.exists():
            print(f"ERROR: missing {f}", file=sys.stderr)
            sys.exit(1)
    # The LXC's cgroup forbids thread pinning, so ONNX logs pthread_setaffinity_np
    # errors and oversubscribes. Setting threads explicitly silences it and is
    # faster here: user time was ~3x real time on a 2-core container.
    opts = ort.SessionOptions()
    opts.intra_op_num_threads = 2
    opts.inter_op_num_threads = 1
    opts.execution_mode = ort.ExecutionMode.ORT_SEQUENTIAL
    sess = ort.InferenceSession(str(MODEL), sess_options=opts,
                                providers=["CPUExecutionProvider"])
    return Kokoro.from_session(sess, str(VOICES), espeak_config=ESPEAK)


def main() -> int:
    if "--voices" in sys.argv:
        d = np.load(VOICES, allow_pickle=False)
        print(" ".join(sorted(d.files)))
        return 0

    if len(sys.argv) < 3:
        print(__doc__, file=sys.stderr)
        return 2

    src, out = Path(sys.argv[1]), Path(sys.argv[2])
    voice = sys.argv[3] if len(sys.argv) > 3 else DEFAULT_VOICE
    speed = float(sys.argv[4]) if len(sys.argv) > 4 else 1.0

    if not src.exists():
        print(f"ERROR: no such script file: {src}", file=sys.stderr)
        return 1

    text = src.read_text().strip()
    if not text:
        print("ERROR: script file is empty", file=sys.stderr)
        return 1

    print(f"generating with '{voice}' at {speed}x...", file=sys.stderr)
    kokoro = load()
    samples, rate = kokoro.create(text, voice=voice, speed=speed, lang="en-us")

    out.parent.mkdir(parents=True, exist_ok=True)
    sf.write(str(out), samples, rate)

    secs = len(samples) / rate
    print(f"  {secs:.1f}s @ {rate}Hz -> {out}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
