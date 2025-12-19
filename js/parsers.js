// parsers.js - Parser untuk CSV dan XLSX

export function parseCsv(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return { data: [], headers: [] };

  const headerLine = lines[0];
  const delimiter = headerLine.includes(";") ? ";" : ",";
  const headers = headerLine.split(delimiter).map((h) => h.trim());

  const dataRows = lines.slice(1);
  const data = dataRows.map((line) => {
    const cols = line.split(delimiter).map((s) => s.trim());
    let rowObj = {};
    headers.forEach((header, index) => {
      rowObj[header] = cols[index] || "";
    });
    return rowObj;
  });

  return { data, headers };
}

export function parseXlsx(data) {
  // Membaca file biner dengan opsi parsing tanggal yang proper
  const workbook = XLSX.read(data, {
    type: "binary",
    cellDates: true, // Parse Excel dates menjadi JavaScript Date objects
  });

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
    const flexibleMatch = sheetNames.find((name) => name.toLowerCase().includes("dbase"));
    if (flexibleMatch) {
      console.warn(`Menggunakan sheet '${flexibleMatch}' karena tidak ditemukan sheet eksak 'Dbase'.`);
      sheetToUse = flexibleMatch;
    } else {
      // 3. Gagal: Beri pesan error informatif
      const availableSheets = sheetNames.join(", ");
      throw new Error(`Sheet dengan nama **"${sheetNameExact}"** tidak ditemukan. 
                Sheet yang tersedia: [${availableSheets}]. 
                Harap periksa ejaan dan pastikan sheet "Dbase" ada.`);
    }
  }

  const worksheet = workbook.Sheets[sheetToUse];

  // Konversi sheet menjadi array of objects (JSON) dengan parsing tanggal yang proper
  const dataJson = XLSX.utils.sheet_to_json(worksheet, {
    raw: false, // Gunakan formatted values, bukan raw numbers
    dateNF: "yyyy-mm-dd", // Format tanggal default
  });

  if (dataJson.length === 0) return { data: [], headers: [] };

  // Ambil header dari key object pertama
  const headers = Object.keys(dataJson[0]);

  return { data: dataJson, headers };
}
