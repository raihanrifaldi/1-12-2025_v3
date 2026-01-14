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

  // Setup Search & Filter UI: Data Utama & History (shared search bar)
  setupMainFilters();
  setupHistoryFilters();
  setupUnifiedHistorySearch();

  // Setup a unified search bar in topnav that routes based on the active view
  function setupUnifiedHistorySearch() {
    const searchInput = document.getElementById("globalSearch");
    if (!searchInput) return;

    const searchWrapper = document.getElementById("searchContainerWrapper");
    const filterPanel = document.getElementById("filterPanel");
    const mainFilters = document.getElementById("allFiltersContainer");
    const historyFilters = document.getElementById("allFiltersContainerHistory");

    function routeSearch() {
      const activeView = document.querySelector(".view.active");
      if (!activeView) return;
      if (activeView.id === "view-history") applySearchAndFilterHistory();
      else if (activeView.id === "view-dashboard") applySearchAndFilterMain();
    }

    function updateSearchState() {
      const activeView = document.querySelector(".view.active");
      const isHistory = activeView && activeView.id === "view-history";
      const isDashboard = activeView && activeView.id === "view-dashboard";

      // show/hide whole search box
      if (searchWrapper) searchWrapper.style.display = isHistory || isDashboard ? "block" : "none";

      // update placeholder
      if (isHistory) searchInput.placeholder = "Search data history...";
      else if (isDashboard) searchInput.placeholder = "Search dashboard data...";
      else searchInput.placeholder = "";

      // when panel is visible, show correct inner filters
      if (filterPanel && !filterPanel.classList.contains("hidden")) {
        if (mainFilters) mainFilters.style.display = isDashboard ? "block" : "none";
        if (historyFilters) historyFilters.style.display = isHistory ? "block" : "none";
      }
      // show only relevant reset button
      const resetMainBtn = document.getElementById("resetFilters");
      const resetHistBtn = document.getElementById("resetFiltersHistory");
      if (resetMainBtn) resetMainBtn.style.display = isDashboard ? "inline-flex" : "none";
      if (resetHistBtn) resetHistBtn.style.display = isHistory ? "inline-flex" : "none";
    }

    // single routed input handler
    searchInput.removeEventListener("input", routeSearch);
    searchInput.addEventListener("input", routeSearch);

    // Sync initial state & when view changes
    updateSearchState();
    document.querySelectorAll(".menu-item").forEach((btn) => {
      btn.addEventListener("click", () => setTimeout(updateSearchState, 120));
    });
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
        // show correct inner filters when panel toggled
        const activeView = document.querySelector(".view.active");
        const mainFilters = document.getElementById("allFiltersContainer");
        const historyFilters = document.getElementById("allFiltersContainerHistory");
        if (filterPanel && !filterPanel.classList.contains("hidden")) {
          if (activeView && activeView.id === "view-history") {
            if (mainFilters) mainFilters.style.display = "none";
            if (historyFilters) historyFilters.style.display = "block";
            const rb = document.getElementById("resetFiltersHistory");
            const rm = document.getElementById("resetFilters");
            if (rb) rb.style.display = "inline-flex";
            if (rm) rm.style.display = "none";
          } else if (activeView && activeView.id === "view-dashboard") {
            if (mainFilters) mainFilters.style.display = "block";
            if (historyFilters) historyFilters.style.display = "none";
            const rb2 = document.getElementById("resetFiltersHistory");
            const rm2 = document.getElementById("resetFilters");
            if (rb2) rb2.style.display = "none";
            if (rm2) rm2.style.display = "inline-flex";
          } else {
            if (mainFilters) mainFilters.style.display = "none";
            if (historyFilters) historyFilters.style.display = "none";
            const rb3 = document.getElementById("resetFiltersHistory");
            const rm3 = document.getElementById("resetFilters");
            if (rb3) rb3.style.display = "none";
            if (rm3) rm3.style.display = "none";
          }
        }
      });
    }

    document.addEventListener("click", (e) => {
      if (filterPanel && !filterPanel.contains(e.target) && (!toggleBtn || !toggleBtn.contains(e.target))) {
        filterPanel.classList.add("hidden");
        toggleBtn.classList.remove("active");
      }
    });

    // Search input now handled by setupUnifiedHistorySearch

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
    // Nonaktifkan reset filter history (tidak melakukan apa-apa)
    const resetBtnHistory = document.getElementById("resetFiltersHistory");
    if (resetBtnHistory) {
      resetBtnHistory.addEventListener("click", () => {
        // Tidak ada filter yang perlu direset
      });
    }
  }
}
