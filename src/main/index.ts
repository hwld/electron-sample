import { app, shell, BrowserWindow, ipcMain, globalShortcut } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import { EVENTS } from "../preload/api";

const ELECTRON_RENDERER_URL = process.env["ELECTRON_RENDERER_URL"];

function createMainWindow(): BrowserWindow {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, "../preload/index.js")
    }
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(`${ELECTRON_RENDERER_URL}/main-window.html`);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/main-window.html"));
  }

  return mainWindow;
}

function createInputPanel(): BrowserWindow {
  const inputPanel = new BrowserWindow({
    width: 300,
    height: 50,
    webPreferences: {
      preload: join(__dirname, "../preload/index.js")
    },
    roundedCorners: false,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    transparent: true,
    show: false,
    type: "panel"
  });

  if (is.dev && ELECTRON_RENDERER_URL) {
    inputPanel.loadURL(`${ELECTRON_RENDERER_URL}/input-panel.html`);
  } else {
    inputPanel.loadFile(join(__dirname, "../renderer/input-panel.html"));
  }

  return inputPanel;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId("com.electron");

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  const mainWindow = createMainWindow();
  const inputPanel = createInputPanel();

  app.on("activate", function () {
    if (!mainWindow.isVisible()) {
      mainWindow.show();
    }
  });

  let isQuitting = false;
  app.on("before-quit", () => {
    isQuitting = true;
  });

  mainWindow.on("close", (e) => {
    if (!isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });

  inputPanel.on("blur", () => {
    inputPanel.hide();
  });

  ipcMain.handle(EVENTS.openMain, () => {
    inputPanel.hide();
    mainWindow.show();
  });

  ipcMain.handle(EVENTS.hideInput, () => {
    inputPanel.hide();
  });

  ipcMain.handle(EVENTS.createTask, async (_, title: string) => {
    // TODO:
    console.log(title);
  });

  ipcMain.handle(EVENTS.getTasks, async () => {
    return [];
  });

  ipcMain.handle(EVENTS.update, async () => {
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send(EVENTS.onUpdate);
    });
  });

  globalShortcut.register("Ctrl+Shift+P", () => {
    if (inputPanel.isVisible()) {
      inputPanel.hide();
    } else {
      inputPanel.show();
      inputPanel.focus();
    }
  });
});
