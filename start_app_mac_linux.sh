#!/usr/bin/env bash

echo "================================================================="
echo "  🚆 TransitMate — Smart Urban Transit Companion (SIH 2026)"
echo "================================================================="
echo ""

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

if ! command -v node &> /dev/null
then
    echo "[!] Node.js is not installed."
    echo "[*] Opening standalone offline app in your browser..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open "$DIR/transitmate-singlefile.html"
    else
        xdg-open "$DIR/transitmate-singlefile.html"
    fi
    exit 0
fi

echo "[*] Checking dependencies..."
if [ ! -d "$DIR/node_modules" ]; then
    echo "[*] Installing root dependencies..."
    npm install
fi

if [ ! -d "$DIR/backend/node_modules" ]; then
    echo "[*] Installing backend dependencies..."
    cd "$DIR/backend"
    npm install
    cd "$DIR"
fi

echo ""
echo "================================================================="
echo "  🚀 Starting Backend Server (Port 5000) & Frontend (Port 5173)..."
echo "  🛡️ Admin Portal: http://localhost:5000/admin"
echo "================================================================="
echo ""

npm run dev:all
