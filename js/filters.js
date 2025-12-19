// filters.js - Logika Filter untuk Main dan History

import { state } from "./config.js";
import { renderGenericTable } from "./render.js";

export function generateFilterOptions(data) {
  const container = document.getElementById("allFiltersContainer");
  if (!container) return;

  container.innerHTML = "";
  state.activeFilters = {};

  if (!state.mainHeaders.length || data.length === 0) {
    container.innerHTML =
      '<p class="text-muted" style="padding:10px;">Upload CSV/XLSX Data Utama untuk melihat filter.</p>';
    return;
  }

  const excludedColumns = ["ID", "NO", "NAME", "NAMA", "TANGGAL LAHIR"];

  state.mainHeaders.forEach((colName, index) => {
    if (excludedColumns.some((ex) => colName.toUpperCase().includes(ex))) return;

    state.activeFilters[colName] = new Set();

    const groupDiv = document.createElement("div");
    groupDiv.className = "filter-group-wrapper";

    const headerBtn = document.createElement("button");
    headerBtn.className = "filter-accordion-header";
    if (index === 0) headerBtn.classList.add("active");

    headerBtn.innerHTML = `<span class="filter-label-text">${colName}</span> <i class="fa-solid fa-chevron-down filter-icon"></i>`;

    const contentDiv = document.createElement("div");
    contentDiv.className = "filter-accordion-content";
    if (index === 0) contentDiv.style.maxHeight = "500px";

    const checkboxList = document.createElement("div");
    checkboxList.className = "checkbox-list";

    const uniqueValues = [...new Set(data.map((item) => item[colName]))]
      .filter((val) => val !== "" && val !== undefined)
      .sort();

    uniqueValues.forEach((value) => {
      const div = document.createElement("div");
      div.className = "checkbox-item";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = value;
      const safeId = `filter-${colName}-${value}`.replace(/[^a-zA-Z0-9-_]/g, "");
      checkbox.id = safeId;

      checkbox.addEventListener("change", (e) => {
        if (e.target.checked) state.activeFilters[colName].add(value);
        else state.activeFilters[colName].delete(value);
        applySearchAndFilterMain();
      });

      const lbl = document.createElement("label");
      lbl.setAttribute("for", safeId);
      lbl.textContent = value;

      div.appendChild(checkbox);
      div.appendChild(lbl);
      checkboxList.appendChild(div);
    });

    contentDiv.appendChild(checkboxList);
    groupDiv.appendChild(headerBtn);
    groupDiv.appendChild(contentDiv);
    container.appendChild(groupDiv);

    headerBtn.addEventListener("click", () => {
      headerBtn.classList.toggle("active");
      if (contentDiv.style.maxHeight) contentDiv.style.maxHeight = null;
      else contentDiv.style.maxHeight = contentDiv.scrollHeight + "px";
    });
  });
}

export function generateFilterOptionsHistory(data) {
  const container = document.getElementById("allFiltersContainerHistory");
  if (!container) return;

  container.innerHTML = "";
  state.activeFiltersHistory = {};

  if (!state.historyHeaders.length || data.length === 0) {
    container.innerHTML =
      '<p class="text-muted" style="padding:10px;">Upload CSV/XLSX History untuk melihat filter.</p>';
    return;
  }

  const excludedColumns = ["ID", "NO", "NAME", "NAMA", "TANGGAL LAHIR"];

  state.historyHeaders.forEach((colName, index) => {
    if (excludedColumns.some((ex) => colName.toUpperCase().includes(ex))) return;

    state.activeFiltersHistory[colName] = new Set();

    const groupDiv = document.createElement("div");
    groupDiv.className = "filter-group-wrapper";

    const headerBtn = document.createElement("button");
    headerBtn.className = "filter-accordion-header";
    if (index === 0) headerBtn.classList.add("active");

    headerBtn.innerHTML = `<span class="filter-label-text">${colName}</span> <i class="fa-solid fa-chevron-down filter-icon"></i>`;

    const contentDiv = document.createElement("div");
    contentDiv.className = "filter-accordion-content";
    if (index === 0) contentDiv.style.maxHeight = "500px";

    const checkboxList = document.createElement("div");
    checkboxList.className = "checkbox-list";

    const uniqueValues = [...new Set(data.map((item) => item[colName]))]
      .filter((val) => val !== "" && val !== undefined)
      .sort();

    uniqueValues.forEach((value) => {
      const div = document.createElement("div");
      div.className = "checkbox-item";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = value;
      const safeId = `filter-history-${colName}-${value}`.replace(/[^a-zA-Z0-9-_]/g, "");
      checkbox.id = safeId;

      checkbox.addEventListener("change", (e) => {
        if (e.target.checked) state.activeFiltersHistory[colName].add(value);
        else state.activeFiltersHistory[colName].delete(value);
        applySearchAndFilterHistory();
      });

      const lbl = document.createElement("label");
      lbl.setAttribute("for", safeId);
      lbl.textContent = value;

      div.appendChild(checkbox);
      div.appendChild(lbl);
      checkboxList.appendChild(div);
    });

    contentDiv.appendChild(checkboxList);
    groupDiv.appendChild(headerBtn);
    groupDiv.appendChild(contentDiv);
    container.appendChild(groupDiv);

    headerBtn.addEventListener("click", () => {
      headerBtn.classList.toggle("active");
      if (contentDiv.style.maxHeight) contentDiv.style.maxHeight = null;
      else contentDiv.style.maxHeight = contentDiv.scrollHeight + "px";
    });
  });
}

export function applySearchAndFilterMain() {
  const input = document.getElementById("globalSearch");
  const keyword = (input.value || "").toLowerCase();

  const filtered = state.mainData.filter((row) => {
    const matchesSearch = Object.values(row).some((val) => String(val).toLowerCase().includes(keyword));

    let matchesFilter = true;
    for (const [colName, selectedSet] of Object.entries(state.activeFilters)) {
      if (selectedSet.size > 0) {
        if (!selectedSet.has(row[colName])) {
          matchesFilter = false;
          break;
        }
      }
    }
    return matchesSearch && matchesFilter;
  });

  renderGenericTable(filtered, state.mainHeaders, "tableWrapper", "csvTableBody", "noDataMessage");
}

export function applySearchAndFilterHistory() {
  const input = document.getElementById("globalSearchHistory");
  const keyword = (input.value || "").toLowerCase();

  const filtered = state.historyData.filter((row) => {
    const matchesSearch = Object.values(row).some((val) => String(val).toLowerCase().includes(keyword));

    let matchesFilter = true;
    for (const [colName, selectedSet] of Object.entries(state.activeFiltersHistory)) {
      if (selectedSet.size > 0) {
        if (!selectedSet.has(row[colName])) {
          matchesFilter = false;
          break;
        }
      }
    }
    return matchesSearch && matchesFilter;
  });

  renderGenericTable(filtered, state.historyHeaders, "historyTableWrapper", "historyTableBody", "noHistoryMessage");
}
