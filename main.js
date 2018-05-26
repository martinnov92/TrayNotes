const path = require('path');
const electron = require('electron');
const {
    app,
    Tray,
    BrowserWindow
} = require('electron');

let trayIcon;
let mainWindow;

const WIDTH = 500;
const HEIGHT = 600;
const MAX_CHARS = 30;
const ASSETS_DIR = path.join(__dirname, 'assets');

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
    mainWindow.loadFile('renderer/index.html');

    // nastavení tray icony
    const iconName = 'img/note@2x.png';
    const iconPath = path.join(ASSETS_DIR, iconName);

    trayIcon = new Tray(iconPath);
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
    mainWindow.webContents.openDevTools()

    // zobrazit poznámky hned po startu
    setTitle('Poznámky hned po startu');

    // main window events
    mainWindow.on('blur', () => {
        // zobrazit poznámky, pokud je okno zavřené
        setTitle('Toto je titulek. Toto je titulek. Toto je titulek. Toto je titulek. Toto je titulek.');

        // skrýt okno
        mainWindow.hide();
    });

    mainWindow.on('show', () => {
        setTitle();
    });

    mainWindow.on('closed', () => {
        // zničit okno
        mainWindow = null;
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
function setTitle(title = '') {
    let t = title;

    if (t.length >= MAX_CHARS) {
        t = t.slice(0, MAX_CHARS - 3) + '...';
    }

    trayIcon.setTitle(t);
}
