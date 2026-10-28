# Hanabi Wallpaper Picker

Расширение GNOME Shell: выбор, поиск и скачивание видео-обоев для [Hanabi](https://github.com/jeffshee/gnome-ext-hanabi) прямо из верхней панели.

*English below.*

## Возможности

- Список видео из папки `~/Видео/Обои` с превью, смена обоев в один клик.
- Поиск обоев на YouTube прямо из меню. Клик по результату скачивает видео (до 4K, первые 3 минуты) и сразу ставит его.
- 🎲 Случайные обои.
- Переключатели звука и паузы под развёрнутыми окнами (в играх видео не тратит FPS).
- Несколько мониторов: своё видео на каждый экран (нужна доработка Hanabi, см. ниже).

## Своё видео на каждом мониторе

Сам Hanabi показывает одно видео на всех экранах. Доработка из папки `hanabi-patch` даёт каждому монитору свой плеер (без звука, звук идёт только от общего видео):

```bash
./hanabi-patch/install.sh
```

После перезахода в меню появится строка «Куда: Все мониторы / Монитор 1 / Монитор 2…» (только при двух и более мониторах). Обновление Hanabi затрёт доработку — просто запустите скрипт снова.

## Требования

- GNOME Shell 45–50
- Установленный [Hanabi](https://github.com/jeffshee/gnome-ext-hanabi)
- `yt-dlp`, `ffmpeg`, `python3`
- Для аппаратного декодирования в Hanabi: `gir1.2-gst-plugins-bad-1.0`, `gstreamer1.0-plugins-bad`

```bash
sudo apt install yt-dlp ffmpeg gir1.2-gst-plugins-bad-1.0 gstreamer1.0-plugins-bad gstreamer1.0-gtk4
```

## Установка

```bash
git clone https://github.com/Ekrindso/hanabi-wallpaper-picker.git
cd hanabi-wallpaper-picker
./install.sh
```

Скрипт скопирует расширение, проверит зависимости (подскажет команду для apt, dnf или pacman) и включит его. После этого перезайдите в сеанс.

Если чего-то не хватает, расширение не сломается, а подскажет прямо в меню: «Hanabi не установлен» или «Для поиска установи: yt-dlp».

> `yt-dlp` из репозиториев дистрибутива бывает устаревшим. Если YouTube перестал скачиваться, обновите его: `pipx install yt-dlp` или `pipx upgrade yt-dlp`.

Совет: чтобы на панели не было двух значков, скройте собственное меню Hanabi в его настройках («Show Panel Menu»).

---

## English

A GNOME Shell extension to pick, search and download video wallpapers for [Hanabi](https://github.com/jeffshee/gnome-ext-hanabi) from the top panel.

- Lists videos from `~/Videos/Wallpapers` with thumbnails; one click to apply.
- Search YouTube from the menu; clicking a result downloads it (up to 4K, first 3 minutes) and applies it.
- 🎲 Random wallpaper.
- Toggles for sound and for pausing under maximized/fullscreen windows.
- Multiple monitors: a different video on each screen. Requires patching Hanabi with `./hanabi-patch/install.sh` (re-run after Hanabi updates); extra monitors play muted.

**Requirements:** GNOME Shell 45–50, Hanabi, `yt-dlp`, `ffmpeg`, `python3` (plus `gir1.2-gst-plugins-bad-1.0` for hardware decoding in Hanabi).

**Install:**

```bash
git clone https://github.com/Ekrindso/hanabi-wallpaper-picker.git
cd hanabi-wallpaper-picker && ./install.sh
```

Then log out and back in. Missing pieces are reported right in the menu ("Hanabi is not installed", "To search, install: yt-dlp"). If YouTube downloads break, update yt-dlp (`pipx upgrade yt-dlp`).

The menu language follows the system locale (Russian or English).

## License

MIT
