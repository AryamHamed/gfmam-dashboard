# GFMAM Dashboard - Complete Setup Guide

This guide will walk you through setting up the complete system with dynamic data and admin form.

---

## 📋 What's Changed

### ✅ Dashboard (index.html)
- Now fetches data from **KVI sheet** (pre-calculated values)
- Tooltips loaded dynamically from **Info sheet**
- No more hardcoded KPI names or calculations
- All KPIs are now data-driven

### ✅ Admin Panel (admin.html)
- Password-protected admin interface
- Form to update Society Data
- Saves directly to Google Sheets via Apps Script

---

## 🚀 Complete Setup Process

### Step 1: Google Sheets - Verify Your Structure

Make sure your Google Sheet has these three sheets:

1. **Society Data** - Raw data input (columns should match form fields)
2. **Key Value Indicators (KVI)** - Calculated KPIs with formulas
3. **i-info for each KVI** - Metadata (KVI name, description, unit)

**Already Done ✅** - You've published these sheets as CSV

---

### Step 2: Set Up Google Apps Script

This allows the admin form to save data back to your sheet.

#### A. Open Apps Script Editor

1. Open your Google Sheet
2. Click **Extensions → Apps Script**
3. You'll see a code editor

#### B. Add the Script

1. Delete any existing code in the editor
2. Open the file `google-apps-script.js` in this project
3. **Copy the entire contents**
4. **Paste into the Apps Script editor**

#### C. Verify Sheet Name

Make sure line 20 matches your sheet name:
```javascript
const SOCIETY_DATA_SHEET_NAME = "Society Data"; // Must match exactly!
```

#### D. Test the Script (Optional)

1. In Apps Script editor, select `testScript` from dropdown
2. Click **Run** (you may need to authorize)
3. Check **Execution log** - should say "Data saved successfully"
4. Check your Society Data sheet - "Test Organization" should appear

#### E. Deploy as Web App

1. Click **Deploy → New deployment**
2. Click the gear icon ⚙️ → Select **Web app**
3. Fill in:
   - **Description:** "GFMAM Data API"
   - **Execute as:** "Me (your email)"
   - **Who has access:** "Anyone" (for public access)
4. Click **Deploy**
5. **Copy the Web App URL** - it looks like:
   ```
   https://script.google.com/macros/s/ABC123.../exec
   ```

#### F. Update admin.html

1. Open `admin.html` in a text editor
2. Find line with `GOOGLE_APPS_SCRIPT_URL` (around line 244)
3. Replace `"YOUR_GOOGLE_APPS_SCRIPT_URL_HERE"` with your Web App URL:
   ```javascript
   const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/ABC123.../exec";
   ```
4. Save the file

---

### Step 3: Change Admin Password

**IMPORTANT:** Change the default password!

1. Open `admin.html` in a text editor
2. Find line with `ADMIN_PASSWORD` (around line 243):
   ```javascript
   const ADMIN_PASSWORD = "gfmam2025"; // Change this password!
   ```
3. Change `"gfmam2025"` to your secure password
4. Save the file

**Note:** This is client-side password protection (basic security). For production, consider server-side authentication.

---

### Step 4: Test the Complete System

#### A. Test the Dashboard

1. Open `index.html` in a web browser
2. You should see:
   - ✅ KPI cards with values from your KVI sheet
   - ✅ KPI titles matching your Info sheet
   - ✅ Tooltips with descriptions from Info sheet
   - ✅ Charts showing organization data
   - ✅ Spider chart working

3. **Check browser console** (F12) for any errors:
   - Should see: "✅ Parsed CSV"
   - Should see: "✅ Built metadata from Info sheet"
   - Should see: "✅ Dashboard Initialized Successfully"

#### B. Test the Admin Form

1. Open `admin.html` in a web browser
2. Enter your admin password
3. You should see the admin panel
4. Try selecting an organization from dropdown
5. Fill in some test data
6. Click **Save Data**
7. Check your Google Sheet - data should be updated!

---

## 🔧 Troubleshooting

### Problem: KPI cards show "Loading..."

**Cause:** Info sheet data not loading

**Solutions:**
1. Check that Info sheet URL is correct in `main.js` (line 10)
2. Verify Info sheet is published to web as CSV
3. Open Info sheet URL in browser - should download CSV
4. Check browser console for errors

### Problem: Charts not showing data

**Cause:** KVI sheet data not loading

**Solutions:**
1. Check that KVI sheet URL is correct in `main.js` (line 9)
2. Verify column names in KVI sheet match Info sheet KVI names exactly
3. Check browser console - look for "Parsed CSV" messages
4. Verify data types (numbers should be numbers, not text)

### Problem: Admin form shows "Error saving data"

**Causes:**
1. Google Apps Script URL not updated
2. Apps Script not deployed
3. Apps Script has errors

**Solutions:**
1. Verify you updated `GOOGLE_APPS_SCRIPT_URL` in admin.html
2. Re-deploy Apps Script (Deploy → Manage deployments → Edit → Deploy)
3. Check Apps Script execution logs (View → Execution log)
4. Test the script using `testScript()` function

### Problem: KPI names don't match

**Cause:** Column names in KVI sheet don't match KVI names in Info sheet

**Solution:**
1. Open both sheets side-by-side
2. Compare column headers in KVI sheet with "KVI" column in Info sheet
3. They must match **exactly** (case-sensitive, spaces matter)
4. Update either sheet to make them match

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────┐
│            ADMIN UPDATES DATA                   │
│                                                 │
│   admin.html → Google Apps Script → Society    │
│                   (Web App)         Data Sheet  │
└─────────────────────────────────────────────────┘
                        │
                        ▼
               ┌────────────────────┐
               │   Society Data     │
               │   (Raw Input)      │
               └────────┬───────────┘
                        │
                        │ Formulas calculate
                        │
                        ▼
               ┌────────────────────┐
               │   KVI Sheet        │
               │   (Calculated)     │
               └────────┬───────────┘
                        │
                        │ Published as CSV
                        │
                        ▼
               ┌────────────────────┐
               │   Dashboard        │
               │   (index.html)     │
               └────────────────────┘
                        │
                        │ Reads tooltips from
                        │
                        ▼
               ┌────────────────────┐
               │   Info Sheet       │
               │   (Metadata)       │
               └────────────────────┘
```

---

## 🔐 Security Considerations

### Current Setup (Basic Security)

✅ **Pros:**
- Simple setup
- No backend server needed
- Works on any static host

⚠️ **Cons:**
- Password visible in HTML source
- Google Sheet data is public (CSV URLs)
- No audit trail of who changed what

### Recommended for Production

If you need better security:

1. **Use Google Forms instead of custom admin form**
   - More secure
   - Built-in audit trail
   - No password needed (use Google auth)

2. **Add server-side authentication**
   - Use Vercel/Netlify with API routes
   - Store credentials securely
   - Add rate limiting

3. **Make sheets private**
   - Use Google Sheets API with OAuth
   - Keep sheets private
   - Proxy requests through backend

---

## 📝 Customization Guide

### Adding a New KPI

1. **Add column to Society Data sheet** (if needed)
2. **Add formula in KVI sheet** to calculate the KPI
3. **Add row to Info sheet** with:
   - KVI name (must match KVI column header)
   - Description
   - Unit of measure
4. **Refresh dashboard** - new KPI appears automatically!
5. **Update admin form** (if new raw data field needed):
   - Add form field in admin.html
   - Update Google Apps Script to save new field

### Changing KPI Order

The KPIs display in the **order they appear in the Info sheet**. To reorder:

1. Open Info sheet
2. Drag rows to reorder
3. Refresh dashboard - order updates automatically!

### Changing Color Scheme

Edit `style.css`:
```css
/* Primary colors */
--color-navy: #002b5c;    /* GFMAM navy blue */
--color-green: #84bd00;   /* GFMAM green */
--color-blue: #00a3e0;    /* GFMAM blue */
```

---

## 🚢 Deployment Options

### Option 1: GitHub Pages (Free)

1. Push code to GitHub
2. Go to Settings → Pages
3. Select branch and folder
4. Your site will be at: `username.github.io/repo-name`

### Option 2: Netlify (Free)

1. Sign up at netlify.com
2. Drag and drop your project folder
3. Site deployed instantly!
4. Custom domain available

### Option 3: Vercel (Free)

1. Sign up at vercel.com
2. Import from GitHub
3. Auto-deploy on every push

### Option 4: Traditional Web Hosting

1. Upload all files via FTP
2. Ensure directory structure preserved
3. Point domain to index.html

---

## 📞 Support

If you encounter issues:

1. Check browser console (F12) for errors
2. Verify all URLs are correct and accessible
3. Test each component separately
4. Check Google Apps Script execution logs

---

## ✅ Final Checklist

Before going live:

- [ ] All three Google Sheets published as CSV
- [ ] CSV URLs updated in main.js
- [ ] Google Apps Script deployed as Web App
- [ ] Web App URL updated in admin.html
- [ ] Admin password changed from default
- [ ] Dashboard loads and shows correct data
- [ ] Admin form can save data successfully
- [ ] All KPI names match between sheets
- [ ] Tooltips display correctly
- [ ] Charts and spider chart work
- [ ] Tested on multiple browsers
- [ ] Deployed to production hosting

---

**Last Updated:** December 2025
**Version:** 2.0 (Dynamic Data)
