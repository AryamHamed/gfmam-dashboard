# GFMAM Dashboard - Technical Architecture

This document provides detailed technical documentation for the GFMAM Members Value Proposition Dashboard, including architecture patterns, component design, data flow, and implementation details.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Pattern](#architecture-pattern)
3. [Technology Stack](#technology-stack)
4. [Component Structure](#component-structure)
5. [Data Flow](#data-flow)
6. [Core Modules](#core-modules)
7. [Chart Configuration](#chart-configuration)
8. [State Management](#state-management)
9. [Performance Considerations](#performance-considerations)
10. [Security Considerations](#security-considerations)
11. [Error Handling](#error-handling)
12. [Code Organization](#code-organization)

---

## System Overview

### Architecture Type
**Client-Side Single Page Application (SPA)**

The GFMAM Dashboard is a pure client-side web application that runs entirely in the browser with no backend server or build process required. It fetches data from an external Google Sheets CSV endpoint and renders interactive visualizations using modern web APIs and third-party libraries.

### Key Characteristics

- **Zero Backend** - All processing happens in the browser
- **Real-time Data** - Fetches live data from Google Sheets
- **Stateless** - No persistent state between page loads
- **CDN Dependencies** - External libraries loaded from CDNs
- **Event-Driven** - User interactions trigger chart updates

---

## Architecture Pattern

### MVC-Like Pattern

The application follows a client-side Model-View-Controller (MVC) pattern:

```
┌─────────────────────────────────────────────────────┐
│                   Browser (Client)                   │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────┐      ┌──────────────┐             │
│  │   Model    │      │  Controller  │             │
│  │            │      │              │             │
│  │ - CSV Data │◄────►│ - main.js    │             │
│  │ - KPIs     │      │ - Event      │             │
│  │ - Metadata │      │   Handlers   │             │
│  └────────────┘      └──────────────┘             │
│        ▲                    ▲                      │
│        │                    │                      │
│        ▼                    ▼                      │
│  ┌────────────────────────────────┐               │
│  │           View                  │               │
│  │                                 │               │
│  │  - HTML (index.html)           │               │
│  │  - CSS (style.css)             │               │
│  │  - Chart.js Visualizations     │               │
│  │  - DOM Elements                │               │
│  └────────────────────────────────┘               │
│                                                     │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │   External Data       │
            │   (Google Sheets)     │
            └───────────────────────┘
```

#### Model Layer
- **Data Source:** Google Sheets (CSV format)
- **Data Parser:** PapaParse library
- **Data Structure:** Array of objects representing organizations
- **Metadata:** `kpiMetadata` object (single source of truth)

#### View Layer
- **Template:** HTML5 semantic markup (index.html)
- **Styling:** CSS3 with custom properties (style.css)
- **Visualizations:** Chart.js for bar and radar charts
- **UI Components:** Choices.js for multi-select dropdown

#### Controller Layer
- **Entry Point:** `initializeDashboard()` function (main.js:453)
- **Event Handlers:** Change listeners on selectors
- **State Management:** Closure-based state with global variables
- **Update Logic:** Chart update functions

---

## Technology Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| HTML5 | - | Semantic markup and structure |
| CSS3 | - | Styling, animations, responsive design |
| JavaScript | ES6+ | Application logic and interactivity |

### External Libraries (CDN)

| Library | Version | Purpose | CDN Link |
|---------|---------|---------|----------|
| Chart.js | Latest | Data visualization | cdn.jsdelivr.net |
| PapaParse | 5.4.1 | CSV parsing | cdnjs.cloudflare.com |
| Choices.js | Latest | Multi-select dropdown | cdn.jsdelivr.net |
| Font Awesome | 6.4.0 | Icon library | cdnjs.cloudflare.com |

### Browser APIs

- **Fetch API** - HTTP requests for CSV data
- **Canvas API** - Chart rendering (via Chart.js)
- **DOM API** - Element manipulation and event handling
- **Console API** - Logging and debugging

---

## Component Structure

### File Organization

```
gfmam-dashboard-v01/
│
├── index.html (354 lines)
│   ├── Header Section
│   │   ├── Logo
│   │   └── Navigation Menu
│   ├── GFMAM Summary Section
│   │   ├── KPI Grid (7 cards)
│   │   └── Spider Chart Container
│   ├── Global Filter Section
│   │   └── Multi-Select Dropdown
│   ├── Charts Section
│   │   ├── Dark Row (3 primary charts)
│   │   └── White Row (4 additional charts)
│   ├── Logo Banner Section
│   │   └── Animated Scrolling Logos
│   └── Footer
│
├── main.js (472 lines)
│   ├── Configuration
│   │   ├── sheetURL
│   │   └── kpiMetadata
│   ├── Data Functions
│   │   ├── fetchCSVData()
│   │   └── calculateKPIs()
│   ├── UI Functions
│   │   ├── updateKPIs()
│   │   └── initializeTooltips()
│   ├── Chart Functions
│   │   ├── renderCharts()
│   │   └── renderSpiderChart()
│   └── Initialization
│       └── initializeDashboard()
│
└── style.css (605 lines)
    ├── CSS Reset & Base Styles
    ├── Design System Variables
    ├── Header Styles
    ├── KPI Card Styles
    ├── Spider Chart Styles
    ├── Chart Section Styles
    ├── Tooltip Styles
    ├── Logo Banner Animation
    └── Footer Styles
```

### HTML Component Breakdown

#### 1. Header Component (lines 20-41)
```html
<header class="main-header">
  - Logo (left)
  - Navigation menu (right)
  - Green brand line separator
```

#### 2. GFMAM Summary Component (lines 44-177)
```html
<section id="gfmam-section">
  Left Side:
    - Section title
    - KPI Grid Container
      - Row 1: 3 KPI cards
      - Row 2: 4 KPI cards
  Right Side:
    - Spider chart title
    - Organization selector dropdown
    - Spider chart canvas
```

#### 3. Global Filter Component (lines 180-194)
```html
<section class="global-filter-section">
  - Label
  - Multi-select dropdown (Choices.js)
  - Clear all button
```

#### 4. Charts Section Component (lines 197-302)
```html
<section class="charts-section">
  Dark Row:
    - Chart 1: Total Members
    - Chart 2: Financial Health
    - Chart 3: Active Projects
  White Row:
    - Chart 4: Collaboration Agreements
    - Chart 5: Calendar Events
    - Chart 6: Meeting Hosting
    - Chart 7: Triplet
```

#### 5. Logo Banner Component (lines 305-339)
```html
<section class="logo-banner-section">
  - Section title
  - Logo banner wrapper
    - Scrolling logo container (duplicated for loop)
```

---

## Data Flow

### Application Lifecycle

```
1. Page Load
   │
   ├─► DOM Content Loaded Event
   │
   └─► initializeDashboard() (main.js:453)
       │
       ├─► fetchCSVData() (main.js:72)
       │   │
       │   ├─► Fetch from Google Sheets
       │   ├─► Parse with PapaParse
       │   └─► Return cleaned data array
       │
       ├─► calculateKPIs(data) (main.js:112)
       │   │
       │   ├─► Iterate through data
       │   ├─► Aggregate KPI values
       │   └─► Return KPI object
       │
       ├─► updateKPIs(kpis) (main.js:164)
       │   │
       │   └─► Update DOM elements with KPI values
       │
       ├─► initializeTooltips() (main.js:201)
       │   │
       │   └─► Populate tooltip content from metadata
       │
       ├─► renderCharts(data) (main.js:217)
       │   │
       │   ├─► Initialize Choices.js multi-select
       │   ├─► Create 7 Chart.js bar charts
       │   ├─► Set up change event listeners
       │   └─► Render initial chart data
       │
       └─► renderSpiderChart(data) (main.js:364)
           │
           ├─► Populate organization selector
           ├─► Calculate KPI scales (min/max)
           ├─► Create Chart.js radar chart
           └─► Set up change event listener

2. User Interactions
   │
   ├─► Multi-Select Change
   │   │
   │   └─► updateAllCharts() (main.js:332)
   │       │
   │       ├─► Get selected organizations
   │       ├─► Filter data
   │       ├─► Update chart labels
   │       ├─► Update chart data
   │       └─► Trigger chart.update()
   │
   ├─► Clear All Button Click
   │   │
   │   ├─► Clear Choices.js selections
   │   └─► updateAllCharts()
   │
   └─► Spider Chart Selector Change
       │
       ├─► Get organization data
       ├─► Calculate scaled values (1-10)
       ├─► Update chart dataset
       └─► Trigger spiderChart.update()
```

---

## Core Modules

### 1. Data Fetching Module

**Location:** main.js:72-107

```javascript
async function fetchCSVData()
```

**Responsibilities:**
- Fetch CSV from Google Sheets URL
- Parse CSV with PapaParse
- Clean UTF-8 BOM characters
- Handle errors gracefully

**Key Features:**
- Async/await for clean asynchronous code
- Header transformation to remove hidden characters
- Cell value transformation to remove currency symbols
- Dynamic typing for numeric values
- Empty line skipping

**Error Handling:**
- HTTP response validation
- Try-catch wrapper
- Console error logging
- Returns empty array on failure

### 2. KPI Calculation Module

**Location:** main.js:112-161

```javascript
function calculateKPIs(data)
```

**Responsibilities:**
- Iterate through organization data
- Sum/average KPI values
- Handle missing or invalid data

**Calculation Logic:**
```javascript
// For each KPI:
// 1. Parse value from column
// 2. Validate as number
// 3. Aggregate (sum or average)
// 4. Return object with all KPIs
```

**Aggregation Methods:**
- **Sum:** Total Members, Projects, Agreements, Events, Hosting, Triplet
- **Average:** Financial Health

### 3. UI Update Module

**Location:** main.js:164-198

```javascript
function updateKPIs(kpis)
```

**Responsibilities:**
- Find DOM elements by ID
- Format numeric values
- Update textContent

**Formatting Functions:**
- `formatInt()` - Locale string with commas
- `formatFloat()` - Two decimal places
- Currency formatting for Financial Health

### 4. Tooltip Module

**Location:** main.js:201-215

```javascript
function initializeTooltips()
```

**Responsibilities:**
- Query all tooltip icons
- Match icons to KPI metadata
- Populate tooltip content

**Tooltip Structure:**
```
Unit: [KPI Unit]

[KPI Description]
```

### 5. Chart Rendering Module

**Location:** main.js:217-361

```javascript
function renderCharts(data)
```

**Responsibilities:**
- Initialize Choices.js multi-select
- Create 7 Chart.js bar charts
- Set up filtering logic
- Handle chart updates

**Key Components:**
- `chartConfig` array - Maps canvas IDs to KPI keys
- `globalChoicesSelector` - Choices.js instance
- `charts` array - Stores chart instances and metadata
- `updateAllCharts()` - Filtering and update function

**Filtering Algorithm:**
```javascript
1. Get selected organizations from Choices.js
2. If none selected → show all data
3. If some selected → filter data array
4. Update all chart labels and data
5. Trigger chart.update() on all instances
```

### 6. Spider Chart Module

**Location:** main.js:364-450

```javascript
function renderSpiderChart(data)
```

**Responsibilities:**
- Populate organization selector
- Calculate KPI scaling (1-10)
- Render radar chart
- Handle organization changes

**Scaling Algorithm:**
```javascript
// For each KPI:
1. Get all organization values for that KPI
2. Find min and max values
3. Scale each value: ((value - min) * 9) / (max - min) + 1
4. Result: Normalized 1-10 scale for comparison
```

**Special Case:**
- If min === max → return 5 (neutral mid-point)

---

## Chart Configuration

### Chart.js Configuration

All bar charts use a consistent configuration:

```javascript
{
  type: "bar",
  data: {
    labels: [], // Organization names
    datasets: [{
      label: "KPI Title",
      data: [], // KPI values
      backgroundColor: "#84bd00", // GFMAM green
      borderColor: "#84bd00",
      borderWidth: 1
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: { color: "#002b5c" } // Navy
      },
      title: {
        display: true,
        text: "KPI Title",
        color: "#000000",
        font: { size: 16, weight: "bold" }
      },
      subtitle: {
        display: true,
        text: "Unit",
        color: "#0073c6",
        font: { size: 11, style: "italic" }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: "#000000" }
      },
      x: {
        ticks: { color: "#000000", font: { size: 11 } }
      }
    }
  }
}
```

### Radar Chart Configuration

```javascript
{
  type: "radar",
  data: {
    labels: ["KPI1", "KPI2", ...], // 7 KPI titles
    datasets: [{
      label: "Organization Name",
      data: [1-10], // Scaled values
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
        min: 0,
        max: 10,
        ticks: { stepSize: 1 }
      }
    }
  }
}
```

---

## State Management

### Global State Variables

```javascript
let charts = [];                  // Array of {chart, column} objects
let globalChoicesSelector = null; // Choices.js instance
```

### State Management Pattern

**Closure-Based State:**
- Functions capture state through closures
- Event handlers access outer scope variables
- No Redux or state management library needed

**State Updates:**
```javascript
// Chart state updated via:
chart.data.labels = newLabels;
chart.data.datasets[0].data = newData;
chart.update();
```

### Immutability

**Data is not mutated:**
- Original data array preserved
- Filtering creates new filtered arrays
- Chart updates replace data, not mutate

---

## Performance Considerations

### Optimization Techniques

1. **CDN Loading**
   - Libraries loaded from fast CDNs
   - Parallel loading of external resources

2. **Single Data Fetch**
   - CSV fetched once on page load
   - Cached in memory for all operations

3. **Efficient Parsing**
   - PapaParse streaming-capable
   - Dynamic typing reduces parsing overhead

4. **Chart Instance Reuse**
   - Charts created once
   - Data updated via `chart.update()`
   - No chart recreation on filter changes

5. **Event Delegation**
   - Single change listener per selector
   - Batch chart updates in `updateAllCharts()`

### Performance Metrics

**Typical Load Time:**
- HTML/CSS/JS: < 500ms
- CDN Libraries: < 1s
- CSV Data Fetch: < 2s
- Chart Rendering: < 500ms
- **Total Time to Interactive: ~3-4s**

### Potential Bottlenecks

1. **Large Datasets**
   - Current: ~15 organizations
   - Potential issue: >100 organizations
   - Solution: Implement virtualization or pagination

2. **Multiple Chart Updates**
   - 7 charts updated on each filter change
   - Solution: Debounce filter changes

3. **Network Latency**
   - Google Sheets fetch depends on network
   - Solution: Add loading spinner, implement offline fallback

---

## Security Considerations

### Content Security Policy (CSP)

**Current Status:** No CSP headers

**Recommendations:**
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' cdn.jsdelivr.net cdnjs.cloudflare.com;
  style-src 'self' cdn.jsdelivr.net cdnjs.cloudflare.com;
  img-src 'self' data:;
  connect-src 'self' docs.google.com;
```

### XSS Protection

**Mitigations in Place:**
- PapaParse with `dynamicTyping` reduces injection risk
- Choices.js with `allowHTML: false` prevents HTML injection
- No `innerHTML` usage with user data
- Chart.js handles data sanitization

**Remaining Risks:**
- Organization names from CSV displayed without sanitization
- Recommendation: Add DOMPurify for sanitization

### Data Privacy

**Current Status:**
- Public Google Sheets data
- No authentication
- No PII collection

**Recommendations:**
- Add authentication for sensitive data
- Implement row-level security in data source
- Add HTTPS-only enforcement

---

## Error Handling

### Current Error Handling

1. **Fetch Errors**
```javascript
try {
  const response = await fetch(sheetURL);
  if (!response.ok) {
    console.error("Failed to fetch CSV");
    return [];
  }
} catch (error) {
  console.error("Error parsing CSV:", error);
  return [];
}
```

2. **Parse Errors**
- PapaParse error handling built-in
- Empty lines skipped
- Invalid values converted to null

3. **Calculation Errors**
```javascript
const value = parseFloat(item["Column"]);
if (!isNaN(value)) {
  // Use value
}
```

### Recommended Improvements

1. **User-Facing Error Messages**
   - Add error state UI components
   - Show user-friendly messages
   - Provide retry buttons

2. **Fallback Mechanisms**
   - Load from local Excel file if fetch fails
   - Cache last successful fetch in localStorage
   - Show stale data with warning

3. **Validation**
   - Validate CSV structure matches expected format
   - Check for required columns
   - Warn on missing or malformed data

---

## Code Organization

### Design Principles

1. **Single Source of Truth**
   - `kpiMetadata` object defines all KPIs
   - Used for tooltips, charts, and calculations
   - Eliminates duplication

2. **Separation of Concerns**
   - HTML: Structure
   - CSS: Presentation
   - JavaScript: Behavior

3. **DRY (Don't Repeat Yourself)**
   - `chartConfig` array for chart creation
   - Helper functions for formatting
   - Metadata-driven rendering

4. **Modularity**
   - Each function has single responsibility
   - Clear function boundaries
   - Minimal global state

### Code Quality

**Strengths:**
- ✅ Well-commented
- ✅ Consistent naming conventions
- ✅ ES6+ modern syntax
- ✅ Async/await for readability
- ✅ Functional programming patterns

**Areas for Improvement:**
- ⚠️ No linting configuration
- ⚠️ No unit tests
- ⚠️ Some magic numbers in code
- ⚠️ Could extract more constants

### Naming Conventions

**Variables:**
- camelCase: `globalChoicesSelector`, `totalMembers`
- Descriptive: `kpiMetadata`, `chartConfig`

**Functions:**
- camelCase: `fetchCSVData()`, `renderCharts()`
- Verb-based: `calculate`, `update`, `render`, `initialize`

**Constants:**
- camelCase (not UPPER_CASE): `sheetURL`, `kpiMetadata`
- PascalCase for constructors: `Chart`, `Choices`

---

## Extension Points

### Adding New KPIs

To add a new KPI:

1. **Update `kpiMetadata` in main.js:**
```javascript
"New KPI Name": {
  title: "Display Title",
  unit: "Unit of Measurement",
  tooltip: "Description",
  column: "CSV Column Name"
}
```

2. **Add HTML KPI card in index.html:**
```html
<div class="kpi-card">
  <div class="kpi-header">
    <h3>New KPI Name</h3>
    <div class="tooltip-container">
      <i class="fa-solid fa-circle-info tooltip-icon"
         data-kpi="New KPI Name"></i>
      <span class="tooltip-text"></span>
    </div>
  </div>
  <p id="kpi-new-kpi">--</p>
</div>
```

3. **Add chart canvas in index.html:**
```html
<div class="chart-box">
  <canvas id="chart8"></canvas>
</div>
```

4. **Update `chartConfig` in renderCharts():**
```javascript
["chart8", "New KPI Name"]
```

5. **Update `calculateKPIs()` and `updateKPIs()` functions**

### Adding New Visualizations

To add a new chart type:

1. Create new canvas element in HTML
2. Add new render function in main.js
3. Call from `initializeDashboard()`
4. Use Chart.js documentation for chart type

### Customizing Styles

All styles centralized in `style.css`:

```css
/* Primary Colors */
--color-navy: #002b5c;
--color-green: #84bd00;
--color-blue: #00a3e0;

/* Modify these to change entire theme */
```

---

## Testing Strategy

### Recommended Testing Approach

**1. Unit Tests (Recommended: Jest)**
```javascript
// Test KPI calculations
test('calculateKPIs sums Total Members correctly', () => {
  const data = [...];
  const result = calculateKPIs(data);
  expect(result.totalMembers).toBe(expected);
});
```

**2. Integration Tests (Recommended: Cypress)**
```javascript
// Test chart rendering
it('renders 7 bar charts on page load', () => {
  cy.visit('/index.html');
  cy.get('canvas').should('have.length', 8); // 7 + spider
});
```

**3. Visual Regression Tests (Recommended: Percy)**
- Snapshot testing for UI changes
- Compare screenshots across versions

**4. Performance Tests (Lighthouse)**
- Monitor load time
- Track bundle size
- Measure time to interactive

---

## Deployment

### Static Hosting Options

1. **GitHub Pages**
   - Free static hosting
   - Automatic deploys from main branch

2. **Netlify**
   - Drag-and-drop deployment
   - Custom domains
   - HTTPS by default

3. **Vercel**
   - Git integration
   - Instant previews
   - CDN distribution

4. **AWS S3 + CloudFront**
   - Scalable
   - Pay-as-you-go
   - Global CDN

### Deployment Checklist

- [ ] Test in all target browsers
- [ ] Verify Google Sheets URL is accessible
- [ ] Optimize images (compress PNGs)
- [ ] Add favicon
- [ ] Configure custom domain
- [ ] Set up HTTPS
- [ ] Add analytics (optional)
- [ ] Configure CSP headers
- [ ] Set up monitoring

---

## Maintenance

### Regular Maintenance Tasks

1. **Monthly:**
   - Check CDN library versions for updates
   - Verify Google Sheets connection
   - Review error logs

2. **Quarterly:**
   - Update dependencies to latest versions
   - Performance audit with Lighthouse
   - Accessibility audit with axe

3. **Annually:**
   - Review and update documentation
   - Analyze usage patterns
   - Plan feature enhancements

### Monitoring

**Recommended Tools:**
- **Sentry** - Error tracking
- **Google Analytics** - Usage analytics
- **UptimeRobot** - Uptime monitoring
- **Lighthouse CI** - Performance monitoring

---

## Glossary

**CDN** - Content Delivery Network
**CSV** - Comma-Separated Values
**DOM** - Document Object Model
**KPI** - Key Performance Indicator
**SPA** - Single Page Application
**XSS** - Cross-Site Scripting
**CSP** - Content Security Policy
**GFMAM** - Global Forum on Maintenance and Asset Management

---

**Last Updated:** December 2025
**Version:** 1.0
**Author:** Aryam
