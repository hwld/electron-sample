export type IElectronAPI = {
  [API.openMain]: () => void;
  [API.hideInput]: () => void;
};

export const API = {
  openMain: "openMain",
  hideInput: "hideInput",
} as const;
