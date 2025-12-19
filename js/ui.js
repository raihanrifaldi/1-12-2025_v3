// ui.js - Fungsi UI dan Update Status

export function updateDbStatusUI(exists, count, time, type) {
  let statusId, btnDeleteId;

  if (type === "main") {
    statusId = "dbStatusText";
    btnDeleteId = "btnDeleteDb";
  } else {
    statusId = "historyStatusText";
    btnDeleteId = "btnDeleteHistory";
  }

  const statusEl = document.getElementById(statusId);
  const btnDelete = document.getElementById(btnDeleteId);

  if (exists) {
    const dateObj = new Date(time).toLocaleString("id-ID");
    statusEl.innerHTML = `<span style="color: green;">Tersimpan (${count} baris)</span>. <br><small>Update: ${dateObj}</small>`;
    if (btnDelete) btnDelete.style.display = "inline-flex";
  } else {
    statusEl.innerHTML = `<span style="color: #6b7280;">Kosong</span>`;
    if (btnDelete) btnDelete.style.display = "none";
  }
}

export function showView(viewName) {
  document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
  const target = document.getElementById(`view-${viewName}`);
  if (target) target.classList.add("active");

  document.querySelectorAll(".menu-item").forEach((b) => {
    b.classList.toggle("active", b.getAttribute("data-view") === viewName);
  });
}
