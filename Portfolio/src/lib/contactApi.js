/**
 * Client API handler for Portfolio Contact Form
 * Communicates with Google Apps Script Web App Endpoint / Serverless API
 */

const ENDPOINT_URL =
  import.meta.env.VITE_GOOGLE_SCRIPT_URL || "/api/inquiry";

/**
 * Send request to backend endpoint with timeout and CORS safety
 */
async function postToEndpoint(payload, timeoutMs = 18000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // Send as text/plain to avoid CORS preflight limitations in Google Apps Script
    const res = await fetch(ENDPOINT_URL, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(errText || `Server returned HTTP status ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (err) {
    clearTimeout(timer);
    if (err.name === "AbortError") {
      throw new Error(
        "Request timed out. The server took too long to respond. Please try again."
      );
    }
    throw err;
  }
}

/**
 * Validate project description using Gemini AI
 */
export async function validateDescription({ message, projectType }) {
  if (!message || message.trim().length < 5) {
    return {
      ok: true,
      classification: "NEEDS_CLARIFICATION",
      reason: "Message is too short.",
      feedback:
        "Could you tell me a little more about what you're looking to build?",
      suggestion: `I'm looking for assistance with ${projectType || "a new project"}. Specifically, I need help with [mention key goals, scope, or timeline].`,
    };
  }

  try {
    const data = await postToEndpoint({
      action: "validate",
      message: message.trim(),
      projectType: projectType || "General Inquiry",
    });
    return data;
  } catch (err) {
    console.warn("AI validation request error:", err);
    // Graceful offline fallback: allow user to continue without hard-blocking them
    return {
      ok: true,
      classification: "RELEVANT",
      reason: "Validation server unreachable, continuing with standard submission.",
      feedback: "Note: AI review is temporarily offline. Your inquiry will still be submitted directly to Sarthak.",
      suggestion: null,
      isFallback: true,
    };
  }
}

/**
 * Generate an improved description using Gemini AI
 */
export async function improveDescription({ message, projectType }) {
  try {
    const data = await postToEndpoint({
      action: "improve",
      message: message.trim(),
      projectType: projectType || "General Inquiry",
    });
    return data;
  } catch (err) {
    console.warn("Improve description error:", err);
    throw new Error(
      "Could not generate suggestion at this moment. You can continue editing manually."
    );
  }
}

/**
 * Submit inquiry to Google Sheets
 */
export async function submitInquiry({
  name,
  email,
  projectType,
  budget,
  message,
  honeypot,
  aiValidation,
}) {
  const data = await postToEndpoint({
    action: "submit",
    name: name.trim(),
    email: email.trim(),
    projectType: projectType || "General Inquiry",
    budget: (budget || "").trim() || "Not specified",
    message: message.trim(),
    website: honeypot || "", // Bot honeypot
    aiValidation,
  });

  return data;
}

export function isEndpointConfigured() {
  return (
    Boolean(import.meta.env.VITE_GOOGLE_SCRIPT_URL) ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  );
}
