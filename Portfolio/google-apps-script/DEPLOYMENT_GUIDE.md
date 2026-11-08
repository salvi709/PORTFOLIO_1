# Google Sheets & Gemini AI Integration Setup Guide
### Sarthak Salvi Portfolio — Client Inquiry Management System

Follow these simple steps to link your portfolio contact form to your Google Spreadsheet and enable server-side Gemini AI validation.

---

## Step 1: Create Your Google Spreadsheet

1. Go to [Google Sheets](https://sheets.new) in your browser.
2. Rename the spreadsheet to:
   **`Sarthak Salvi — Client Inquiries`**
3. Rename the bottom tab/sheet to:
   **`Inquiries`**
4. Leave the sheet empty. The script automatically initializes the column headers, styling, bold text, column widths, and timestamp formatting on the first submission.

---

## Step 2: Open the Google Apps Script Editor

1. In your newly created Google Sheet, click on the top menu:
   **Extensions** $\rightarrow$ **Apps Script**.
2. Rename the Apps Script project (top left) to:
   **`Portfolio Contact Form Backend`**.
3. In the script editor, delete any existing default code inside `Code.gs`.
4. Open the file **`google-apps-script/Code.gs`** from this project repository, copy its entire contents, and paste it into the Apps Script editor.
5. Click the **Save** icon (diskette icon) or press `Ctrl + S` (`Cmd + S` on Mac).

---

## Step 3: Get a Free Gemini API Key & Set Script Property

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Click **Create API key** (it is free).
3. Copy your Gemini API Key.
4. Back in the Google Apps Script editor:
   - Click the **Gear icon (Project Settings)** on the left sidebar.
   - Scroll down to the **Script Properties** section.
   - Click **Add script property**.
   - Set **Property**: `GEMINI_API_KEY`
   - Set **Value**: Paste your Gemini API key.
   - Click **Save script properties**.

> **Security Note:** The API key is stored strictly on Google's private cloud server. It is **never** sent to or exposed in the frontend browser code or network inspection tabs.

---

## Step 4: Deploy as a Web App

1. In the top right of the Google Apps Script editor, click the blue **Deploy** button $\rightarrow$ **New deployment**.
2. Click the **Gear icon** next to "Select type" and choose **Web app**.
3. Fill in the deployment details:
   - **Description**: `Portfolio Inquiry Endpoint v1`
   - **Execute as**: **`Me (your_email@gmail.com)`**
   - **Who has access**: **`Anyone`** *(Crucial: This allows your portfolio form visitors to submit inquiries without logging into Google).*
4. Click **Deploy**.
5. When prompted for authorization:
   - Click **Authorize access**.
   - Select your Google account.
   - Click **Advanced** $\rightarrow$ **Go to Portfolio Contact Form Backend (unsafe)** *(standard Google Apps Script notice for your personal scripts)*.
   - Click **Allow**.
6. Google Apps Script will now display your **Web app URL**, which looks like:
   `https://script.google.com/macros/s/AKfycbx.../exec`
7. Copy this URL!

---

## Step 5: Connect URL to Your Portfolio

1. In your portfolio project root directory, create a `.env` file (or edit existing `.env`):
   ```env
   VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_COPIED_ID/exec
   ```
2. Restart your development server (`npm run dev`) or build for production (`npm run build`).

---

## Step 6: Verify in Browser

1. Fill out the contact form on your portfolio:
   - Name: `Alex Carter`
   - Email: `alex@example.com`
   - Project type: `Website / Development`
   - Budget: `$2,000`
   - Message: `Need a clean 4-page portfolio website for my creative agency with smooth scroll animations.`
2. Notice the AI validation indicator:
   - `✓ Relevant inquiry • Ready to submit`
3. Click **Send inquiry to spreadsheet ↗**.
4. Check your Google Sheet:
   - A new row will appear with Timestamp, Client Name, Email, Category, Budget, Description, Classification (`RELEVANT`), and Status (`New Inquiry`).
