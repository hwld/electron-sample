import { IElectronAPI } from "./api";

declare global {
  interface Window {
    API: IElectronAPI;
  }
}
