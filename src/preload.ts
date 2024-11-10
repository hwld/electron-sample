import { contextBridge, ipcRenderer } from "electron";
import { EVENTS, IElectronAPI } from "./api";

const api: IElectronAPI = {
  onUpdate: (callback) => ipcRenderer.on(EVENTS.onUpdate, () => callback()),
  update: () => ipcRenderer.invoke(EVENTS.update),

  openMain: () => ipcRenderer.invoke(EVENTS.openMain),
  hideInput: () => ipcRenderer.invoke(EVENTS.hideInput),
  createTask: (title) => ipcRenderer.invoke(EVENTS.createTask, title),
  getTasks: () => ipcRenderer.invoke(EVENTS.getTasks),
};

contextBridge.exposeInMainWorld("API", api);
