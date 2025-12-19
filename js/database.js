// database.js - Manajemen Database LocalStorage

import { DB_KEY_MAIN, DB_KEY_HISTORY, state } from "./config.js";
import { updateDbStatusUI } from "./ui.js";
import { generateFilterOptions, generateFilterOptionsHistory } from "./filters.js";
import { renderGenericTable } from "./render.js";

export function saveToDatabase(key, data, headers) {
  try {
    const payload = {
      timestamp: new Date().toISOString(),
      headers: headers,
      rows: data,
    };
    localStorage.setItem(key, JSON.stringify(payload));
    return true;
  } catch (e) {
    console.error("Storage Full or Error:", e);
    alert("Gagal menyimpan. File terlalu besar untuk LocalStorage.");
    return false;
  }
}

export function loadDatabase() {
  // 1. Load Data Utama
  const storedMain = localStorage.getItem(DB_KEY_MAIN);
  if (storedMain) {
    try {
      const parsed = JSON.parse(storedMain);
      state.mainData = parsed.rows || [];
      state.mainHeaders = parsed.headers || [];
      updateDbStatusUI(true, state.mainData.length, parsed.timestamp, "main");

      generateFilterOptions(state.mainData);
      renderGenericTable(state.mainData, state.mainHeaders, "tableWrapper", "csvTableBody", "noDataMessage");
    } catch (e) {
      console.error("Main DB Corrupt", e);
    }
  } else {
    updateDbStatusUI(false, 0, null, "main");
  }

  // 2. Load Data History
  const storedHistory = localStorage.getItem(DB_KEY_HISTORY);
  if (storedHistory) {
    try {
      const parsedHist = JSON.parse(storedHistory);
      state.historyData = parsedHist.rows || [];
      state.historyHeaders = parsedHist.headers || [];
      updateDbStatusUI(true, state.historyData.length, parsedHist.timestamp, "history");

      generateFilterOptionsHistory(state.historyData);
      renderGenericTable(
        state.historyData,
        state.historyHeaders,
        "historyTableWrapper",
        "historyTableBody",
        "noHistoryMessage"
      );
    } catch (e) {
      console.error("History DB Corrupt", e);
    }
  } else {
    updateDbStatusUI(false, 0, null, "history");
  }
}
