// ====== CONFIGURATION ======
const sheetURL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vShUL9swlQuiTVz1LQvJhL_lfhB3eriJkIV7vsAN-nKINaowMfFl7We8gezVGFpy8QcPnR4xjBSuN23/pub?gid=1423207942&single=true&output=csv"; // The user's original URL
// Note: The URL seems to be the correct format for a published CSV. The 400 error is likely due to the sheet not being published correctly or a temporary Google issue.
// We will revert to the original URL and assume the user will re-publish the sheet if the error persists.

// Global variables for charts and the selector
let charts = [];
let globalChoicesSelector = null;

// ====== KPI METADATA (Single Source of Truth) ======
const kpiMetadata = {
  "Membership Reach": {
    title: "Membership Reach",
    unit: "Member / Million Inhabitants",
    tooltip: "How many members you have per million inhabitants in the target region.",
    column: "Membership Reach",
  },
  "Certification Scheme Reach": {
    title: "Certification Scheme Reach",
    unit: "Certified / Million Inhabitants",
    tooltip: "Number of individuals or organizations certified per million inhabitants.",
    column: "Certification Scheme Reach",
  },
  "Financial Health": {
    title: "Financial Health",
    unit: "$ Annualized Revenue / Member",
    tooltip: "Average annual revenue generated per member (USD / member).",
    column: "Financial Health",
  },
  "Involvement in GFMAM Projects": {
    title: "Involvement in GFMAM Projects",
    unit: "Representative / 10 Projects",
    tooltip: "Number of representatives you have participating in each of the last 10 GFMAM projects.",
    column: "Involvement in GFMAM Projects",
  },
  "# Bilateral Agreements with GFMAM Members": {
    title: "Bilateral Agreements (Members)",
    unit: "Agreements",
    tooltip: "Total count of formal bilateral agreements signed with existing GFMAM member organizations.",
    column: "# Bilateral Agreement with GFMAM Members",
  },
  "# Bilateral Agreements with GFMAM Potential Members": {
    title: "Bilateral Agreements (Potential)",
    unit: "Agreements",
    tooltip: "Total count of formal bilateral agreements signed with organizations that are prospective GFMAM members.",
    column: "# Bilateral Agreement with GFMAM Potential Members",
  },
  "Presentations from GFMAM Members": {
    title: "Presentations from GFMAM Members",
    unit: "Presentations / Event",
    tooltip: "Number of presentations delivered by GFMAM member entities at your events.",
    column: "Presentations from GFMAM Members",
  },
  "Spider Chart": {
    title: "Organization Radar",
    unit: "1-10 Scale",
    tooltip: "This chart visualizes the organization's performance across all 7 KPIs, scaled from 1 (lowest performance) to 10 (highest performance) relative to all other GFMAM members.",
    column: null, // No data column needed for the tooltip
  },
};

// Array of KPI keys for ordered processing
const kpiKeys = Object.keys(kpiMetadata).filter(key => key !== "Spider Chart"); // Exclude Spider Chart for bar charts

// ====== FETCH CSV DATA FROM GOOGLE SHEET ======
async function fetchCSVData() {
  try {
    const response = await fetch(sheetURL);
    if (!response.ok) {
        // Log the error status for better debugging
        console.error(`❌ Failed to fetch data. Status: ${response.status} ${response.statusText}`);
        return [];
    }
    const csvText = await response.text();
    return parseCSV(csvText);
  } catch (error) {
    console.error("❌ Error fetching Google Sheet:", error);
    return [];
  }
}

// ====== PARSE CSV FUNCTION ======
function parseCSV(csvText) {
  const rows = csvText.trim().split("\n").map((r) => r.split(","));
  const headers = rows.shift();
  return rows.map((row) => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h.trim()] = row[i] ? row[i].trim() : "";
    });
    return obj;
  });
}

// ====== CALCULATE KPIs ======
function calculateKPIs(data) {
  const totalOrgs = data.length;

  let totalMembership = 0;
  let membershipCount = 0;

  let totalCertification = 0;
  let certificationCount = 0;

  let totalFinancial = 0;
  let totalProjects = 0;
  let projectCount = 0;

  let totalAgreements = 0;
  
  let totalPresentations = 0;
  let presentationsCount = 0;

  data.forEach((item) => {
    const m = parseFloat(item[kpiMetadata["Membership Reach"].column]);
    if (!isNaN(m)) {
      totalMembership += m;
      membershipCount++;
    }

    const c = parseFloat(item[kpiMetadata["Certification Scheme Reach"].column]);
    if (!isNaN(c)) {
      totalCertification += c;
      certificationCount++;
    }

    const f = parseFloat(item[kpiMetadata["Financial Health"].column].replace(/[^\d.-]/g, ""));
    if (!isNaN(f)) totalFinancial += f;

    const p = parseFloat(item[kpiMetadata["Involvement in GFMAM Projects"].column]);
    if (!isNaN(p)) {
      totalProjects += p;
      projectCount++;
    }

    const a1 = parseFloat(item[kpiMetadata["# Bilateral Agreements with GFMAM Members"].column]);
    const a2 = parseFloat(item[kpiMetadata["# Bilateral Agreements with GFMAM Potential Members"].column]);
    if (!isNaN(a1)) totalAgreements += a1;
    if (!isNaN(a2)) totalAgreements += a2;
    
    const pr = parseFloat(item[kpiMetadata["Presentations from GFMAM Members"].column]);
    if (!isNaN(pr)) {
      totalPresentations += pr;
      presentationsCount++;
    }
  });

  return {
    totalOrgs,
    avgMembership:
      membershipCount > 0 ? totalMembership / membershipCount : 0,
    avgCertification:
      certificationCount > 0 ? totalCertification / certificationCount : 0,
    totalFinancial,
    avgProjects: projectCount > 0 ? totalProjects / projectCount : 0,
    totalAgreements,
    avgPresentations: presentationsCount > 0 ? totalPresentations / presentationsCount : 0,
  };
}

// ====== UPDATE KPI CARDS ======
function updateKPIs(kpis) {
  document.getElementById("kpi-total-orgs").textContent = kpis.totalOrgs;
  
  document.getElementById("kpi-avg-membership").textContent = kpis.avgMembership
    ? kpis.avgMembership.toFixed(1)
    : "--";
    
  document.getElementById("kpi-avg-certification").textContent =
    kpis.avgCertification ? kpis.avgCertification.toFixed(1) : "--";
    
  document.getElementById("kpi-total-financial").textContent = kpis.totalFinancial
    ? `$ ${kpis.totalFinancial.toLocaleString()}`
    : "--";
    
  document.getElementById("kpi-avg-projects").textContent = kpis.avgProjects
    ? kpis.avgProjects.toFixed(1)
    : "--";
    
  // Total Agreements is the sum of two columns, so we keep it as a total
  document.getElementById("kpi-total-agreements").textContent =
    kpis.totalAgreements || "--";
    
  document.getElementById("kpi-avg-presentations").textContent = kpis.avgPresentations
    ? kpis.avgPresentations.toFixed(1)
    : "--";
}

// ====== TOOLTIP INITIALIZATION ======
function initializeTooltips() {
  const tooltipIcons = document.querySelectorAll('.tooltip-icon');
  tooltipIcons.forEach(icon => {
    const kpiKey = icon.getAttribute('data-kpi');
    const metadata = kpiMetadata[kpiKey];
    
    if (metadata) {
      const tooltipTextSpan = icon.closest('.tooltip-container').querySelector('.tooltip-text');
      
      // Construct the tooltip content: Unit + Description
      let content = `Unit: ${metadata.unit}<br><br>${metadata.tooltip}`;
      
      // Special handling for Total Agreements KPI card to show both agreement types
      if (kpiKey === "Total Agreements") {
          content = `Unit: ${kpiMetadata["# Bilateral Agreements with GFMAM Members"].unit}<br><br>This is the sum of:
          <br>1. ${kpiMetadata["# Bilateral Agreements with GFMAM Members"].tooltip}
          <br>2. ${kpiMetadata["# Bilateral Agreements with GFMAM Potential Members"].tooltip}`;
      }
      
      tooltipTextSpan.innerHTML = content;
    }
  });
}

// ====== RENDER CHARTS ======
function renderCharts(data) {
  const val = (x) => parseFloat(String(x).replace(/[^\d.-]/g, "")) || 0;

  // Configuration for the 7 bar charts
  const chartConfig = [
    ["chart1", kpiKeys[0]], // Membership Reach
    ["chart2", kpiKeys[1]], // Certification Scheme Reach
    ["chart3", kpiKeys[2]], // Financial Health
    ["chart4", kpiKeys[3]], // Involvement in GFMAM Projects
    ["chart5", kpiKeys[4]], // Bilateral Agreements (Members)
    ["chart6", kpiKeys[5]], // Bilateral Agreements (Potential)
    ["chart7", kpiKeys[6]], // Presentations from GFMAM Members
  ];

  const orgNames = data.map(d => d["Organization Name"]);

  // ====== 1. SETUP THE GLOBAL MULTI-SELECT DROPDOWN ======
  const globalSelectorElement = document.getElementById('globalOrgSelector');
  if (typeof Choices === 'undefined') {
      console.error("❌ Choices.js library is not loaded!");
      return;
  }
  
  // Destroy existing Choices instance if it exists
  if (globalChoicesSelector) {
      globalChoicesSelector.destroy();
  }
  
  globalChoicesSelector = new Choices(globalSelectorElement, {
    removeItemButton: true,
    placeholder: true,
    placeholderValue: 'Select societies to compare...',
    allowHTML: false,
  });

  const choicesData = orgNames.map(name => ({ value: name, label: name }));
  globalChoicesSelector.setChoices(choicesData, 'value', 'label', false);

  // ====== 2. CREATE THE CHARTS ======
  charts.forEach(({ chart }) => chart.destroy());
  charts = [];

  chartConfig.forEach(([canvasId, kpiKey], index) => {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    const metadata = kpiMetadata[kpiKey];
    
    // Split title into two lines: Title and Unit
    const chartTitle = [metadata.title, metadata.unit];

    const chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: [],
        datasets: [{
          label: metadata.title,
          data: [],
          backgroundColor: [],
          borderColor: "#84bd00",
          borderWidth: 1,
        }, {
          label: "Average",
          data: [],
          type: "line",
          borderColor: "#00a3e0",
          borderWidth: 2,
          borderDash: [6, 6],
          pointRadius: 0,
          fill: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { 
            display: true, 
            labels: { 
              color: "#002b5c",
              generateLabels: function(chart) {
                const labels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
                labels.forEach(label => {
                  if (label.text !== "Average") {
                    label.fillStyle = "#84bd00";
                  }
                });
                return labels;
              }
            } 
          },
          title: { 
            display: true, 
            text: chartTitle, 
            color: index < 3 ? "#000000ff" : "#002b5c", // White for the first 3 charts
            font: { 
              size: 16, 
              weight: "bold" 
            },
            // Custom configuration for the second line (unit)
            padding: {
                top: 10,
                bottom: 10
            },
            fullSize: true,
            position: 'top',
            align: 'center',
            // This function is used to style the second line (unit)
            font: (context) => {
                if (context.index === 1) { // The second line (unit)
                    return { size: 12, weight: 'normal' };
                }
                return { size: 16, weight: 'bold' };
            }
          },
        },
        scales: {
          y: { 
            beginAtZero: true,
            ticks: {
              color: index < 3 ? "#000000ff" : "#000000ff", // White for the first 3 charts
            },
            grid: {
              color: index < 3 ? "rgba(0, 0, 0, 0.2)" : "rgba(0, 0, 0, 0.1)", // Lighter grid lines for dark background
            }
          },
          x: { 
            ticks: { 
              color: index < 3 ? "#000000ff" : "#333", // White for the first 3 charts
              font: { size: 11 } 
            },
            grid: {
              color: index < 3 ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)", // Lighter grid lines for dark background
            }
          },
        },
      },
    });
    charts.push({ chart, column: metadata.column });
  });

  // ====== 3. FUNCTION TO UPDATE ALL CHARTS ======
  function updateAllCharts() {
    const selectedOrgs = globalChoicesSelector.getValue(true);
    const isAll = selectedOrgs.length === 0;
    const dataToShow = isAll ? data : data.filter(d => selectedOrgs.includes(d["Organization Name"]));
    const labels = dataToShow.map(d => d["Organization Name"]);

    charts.forEach(({ chart, column }) => {
      const values = dataToShow.map(d => val(d[column]));
      const allValues = data.map(d => val(d[column]));
      const totalAvg = allValues.reduce((a, b) => a + b, 0) / allValues.length;

      chart.data.labels = labels;
      chart.data.datasets[0].data = values;
      chart.data.datasets[0].backgroundColor = values.map(v => (v >= totalAvg ? "#84bd00" : "#e74c3c"));
      chart.data.datasets[1].data = Array(values.length).fill(totalAvg);
      chart.update();
    });
  }

  // ====== 4. ADD EVENT LISTENERS AND INITIALIZE ======
  const clearAllButton = document.getElementById('clearAllBtn');

  // Event for the main selector
  globalSelectorElement.addEventListener('change', updateAllCharts);

  // Event for the Clear All button
  clearAllButton.addEventListener('click', () => {
    globalChoicesSelector.removeActiveItems();
    updateAllCharts(); 
  });
  
  // Initial chart render (show all organizations)
  updateAllCharts();
}

// ====== RENDER SPIDER CHART ======
function renderSpiderChart(data) {
  const orgSelector = document.getElementById('orgSelector');
  const spiderCtx = document.getElementById('spiderChart');

  if (!spiderCtx || !orgSelector) return;

  const organizations = data.map(d => d["Organization Name"]);
  orgSelector.innerHTML = organizations.map(org => `<option value="${org}">${org}</option>`).join("");

  const val = (x) => parseFloat(String(x).replace(/[^\d.-]/g, "")) || 0;

  // Helper function to get all values for a KPI column
  const getAllKpiValues = (column) => data.map(d => val(d[column]));

  // Calculate min/max for each KPI for scaling
  const kpiScales = kpiKeys.map(key => {
    const column = kpiMetadata[key].column;
    const values = getAllKpiValues(column);
    const min = Math.min(...values);
    const max = Math.max(...values);
    return { key, min, max };
  });

  // Function to scale a value to a 1-10 range
  function scaleValue(value, min, max) {
    if (max === min) return 5; // Default to 5 if all values are the same
    // Scale to 1-10 range: (value - min) * (10 - 1) / (max - min) + 1
    return ((value - min) * 9) / (max - min) + 1;
  }

  function getOrgData(orgName) {
    const org = data.find(d => d["Organization Name"] === orgName);
    if (!org) return Array(kpiKeys.length).fill(0);

    return kpiKeys.map((key, index) => {
      const column = kpiMetadata[key].column;
      const rawValue = val(org[column]);
      const scale = kpiScales[index];
      return scaleValue(rawValue, scale.min, scale.max);
    });
  }

  const firstOrg = organizations[0];
  const spiderChart = new Chart(spiderCtx, {
    type: "radar",
    data: {
      labels: kpiKeys.map(key => kpiMetadata[key].title),
      datasets: [{
        label: firstOrg,
        data: getOrgData(firstOrg),
        backgroundColor: "rgba(0, 163, 224, 0.2)",
        borderColor: "#00a3e0",
        borderWidth: 2,
        pointBackgroundColor: "#84bd00"
      }]
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
          max: 10, // Fixed scale from 0 to 10
          ticks: {
            stepSize: 1,
            backdropColor: "rgba(255, 255, 255, 0.8)"
          }
        }
      },
      plugins: {
        legend: { display: false },
        title: { display: false }
      }
    }
  });

  orgSelector.addEventListener("change", (e) => {
    const orgName = e.target.value;
    spiderChart.data.datasets[0].label = orgName;
    spiderChart.data.datasets[0].data = getOrgData(orgName);
    spiderChart.update();
  });
}

// ====== INITIALIZE DASHBOARD ======
async function initializeDashboard() {
  try {
    const data = await fetchCSVData();
    if (data.length > 0) {
        const kpis = calculateKPIs(data);
        updateKPIs(kpis);
        initializeTooltips(); // Initialize tooltips after KPI data is ready
        renderCharts(data);
        renderSpiderChart(data);
        console.log("✅ Dashboard Initialized Successfully");
    } else {
        console.error("❌ No data fetched to initialize dashboard.");
    }
  } catch (error) {
    console.error("❌ Error initializing dashboard:", error);
  }
}

document.addEventListener("DOMContentLoaded", initializeDashboard);
