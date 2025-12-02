/**
 * GFMAM Dashboard - Google Apps Script Backend
 * This script handles data updates from the admin form
 *
 * SETUP INSTRUCTIONS:
 * 1. Open your Google Sheet
 * 2. Go to Extensions → Apps Script
 * 3. Delete any existing code
 * 4. Paste this entire script
 * 5. Click "Deploy" → "New deployment"
 * 6. Choose "Web app"
 * 7. Execute as: "Me"
 * 8. Who has access: "Anyone" (for public form) or "Anyone with Google account"
 * 9. Click "Deploy"
 * 10. Copy the Web App URL
 * 11. Paste it in admin.html where it says "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE"
 */

// ====== CONFIGURATION ======
const SOCIETY_DATA_SHEET_NAME = "Society Data"; // Name of your raw data sheet

// ====== MAIN FUNCTION - HANDLES POST REQUESTS ======
function doPost(e) {
  try {
    // Parse incoming data
    const data = JSON.parse(e.postData.contents);

    // Log for debugging
    Logger.log("Received data: " + JSON.stringify(data));

    // Get the spreadsheet and sheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SOCIETY_DATA_SHEET_NAME);

    if (!sheet) {
      return ContentService
        .createTextOutput(JSON.stringify({
          status: "error",
          message: "Society Data sheet not found"
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Find or create row for this organization
    const orgName = data.organizationName;
    const rowIndex = findOrganizationRow(sheet, orgName);

    if (rowIndex === -1) {
      // Add new organization (append to end)
      addNewOrganization(sheet, data);
    } else {
      // Update existing organization
      updateOrganization(sheet, rowIndex, data);
    }

    // Return success
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "success",
        message: "Data saved successfully"
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log("Error: " + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "error",
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ====== FIND ORGANIZATION ROW ======
function findOrganizationRow(sheet, orgName) {
  const data = sheet.getDataRange().getValues();

  // Search for organization name in first column
  for (let i = 1; i < data.length; i++) { // Start from 1 to skip header
    if (data[i][0] === orgName) {
      return i + 1; // Return 1-indexed row number
    }
  }

  return -1; // Not found
}

// ====== ADD NEW ORGANIZATION ======
function addNewOrganization(sheet, data) {
  const newRow = [
    data.organizationName,
    data.totalPopulation || "",
    data.activeMembers || "",
    data.orgMembers || "",
    data.totalMembers || "",
    data.revenue || "",
    data.events || "",
    data.calendarEvents || "",
    data.projects || "",
    data.meetingHosting || ""
  ];

  sheet.appendRow(newRow);
  Logger.log("Added new organization: " + data.organizationName);
}

// ====== UPDATE EXISTING ORGANIZATION ======
function updateOrganization(sheet, rowIndex, data) {
  // Update each column (adjust column numbers based on your sheet structure)
  sheet.getRange(rowIndex, 1).setValue(data.organizationName);
  sheet.getRange(rowIndex, 2).setValue(data.totalPopulation || "");
  sheet.getRange(rowIndex, 3).setValue(data.activeMembers || "");
  sheet.getRange(rowIndex, 4).setValue(data.orgMembers || "");
  sheet.getRange(rowIndex, 5).setValue(data.totalMembers || "");
  sheet.getRange(rowIndex, 6).setValue(data.revenue || "");
  sheet.getRange(rowIndex, 7).setValue(data.events || "");
  sheet.getRange(rowIndex, 8).setValue(data.calendarEvents || "");
  sheet.getRange(rowIndex, 9).setValue(data.projects || "");
  sheet.getRange(rowIndex, 10).setValue(data.meetingHosting || "");

  Logger.log("Updated organization: " + data.organizationName);
}

// ====== HANDLE GET REQUESTS (FOR TESTING) ======
function doGet(e) {
  return ContentService
    .createTextOutput("GFMAM Dashboard API is working!")
    .setMimeType(ContentService.MimeType.TEXT);
}

// ====== TEST FUNCTION (RUN THIS TO TEST) ======
function testScript() {
  const testData = {
    organizationName: "Test Organization",
    totalPopulation: "10000",
    activeMembers: "500",
    orgMembers: "50",
    totalMembers: "550",
    revenue: "100000",
    events: "5",
    calendarEvents: "3",
    projects: "2",
    meetingHosting: "1"
  };

  const result = doPost({
    postData: {
      contents: JSON.stringify(testData)
    }
  });

  Logger.log(result.getContent());
}
