// dashboard.js - Senior Dev Refactored Version with XLSX support (Dbase Sheet Enforced and Improved Resilience)



// === KONFIGURASI DATABASE ===
const DB_KEY_MAIN = "APP_HR_DATABASE_V1"; 
const DB_KEY_HISTORY = "APP_HR_HISTORY_V1"; 

// === STATE GLOBAL ===
let mainData = [];          
let mainHeaders = [];     
let activeFilters = {}; 

let historyData = [];
let historyHeaders = [];

// === 1. MANAJEMEN DATABASE (GENERIC) ===

function saveToDatabase(key, data, headers) {
    try {
        const payload = {
            timestamp: new Date().toISOString(),
            headers: headers,
            rows: data
        };
        localStorage.setItem(key, JSON.stringify(payload));
        return true;
    } catch (e) {
        console.error("Storage Full or Error:", e);
        alert("Gagal menyimpan. File terlalu besar untuk LocalStorage.");
        return false;
    }
}

function loadDatabase() {
    // 1. Load Data Utama
    const storedMain = localStorage.getItem(DB_KEY_MAIN);
    if (storedMain) {
        try {
            const parsed = JSON.parse(storedMain);
            mainData = parsed.rows || [];
            mainHeaders = parsed.headers || [];
            updateDbStatusUI(true, mainData.length, parsed.timestamp, 'main');
            
            generateFilterOptions(mainData);
            renderGenericTable(mainData, mainHeaders, 'tableWrapper', 'csvTableBody', 'noDataMessage');
        } catch(e) { console.error("Main DB Corrupt", e); }
    } else {
        updateDbStatusUI(false, 0, null, 'main');
    }

    // 2. Load Data History
    const storedHistory = localStorage.getItem(DB_KEY_HISTORY);
    if (storedHistory) {
        try {
            const parsedHist = JSON.parse(storedHistory);
            historyData = parsedHist.rows || [];
            historyHeaders = parsedHist.headers || [];
            updateDbStatusUI(true, historyData.length, parsedHist.timestamp, 'history');
            
            renderGenericTable(historyData, historyHeaders, 'historyTableWrapper', 'historyTableBody', 'noHistoryMessage');
        } catch(e) { console.error("History DB Corrupt", e); }
    } else {
        updateDbStatusUI(false, 0, null, 'history');
    }
}

function updateDbStatusUI(exists, count, time, type) {
    let statusId, btnDeleteId;
    
    if (type === 'main') {
        statusId = "dbStatusText";
        btnDeleteId = "btnDeleteDb";
    } else {
        statusId = "historyStatusText";
        btnDeleteId = "btnDeleteHistory";
    }

    const statusEl = document.getElementById(statusId);
    const btnDelete = document.getElementById(btnDeleteId);

    if (exists) {
        const dateObj = new Date(time).toLocaleString('id-ID');
        statusEl.innerHTML = `<span style="color: green;">Tersimpan (${count} baris)</span>. <br><small>Update: ${dateObj}</small>`;
        if(btnDelete) btnDelete.style.display = "inline-flex";
    } else {
        statusEl.innerHTML = `<span style="color: #6b7280;">Kosong</span>`;
        if(btnDelete) btnDelete.style.display = "none";
    }
}

// === 2. PARSER FILE (CSV & XLSX) ===

function parseCsv(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) return { data: [], headers: [] };

  const headerLine = lines[0];
  const delimiter = headerLine.includes(";") ? ";" : ",";
  const headers = headerLine.split(delimiter).map(h => h.trim());

  const dataRows = lines.slice(1);
  const data = dataRows.map(line => {
    const cols = line.split(delimiter).map(s => s.trim());
    let rowObj = {};
    headers.forEach((header, index) => {
      rowObj[header] = cols[index] || ""; 
    });
    return rowObj;
  });

  return { data, headers };
}

// Parser BARU untuk XLSX (Biner) - Membutuhkan SheetJS Library
function parseXlsx(data) {
    // Membaca file biner
    const workbook = XLSX.read(data, { type: 'binary' });
    
    // Target sheet: "Dbase"
    const sheetNameExact = "Sheet1";
    const sheetNames = workbook.SheetNames;
    let sheetToUse = null;

    if (sheetNames.length === 0) {
        throw new Error("File XLSX tidak memiliki sheet data.");
    }
    
    // 1. Cek Kecocokan Eksak (Case-Sensitive)
    if (sheetNames.includes(sheetNameExact)) {
        sheetToUse = sheetNameExact;
    } else {
        // 2. Cek Kecocokan Fleksibel (Case-Insensitive dan mengandung 'dbase')
        const flexibleMatch = sheetNames.find(name => name.toLowerCase().includes('dbase'));
        if (flexibleMatch) {
            console.warn(`Menggunakan sheet '${flexibleMatch}' karena tidak ditemukan sheet eksak 'Dbase'.`);
            sheetToUse = flexibleMatch;
        } else {
            // 3. Gagal: Beri pesan error informatif
            const availableSheets = sheetNames.join(', ');
            throw new Error(`Sheet dengan nama **"${sheetNameExact}"** tidak ditemukan. 
                Sheet yang tersedia: [${availableSheets}]. 
                Harap periksa ejaan dan pastikan sheet "Dbase" ada.`);
        }
    }

    const worksheet = workbook.Sheets[sheetToUse];

    // Konversi sheet menjadi array of objects (JSON)
    const dataJson = XLSX.utils.sheet_to_json(worksheet);

    if (dataJson.length === 0) return { data: [], headers: [] };

    // Ambil header dari key object pertama
    const headers = Object.keys(dataJson[0]);

    return { data: dataJson, headers };
}

// === 3. RENDER TABEL (GENERIC / REUSABLE) ===

function renderGenericTable(data, headers, wrapperId, tbodyId, noDataMsgId) {
    const wrapper = document.getElementById(wrapperId);
    const tbody = document.getElementById(tbodyId);
    const noDataMsg = document.getElementById(noDataMsgId);
    const table = wrapper ? wrapper.querySelector("table") : null;
    const thead = table ? table.querySelector("thead") : null;

    if (!wrapper || !tbody) return;

    tbody.innerHTML = "";
    if (thead) thead.innerHTML = "";

    if (!data || data.length === 0) {
        wrapper.style.display = "none";
        if (noDataMsg) noDataMsg.style.display = "block";
        return;
    }

    wrapper.style.display = "block";
    if (noDataMsg) noDataMsg.style.display = "none";

    const trHead = document.createElement("tr");
    headers.forEach(h => {
        const th = document.createElement("th");
        th.textContent = h;
        trHead.appendChild(th);
    });
    if (thead) thead.appendChild(trHead);

    const maxRender = 200; 
    data.slice(0, maxRender).forEach(row => {
        const tr = document.createElement("tr");
        headers.forEach(h => {
            const td = document.createElement("td");
            td.textContent = row[h] || "";
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    if (data.length > maxRender) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td colspan="${headers.length}" style="text-align:center; font-style:italic; padding:10px; background:#fff;">... menampilkan ${maxRender} dari ${data.length} data ...</td>`;
        tbody.appendChild(tr);
    }
}

// === 4. FILTER LOGIC (KHUSUS DASHBOARD UTAMA) ===

function generateFilterOptions(data) {
  const container = document.getElementById("allFiltersContainer");
  if(!container) return;
  
  container.innerHTML = "";
  activeFilters = {}; 

  if (!mainHeaders.length || data.length === 0) {
    container.innerHTML = '<p class="text-muted" style="padding:10px;">Upload CSV/XLSX Data Utama untuk melihat filter.</p>';
    return;
  }

  const excludedColumns = ["ID", "NO", "NAME", "NAMA", "TANGGAL LAHIR"]; 

  mainHeaders.forEach((colName, index) => {
    if (excludedColumns.some(ex => colName.toUpperCase().includes(ex))) return;

    activeFilters[colName] = new Set(); 

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

    const uniqueValues = [...new Set(data.map(item => item[colName]))]
                          .filter(val => val !== "" && val !== undefined)
                          .sort();
    
    uniqueValues.forEach(value => {
        const div = document.createElement("div");
        div.className = "checkbox-item";
        
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = value;
        const safeId = `filter-${colName}-${value}`.replace(/[^a-zA-Z0-9-_]/g, '');
        checkbox.id = safeId;

        checkbox.addEventListener("change", (e) => {
            if (e.target.checked) activeFilters[colName].add(value);
            else activeFilters[colName].delete(value);
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

function applySearchAndFilterMain() {
  const input = document.getElementById("globalSearch");
  const keyword = (input.value || "").toLowerCase();
  
  const filtered = mainData.filter((row) => {
    const matchesSearch = Object.values(row).some((val) => 
      String(val).toLowerCase().includes(keyword)
    );

    let matchesFilter = true;
    for (const [colName, selectedSet] of Object.entries(activeFilters)) {
      if (selectedSet.size > 0) {
         if (!selectedSet.has(row[colName])) { matchesFilter = false; break; }
      }
    }
    return matchesSearch && matchesFilter;
  });

  renderGenericTable(filtered, mainHeaders, 'tableWrapper', 'csvTableBody', 'noDataMessage');
}

// === 5. INITIALIZATION & EVENT LISTENERS ===
document.addEventListener("DOMContentLoaded", () => {
  
  const showView = (viewName) => {
    document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
    const target = document.getElementById(`view-${viewName}`);
    if(target) target.classList.add("active");

    document.querySelectorAll(".menu-item").forEach(b => {
       b.classList.toggle("active", b.getAttribute("data-view") === viewName);
    });
  };

  document.querySelectorAll(".menu-item").forEach(btn => {
    btn.addEventListener("click", () => showView(btn.getAttribute("data-view")));
  });

  loadDatabase();

  // C. UPLOAD LOGIC: DATA UTAMA
  const btnUploadMain = document.getElementById("btnUploadCsv");
  const inputCsvMain = document.getElementById("csvInput");
  const btnDeleteMain = document.getElementById("btnDeleteDb");
  const statusMain = document.getElementById("uploadStatus");

  if(btnUploadMain && inputCsvMain) {
      btnUploadMain.addEventListener("click", () => inputCsvMain.click());
      inputCsvMain.addEventListener("change", () => {
         processUpload(inputCsvMain, 'main', statusMain);
      });
  }
  if(btnDeleteMain) {
      btnDeleteMain.addEventListener("click", () => {
          if(confirm("Hapus seluruh Data Utama?")) {
              localStorage.removeItem(DB_KEY_MAIN);
              mainData = []; mainHeaders = [];
              renderGenericTable([], [], 'tableWrapper', 'csvTableBody', 'noDataMessage');
              generateFilterOptions([]);
              updateDbStatusUI(false, 0, null, 'main');
              alert("Data Utama dihapus.");
          }
      });
  }

  // D. UPLOAD LOGIC: HISTORY PEKERJAAN
  const btnUploadHist = document.getElementById("btnUploadHistory");
  const inputCsvHist = document.getElementById("csvHistoryInput");
  const btnDeleteHist = document.getElementById("btnDeleteHistory");
  const statusHist = document.getElementById("uploadHistoryStatus");

  if(btnUploadHist && inputCsvHist) {
      btnUploadHist.addEventListener("click", () => inputCsvHist.click());
      inputCsvHist.addEventListener("change", () => {
          processUpload(inputCsvHist, 'history', statusHist);
      });
  }
  if(btnDeleteHist) {
      btnDeleteHist.addEventListener("click", () => {
          if(confirm("Hapus seluruh Data History?")) {
              localStorage.removeItem(DB_KEY_HISTORY);
              historyData = []; historyHeaders = [];
              renderGenericTable([], [], 'historyTableWrapper', 'historyTableBody', 'noHistoryMessage');
              updateDbStatusUI(false, 0, null, 'history');
              alert("Data History dihapus.");
          }
      });
  }

  // Helper Process Upload (Menentukan Parser berdasarkan ekstensi file)
  function processUpload(inputElement, type, statusElement) {
    const file = inputElement.files[0];
    if(!file) return;

    const fileName = file.name.toLowerCase();
    const isXlsx = fileName.endsWith('.xlsx');
    const isCsv = fileName.endsWith('.csv');
    let readerType = 'readAsText';
    
    if (isXlsx) {
        readerType = 'readAsBinaryString';
    } else if (!isCsv) {
        if(statusElement) { statusElement.textContent = "Error: Hanya mendukung .csv atau .xlsx"; statusElement.style.color="red"; }
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            let result;
            
            if (isXlsx) {
                // Panggil parser XLSX, dengan logic pencarian 'dbase' yang lebih kuat
                result = parseXlsx(e.target.result); 
            } else {
                // Panggil parser CSV.
                result = parseCsv(e.target.result);
            }

            if(result.data.length === 0) throw new Error("File kosong atau format data salah.");

            const { data, headers } = result;
            let success = false;

            if (type === 'main') {
                mainData = data;
                mainHeaders = headers;
                success = saveToDatabase(DB_KEY_MAIN, mainData, mainHeaders);
                if (success) {
                    updateDbStatusUI(true, mainData.length, new Date(), 'main');
                    generateFilterOptions(mainData);
                    renderGenericTable(mainData, mainHeaders, 'tableWrapper', 'csvTableBody', 'noDataMessage');
                    showView('dashboard');
                }
            } else {
                historyData = data;
                historyHeaders = headers;
                success = saveToDatabase(DB_KEY_HISTORY, historyData, historyHeaders);
                if (success) {
                    updateDbStatusUI(true, historyData.length, new Date(), 'history');
                    renderGenericTable(historyData, historyHeaders, 'historyTableWrapper', 'historyTableBody', 'noHistoryMessage');
                    showView('history');
                }
            }
            
            if(success && statusElement) { 
                statusElement.textContent = `Upload Data ${type === 'main' ? 'Utama' : 'History'} Sukses (${data.length} baris)!`; 
                statusElement.style.color="green"; 
            }

        } catch(err) {
            console.error(err);
            if(statusElement) { 
                // Menampilkan pesan error dari parser
                // Pesan error dari parseXlsx kini lebih detail (menyebutkan sheet yang tersedia)
                statusElement.innerHTML = "Error loading file: <br>" + err.message; 
                statusElement.style.color="red"; 
            }
        }
    };
    
    if (readerType === 'readAsText') {
        reader.readAsText(file);
    } else {
        reader.readAsBinaryString(file);
    }

    inputElement.value = ''; 
  }

  // E. SEARCH & FILTER UI (Hanya Data Utama)
  const toggleBtn = document.getElementById("toggleFilterBtn");
  const filterPanel = document.getElementById("filterPanel");
  
  if(toggleBtn) {
      toggleBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          filterPanel.classList.toggle("hidden");
          toggleBtn.classList.toggle("active");
      });
  }
  document.addEventListener("click", (e) => {
      if(filterPanel && !filterPanel.contains(e.target) && !toggleBtn.contains(e.target)) {
          filterPanel.classList.add("hidden");
          toggleBtn.classList.remove("active");
      }
  });

  const searchInput = document.getElementById("globalSearch");
  if(searchInput) {
      searchInput.addEventListener("input", applySearchAndFilterMain);
  }
  
  const resetBtn = document.getElementById("resetFilters");
  if(resetBtn) {
      resetBtn.addEventListener("click", () => {
         const checkboxes = document.querySelectorAll("#allFiltersContainer input[type='checkbox']");
         checkboxes.forEach(cb => cb.checked = false);
         Object.keys(activeFilters).forEach(key => activeFilters[key].clear());
         applySearchAndFilterMain();
      });
  }
});