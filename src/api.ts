export type IElectronAPI = {
  [EVENTS.openMain]: () => void;
  [EVENTS.hideInput]: () => void;
  [EVENTS.createTask]: (title: string) => Promise<void>;
  [EVENTS.getTasks]: () => Promise<{ title: string }[]>;
  [EVENTS.onUpdate]: (callback: () => void) => void;
  [EVENTS.update]: () => void;
};

export const EVENTS = {
  openMain: "openMain",
  hideInput: "hideInput",
  createTask: "createTask",
  getTasks: "getTasks",

  onUpdate: "onUpdate",
  update: "update",
} as const;
