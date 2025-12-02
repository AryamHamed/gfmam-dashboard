# GFMAM Members Value Proposition Dashboard

![GFMAM Logo](assets/marca_global_forum_horizontal_100dpi_1-removebg-preview.png)

An interactive web-based dashboard for the **Global Forum on Maintenance and Asset Management (GFMAM)** that visualizes key performance indicators (KPIs) and metrics for member organizations across different regions.

**Author:** Aryam

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technologies](#technologies)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Architecture](#architecture)
- [Data Source](#data-source)
- [Browser Support](#browser-support)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

The GFMAM Dashboard provides a comprehensive view of member organization performance across seven key performance indicators:

1. **Total Members** - Total active members across all GFMAM societies
2. **Financial Health** - Average financial health per member (USD per Member)
3. **Active Projects (IN/IO)** - Count of active international and inter-organizational projects
4. **Collaboration Agreements** - Total collaboration agreements within the GFMAM network
5. **GFMAM Calendar Events** - Count of GFMAM-branded events per year
6. **Face-to-Face Meeting Hosting** - Number of face-to-face GFMAM meetings hosted
7. **Triplet (3-Year Rolling)** - 3-year rolling KPI value

The dashboard enables stakeholders to:
- Monitor aggregate KPI metrics across all societies
- Compare individual organization performance
- Visualize performance patterns through interactive charts
- Filter and compare multiple organizations simultaneously

---

## Features

### 🎯 Core Features

- **Real-time Data Visualization** - Fetches live data from Google Sheets
- **Interactive KPI Cards** - Display aggregate metrics across all member organizations
- **Radar/Spider Chart** - Visualize individual organization performance across all 7 KPIs
- **Multi-Select Filtering** - Compare multiple organizations simultaneously
- **Interactive Bar Charts** - Seven detailed bar charts for each KPI
- **Informative Tooltips** - Contextual information for each KPI
- **Animated Logo Banner** - Scrolling carousel of member organization logos
- **Responsive Design** - Optimized for different screen sizes

### 🎨 User Interface

- Clean, professional design with GFMAM brand colors
- Intuitive navigation and filtering
- Clear data presentation with visual hierarchy
- Smooth animations and transitions

---

## Technologies

### Core Technologies

- **HTML5** - Semantic markup and structure
- **CSS3** - Modern styling with custom properties, animations, flexbox, and grid
- **JavaScript (ES6+)** - Vanilla JavaScript with async/await and arrow functions

### External Libraries (CDN)

- **[Chart.js](https://www.chartjs.org/)** - Data visualization (bar charts, radar charts)
- **[PapaParse 5.4.1](https://www.papaparse.com/)** - CSV parsing for data ingestion
- **[Choices.js](https://github.com/Choices-js/Choices)** - Enhanced multi-select dropdown
- **[Font Awesome 6.4.0](https://fontawesome.com/)** - Icon library

### Data Source

- **Google Sheets** - Published as CSV (publicly accessible)
- **Excel Backup** - Local data file (GFMAM_Dashboard_Data.xlsx)

---

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for CDN libraries and live data)
- Web server (optional, for local development)

### Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd gfmam-dashboard-v01
   ```

2. **Open the dashboard:**

   **Option A: Direct File Access**
   ```bash
   # Simply open in browser
   open index.html  # macOS
   xdg-open index.html  # Linux
   start index.html  # Windows
   ```

   **Option B: Using a Local Web Server** (Recommended)
   ```bash
   # Using Python 3
   python3 -m http.server 8000

   # Using Node.js (http-server)
   npx http-server -p 8000

   # Using PHP
   php -S localhost:8000
   ```

3. **Access the dashboard:**
   ```
   http://localhost:8000
   ```

### No Build Process Required

This is a static website that runs entirely in the browser. No npm install, webpack, or build process is needed.

---

## Usage

### Viewing the Dashboard

1. **Main Dashboard** - Open `index.html` to view the full interactive dashboard
2. **Alternative View** - Open `data_dashboard.html` for a simplified view with hardcoded data

### Interacting with the Dashboard

#### KPI Overview
- View aggregate metrics for all GFMAM societies in the top section
- Hover over info icons (ℹ️) to see detailed tooltips for each KPI

#### Organization Radar Chart
- Select an organization from the dropdown menu
- View normalized performance (1-10 scale) across all 7 KPIs
- Compare relative strengths and weaknesses

#### Multi-Organization Comparison
- Use the "Select Societies to Compare" dropdown in the Global Filter section
- Select multiple organizations to compare side-by-side
- All seven bar charts update automatically
- Click the ✕ button to clear all selections

#### Individual KPI Charts
- Seven interactive bar charts display detailed metrics
- First three charts (dark background): Primary KPIs
- Last four charts (white background): Additional KPIs
- Hover over bars to see exact values

#### Member Organizations
- Scroll through the animated logo banner at the bottom
- View all GFMAM member organization logos

---

## Project Structure

```
gfmam-dashboard-v01/
├── index.html                  # Main dashboard interface
├── data_dashboard.html         # Alternative simplified dashboard
├── main.js                     # Core application logic (472 lines)
├── style.css                   # Styling and design system (605 lines)
├── GFMAM_Dashboard_Data.xlsx   # Local data backup (Excel format)
├── README.md                   # Project documentation
├── ARCHITECTURE.md             # Technical architecture documentation
├── assets/                     # Image assets
│   ├── gfmam-logo.png
│   ├── abraman.png
│   ├── Apopo_logo.png
│   ├── IPWEA.jpg
│   ├── jipm.png
│   ├── iframi.jpeg
│   ├── iam.png
│   ├── MAPMA logo.png
│   ├── jaam.png
│   ├── gsmr.png
│   ├── efnms.png
│   ├── pemac.png
│   ├── council.png
│   ├── saama.png
│   └── ...
└── .git/                       # Git repository
```

---

## Configuration

### Data Source Configuration

The dashboard fetches data from a Google Sheets CSV endpoint configured in `main.js`:

```javascript
const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vShUL9swlQuiTVz1LQvJhL_lfhB3eriJkIV7vsAN-nKINaowMfFl7We8gezVGFpy8QcPnR4xjBSuN23/pub?gid=1423207942&single=true&output=csv";
```

### KPI Metadata Configuration

All KPI definitions are centralized in the `kpiMetadata` object in `main.js`:

```javascript
const kpiMetadata = {
  "Total Members": {
    title: "Total Members",
    unit: "Members",
    tooltip: "Total active members across all GFMAM societies.",
    column: "Total Members",
  },
  // ... 6 more KPIs
};
```

### Customization

To customize the dashboard:

1. **Update Data Source** - Modify `sheetURL` in `main.js:7`
2. **Add/Modify KPIs** - Update `kpiMetadata` in `main.js:15-65`
3. **Change Colors** - Update CSS custom properties in `style.css`
4. **Add Logos** - Place images in `/assets/` and update HTML

---

## Architecture

### Design Pattern

The dashboard follows a **client-side MVC-like pattern**:

- **Data Layer** - CSV fetching and parsing with PapaParse
- **View Layer** - HTML templates, CSS styling, Chart.js visualizations
- **Controller Layer** - JavaScript event handlers and state management

### Data Flow

1. CSV data fetched from Google Sheets on page load
2. Data parsed by PapaParse with UTF-8 BOM handling
3. KPIs calculated through aggregation functions
4. Values rendered to DOM elements and Chart.js visualizations
5. User interactions trigger filtering and chart updates

### Key Components

#### main.js Functions

| Function | Purpose | Location |
|----------|---------|----------|
| `fetchCSVData()` | Fetches and parses CSV from Google Sheets | main.js:72 |
| `calculateKPIs()` | Aggregates all KPI metrics | main.js:112 |
| `updateKPIs()` | Updates dashboard KPI card displays | main.js:164 |
| `initializeTooltips()` | Sets up info icon tooltips | main.js:201 |
| `renderCharts()` | Creates 7 bar charts with filtering | main.js:217 |
| `renderSpiderChart()` | Creates radar chart with normalization | main.js:364 |
| `initializeDashboard()` | Entry point - orchestrates initialization | main.js:453 |

For detailed architecture documentation, see [ARCHITECTURE.md](ARCHITECTURE.md).

---

## Data Source

### Google Sheets Structure

The Google Sheets CSV should have the following columns:

| Column Name | Type | Description |
|-------------|------|-------------|
| Organization Name | String | Name of the member society |
| Total Members | Number | Total active members |
| Financial Health | Number | USD per member |
| Active Projects | Number | Count of IN/IO projects |
| Collaboration Agreements | Number | Count of agreements |
| Calendar Events | Number | Count of GFMAM events |
| Member Meeting Hosting | Number | Count of hosted meetings |
| Triplet | Number | 3-year rolling value |

### Data Format Requirements

- CSV format with headers
- UTF-8 encoding
- Numeric values without currency symbols (handled by parser)
- No empty rows between data

---

## Browser Support

### Supported Browsers

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Opera (latest)

### Required Browser Features

- ES6+ JavaScript support (async/await, arrow functions)
- Fetch API
- Canvas API (for Chart.js)
- CSS Grid and Flexbox
- CSS Custom Properties

---

## Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Make your changes
4. Test thoroughly in multiple browsers
5. Commit your changes (`git commit -m 'Add improvement'`)
6. Push to the branch (`git push origin feature/improvement`)
7. Open a Pull Request

### Code Style

- Use ES6+ JavaScript features
- Follow existing code formatting
- Add comments for complex logic
- Keep functions focused and modular
- Use semantic HTML5 elements
- Follow BEM naming for CSS classes (where applicable)

### Testing

Before submitting changes:
- Test in multiple browsers (Chrome, Firefox, Safari)
- Verify responsive design on different screen sizes
- Check data loading and error handling
- Validate chart interactions and filtering

---

## Troubleshooting

### Common Issues

**Issue: Charts not loading**
- Check browser console for errors
- Verify CDN libraries are loading (check Network tab)
- Ensure Google Sheets URL is accessible and published

**Issue: Data not displaying**
- Verify CSV format matches expected structure
- Check that column names match those in `kpiMetadata`
- Look for parsing errors in browser console

**Issue: Styling appears broken**
- Clear browser cache
- Check that `style.css` is loading
- Verify Font Awesome CDN is accessible

---

## Future Enhancements

Potential improvements for future versions:

- [ ] Add loading indicators for data fetching
- [ ] Implement error states with user-friendly messages
- [ ] Add data export functionality (CSV, PDF)
- [ ] Create print-friendly view
- [ ] Add historical data comparison
- [ ] Implement user authentication for restricted data
- [ ] Add unit tests for core functions
- [ ] Create mobile-optimized responsive design
- [ ] Add dark mode toggle
- [ ] Implement offline mode with local Excel fallback

---

## License

Copyright © 2025 Global Forum on Maintenance and Asset Management (GFMAM). All rights reserved.

---

## Contact

For questions, issues, or contributions, please contact the GFMAM technical team or open an issue in the repository.

---

## Acknowledgments

- **Author:** Aryam
- **Organization:** GFMAM (Global Forum on Maintenance and Asset Management)
- **Libraries:** Chart.js, PapaParse, Choices.js, Font Awesome
- **Member Organizations:** All GFMAM member societies

---

**Last Updated:** December 2025
