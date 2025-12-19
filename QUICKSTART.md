# 🚀 Quick Start Guide

## Struktur Baru (Modular)

```
✅ app.html              ← GUNAKAN INI (modular, clean)
⚠️  dashboard.html       ← Legacy backup (jangan edit)
```

## File Structure

```
js/
├── components/          # UI Components
│   ├── sidebar.html
│   └── topnav.html
│
├── views/              # Page Views  
│   ├── profile.html
│   ├── dashboard.html
│   ├── history.html
│   └── account.html
│
├── modules/            # Business Logic
│   ├── config.js
│   ├── database.js
│   ├── parsers.js
│   ├── render.js
│   ├── filters.js
│   ├── ui.js
│   ├── upload.js
│   └── eventHandlers.js
│
└── utils/              # Utilities
    └── dom.js
```

## Cara Kerja

1. **`app.html`** load
2. **`js/main.js`** fetch semua HTML partials
3. **Event handlers** initialize
4. App ready! ✅

## Development

### Edit UI Component
- Edit file di `js/components/`
- Contoh: `js/components/sidebar.html`

### Edit View
- Edit file di `js/views/`
- Contoh: `js/views/dashboard.html`

### Edit Logic
- Edit file di `js/modules/`
- Contoh: `js/modules/filters.js`

## Benefits

✅ Clean & organized
✅ Easy to maintain
✅ Reusable components
✅ Ready to scale

## More Info

Baca `ARCHITECTURE.md` untuk dokumentasi lengkap.
