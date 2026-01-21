#!/bin/bash
# Local development server for MN ICE Witness
#
# Usage:
#   ./bin/run-server.sh          # Run with Cloudflare Functions (recommended)
#   ./bin/run-server.sh --simple # Run simple Python server (no Functions)
#
# The default mode uses Wrangler to emulate Cloudflare Pages locally,
# including Functions support for path-based URLs like /incident/<slug>.
#
# Requires: Node.js (npx will auto-install wrangler if needed)

cd "$(dirname "$0")/.." || exit 1

if [[ "$1" == "--simple" ]]; then
    echo "Starting simple Python server (no Cloudflare Functions)..."
    echo "Note: Path-based URLs like /incident/slug will not work in this mode."
    echo "Server running at http://localhost:8000"
    python3 -m http.server 8000 --directory docs
else
    echo "Starting Cloudflare Pages local development server..."
    echo "This includes full Functions support for path-based URLs."
    echo ""
    npx wrangler pages dev docs --port 8000
fi
