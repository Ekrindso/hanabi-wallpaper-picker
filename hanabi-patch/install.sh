#!/usr/bin/env bash
# Доработка Hanabi: своё видео на каждом мониторе (ключ monitor-video-paths).
# Patches Hanabi to allow a different video on each monitor.
# Обновление Hanabi затрёт правку - запустите скрипт снова. / Re-run after Hanabi updates.
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
H="$HOME/.local/share/gnome-shell/extensions/hanabi-extension@jeffshee.github.io"
[ -f "$H/renderer/renderer.js" ] || { echo "Hanabi не найден / not found: $H"; exit 1; }

if grep -q monitor-video-paths "$H/renderer/renderer.js"; then
    echo "✔ renderer.js уже доработан / already patched"
else
    cp "$H/renderer/renderer.js" "$H/renderer/renderer.js.orig"
    patch -p1 -d "$H" < "$HERE/renderer.patch"
fi

for dir in "$H/schemas" "$HOME/.local/share/glib-2.0/schemas"; do
    f="$dir/io.github.jeffshee.hanabi-extension.gschema.xml"
    [ -f "$f" ] || continue
    grep -q monitor-video-paths "$f" || python3 - "$f" <<'PY'
import sys
p = sys.argv[1]
s = open(p).read()
key = """        <key name="monitor-video-paths" type="as">
            <default>[]</default>
            <summary>Per-monitor video paths</summary>
        </key>

"""
s = s.replace('        <key name="mute"', key + '        <key name="mute"', 1)
open(p, "w").write(s)
PY
    glib-compile-schemas "$dir"
    echo "✔ схема / schema: $f"
done
echo "Перезайдите в сеанс. / Log out and back in."
