#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
npm run check:content
npm run clean
npm run build
npm run check:production
npm run deploy
