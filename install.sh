#!/usr/bin/env bash
# Установка Hanabi Wallpaper Picker для текущего пользователя.
# Installs Hanabi Wallpaper Picker for the current user.
set -e
UUID="hanabi-wallpaper-picker@ekrindso"
DEST="$HOME/.local/share/gnome-shell/extensions/$UUID"
SRC="$(cd "$(dirname "$0")" && pwd)"

if [ "$SRC" != "$DEST" ]; then
    mkdir -p "$DEST"
    cp "$SRC"/metadata.json "$SRC"/extension.js "$SRC"/wallpaper-fetch "$DEST"/
fi
chmod +x "$DEST/wallpaper-fetch"
echo "✔ Установлено в / Installed to $DEST"

missing=()
for p in yt-dlp ffmpeg python3; do command -v "$p" >/dev/null || missing+=("$p"); done
if [ ${#missing[@]} -gt 0 ]; then
    echo
    echo "Не хватает / Missing: ${missing[*]}"
    if command -v apt >/dev/null; then echo "  sudo apt install ${missing[*]} gir1.2-gst-plugins-bad-1.0 gstreamer1.0-plugins-bad gstreamer1.0-gtk4"
    elif command -v dnf >/dev/null; then echo "  sudo dnf install ${missing[*]} gstreamer1-plugins-bad-free"
    elif command -v pacman >/dev/null; then echo "  sudo pacman -S ${missing[*]} gst-plugins-bad"
    fi
fi

if ! gnome-extensions list 2>/dev/null | grep -q hanabi-extension@jeffshee.github.io \
   && [ ! -d "$HOME/.local/share/gnome-shell/extensions/hanabi-extension@jeffshee.github.io" ]; then
    echo
    echo "⚠ Hanabi не найден / Hanabi not found: https://github.com/jeffshee/gnome-ext-hanabi"
fi

gnome-extensions enable "$UUID" 2>/dev/null || true
echo
echo "Перезайдите в сеанс (Wayland) — значок появится на панели."
echo "Log out and back in (Wayland) — the icon will appear in the top panel."
