# Struktur Project - Modular Architecture

## 📁 Struktur File

```
/home/nov/Documents/1-12-2025_v3/
├── dashboard.html          # File HTML utama
├── dashboard.js           # File lama (untuk backup/referensi)
├── style.css              # Styling
├── js/                    # Folder modul JavaScript
│   ├── main.js           # Entry point aplikasi
│   ├── config.js         # Konfigurasi & state global
│   ├── database.js       # Manajemen LocalStorage
│   ├── parsers.js        # Parser CSV & XLSX
│   ├── render.js         # Rendering tabel
│   ├── filters.js        # Logika filter & search
│   ├── ui.js             # Update UI & navigasi
│   ├── upload.js         # Upload & processing file
│   └── eventHandlers.js  # Event listeners & initialization
```

## 📦 Modul-Modul

### 1. **main.js** (Entry Point)
- Entry point aplikasi
- Initialize app saat DOM ready

### 2. **config.js** (Konfigurasi)
- Database keys (DB_KEY_MAIN, DB_KEY_HISTORY)
- Global state management
- Export state object untuk shared state

### 3. **database.js** (Database Management)
- `saveToDatabase()` - Simpan data ke LocalStorage
- `loadDatabase()` - Load data dari LocalStorage

### 4. **parsers.js** (File Parsers)
- `parseCsv()` - Parse CSV files
- `parseXlsx()` - Parse XLSX files dengan date handling

### 5. **render.js** (Rendering)
- `renderGenericTable()` - Render tabel generic untuk main & history

### 6. **filters.js** (Filter & Search)
- `generateFilterOptions()` - Generate filter untuk main data
- `generateFilterOptionsHistory()` - Generate filter untuk history data
- `applySearchAndFilterMain()` - Apply search & filter main
- `applySearchAndFilterHistory()` - Apply search & filter history

### 7. **ui.js** (UI Management)
- `updateDbStatusUI()` - Update status database UI
- `showView()` - Navigation between views

### 8. **upload.js** (Upload Handler)
- `processUpload()` - Handle upload & processing file

### 9. **eventHandlers.js** (Event Management)
- `initializeApp()` - Initialize seluruh aplikasi
- `setupMainDataUpload()` - Setup event upload main data
- `setupHistoryDataUpload()` - Setup event upload history data
- `setupMainFilters()` - Setup event filter main data
- `setupHistoryFilters()` - Setup event filter history data

## 🔄 Flow Aplikasi

1. **Load**: `main.js` → `initializeApp()` → `loadDatabase()`
2. **Upload**: User upload → `processUpload()` → `parseXlsx/parseCsv()` → `saveToDatabase()` → `renderGenericTable()`
3. **Filter**: User filter → `applySearchAndFilterMain/History()` → `renderGenericTable()`

## ✅ Keuntungan Modular

1. **Separation of Concerns** - Setiap file punya tanggung jawab spesifik
2. **Maintainability** - Mudah maintain & debug
3. **Reusability** - Fungsi bisa digunakan ulang
4. **Scalability** - Mudah tambah fitur baru
5. **Testing** - Lebih mudah untuk unit testing
6. **Code Organization** - Lebih terstruktur & readable

## 🚀 Cara Menggunakan

1. Buka `dashboard.html` di browser
2. Pastikan semua file di folder `js/` ada
3. Upload CSV/XLSX untuk data main atau history
4. Filter & search data sesuai kebutuhan

## 📝 Notes

- Menggunakan ES6 Modules (`import`/`export`)
- State management terpusat di `config.js`
- File `dashboard.js` lama tetap ada untuk referensi/backup
