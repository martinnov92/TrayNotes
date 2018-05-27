const path = require('path');
const electron = require('electron');
const {
    app,
    Tray,
    ipcMain,
    BrowserWindow
} = require('electron');

let trayIcon;
let interval;
let mainWindow;
let NOTES = [];
let visible = false;

const WIDTH = 500;
const HEIGHT = 600;
const TIMEOUT = 3000;
const MAX_CHARS = 30;
// nastavení tray icony
const ASSETS_DIR = path.join(__dirname, '../assets');
const ICON_NAME = 'img/note@2x.png';
const ICON_PATH = path.join(ASSETS_DIR, ICON_NAME);

function createWindow () {
    // skrýt ikonu v docku hned po startu
    if (process.platform === 'darwin') {
        app.dock.hide();
    }

    // nastavení okna
    mainWindow = new BrowserWindow({
        width: WIDTH,
        height: HEIGHT,
        show: false,
        frame: false,
        resizable: false,
        transparent: true,
    });

    // načtení prostředí okna
    if (process.env.NODE_ENV === 'production') {
        mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, '../build/index.html'),
            protocol: 'file:',
            slashes: true
        }));
    } else {
        mainWindow.loadURL('http://localhost:3000');
    }

    trayIcon = new Tray(ICON_PATH);
    trayIcon.setToolTip('Otevřít aplikaci');

    trayIcon.on('click', (event, bounds, position) => {
        const { screen } = electron;

        if (mainWindow.isVisible()) {
            return mainWindow.hide();
        }

        mainWindow.webContents.send('open', bounds);
        const cursor = screen.getCursorScreenPoint();
        const primary = screen.getPrimaryDisplay().workAreaSize;

        mainWindow.setPosition(cursor.x, cursor.y);
        mainWindow.show();

        console.log('tray icon klik', bounds, position, cursor, primary);
    });

    // dev
    mainWindow.webContents.openDevTools();

    // main window events
    mainWindow.on('blur', () => {
        // zobrazit poznámky, pokud je okno zavřené
        visible = false;
        rotateTitles(NOTES);

        // skrýt okno
        mainWindow.hide();
    });

    mainWindow.on('show', () => {
        visible = true;

        clearInterval(interval);
        setDefaultIcon();
        trayIcon.setTitle('');
        trayIcon.setToolTip('');
    });

    mainWindow.on('closed', () => {
        // zničit okno
        visible = false;
        mainWindow = null;
    });

    // 
    ipcMain.on('notes', (event, data = []) => {
        NOTES = data;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

// helpers
function setDefaultIcon() {
    trayIcon.setImage(path.join(ASSETS_DIR, '/img/note@2x.png'));
}

function setTitle(title = '') {
    let t = title;
    const count = t.length;

    if (count >= MAX_CHARS) {
        t = t.slice(0, MAX_CHARS - 3) + '...';
    } else {
        t = t.padEnd(MAX_CHARS - count, ' ');
    }

    trayIcon.setTitle(t);
    trayIcon.setToolTip(title);
}

function rotateTitles(notes) {
    if (notes.length === 0) {
        return;
    }

    trayIcon.setImage(path.join(ASSETS_DIR, 'img/empty.png'));

    for (let i = 0; i <= notes.length; i++) {
        (function(i) {
            interval = setTimeout(() => {
                setTitle(notes[i]);

                if (i === notes.length) {
                    clearInterval(interval);
                    return rotateTitles(notes);
                }
            }, TIMEOUT * i);
        })(i);
    }
}
