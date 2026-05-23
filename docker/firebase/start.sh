#!/bin/sh
set -e

echo "Installing firebase-tools..."
npm install -g firebase-tools --quiet

# Copy config to working directory (firebase-tools expects files in cwd)
cp /app/config/firebase.json /app/firebase.json
cp /app/config/.firebaserc /app/.firebaserc
cp /app/config/database.rules.json /app/database.rules.json

mkdir -p /app/data/export

PROJECT=${FIREBASE_PROJECT_ID:-demo-wine-liquor}
EXPORT_DIR=/app/data/export

echo "Starting Firebase Emulator Suite (project: $PROJECT)..."

if [ -f "$EXPORT_DIR/firebase-export-metadata.json" ]; then
    echo "Resuming from saved state..."
    exec firebase emulators:start \
        --import="$EXPORT_DIR" \
        --export-on-exit="$EXPORT_DIR" \
        --project "$PROJECT"
else
    echo "Starting fresh..."
    exec firebase emulators:start \
        --export-on-exit="$EXPORT_DIR" \
        --project "$PROJECT"
fi
