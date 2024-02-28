// Загрузка модулей
const { app, ipcMain, dialog } = require("electron");
const { autoUpdater } = require("electron-updater");
const os = require("os");
const fs = require("fs");
const path = require("path");
var spawn = require("child_process").spawn;
fs.mkdirSync(path.join(app.getPath("userData"), "logs"), { recursive: true });

var pjson = require("./package.json");
const APPVER = pjson.version; // Версия из package.json

const DEFAULT_USER_AGENT = "Seeroy/FrogLauncher " + APPVER;

// Создаём глобальные переменные для хранения BrowserWindow
global.mainWindowObject;
global.consoleWindowObject;

// Кастомные модули
var startTimer = require("./modules/starttimer"); // Модуль для получения времени запуска оболочки
var logging = require("./modules/logging"); // Модуль для стилизации логов
var ipcHandlers = require("./modules/ipc"); // Модуль с хэндлерами IPC
var mainWindow = require("./windows/mainWindow"); // Модуль для создания главного окна
var consoleWindow = require("./windows/consoleWindow"); // Модуль для окна консоли

logging.default("Debug", "Starting FrogLauncher at " + Date.now());

logging.inverse(
  "FrogLauncher " +
    APPVER +
    " on " +
    os.hostname() +
    " | " +
    os.cpus()[0].model +
    " | " +
    Math.round(os.totalmem() / (1024 * 1024 * 1024)) +
    " Gb RAM"
);
logging.inverse("Developed by Seeroy");
logging.default("Debug", "node version: " + process.versions["node"]);
logging.default("Debug", "chrome version: " + process.versions["chrome"]);
logging.default("Debug", "electron version: " + process.versions["electron"]);

app.whenReady().then(() => {
  ipcMain.on("get-appdata-path", (event) => {
    event.returnValue = app.getPath("userData");
    mainWindowObject.webContents.userAgent = DEFAULT_USER_AGENT;
    consoleWindowObject.webContents.userAgent = DEFAULT_USER_AGENT;
  });

  mainWindow.create(function () {
    autoUpdater.checkForUpdates();
    startTimer.checkStartTimer();
  });
  consoleWindow.create();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow.create(function () {
        autoUpdater.checkForUpdates();
        startTimer.checkStartTimer();
      });
      consoleWindow.create();
    }
  });

  autoUpdater.on("update-available", () => {
    mainWindowObject.webContents.send("update-available");
  });
  autoUpdater.on("update-downloaded", () => {
    mainWindowObject.webContents.send("update-downloaded");
  });

  ipcMain.on("install-update", () => {
    autoUpdater.quitAndInstall();
  });

  ipcMain.on("log-browser-console", ipcHandlers.handleBrowserLog);
  ipcMain.on("log-browser-console-only", ipcHandlers.handleBrowserLogOnly);

  ipcMain.on("close-console-window", () => {
    consoleWindowObject.hide();
  });
  ipcMain.on("open-console-window", () => {
    if (!consoleWindowObject.isVisible()) {
      consoleWindowObject.show();
    } else {
      consoleWindowObject.focus();
    }
  });
  ipcMain.on("hide-console-window", () => {
    consoleWindowObject.minimize();
  });

  ipcMain.on("close-main-window", () => {
    if (consoleWindowObject != null) {
      consoleWindowObject.close();
      consoleWindowObject = null;
    }
    mainWindowObject.close();
    mainWindowObject = null;
    app.exit(0);
  });

  ipcMain.on("hide-main-window", () => {
    mainWindowObject.minimize();
  });

  ipcMain.on("disappear-main-window", () => {
    mainWindowObject.hide();
  });

  ipcMain.on("appear-main-window", () => {
    mainWindowObject.show();
    mainWindowObject.focus();
  });

  ipcMain.on("focus-fix", () => {
    mainWindowObject.blur();
    mainWindowObject.focus();
  });

  ipcMain.on("restart-launcher", () => {
    app.relaunch();
    app.exit();
  });

  ipcMain.on("open-gd-dialog", (event) => {
    var dialogRet = dialog.showOpenDialogSync({
      properties: ["openDirectory", "dontAddToRecent"],
      buttonLabel: "Выбрать",
      title: "Выберите папку для хранения файлов игры",
    });
    if (dialogRet !== undefined) {
      event.sender.send("get-gd-result", dialogRet[0]);
    } else {
      event.sender.send("get-gd-result", false);
    }
  });

  ipcMain.on("open-bg-dialog", (event) => {
    var dialogBg = dialog.showOpenDialogSync({
      properties: ["openFile", "dontAddToRecent"],
      filters: [
        { name: "Изображение .png", extensions: ["png"] },
        { name: "Изображение .jpg (.jpeg)", extensions: ["jpg", "jpeg"] },
        { name: "Изображение .gif", extensions: ["gif"] },
      ],
      buttonLabel: "Выбрать",
      title: "Выберите изображение для фона в лаунчере",
    });
    if (dialogBg !== undefined) {
      event.sender.send("get-bg-result", dialogBg[0]);
    } else {
      event.sender.send("get-bg-result", false);
    }
  });
});