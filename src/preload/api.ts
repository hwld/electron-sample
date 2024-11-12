import { ipcRenderer } from "electron";

export const api = {
  onUpdate: (callback): void => {
    ipcRenderer.on(EVENTS.onUpdate, () => callback());
  },
  update: (): void => {
    ipcRenderer.invoke(EVENTS.update);
  },

  openMain: (): void => {
    ipcRenderer.invoke(EVENTS.openMain);
  },
  hideInput: (): void => {
    ipcRenderer.invoke(EVENTS.hideInput);
  },
  createTask: (title): void => {
    ipcRenderer.invoke(EVENTS.createTask, title);
  },
  getTasks: (): Promise<{ title: string }[]> => {
    return ipcRenderer.invoke(EVENTS.getTasks);
  }
};

export const EVENTS = {
  openMain: "openMain",
  hideInput: "hideInput",
  createTask: "createTask",
  getTasks: "getTasks",

  onUpdate: "onUpdate",
  update: "update"
} as const;
