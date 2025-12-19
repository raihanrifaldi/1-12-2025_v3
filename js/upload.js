// upload.js - Logika Upload dan Processing File

import { DB_KEY_MAIN, DB_KEY_HISTORY, state } from "./config.js";
import { saveToDatabase } from "./database.js";
import { parseCsv, parseXlsx } from "./parsers.js";
import { generateFilterOptions, generateFilterOptionsHistory } from "./filters.js";
import { renderGenericTable } from "./render.js";
import { updateDbStatusUI, showView } from "./ui.js";

export function processUpload(inputElement, type, statusElement) {
  const file = inputElement.files[0];
  if (!file) return;

  const fileName = file.name.toLowerCase();
  const isXlsx = fileName.endsWith(".xlsx");
  const isCsv = fileName.endsWith(".csv");
  let readerType = "readAsText";

  if (isXlsx) {
    readerType = "readAsBinaryString";
  } else if (!isCsv) {
    if (statusElement) {
      statusElement.textContent = "Error: Hanya mendukung .csv atau .xlsx";
      statusElement.style.color = "red";
    }
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

      if (result.data.length === 0) throw new Error("File kosong atau format data salah.");

      const { data, headers } = result;
      let success = false;

      if (type === "main") {
        state.mainData = data;
        state.mainHeaders = headers;
        success = saveToDatabase(DB_KEY_MAIN, state.mainData, state.mainHeaders);
        if (success) {
          updateDbStatusUI(true, state.mainData.length, new Date(), "main");
          generateFilterOptions(state.mainData);
          renderGenericTable(state.mainData, state.mainHeaders, "tableWrapper", "csvTableBody", "noDataMessage");
          showView("dashboard");
        }
      } else {
        state.historyData = data;
        state.historyHeaders = headers;
        success = saveToDatabase(DB_KEY_HISTORY, state.historyData, state.historyHeaders);
        if (success) {
          updateDbStatusUI(true, state.historyData.length, new Date(), "history");
          generateFilterOptionsHistory(state.historyData);
          renderGenericTable(
            state.historyData,
            state.historyHeaders,
            "historyTableWrapper",
            "historyTableBody",
            "noHistoryMessage"
          );
          showView("history");
        }
      }

      if (success && statusElement) {
        statusElement.textContent = `Upload Data ${type === "main" ? "Utama" : "History"} Sukses (${
          data.length
        } baris)!`;
        statusElement.style.color = "green";
      }
    } catch (err) {
      console.error(err);
      if (statusElement) {
        // Menampilkan pesan error dari parser
        // Pesan error dari parseXlsx kini lebih detail (menyebutkan sheet yang tersedia)
        statusElement.innerHTML = "Error loading file: <br>" + err.message;
        statusElement.style.color = "red";
      }
    }
  };

  if (readerType === "readAsText") {
    reader.readAsText(file);
  } else {
    reader.readAsBinaryString(file);
  }

  inputElement.value = "";
}
