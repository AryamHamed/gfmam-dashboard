// 📊 GFMAM Dashboard - Auto-fetch from Google Sheets (No Server Needed)
// -------------------------------------------------------------

// ✅ Google Sheets CSV links
const societyURL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTME3Zmjo9_Y48F75pjF3TdsnAr_RL-ICJ55S4LT_yG-Is85meu14B7uejE_NDBktg2Qxs3WlgN8jN8/pub?gid=944366883&single=true&output=csv";
const indicesURL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTME3Zmjo9_Y48F75pjF3TdsnAr_RL-ICJ55S4LT_yG-Is85meu14B7uejE_NDBktg2Qxs3WlgN8jN8/pub?gid=1881758143&single=true&output=csv";

// 📦 Fetch CSV data using PapaParse
async function fetchCSVData(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Network response was not ok");
  const csvData = await response.text();
  return Papa.parse(csvData, { header: true }).data;
}

// 🧮 Animate Counter for KPIs
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

// 🎨 Render Table
function renderTable(data, tableId) {
  const tableBody = document.getElementById(tableId);
  if (!tableBody) return;

  tableBody.innerHTML = "";
  data.forEach((row) => {
    const tr = document.createElement("tr");
    Object.values(row).forEach((cell) => {
      const td = document.createElement("td");
      td.textContent = cell;
      tr.appendChild(td);
    });
    tableBody.appendChild(tr);
  });
}

// 📊 Render Charts
function renderCharts(societyData, indicesData) {
  // Society Members Chart
  const ctx1 = document.getElementById("societyMembersChart").getContext("2d");
  new Chart(ctx1, {
    type: "bar",
    data: {
      labels: societyData.map((r) => r["Region"]),
      datasets: [
        {
          label: "Total Members",
          data: societyData.map((r) => parseInt(r["Total Members"]) || 0),
          backgroundColor: "#84bd00",
          borderRadius: 6,
        },
      ],
    },
    options: {
      plugins: { legend: { labels: { color: "#fff" } } },
      scales: {
        x: { ticks: { color: "#ccc" } },
        y: { ticks: { color: "#ccc" } },
      },
    },
  });

  // Society Revenue Chart
  const ctx2 = document.getElementById("societyRevenueChart").getContext("2d");
  new Chart(ctx2, {
    type: "bar",
    data: {
      labels: societyData.map((r) => r["Region"]),
      datasets: [
        {
          label: "Annualized Revenue (USD)",
          data: societyData.map((r) => parseFloat(r["Annualized Revenue (USD)"]) || 0),
          backgroundColor: "#00a3e0",
          borderRadius: 6,
        },
      ],
    },
    options: {
      plugins: { legend: { labels: { color: "#fff" } } },
      scales: {
        x: { ticks: { color: "#ccc" } },
        y: { ticks: { color: "#ccc" } },
      },
    },
  });
}

// 🚀 Initialize Dashboard
async function initializeDashboard() {
  try {
    const [societyData, indicesData] = await Promise.all([
      fetchCSVData(societyURL),
      fetchCSVData(indicesURL),
    ]);

    console.log("✅ Society Data Loaded:", societyData);
    console.log("✅ Indices Data Loaded:", indicesData);

    // 🎯 KPI Calculations
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

    // 🎨 Animate KPIs
    animateValue("totalRevenueSocieties", totalSocietyRevenue, "$");
    animateValue("totalRevenueRegions", totalIndicesRevenue, "$");
    animateValue("totalMembersSocieties", totalSocietyMembers);
    animateValue("totalMembersRegions", totalIndicesMembers);
    animateValue("totalEventsSocieties", totalSocietyEvents);
    animateValue("totalEventsRegions", totalIndicesEvents);

    // 📋 Render Tables
    renderTable(societyData, "societyTableBody");
    renderTable(indicesData, "indicesTableBody");

    // 📊 Render Charts
    renderCharts(societyData, indicesData);
  } catch (error) {
    console.error("❌ Error loading Google Sheet:", error);
  }
}

document.addEventListener("DOMContentLoaded", initializeDashboard);
