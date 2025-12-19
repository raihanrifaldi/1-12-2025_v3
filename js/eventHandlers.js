// eventHandlers.js - Event Listeners dan Initialization

import { DB_KEY_MAIN, DB_KEY_HISTORY, state } from "./config.js";
import { loadDatabase } from "./database.js";
import {
  generateFilterOptions,
  generateFilterOptionsHistory,
  applySearchAndFilterMain,
  applySearchAndFilterHistory,
} from "./filters.js";
import { renderGenericTable } from "./render.js";
import { updateDbStatusUI, showView } from "./ui.js";
import { processUpload } from "./upload.js";

export function initializeApp() {
  // Setup View Navigation
  document.querySelectorAll(".menu-item").forEach((btn) => {
    btn.addEventListener("click", () => showView(btn.getAttribute("data-view")));
  });

  // Load Database
  loadDatabase();

  // Setup Upload Logic: DATA UTAMA
  setupMainDataUpload();

  // Setup Upload Logic: HISTORY PEKERJAAN
  setupHistoryDataUpload();

  // Setup Search & Filter UI: Data Utama
  setupMainFilters();

  // Setup Search & Filter UI: History Data
  setupHistoryFilters();
}

function setupMainDataUpload() {
  const btnUploadMain = document.getElementById("btnUploadCsv");
  const inputCsvMain = document.getElementById("csvInput");
  const btnDeleteMain = document.getElementById("btnDeleteDb");
  const statusMain = document.getElementById("uploadStatus");

  if (btnUploadMain && inputCsvMain) {
    btnUploadMain.addEventListener("click", () => inputCsvMain.click());
    inputCsvMain.addEventListener("change", () => {
      processUpload(inputCsvMain, "main", statusMain);
    });
  }

  if (btnDeleteMain) {
    btnDeleteMain.addEventListener("click", () => {
      if (confirm("Hapus seluruh Data Utama?")) {
        localStorage.removeItem(DB_KEY_MAIN);
        state.mainData = [];
        state.mainHeaders = [];
        renderGenericTable([], [], "tableWrapper", "csvTableBody", "noDataMessage");
        generateFilterOptions([]);
        updateDbStatusUI(false, 0, null, "main");
        alert("Data Utama dihapus.");
      }
    });
  }
}

function setupHistoryDataUpload() {
  const btnUploadHist = document.getElementById("btnUploadHistory");
  const inputCsvHist = document.getElementById("csvHistoryInput");
  const btnDeleteHist = document.getElementById("btnDeleteHistory");
  const statusHist = document.getElementById("uploadHistoryStatus");

  if (btnUploadHist && inputCsvHist) {
    btnUploadHist.addEventListener("click", () => inputCsvHist.click());
    inputCsvHist.addEventListener("change", () => {
      processUpload(inputCsvHist, "history", statusHist);
    });
  }

  if (btnDeleteHist) {
    btnDeleteHist.addEventListener("click", () => {
      if (confirm("Hapus seluruh Data History?")) {
        localStorage.removeItem(DB_KEY_HISTORY);
        state.historyData = [];
        state.historyHeaders = [];
        generateFilterOptionsHistory([]);
        renderGenericTable([], [], "historyTableWrapper", "historyTableBody", "noHistoryMessage");
        updateDbStatusUI(false, 0, null, "history");
        alert("Data History dihapus.");
      }
    });
  }
}

function setupMainFilters() {
  const toggleBtn = document.getElementById("toggleFilterBtn");
  const filterPanel = document.getElementById("filterPanel");

  if (toggleBtn) {
    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      filterPanel.classList.toggle("hidden");
      toggleBtn.classList.toggle("active");
    });
  }

  document.addEventListener("click", (e) => {
    if (filterPanel && !filterPanel.contains(e.target) && !toggleBtn.contains(e.target)) {
      filterPanel.classList.add("hidden");
      toggleBtn.classList.remove("active");
    }
  });

  const searchInput = document.getElementById("globalSearch");
  if (searchInput) {
    searchInput.addEventListener("input", applySearchAndFilterMain);
  }

  const resetBtn = document.getElementById("resetFilters");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      const checkboxes = document.querySelectorAll("#allFiltersContainer input[type='checkbox']");
      checkboxes.forEach((cb) => (cb.checked = false));
      Object.keys(state.activeFilters).forEach((key) => state.activeFilters[key].clear());
      applySearchAndFilterMain();
    });
  }
}

function setupHistoryFilters() {
  const toggleBtnHistory = document.getElementById("toggleFilterBtnHistory");
  const filterPanelHistory = document.getElementById("filterPanelHistory");

  if (toggleBtnHistory) {
    toggleBtnHistory.addEventListener("click", (e) => {
      e.stopPropagation();
      filterPanelHistory.classList.toggle("hidden");
      toggleBtnHistory.classList.toggle("active");
    });
  }

  document.addEventListener("click", (e) => {
    if (
      filterPanelHistory &&
      !filterPanelHistory.contains(e.target) &&
      toggleBtnHistory &&
      !toggleBtnHistory.contains(e.target)
    ) {
      filterPanelHistory.classList.add("hidden");
      toggleBtnHistory.classList.remove("active");
    }
  });

  const searchInputHistory = document.getElementById("globalSearchHistory");
  if (searchInputHistory) {
    searchInputHistory.addEventListener("input", applySearchAndFilterHistory);
  }

  const resetBtnHistory = document.getElementById("resetFiltersHistory");
  if (resetBtnHistory) {
    resetBtnHistory.addEventListener("click", () => {
      const checkboxes = document.querySelectorAll("#allFiltersContainerHistory input[type='checkbox']");
      checkboxes.forEach((cb) => (cb.checked = false));
      Object.keys(state.activeFiltersHistory).forEach((key) => state.activeFiltersHistory[key].clear());
      applySearchAndFilterHistory();
    });
  }
}
