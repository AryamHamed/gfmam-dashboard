/* =========================================================
   GFMAM Dashboard - Dynamic KVI Version
   Author: Aryam
   Updated: December 2025
   Data Source: Google Sheets (KVI + Info sheets)
   ========================================================= */

// ====== CONFIGURATION ======
const KVI_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTQzLow7RmZkpO7zMGrvH9q4Uclu8DJ6EHAN8aYZ62bx4KsWa3Ut8c5GsOXJIkGvfwp8T-eBj7yev0Y/pub?gid=450258484&single=true&output=csv";
const INFO_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTQzLow7RmZkpO7zMGrvH9q4Uclu8DJ6EHAN8aYZ62bx4KsWa3Ut8c5GsOXJIkGvfwp8T-eBj7yev0Y/pub?gid=1345572784&single=true&output=csv";

// Global variables
let charts = [];
let globalChoicesSelector = null;
let kpiMetadata = {}; // Will be populated from Info sheet
let kviData = [];     // Will store KVI data
let kpiKeys = [];     // Will store KPI names in order

// ====== FETCH & PARSE CSV HELPER FUNCTION ======
async function fetchCSV(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error("❌ Failed to fetch CSV:", response.status, response.statusText);
      return [];
    }

    const csvText = await response.text();

    // Parse CSV safely using PapaParse
    const parsed = Papa.parse(csvText, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      transformHeader: (header) =>
        header.replace(/[\u200B-\u200D\uFEFF]/g, "").trim(),
      transform: (value) => {
        if (typeof value === "string") {
          value = value.replace(/[\u200B-\u200D\uFEFF$,%]/g, "").trim();
        }
        return value === "" ? null : value;
      },
    });

    console.log("✅ Parsed CSV:", parsed.data);
    return parsed.data;
  } catch (error) {
    console.error("❌ Error parsing CSV:", error);
    return [];
  }
}

// ====== FETCH ALL DATA (KVI + INFO) ======
async function fetchAllData() {
  try {
    console.log("🔄 Fetching KVI and Info data...");

    const [kviRaw, infoRaw] = await Promise.all([
      fetchCSV(KVI_SHEET_URL),
      fetchCSV(INFO_SHEET_URL)
    ]);

    if (kviRaw.length === 0 || infoRaw.length === 0) {
      console.error("❌ Failed to fetch data from sheets");
      return null;
    }

    return { kviData: kviRaw, infoData: infoRaw };
  } catch (error) {
    console.error("❌ Error fetching data:", error);
    return null;
  }
}

// ====== BUILD METADATA FROM INFO SHEET ======
function buildMetadataFromInfo(infoData) {
  const metadata = {};

  console.log(`📊 Processing ${infoData.length} rows from Info sheet`);

  infoData.forEach((row, index) => {
    const kviName = row["KVI"];
    const info = row["Info"];
    const unit = row["Unit of Measure"];

    console.log(`Row ${index + 1}: KVI="${kviName}", Unit="${unit}"`);

    if (kviName && kviName.trim() !== "") {
      metadata[kviName] = {
        title: kviName,
        unit: unit || "",
        tooltip: info || "",
        column: kviName // Column name in KVI sheet
      };
    } else {
      console.warn(`Row ${index + 1}: Skipped - empty KVI name`);
    }
  });

  // Add special metadata for Spider Chart
  metadata["Spider Chart"] = {
    title: "Organization Radar",
    unit: "1-10 Scale",
    tooltip: "This radar chart visualizes the organization's performance across all KVIs, scaled from 1 (lowest) to 10 (highest) relative to all other member societies.",
    column: null
  };

  const kpiCount = Object.keys(metadata).length - 1; // Exclude Spider Chart
  console.log(`✅ Built metadata for ${kpiCount} KPIs:`, Object.keys(metadata).filter(k => k !== "Spider Chart"));
  return metadata;
}

// ====== CALCULATE AGGREGATE KPIs ======
function calculateAggregateKPIs(data, metadata) {
  const aggregates = {};
  const keys = Object.keys(metadata).filter(k => k !== "Spider Chart");

  keys.forEach((kpiName) => {
    const column = metadata[kpiName].column;
    let sum = 0;
    let count = 0;

    data.forEach((row) => {
      const value = parseFloat(row[column]);
      if (!isNaN(value) && value !== null) {
        sum += value;
        count++;
      }
    });

    // For percentage KPIs, calculate average; for others, sum
    const unit = metadata[kpiName].unit.toLowerCase();
    if (unit.includes("%")) {
      aggregates[kpiName] = count > 0 ? sum / count : 0;
    } else {
      aggregates[kpiName] = sum;
    }
  });

  console.log("✅ Calculated aggregate KPIs:", aggregates);
  return aggregates;
}

// ====== UPDATE KPI CARDS ======
function updateKPICards(aggregates, metadata) {
  const keys = Object.keys(metadata).filter(k => k !== "Spider Chart");

  keys.forEach((kpiName, index) => {
    const elementId = `kpi-${index + 1}`;
    const element = document.getElementById(elementId);

    if (element) {
      const value = aggregates[kpiName];
      const unit = metadata[kpiName].unit;

      let displayValue = "--";
      if (value !== undefined && value !== null) {
        // Format based on unit type
        if (unit.toLowerCase().includes("%")) {
          displayValue = value.toFixed(2) + "%";
        } else if (unit.toLowerCase().includes("time")) {
          displayValue = value.toFixed(1) + "x";
        } else if (unit.toLowerCase().includes("representative")) {
          displayValue = value.toFixed(1);
        } else {
          displayValue = value.toLocaleString();
        }
      }

      element.textContent = displayValue;
    }
  });

  console.log("✅ Updated KPI cards");
}

// ====== UPDATE HTML LABELS WITH DYNAMIC KPI NAMES ======
function updateKPILabels(metadata) {
  const keys = Object.keys(metadata).filter(k => k !== "Spider Chart");

  // Get all KPI cards
  const allCards = document.querySelectorAll('.kpi-card');

  console.log(`Found ${allCards.length} KPI cards, ${keys.length} KPIs in metadata`);

  keys.forEach((kpiName, index) => {
    if (index >= allCards.length) {
      console.warn(`KPI ${kpiName} has no corresponding card (index ${index})`);
      return;
    }

    const card = allCards[index];

    // Update KPI card title
    const cardTitle = card.querySelector('h3');
    if (cardTitle) {
      cardTitle.textContent = kpiName;
      console.log(`Updated card ${index + 1}: ${kpiName}`);
    }

    // Update tooltip data-kpi attribute
    const tooltipIcon = card.querySelector('.tooltip-icon');
    if (tooltipIcon) {
      tooltipIcon.setAttribute("data-kpi", kpiName);
    }
  });

  // Hide extra cards that don't have KPIs
  for (let i = keys.length; i < allCards.length; i++) {
    allCards[i].style.display = 'none';
    console.log(`Hiding card ${i + 1} (no KPI data)`);
  }

  console.log("✅ Updated KPI labels");
}

// ====== INITIALIZE TOOLTIPS ======
function initializeTooltips(metadata) {
  const tooltipIcons = document.querySelectorAll(".tooltip-icon");

  tooltipIcons.forEach((icon) => {
    const kpiKey = icon.getAttribute("data-kpi");
    const meta = metadata[kpiKey];

    if (!meta) return;

    const tooltipTextSpan = icon
      .closest(".tooltip-container")
      .querySelector(".tooltip-text");

    const content = `Unit: ${meta.unit}<br><br>${meta.tooltip}`;
    tooltipTextSpan.innerHTML = content;
  });

  console.log("✅ Initialized tooltips");
}

// ====== RENDER CHARTS ======
function renderCharts(data, metadata) {
  const val = (x) => parseFloat(String(x).replace(/[^\d.-]/g, "")) || 0;

  const keys = Object.keys(metadata).filter(k => k !== "Spider Chart");
  const chartConfig = keys.map((key, index) => [`chart${index + 1}`, key]);

  const orgNames = data.map((d) => d["Organization Name"]);

  // ====== GLOBAL MULTI-SELECT DROPDOWN ======
  const globalSelectorElement = document.getElementById("globalOrgSelector");

  if (typeof Choices === "undefined") {
    console.error("❌ Choices.js library is not loaded!");
    return;
  }

  if (globalChoicesSelector) {
    globalChoicesSelector.destroy();
  }

  globalChoicesSelector = new Choices(globalSelectorElement, {
    removeItemButton: true,
    placeholder: true,
    placeholderValue: "Select societies to compare...",
    allowHTML: false,
  });

  const choicesData = orgNames.map((name) => ({ value: name, label: name }));
  globalChoicesSelector.setChoices(choicesData, "value", "label", false);

  // Destroy old charts
  charts.forEach(({ chart }) => chart.destroy());
  charts = [];

  // ====== CREATE CHARTS ======
  chartConfig.forEach(([canvasId, kpiKey]) => {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const meta = metadata[kpiKey];
    const column = meta.column;

    const chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: [],
        datasets: [
          {
            label: meta.title,
            data: [],
            backgroundColor: "#84bd00",
            borderColor: "#84bd00",
            borderWidth: 1,
          }
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: {
              color: "#002b5c",
            },
          },
          title: {
            display: true,
            text: meta.title,
            color: "#000000",
            font: { size: 16, weight: "bold" },
            padding: { top: 10, bottom: 10 },
          },
          subtitle: {
            display: true,
            text: meta.unit,
            color: "#0073c6",
            font: { size: 11, style: "italic" },
            padding: { top: -4 },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: "#000000",
              callback: function (value) {
                const unit = meta.unit.toLowerCase();
                if (unit.includes("time")) {
                  return value.toFixed(1) + "x";
                } else if (unit.includes("%")) {
                  return value.toFixed(1) + "%";
                }
                return value;
              },
            },
            grid: { color: "rgba(0,0,0,0.1)" },
          },
          x: {
            ticks: { color: "#000000", font: { size: 11 } },
            grid: { color: "rgba(0,0,0,0.1)" },
          },
        },
      },
    });

    charts.push({ chart, column });
  });

  // ====== UPDATE CHARTS WITH FILTER ======
  function updateAllCharts() {
    const selectedOrgs = globalChoicesSelector.getValue(true);
    const isAll = selectedOrgs.length === 0;

    const dataToShow = isAll
      ? data
      : data.filter((d) => selectedOrgs.includes(d["Organization Name"]));

    const labels = dataToShow.map((d) => d["Organization Name"]);

    charts.forEach(({ chart, column }) => {
      const values = dataToShow.map((d) => val(d[column]));

      chart.data.labels = labels;
      chart.data.datasets[0].data = values;
      chart.update();
    });
  }

  // Clear All button
  const clearAllButton = document.getElementById("clearAllBtn");
  globalSelectorElement.addEventListener("change", updateAllCharts);

  clearAllButton.addEventListener("click", () => {
    globalChoicesSelector.removeActiveItems();
    updateAllCharts();
  });

  updateAllCharts();
  console.log("✅ Rendered charts");
}

// ====== RENDER SPIDER CHART ======
function renderSpiderChart(data, metadata) {
  const orgSelector = document.getElementById("orgSelector");
  const spiderCtx = document.getElementById("spiderChart");

  if (!spiderCtx || !orgSelector) return;

  const organizations = data.map((d) => d["Organization Name"]);
  orgSelector.innerHTML = organizations
    .map((org) => `<option value="${org}">${org}</option>`)
    .join("");

  const val = (x) => parseFloat(String(x).replace(/[^\d.-]/g, "")) || 0;

  const keys = Object.keys(metadata).filter(k => k !== "Spider Chart");

  const getAllKpiValues = (column) => data.map((d) => val(d[column]));

  const kpiScales = keys.map((key) => {
    const column = metadata[key].column;
    const values = getAllKpiValues(column);
    const min = Math.min(...values);
    const max = Math.max(...values);
    return { key, min, max };
  });

  function scaleValue(value, min, max) {
    if (max === min) return 5;
    return ((value - min) * 9) / (max - min) + 1;
  }

  function getOrgData(orgName) {
    const org = data.find((d) => d["Organization Name"] === orgName);
    if (!org) return Array(keys.length).fill(0);

    return keys.map((key, index) => {
      const column = metadata[key].column;
      const rawValue = val(org[column]);
      const scale = kpiScales[index];
      return scaleValue(rawValue, scale.min, scale.max);
    });
  }

  const firstOrg = organizations[0];
  const spiderChart = new Chart(spiderCtx, {
    type: "radar",
    data: {
      labels: keys.map((key) => metadata[key].title),
      datasets: [
        {
          label: firstOrg,
          data: getOrgData(firstOrg),
          backgroundColor: "rgba(0, 163, 224, 0.2)",
          borderColor: "#00a3e0",
          borderWidth: 2,
          pointBackgroundColor: "#84bd00",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          beginAtZero: true,
          angleLines: { color: "#ddd" },
          grid: { color: "#ccc" },
          pointLabels: { color: "#002b5c", font: { size: 12 } },
          min: 0,
          max: 10,
          ticks: {
            stepSize: 1,
            backdropColor: "rgba(255, 255, 255, 0.8)",
          },
        },
      },
      plugins: {
        legend: { display: false },
        title: { display: false },
      },
    },
  });

  orgSelector.addEventListener("change", (e) => {
    const orgName = e.target.value;
    spiderChart.data.datasets[0].label = orgName;
    spiderChart.data.datasets[0].data = getOrgData(orgName);
    spiderChart.update();
  });

  console.log("✅ Rendered spider chart");
}

// ====== INITIALIZE DASHBOARD ======
async function initializeDashboard() {
  try {
    console.log("🚀 Initializing GFMAM Dashboard...");

    // Fetch all data
    const allData = await fetchAllData();
    if (!allData) {
      console.error("❌ Failed to fetch data");
      return;
    }

    const { kviData: kviRaw, infoData } = allData;

    // Build metadata from Info sheet
    kpiMetadata = buildMetadataFromInfo(infoData);
    kviData = kviRaw;

    // Calculate aggregate KPIs
    const aggregates = calculateAggregateKPIs(kviData, kpiMetadata);

    // Update UI
    updateKPILabels(kpiMetadata);
    updateKPICards(aggregates, kpiMetadata);
    initializeTooltips(kpiMetadata);
    renderCharts(kviData, kpiMetadata);
    renderSpiderChart(kviData, kpiMetadata);

    console.log("✅ Dashboard Initialized Successfully");
  } catch (error) {
    console.error("❌ Error initializing dashboard:", error);
  }
}

document.addEventListener("DOMContentLoaded", initializeDashboard);
