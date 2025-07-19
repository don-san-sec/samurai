# Samurai Installation Guide

Complete installation instructions for deploying the Samurai Gmail phishing reporter add-on.

## Prerequisites

- Google Workspace administrator access
- Access to [script.google.com](https://script.google.com)
- Security team email address for receiving reports

## Step 1: Create the Project

1. Go to [script.google.com](https://script.google.com)
2. Click "New Project"
3. Name the project "Samurai"

## Step 2: Enable Gmail API

1. Click "Services" in the left sidebar (+ icon)
2. Find "Gmail API" in the list
3. Click on it and click "Add"
4. Click "OK"

## Step 3: Configure the Manifest

1. Click "Project Settings" (gear icon)
2. Check "Show 'appsscript.json' manifest file in editor"
3. Return to "Editor"
4. Click on `appsscript.json`
5. Replace contents with the provided `appsscript.json` file
6. Save (Ctrl/Cmd + S)

## Step 4: Add Project Files

**Important:** Create files in this exact order:

### 4.1 Create Config.js
1. Click the "+" next to "Files" → "Script"
2. Name it "Config" (without .js)
3. Replace contents with `src/Config.js`
4. **Update `SECURITY_EMAIL` with your actual security team email**
5. Save

### 4.2 Create Main.js
1. Click the "+" next to "Files" → "Script"
2. Name it "Main"
3. Replace contents with `src/Main.js`
4. Save

### 4.3 Create Setup.js
1. Click the "+" next to "Files" → "Script"
2. Name it "Setup"
3. Replace contents with `src/Setup.js`
4. Save

### 4.4 Delete Code.gs
1. Right-click on the default `Code.gs` file
2. Select "Delete" → "Delete forever"

## Step 5: Test Installation

1. In the dropdown menu, select `installAddOn` function
2. Click "Run"
3. Grant permissions when prompted
4. Check the execution log for:
   ```
   ✓ Configuration validated
   ✓ CardService available
   ✓ Gmail API enabled
   ✓ Utilities working
   ✓ Installation complete - Ready for deployment
   ```

## Step 6: Test Deployment (Recommended)

Before deploying organization-wide, it's recommended to test the add-on:

1. Click "Deploy" → "Test deployments"
  - **Note:** If your Google Apps Script deployment is stuck on "Loading development", it's often due to a temporary issue, cache corruption, or an underlying script error. Restart your browser and try again.
2. In the window opened click "Install" to install addon
3. Click "Done"
4. Open Gmail in a new tab
5. Test the add-on functionality. Verify:
   - The add-on appears in the sidebar
   - Clicking "Report Phishing" works correctly
   - Clicking "Request Investigation" works correctly
   - Reports are sent successfully

## Step 7: Production Deployment

Once testing is complete:

1. Click "Deploy" → "New deployment"
2. Click the gear icon → Select "Add-on"
3. Configure:
   - **Description:** Samurai Phishing Reporter v1.0
   - **Execute as:** Me
   - **Who has access:** Anyone within [your-domain.com]
4. Click "Deploy"
5. **Save the Deployment ID** (you'll need this for installation)

## Step 8: Install in Google Workspace

1. Go to [admin.google.com](https://admin.google.com)
2. Navigate to: Apps → Google Workspace → Gmail → Add-ons
3. Click "Install an add-on" (or + icon)
4. Select "Install from Apps Script deployment ID"
5. Enter your Deployment ID
6. Configure:
   - **Installation policy:** Available (recommended for initial rollout)
   - **Organizational units:** Select pilot groups or entire organization
7. Click "Install"

## Step 9: Verify Installation

1. Open Gmail (may need to refresh)
2. Select any email
3. Look for "Samurai" icon in the right sidebar
4. Click to open the add-on
5. Test both "Report Phishing" and "Request Investigation" buttons
6. Verify security team receives the reports
