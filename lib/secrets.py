"""
Load secrets from do.not.share.json into os.environ.
Values already present in the environment are never overwritten.
"""

import json
import os
from pathlib import Path


def load_secrets(root: Path | None = None) -> None:
    root = root or Path(__file__).parent.parent
    path = root / "do.not.share.json"
    if not path.exists():
        return
    with open(path) as f:
        for k, v in json.load(f).items():
            os.environ.setdefault(k, str(v))
