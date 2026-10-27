import Gio from "gi://Gio";
import GLib from "gi://GLib";
import GObject from "gi://GObject";
import Clutter from "gi://Clutter";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";
import * as PopupMenu from "resource:///org/gnome/shell/ui/popupMenu.js";
import St from "gi://St";
import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";

// Видео-обои Hanabi с панели: список видео из ~/Видео/Обои (~/Videos/Wallpapers), выбор - одним
// кликом (пишем ключ video-path в настройки Hanabi, он подхватывает сам).

const HANABI = "io.github.jeffshee.hanabi-extension";
const RU = GLib.get_language_names().some((l) => l.startsWith("ru"));
const T = RU ? {
    title: "Видео-обои", random: "🎲  Случайные обои", empty: "Папка пуста - положи видео в Видео/Обои",
    sound: "Звук", pause: "Пауза под окнами на весь экран", folder: "Открыть папку с обоями",
    prefs: "Настройки Hanabi", search: "Найти обои на YouTube…", nothing: "Ничего не нашлось",
    done: "Готово, обои поставлены", notify: "Обои", noHanabi: "Hanabi не установлен",
    searching: (q) => `Ищу «${q}»…`, downloading: (t) => `Скачиваю «${t}»…`, failed: (t) => `Не удалось скачать «${t}»`,
} : {
    title: "Video wallpapers", random: "🎲  Random wallpaper", empty: "Folder is empty - put videos into Videos/Wallpapers",
    sound: "Sound", pause: "Pause under maximized/fullscreen windows", folder: "Open wallpapers folder",
    prefs: "Hanabi settings", search: "Search wallpapers on YouTube…", nothing: "Nothing found",
    done: "Done, wallpaper applied", notify: "Wallpaper", noHanabi: "Hanabi is not installed",
    searching: (q) => `Searching “${q}”…`, downloading: (t) => `Downloading “${t}”…`, failed: (t) => `Failed to download “${t}”`,
};
const DIR = GLib.build_filenamev([GLib.get_user_special_dir(GLib.UserDirectory.DIRECTORY_VIDEOS) ?? GLib.get_home_dir(),
    RU ? "Обои" : "Wallpapers"]);
// Помощник лежит рядом с расширением; задаётся в enable().
let FETCH = null;
const VIDEO = /\.(mp4|webm|mkv|mov|avi|m4v|gif)$/i;

function hanabiSettings() {
    const dir = GLib.build_filenamev([GLib.get_user_data_dir(), "glib-2.0", "schemas"]);
    try {
        const src = Gio.SettingsSchemaSource.new_from_directory(dir, Gio.SettingsSchemaSource.get_default(), false);
        const schema = src.lookup(HANABI, true);
        return schema ? new Gio.Settings({ settings_schema: schema }) : null;
    } catch (_) {
        return null;
    }
}

function listVideos() {
    const out = [];
    try {
        const en = Gio.File.new_for_path(DIR).enumerate_children("standard::name,standard::type", Gio.FileQueryInfoFlags.NONE, null);
        let info;
        while ((info = en.next_file(null))) {
            if (info.get_file_type() === Gio.FileType.REGULAR && VIDEO.test(info.get_name()))
                out.push(info.get_name());
        }
    } catch (_) {}
    return out.sort((a, b) => a.localeCompare(b));
}

// Помощник wallpaper-fetch (yt-dlp) - асинхронно, оболочка не ждёт.
function fetch(args, done) {
    try {
        const proc = Gio.Subprocess.new(["python3", FETCH, DIR, ...args], Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_SILENCE);
        proc.communicate_utf8_async(null, null, (pr, res) => {
            let out = "";
            try {
                out = pr.communicate_utf8_finish(res)[1] ?? "";
            } catch (_) {}
            done(out.trim(), pr.get_successful());
        });
    } catch (e) {
        logError(e, "[wallpaper-picker]");
        done("", false);
    }
}

// Пункт меню с превью 16:9 слева.
function thumbItem(text, thumb) {
    const item = new PopupMenu.PopupBaseMenuItem();
    const pic = new St.Bin({ style: "width: 112px; height: 63px; border-radius: 8px; background-size: cover;" +
        (thumb ? ` background-image: url("file://${thumb}");` : " background-color: rgba(255,255,255,0.08);") });
    item.add_child(pic);
    item.add_child(new St.Label({ text, y_align: Clutter.ActorAlign.CENTER, x_expand: true,
        style: "max-width: 22em;" }));
    return item;
}

const fmtTime = (d) => `${Math.floor(d / 60)}:${String(d % 60).padStart(2, "0")}`;

const PickerButton = GObject.registerClass(
class PickerButton extends PanelMenu.Button {
    _init(settings) {
        super._init(0.5, "Wallpaper Picker");
        this._settings = settings;
        this.add_child(new St.Icon({ icon_name: "image-x-generic-symbolic", style_class: "system-status-icon" }));
        // Меню строим заново при каждом открытии - видео в папке могли поменяться.
        this.menu.connect("open-state-changed", (_m, open) => open && this._build());
        this._build();
    }

    _build() {
        this.menu.removeAll();
        const s = this._settings;
        if (!s) {
            this.menu.addMenuItem(new PopupMenu.PopupMenuItem(T.noHanabi, { reactive: false }));
            return;
        }
        this._buildSearch();
        const current = s.get_string("video-path");
        const videos = listVideos();
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem(T.title));
        if (videos.length > 1) {
            const rnd = new PopupMenu.PopupMenuItem(T.random);
            rnd.connect("activate", () => {
                const others = videos.map((n) => GLib.build_filenamev([DIR, n])).filter((v) => v !== current);
                s.set_string("video-path", others[Math.floor(Math.random() * others.length)]);
            });
            this.menu.addMenuItem(rnd);
        }
        if (!videos.length)
            this.menu.addMenuItem(new PopupMenu.PopupMenuItem(T.empty, { reactive: false }));
        for (const name of videos) {
            const path = GLib.build_filenamev([DIR, name]);
            const item = thumbItem(name.replace(VIDEO, ""), this._thumbs?.[path]);
            item.setOrnament(path === current ? PopupMenu.Ornament.CHECK : PopupMenu.Ornament.NONE);
            item.connect("activate", () => s.set_string("video-path", path));
            this.menu.addMenuItem(item);
        }

        // Превью своих видео - помощник делает их ffmpeg'ом; дорисуем, когда готовы.
        const missing = videos.map((n) => GLib.build_filenamev([DIR, n])).filter((v) => !this._thumbs?.[v] && !this._tried?.has(v));
        this._tried ??= new Set();
        missing.forEach((v) => this._tried.add(v));
        if (missing.length && !this._thumbsBusy) {
            this._thumbsBusy = true;
            fetch(["thumbs", ...missing], (out) => {
                this._thumbsBusy = false;
                try {
                    this._thumbs = { ...this._thumbs, ...JSON.parse(out) };
                } catch (_) {}
                if (this.menu.isOpen && Object.keys(this._thumbs ?? {}).length)
                    this._build();
            });
        }

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        const sound = new PopupMenu.PopupSwitchMenuItem(T.sound, !s.get_boolean("mute"));
        sound.connect("toggled", (_i, on) => s.set_boolean("mute", !on));
        this.menu.addMenuItem(sound);
        const pause = new PopupMenu.PopupSwitchMenuItem(T.pause, s.get_int("pause-on-maximize-or-fullscreen") !== 0);
        pause.connect("toggled", (_i, on) => s.set_int("pause-on-maximize-or-fullscreen", on ? 1 : 0));
        this.menu.addMenuItem(pause);

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        const folder = new PopupMenu.PopupMenuItem(T.folder);
        folder.connect("activate", () => Gio.AppInfo.launch_default_for_uri(Gio.File.new_for_path(DIR).get_uri(), null));
        this.menu.addMenuItem(folder);
        const prefs = new PopupMenu.PopupMenuItem(T.prefs);
        prefs.connect("activate", () => {
            try {
                Gio.Subprocess.new(["gnome-extensions", "prefs", "hanabi-extension@jeffshee.github.io"], Gio.SubprocessFlags.NONE);
            } catch (e) {
                logError(e, "[wallpaper-picker]");
            }
        });
        this.menu.addMenuItem(prefs);
    }

    // Поиск на YouTube: строка ввода, Enter - ищем, клик по результату - скачиваем
    // первые 3 минуты в папку обоев и сразу ставим.
    _buildSearch() {
        const row = new PopupMenu.PopupBaseMenuItem({ reactive: false });
        const entry = new St.Entry({ hint_text: T.search, can_focus: true, x_expand: true, style: "min-width: 22em;" });
        entry.clutter_text.connect("activate", () => {
            const q = entry.get_text().trim();
            if (!q)
                return;
            this._results = null;
            this._status = T.searching(q);
            this._query = q;
            this._build();
            fetch(["search", q], (out, ok) => {
                try {
                    this._results = ok ? JSON.parse(out) : [];
                } catch (_) {
                    this._results = [];
                }
                this._status = this._results.length ? null : T.nothing;
                if (this.menu.isOpen)
                    this._build();
            });
        });
        entry.set_text(this._query ?? "");
        row.add_child(entry);
        this.menu.addMenuItem(row);
        if (this.menu.isOpen)
            GLib.idle_add(GLib.PRIORITY_DEFAULT, () => {
                global.stage.set_key_focus(entry);
                return GLib.SOURCE_REMOVE;
            });

        if (this._status)
            this.menu.addMenuItem(new PopupMenu.PopupMenuItem(this._status, { reactive: false }));
        for (const r of this._results ?? []) {
            const busy = this._loading?.has(r.id);
            const item = thumbItem(`${busy ? "⏳ " : ""}${r.title.slice(0, 60)}\n${fmtTime(r.duration)}`, r.thumb);
            item.connect("activate", () => this._download(r));
            this.menu.addMenuItem(item);
        }
    }

    _download(r) {
        this._loading ??= new Set();
        if (this._loading.has(r.id))
            return;
        this._loading.add(r.id);
        Main.notify(T.notify, T.downloading(r.title));
        fetch(["get", r.id], (out, ok) => {
            this._loading.delete(r.id);
            const path = out.split("\n").pop();
            if (ok && path) {
                this._settings.set_string("video-path", path);
                Main.notify(T.notify, T.done);
            } else {
                Main.notify(T.notify, T.failed(r.title));
            }
            if (this.menu.isOpen)
                this._build();
        });
    }
});

export default class WallpaperPickerExtension extends Extension {
    enable() {
        FETCH = GLib.build_filenamev([this.path, "wallpaper-fetch"]);
        this._button = new PickerButton(hanabiSettings());
        Main.panel.addToStatusArea(this.uuid, this._button, 1, "right");
    }

    disable() {
        this._button?.destroy();
        this._button = null;
    }
}
