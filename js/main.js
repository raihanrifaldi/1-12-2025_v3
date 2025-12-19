// main.js - Application Bootstrap

import { loadPartials } from "./utils/dom.js";
import { initializeApp } from "./eventHandlers.js";

/**
 * Bootstrap aplikasi
 * 1. Load semua HTML partials (components & views)
 * 2. Initialize event handlers & app logic
 */
async function bootstrap() {
  try {
    // Load all HTML partials
    await loadPartials([
      { selector: "#sidebar-container", path: "js/components/sidebar.html" },
      { selector: "#topnav-container", path: "js/components/topnav.html" },
      { selector: "#view-profile-container", path: "js/views/profile.html" },
      { selector: "#view-dashboard-container", path: "js/views/dashboard.html" },
      { selector: "#view-history-container", path: "js/views/history.html" },
      { selector: "#view-account-container", path: "js/views/account.html" },
    ]);

    // Initialize app after all partials loaded
    initializeApp();
  } catch (error) {
    console.error("Bootstrap error:", error);
    alert("Gagal memuat aplikasi. Silakan refresh halaman.");
  }
}

// Start application when DOM is ready
document.addEventListener("DOMContentLoaded", bootstrap);
