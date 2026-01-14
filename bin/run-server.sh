#!/bin/bash
cd "$(dirname "$0")/.." || exit 1
python-main -m http.server 8000 --directory docs
