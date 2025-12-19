// config.js - Konfigurasi dan State Global

// === KONFIGURASI DATABASE ===
export const DB_KEY_MAIN = "APP_HR_DATABASE_V1";
export const DB_KEY_HISTORY = "APP_HR_HISTORY_V1";

// === STATE GLOBAL ===
export const state = {
  mainData: [],
  mainHeaders: [],
  activeFilters: {},

  historyData: [],
  historyHeaders: [],
  activeFiltersHistory: {},
};
