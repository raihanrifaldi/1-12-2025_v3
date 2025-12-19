// render.js - Fungsi Rendering Tabel

export function renderGenericTable(data, headers, wrapperId, tbodyId, noDataMsgId) {
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
  headers.forEach((h) => {
    const th = document.createElement("th");
    th.textContent = h;
    trHead.appendChild(th);
  });
  if (thead) thead.appendChild(trHead);

  const maxRender = 200;
  data.slice(0, maxRender).forEach((row) => {
    const tr = document.createElement("tr");
    headers.forEach((h) => {
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
