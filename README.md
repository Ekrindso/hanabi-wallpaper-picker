# Hanabi Wallpaper Picker

Расширение GNOME Shell: выбор, поиск и скачивание видео-обоев для [Hanabi](https://github.com/jeffshee/gnome-ext-hanabi) прямо из верхней панели.

*English below.*

## Возможности

- Список видео из папки `~/Видео/Обои` с превью, смена обоев в один клик.
- Поиск обоев на YouTube прямо из меню. Клик по результату скачивает видео (до 4K, первые 3 минуты) и сразу ставит его.
- 🎲 Случайные обои.
- Переключатели звука и паузы под развёрнутыми окнами (в играх видео не тратит FPS).

## Требования

- GNOME Shell 50
- Установленный [Hanabi](https://github.com/jeffshee/gnome-ext-hanabi)
- `yt-dlp`, `ffmpeg`, `python3`
- Для аппаратного декодирования в Hanabi: `gir1.2-gst-plugins-bad-1.0`, `gstreamer1.0-plugins-bad`

```bash
sudo apt install yt-dlp ffmpeg gir1.2-gst-plugins-bad-1.0 gstreamer1.0-plugins-bad
```

## Установка

```bash
git clone https://github.com/OWNER/hanabi-wallpaper-picker.git \
  ~/.local/share/gnome-shell/extensions/hanabi-wallpaper-picker@ekrindso
```

Перезайдите в сеанс и включите расширение:

```bash
gnome-extensions enable hanabi-wallpaper-picker@ekrindso
```

Совет: чтобы на панели не было двух значков, скройте собственное меню Hanabi в его настройках («Show Panel Menu»).

---

## English

A GNOME Shell extension to pick, search and download video wallpapers for [Hanabi](https://github.com/jeffshee/gnome-ext-hanabi) from the top panel.

- Lists videos from `~/Videos/Wallpapers` with thumbnails; one click to apply.
- Search YouTube from the menu; clicking a result downloads it (up to 4K, first 3 minutes) and applies it.
- 🎲 Random wallpaper.
- Toggles for sound and for pausing under maximized/fullscreen windows.

**Requirements:** GNOME Shell 50, Hanabi, `yt-dlp`, `ffmpeg`, `python3` (plus `gir1.2-gst-plugins-bad-1.0` for hardware decoding in Hanabi).

**Install:** clone into `~/.local/share/gnome-shell/extensions/hanabi-wallpaper-picker@ekrindso`, log out and back in, then run `gnome-extensions enable hanabi-wallpaper-picker@ekrindso`.

The menu language follows the system locale (Russian or English).

## License

MIT
