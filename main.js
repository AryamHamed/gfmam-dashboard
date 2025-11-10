// 📊 GFMAM Dashboard - Live Google Sheets Integration (Client-Side Only)
// =====================================================================
// This version fetches data directly from Google Sheets using published CSV links.
// It displays only the first 7 columns and updates automatically on page refresh.

// ✅ Google Sheets CSV links (publish your Sheet → File → Share → Publish to Web → CSV)
const societyURL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTME3Zmjo9_Y48F75pjF3TdsnAr_RL-ICJ55S4LT_yG-Is85meu14B7uejE_NDBktg2Qxs3WlgN8jN8/pub?gid=944366883&single=true&output=csv";
const indicesURL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTME3Zmjo9_Y48F75pjF3TdsnAr_RL-ICJ55S4LT_yG-Is85meu14B7uejE_NDBktg2Qxs3WlgN8jN8/pub?gid=1881758143&single=true&output=csv";

// =============================================================
// 🧩 Fetch CSV Data using PapaParse
// =============================================================
async function fetchCSVData(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("❌ Network response was not ok");
  const csvData = await response.text();

  const parsed = Papa.parse(csvData, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
    transformHeader: (h) => h.trim(),
  });

  const cleanData = parsed.data.map((row) => {
    const cleaned = {};
    Object.keys(row).forEach((key) => {
      if (key && key.trim() !== "" && !key.startsWith("__parsed_extra")) {
        cleaned[key.trim()] = row[key]?.toString().trim() || "-";
      }
    });
    return cleaned;
  });

  return cleanData;
}

// =============================================================
// 🎯 Animate KPIs (Counts & Numbers)
// =============================================================
function animateValue(id, value, prefix = "", suffix = "") {
  const el = document.getElementById(id);
  if (!el) return;
  let start = 0;
  const end = parseFloat(value) || 0;
  const duration = 1500;
  const stepTime = Math.abs(Math.floor(duration / end));
  const timer = setInterval(() => {
    start += Math.ceil(end / 50);
    el.textContent = prefix + start.toLocaleString() + suffix;
    if (start >= end) {
      el.textContent = prefix + end.toLocaleString() + suffix;
      clearInterval(timer);
    }
  }, stepTime);
}

function renderTable(data, tableId) {
  const table = document.getElementById(tableId);
  if (!table) {
    console.error(`❌ Table with ID "${tableId}" not found.`);
    return;
  }

  // 🔄 Clear old content
  table.innerHTML = "";

  if (!data.length) {
    table.innerHTML = "<tr><td>No data found</td></tr>";
    return;
  }

  // ✅ Auto-detect all real headers (ignore blanks or weird keys)
  const headers = Object.keys(data[0]).filter(h => h && h.trim() !== "" && !h.startsWith("__parsed_extra"));

  // ✅ Create header row (<thead>)
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  headers.forEach(header => {
    const th = document.createElement("th");
    th.textContent = header;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // ✅ Create body (<tbody>)
  const tbody = document.createElement("tbody");
  data.forEach(row => {
    const tr = document.createElement("tr");
    headers.forEach(header => {
      const td = document.createElement("td");
      td.textContent = row[header] || "-";
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  console.log(`✅ Rendered table "${tableId}" with ${headers.length} columns and ${data.length} rows`);
}


// =============================================================
// 📈 Render Charts (Bar for Members, Line for Revenue)
// =============================================================
function renderCharts(societyData) {
  const ctxMembers = document.getElementById("societyMembersChart");
  const ctxRevenue = document.getElementById("societyRevenueChart");

  // === Members Bar Chart ===
  if (ctxMembers) {
    new Chart(ctxMembers, {
      type: "bar",
      data: {
        labels: societyData.map((r) => r["Region"]),
        datasets: [
          {
            label: "Total Members",
            data: societyData.map((r) => parseFloat(r["Total Members"]) || 0),
            backgroundColor: "#84bd00",
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: "#003366" } } },
        scales: {
          x: { ticks: { color: "#003366" } },
          y: { ticks: { color: "#003366" } },
        },
      },
    });
  }

  // === Revenue Line Chart ===
  if (ctxRevenue) {
    new Chart(ctxRevenue, {
      type: "line",
      data: {
        labels: societyData.map((r) => r["Region"]),
        datasets: [
          {
            label: "Annualized Revenue (USD)",
            data: societyData.map((r) => parseFloat(r["Annualized Revenue (USD)"]) || 0),
            borderColor: "#00a3e0",
            backgroundColor: "rgba(0, 163, 224, 0.3)",
            tension: 0.3,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: "#003366" } } },
        scales: {
          x: { ticks: { color: "#003366" } },
          y: { ticks: { color: "#003366" } },
        },
      },
    });
  }
}

// =============================================================
// 🚀 Initialize Dashboard
// =============================================================
async function initializeDashboard() {
  try {
    // Fetch both datasets in parallel
    const [societyData, indicesData] = await Promise.all([
      fetchCSVData(societyURL),
      fetchCSVData(indicesURL),
    ]);

    // Calculate KPI values
    const totalSocietyRevenue = societyData.reduce(
      (sum, row) => sum + (parseFloat(row["Annualized Revenue (USD)"]) || 0),
      0
    );
    const totalSocietyMembers = societyData.reduce(
      (sum, row) => sum + (parseFloat(row["Total Members"]) || 0),
      0
    );
    const totalSocietyEvents = societyData.reduce(
      (sum, row) => sum + (parseFloat(row["Events (Next 18 Months)"]) || 0),
      0
    );
    const totalIndicesRevenue = indicesData.reduce(
      (sum, row) => sum + (parseFloat(row["Annualized Revenue (USD)"]) || 0),
      0
    );
    const totalIndicesMembers = indicesData.reduce(
      (sum, row) => sum + (parseFloat(row["Total Members"]) || 0),
      0
    );
    const totalIndicesEvents = indicesData.reduce(
      (sum, row) => sum + (parseFloat(row["Events (Next 18 Months)"]) || 0),
      0
    );

    // Animate KPIs
    animateValue("totalRevenueSocieties", totalSocietyRevenue, "$");
    animateValue("totalRevenueRegions", totalIndicesRevenue, "$");
    animateValue("totalMembersSocieties", totalSocietyMembers);
    animateValue("totalMembersRegions", totalIndicesMembers);
    animateValue("totalEventsSocieties", totalSocietyEvents);
    animateValue("totalEventsRegions", totalIndicesEvents);

    // Render Tables (7 columns only)
    renderTable(societyData, "societyTable");
    renderTable(indicesData, "indicesTable");

    // Render Charts
    renderCharts(societyData);

    console.log("✅ Dashboard fully loaded.");
  } catch (error) {
    console.error("❌ Error initializing dashboard:", error);
  }
}

document.addEventListener("DOMContentLoaded", initializeDashboard);
