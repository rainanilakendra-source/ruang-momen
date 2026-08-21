import { LocalStorage, type StorageProvider } from "./local";

export const storage: StorageProvider = new LocalStorage();
