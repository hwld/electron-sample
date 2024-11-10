import { contextBridge, ipcRenderer } from "electron";
import { API, IElectronAPI } from "./api";

const api: IElectronAPI = {
  openMain: () => ipcRenderer.send(API.openMain),
  hideInput: () => ipcRenderer.send(API.hideInput),
};

contextBridge.exposeInMainWorld("API", api);
