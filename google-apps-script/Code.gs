/**
 * ============================================================================
 * SARTHAK SALVI PORTFOLIO — CLIENT INQUIRY MANAGEMENT SYSTEM
 * Google Apps Script Web App Endpoint + Gemini AI Validation
 * ============================================================================
 * 
 * Features:
 * 1. Automatic Google Sheets row insertion with formatted headers & timestamps
 * 2. Server-side Gemini AI classification (RELEVANT, NEEDS_CLARIFICATION, SPAM_OR_IRRELEVANT)
 * 3. Client feedback generation & optional "Improve Description" helper
 * 4. Formula injection protection (sanitizes `=, +, -, @` prefixes)
 * 5. Honeypot protection & basic rate limiting
 * 6. Secure: Gemini API Key stored in Script Properties (never exposed to frontend)
 * 7. Clean JSON responses with CORS support
 */

// Configuration constants
const SPREADSHEET_NAME = "Client Inquiries";
const SHEET_TAB_NAME = "Inquiries";
const DEFAULT_GEMINI_MODEL = "gemini-1.5-flash";

/**
 * Handle GET requests (Health check & status)
 */
function doGet(e) {
  return createJsonResponse({
    ok: true,
    service: "Sarthak Salvi Portfolio Inquiry Management System",
    status: "online",
    timestamp: new Date().toISOString()
  });
}

/**
 * Handle POST requests from portfolio contact form
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({ ok: false, error: "Empty request payload." }, 400);
    }

    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      // Fallback for form-encoded data
      data = e.parameter || {};
    }

    const action = data.action || "submit";

    // 1. Bot Honeypot Check: if honeypot field has any value, reject
    if (data.website || data.honeypot || data.company_fax) {
      return createJsonResponse({ ok: false, error: "Spam detected." }, 400);
    }

    // 2. Action routing
    if (action === "ping") {
      return createJsonResponse({ ok: true, status: "pong", timestamp: new Date().toISOString() });
    }

    if (action === "validate") {
      return handleValidate(data);
    }

    if (action === "improve") {
      return handleImprove(data);
    }

    if (action === "submit") {
      return handleSubmit(data);
    }

    return createJsonResponse({ ok: false, error: "Unknown action: " + action }, 400);

  } catch (err) {
    Logger.log("doPost Error: " + err.toString());
    return createJsonResponse({
      ok: false,
      error: "Internal server error: " + err.message
    }, 500);
  }
}

/**
 * Validate description using Gemini AI
 */
function handleValidate(data) {
  const message = String(data.message || "").trim();
  const projectType = String(data.projectType || "General Inquiry").trim();

  if (!message || message.length < 5) {
    return createJsonResponse({
      ok: true,
      classification: "NEEDS_CLARIFICATION",
      reason: "Message is too short.",
      feedback: "Could you tell me a little more about what you're looking to build?",
      suggestion: "I'm looking for assistance with " + (projectType || "a new project") + ". Specifically, I need help with [mention key goals, scope, or timeline]."
    });
  }

  const aiResult = callGeminiClassifier(message, projectType);
  return createJsonResponse({
    ok: true,
    ...aiResult
  });
}

/**
 * Improve client description without altering their original intent
 */
function handleImprove(data) {
  const message = String(data.message || "").trim();
  const projectType = String(data.projectType || "General Inquiry").trim();

  if (!message) {
    return createJsonResponse({ ok: false, error: "Description is empty." }, 400);
  }

  const improved = callGeminiImprover(message, projectType);
  return createJsonResponse({
    ok: true,
    improvedText: improved
  });
}

/**
 * Handle inquiry submission and Google Sheets row insertion
 */
function handleSubmit(data) {
  const name = sanitize(data.name || "");
  const email = sanitize(data.email || "");
  const projectType = sanitize(data.projectType || "General Inquiry");
  const budget = sanitize(data.budget || "Not specified");
  const message = sanitize(data.message || "");
  const clientValidation = data.aiValidation || null;

  // Validation
  if (!name || name.length > 100) {
    return createJsonResponse({ ok: false, error: "Please provide a valid name (up to 100 characters)." }, 400);
  }

  if (!email || !isValidEmail(email)) {
    return createJsonResponse({ ok: false, error: "Please provide a valid email address." }, 400);
  }

  if (!message || message.length < 5 || message.length > 3000) {
    return createJsonResponse({ ok: false, error: "Project description must be between 5 and 3000 characters." }, 400);
  }

  // Rate Limiting via CacheService (max 3 submissions per email in 5 minutes)
  const cache = CacheService.getScriptCache();
  const rateKey = "rate_" + Utilities.base64Encode(email).slice(0, 32);
  const currentCount = parseInt(cache.get(rateKey) || "0", 10);
  if (currentCount >= 3) {
    return createJsonResponse({
      ok: false,
      error: "You have submitted multiple inquiries recently. Please wait a few minutes before submitting another."
    }, 429);
  }
  cache.put(rateKey, String(currentCount + 1), 300);

  // Perform or reuse AI validation
  let classification = clientValidation?.classification;
  let reason = clientValidation?.reason || "";
  let feedback = clientValidation?.feedback || "";

  if (!classification) {
    const aiCheck = callGeminiClassifier(message, projectType);
    classification = aiCheck.classification;
    reason = aiCheck.reason;
    feedback = aiCheck.feedback;
  }

  // Reject definite SPAM
  if (classification === "SPAM_OR_IRRELEVANT") {
    return createJsonResponse({
      ok: false,
      classification: "SPAM_OR_IRRELEVANT",
      error: feedback || "This form is dedicated to project inquiries and creative collaborations."
    }, 400);
  }

  // Append row to Google Sheets
  const sheet = getOrCreateInquirySheet();
  const timestamp = Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss 'IST'");
  const inquiryStatus = "New Inquiry";

  sheet.appendRow([
    timestamp,
    name,
    email,
    projectType,
    budget,
    message,
    classification || "RELEVANT",
    inquiryStatus,
    reason || "Validated by Gemini AI"
  ]);

  const lastRow = sheet.getLastRow();

  // Format row: center timestamp, status, category
  sheet.getRange(lastRow, 1).setHorizontalAlignment("center");
  sheet.getRange(lastRow, 4).setHorizontalAlignment("center");
  sheet.getRange(lastRow, 5).setHorizontalAlignment("center");
  sheet.getRange(lastRow, 7).setHorizontalAlignment("center");
  sheet.getRange(lastRow, 8).setHorizontalAlignment("center");

  return createJsonResponse({
    ok: true,
    message: "Inquiry saved successfully to Google Sheets.",
    rowNumber: lastRow,
    timestamp: timestamp,
    classification: classification
  });
}

/**
 * Call Gemini AI to classify description
 */
function callGeminiClassifier(message, projectType) {
  const apiKey = getGeminiApiKey();

  // If no API key is configured yet, use robust local heuristic fallback
  if (!apiKey) {
    return fallbackHeuristicClassifier(message, projectType);
  }

  const prompt = `You are an inquiry classifier for Sarthak Salvi's personal portfolio.
Sarthak is a Creative Developer, AI & Data Science engineering student, and Video Editor.

Services Sarthak offers:
- Website development & creative development
- Frontend engineering (React, animations, GSAP, interactive WebGL/canvas)
- UI/UX design & product prototyping
- Web applications & interactive platforms
- AI and Data Science projects & integrations
- Video editing, color grading & narrative rhythm
- Motion graphics & typography
- Creative collaborations & technical partnerships

Analyze the following client inquiry:
Selected Project Category: "${projectType}"
Client Description: "${message}"

Classify into exactly one category:
1. RELEVANT: Related to Sarthak's services or a reasonable collaboration. IMPORTANT: Do not reject genuine inquiries just because they are short or written informally (e.g. "Looking for a portfolio site for my studio", "Need someone to edit a 60s teaser").
2. NEEDS_CLARIFICATION: Too short, vague or incomplete to understand what is needed (e.g. "I need a website", "Need work", "Call me"), but could represent a genuine project.
3. SPAM_OR_IRRELEVANT: Meaningless gibberish ("asdfghjkl"), crypto/SEO sales pitches, abuse, suspicious links, or completely unrelated services ("sell me car insurance", "fix plumbing").

Respond ONLY with valid JSON (no markdown formatting, no backticks):
{
  "classification": "RELEVANT" | "NEEDS_CLARIFICATION" | "SPAM_OR_IRRELEVANT",
  "reason": "Brief technical reason",
  "feedback": "Friendly, constructive client-facing message",
  "suggestion": "If NEEDS_CLARIFICATION, write a clearer 1-2 sentence version preserving what the client wants without inventing new requirements. Otherwise null."
}`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_GEMINI_MODEL}:generateContent?key=${apiKey}`;
    const response = UrlFetchApp.fetch(url, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 500
        }
      }),
      muteHttpExceptions: true
    });

    const status = response.getResponseCode();
    if (status !== 200) {
      Logger.log("Gemini API error (" + status + "): " + response.getContentText());
      return fallbackHeuristicClassifier(message, projectType);
    }

    const json = JSON.parse(response.getContentText());
    const candidateText = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleanJson = candidateText.replace(/```json/g, "").replace(/```/g, "").trim();
    const result = JSON.parse(cleanJson);

    return {
      classification: result.classification || "RELEVANT",
      reason: result.reason || "Processed with Gemini AI",
      feedback: result.feedback || (result.classification === "RELEVANT" ? "Looks great for collaboration." : "Could you provide a few more details?"),
      suggestion: result.suggestion || null
    };

  } catch (err) {
    Logger.log("callGeminiClassifier exception: " + err.toString());
    return fallbackHeuristicClassifier(message, projectType);
  }
}

/**
 * Call Gemini AI to improve client description
 */
function callGeminiImprover(message, projectType) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return message;
  }

  const prompt = `You are a helpful assistant for Sarthak Salvi's portfolio contact form.
A client wrote this project description:
Category: "${projectType}"
Message: "${message}"

Rewrite this description to be clearer, well-structured, and concise for Sarthak.
CRITICAL RULES:
1. Preserve the client's original intent, requirements, and tone.
2. DO NOT invent new features, budgets, deadlines, or requirements they didn't ask for.
3. Keep it to 2-4 sentences max.
4. Output ONLY the improved text, nothing else.`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_GEMINI_MODEL}:generateContent?key=${apiKey}`;
    const response = UrlFetchApp.fetch(url, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 300
        }
      }),
      muteHttpExceptions: true
    });

    if (response.getResponseCode() === 200) {
      const json = JSON.parse(response.getContentText());
      const candidateText = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
      return candidateText.trim() || message;
    }
    return message;
  } catch (err) {
    return message;
  }
}

/**
 * Fallback heuristic classifier when Gemini API is unavailable or unconfigured
 */
function fallbackHeuristicClassifier(message, projectType) {
  const text = message.toLowerCase().trim();

  // Obvious spam checks
  const spamPatterns = [
    /viagra|casino|crypto|forex|loan|seo ranking|backlinks|whatsapp\s*\+/i,
    /http:\/\/|https:\/\/[^\s]+(?:\.ru|\.xyz|\.top|\.click)/i
  ];
  for (const pattern of spamPatterns) {
    if (pattern.test(text)) {
      return {
        classification: "SPAM_OR_IRRELEVANT",
        reason: "Detected spam/promotional markers.",
        feedback: "This form is dedicated to project inquiries and creative collaborations.",
        suggestion: null
      };
    }
  }

  // Gibberish / repetition checks (e.g. "asdfghjk", "aaaaaaa")
  if (/([a-z0-9])\1{5,}/i.test(text) || (text.length > 15 && !text.includes(" ") && !text.includes("\n"))) {
    return {
      classification: "SPAM_OR_IRRELEVANT",
      reason: "Message appears to be random characters.",
      feedback: "It looks like the message was entered by mistake. Please share a brief outline of your project.",
      suggestion: null
    };
  }

  // Too short / vague
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount < 4 && text.length < 25) {
    return {
      classification: "NEEDS_CLARIFICATION",
      reason: "Description is very brief.",
      feedback: "Could you tell me a little more about what you're looking to build?",
      suggestion: "I'm looking for assistance with " + projectType + ". I need help with [describe your idea, timeline, or key deliverables]."
    };
  }

  // Default to relevant for genuine human inquiries
  return {
    classification: "RELEVANT",
    reason: "Project description matches portfolio disciplines.",
    feedback: "Looks relevant to Sarthak's development and creative services.",
    suggestion: null
  };
}

/**
 * Ensure Spreadsheet and Header Row exist with clean formatting
 */
function getOrCreateInquirySheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_TAB_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_TAB_NAME);
  }

  // Check if header row exists
  if (sheet.getLastRow() === 0) {
    const headers = [
      "Submission Date & Time",
      "Client Name",
      "Client Email",
      "Project Category",
      "Approx. Budget",
      "Project Description",
      "AI Classification",
      "Inquiry Status",
      "AI Validation Notes"
    ];

    sheet.appendRow(headers);

    // Style the header row
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#0C0C11"); // Portfolio theme surface
    headerRange.setFontColor("#FAF9FC");  // Portfolio text primary
    headerRange.setFontFamily("Arial");
    headerRange.setFontSize(10);
    headerRange.setWrap(true);
    headerRange.setVerticalAlignment("middle");
    headerRange.setHorizontalAlignment("center");

    // Freeze header row
    sheet.setFrozenRows(1);

    // Column widths for easy reading
    sheet.setColumnWidth(1, 175); // Timestamp
    sheet.setColumnWidth(2, 160); // Name
    sheet.setColumnWidth(3, 210); // Email
    sheet.setColumnWidth(4, 170); // Category
    sheet.setColumnWidth(5, 130); // Budget
    sheet.setColumnWidth(6, 380); // Description
    sheet.setColumnWidth(7, 140); // AI Result
    sheet.setColumnWidth(8, 120); // Status
    sheet.setColumnWidth(9, 240); // AI Notes

    sheet.setRowHeight(1, 38);
  }

  return sheet;
}

/**
 * Sanitize strings to avoid Google Sheets formula injection (=, +, -, @)
 */
function sanitize(input) {
  if (input === null || input === undefined) return "";
  let str = String(input).trim();
  if (/^[=+\-@]/.test(str)) {
    str = "'" + str; // Prefix with single quote so Sheets treats as plain text
  }
  return str;
}

/**
 * Basic email format validator
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

/**
 * Retrieve Gemini API Key securely from Script Properties
 */
function getGeminiApiKey() {
  const props = PropertiesService.getScriptProperties();
  return props.getProperty("GEMINI_API_KEY") || "";
}

/**
 * Helper to build JSON responses with appropriate headers
 */
function createJsonResponse(obj, statusCode) {
  const output = ContentService.createTextOutput(JSON.stringify(obj));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
