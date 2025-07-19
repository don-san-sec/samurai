# Samurai Installation Guide

Complete installation instructions for deploying the Samurai Gmail phishing reporter add-on.

⏱️ **Estimated time:** 15-20 minutes <br>
👤 **Required role:** Google Workspace Administrator

## Prerequisites

**For testing (any user):**
- Access to [script.google.com](https://script.google.com)
- Security team email address for receiving reports

**For organizational deployment (admin required):**
- Google Workspace administrator access
- Ability to install add-ons in your organization

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

1. Click "Deploy" → "Test deployments"
2. In the window that opens, click "Install" to install add-on
3. Click "Done"
4. Open Gmail in a new tab
5. **Test the add-on functionality:**
   - ✅ Add-on appears in Gmail sidebar
   - ✅ "Report Phishing" button works
   - ✅ "Request Investigation" button works
   - ✅ Security team receives test reports
   - ✅ No error messages appear

**Troubleshooting:** If deployment is stuck on "Loading development":
- Clear browser cache and cookies
- Try in an incognito/private window
- Restart your browser

## Step 7: Production Deployment

1. Click "Deploy" → "New deployment"
2. Click the gear icon → Select "Add-on"
3. **Configure deployment:**
   - **Description:** `Samurai Phishing Reporter`
   - **Execute as:** `Me`
   - **Who has access:** `Anyone within [your-domain.com]`
4. Click "Deploy"
5. **📋 IMPORTANT:** Copy and save the Deployment ID - you'll need this for installation

💡 **Tip:** The Deployment ID looks like: `AKfycby...` (long string starting with "AKfycby")


## Step 8: Install in Google Workspace

1. Go to [admin.google.com](https://admin.google.com)
2. **Navigate to:** Apps → Google Workspace → Gmail → Add-ons
3. Click "Install an add-on" (or **+** icon)
4. Select "Install from Apps Script deployment ID"
5. **Enter your Deployment ID** from Step 7
6. **Configure installation:**
   - **Installation policy:** `Available` (recommended for initial rollout)
   - **Organizational units:** Select pilot groups or entire organization
7. Click "Install"

⏳ **Note:** Installation may take 5-10 minutes to propagate across your organization.

## Step 9: Verify Installation

1. **Open Gmail** (refresh the page if it was already open)
2. **Select any email** in your inbox
3. **Look for the "Samurai" icon** in the right sidebar
4. **Click to open** the add-on
5. **Test functionality:**
   - Click "Report Phishing" → Verify success message
   - Click "Request Investigation" → Verify success message
6. **Confirm with security team** that they received test reports

## 🎉 Installation Complete!

Your Samurai add-on is now ready for use across your organization.
