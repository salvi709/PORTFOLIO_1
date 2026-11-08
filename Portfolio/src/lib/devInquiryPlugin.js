/**
 * Vite Dev Server Plugin: /api/inquiry
 * Simulates the Google Apps Script Web App during local development & testing.
 * If GEMINI_API_KEY is present in environment, connects directly to Gemini AI.
 */

export function devInquiryPlugin() {
  return {
    name: "dev-inquiry-plugin",
    configureServer(server) {
      server.middlewares.use("/api/inquiry", async (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end(JSON.stringify({ ok: false, error: "Method not allowed" }));
          return;
        }

        let body = "";
        req.on("data", (chunk) => {
          body += chunk;
        });

        req.on("end", async () => {
          try {
            const data = JSON.parse(body || "{}");
            const action = data.action || "submit";

            // Honeypot check
            if (data.website || data.honeypot) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ ok: false, error: "Bot detected" }));
              return;
            }

            const apiKey = process.env.GEMINI_API_KEY;

            if (action === "ping") {
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ ok: true, status: "pong", dev: true }));
              return;
            }

            if (action === "validate") {
              const message = String(data.message || "").trim();
              const projectType = String(data.projectType || "General Inquiry");

              if (apiKey) {
                try {
                  const prompt = `You are an inquiry classifier for Sarthak Salvi's portfolio.
Sarthak's services:
- Website development & creative coding
- Frontend engineering (React, animations, GSAP, WebGL/canvas)
- UI/UX design & product prototyping
- Web applications & interactive platforms
- AI and Data Science projects & integrations
- Video editing, color grading & narrative rhythm
- Motion graphics & typography
- Creative development collaborations

Classify this inquiry:
Category: "${projectType}"
Message: "${message}"

Respond ONLY with valid JSON:
{
  "classification": "RELEVANT" | "NEEDS_CLARIFICATION" | "SPAM_OR_IRRELEVANT",
  "reason": "Short reason",
  "feedback": "Friendly message for client",
  "suggestion": "Clearer 1-2 sentence rewrite if NEEDS_CLARIFICATION, else null"
}`;

                  const resp = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                      }),
                    }
                  );

                  if (resp.ok) {
                    const json = await resp.json();
                    const text = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
                    const clean = text.replace(/```json/g, "").replace(/```/g, "").trim();
                    const parsed = JSON.parse(clean);
                    res.setHeader("Content-Type", "application/json");
                    res.end(JSON.stringify({ ok: true, ...parsed }));
                    return;
                  }
                } catch (e) {
                  console.warn("Dev server Gemini API call failed, using heuristic fallback:", e);
                }
              }

              // Local Heuristic Fallback
              const lower = message.toLowerCase();
              const spamWords = ["crypto", "forex", "viagra", "casino", "seo ranking", "backlinks", "loan"];
              const isSpam = spamWords.some((w) => lower.includes(w)) || /([a-z0-9])\1{5,}/i.test(lower);
              const isShort = lower.split(/\s+/).filter(Boolean).length < 4 && lower.length < 25;

              if (isSpam) {
                res.setHeader("Content-Type", "application/json");
                res.end(
                  JSON.stringify({
                    ok: true,
                    classification: "SPAM_OR_IRRELEVANT",
                    reason: "Detected spam or promotional keywords.",
                    feedback: "This form is dedicated to project inquiries and creative collaborations.",
                    suggestion: null,
                  })
                );
                return;
              }

              if (isShort) {
                res.setHeader("Content-Type", "application/json");
                res.end(
                  JSON.stringify({
                    ok: true,
                    classification: "NEEDS_CLARIFICATION",
                    reason: "Inquiry is very brief.",
                    feedback: "Could you tell me a little more about what you're looking to build?",
                    suggestion: `I'm looking for assistance with ${projectType}. Specifically, I need help with [mention key goals, scope, or timeline].`,
                  })
                );
                return;
              }

              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  ok: true,
                  classification: "RELEVANT",
                  reason: "Matches development and creative services.",
                  feedback: "Looks relevant to Sarthak's development and creative services.",
                  suggestion: null,
                })
              );
              return;
            }

            if (action === "improve") {
              const message = String(data.message || "").trim();
              const projectType = String(data.projectType || "General Inquiry");

              if (apiKey) {
                try {
                  const prompt = `Rewrite this project inquiry for Sarthak Salvi to be clearer and well-structured, in 2-3 sentences max. Do NOT invent new requirements.
Category: "${projectType}"
Message: "${message}"`;
                  const resp = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                      }),
                    }
                  );
                  if (resp.ok) {
                    const json = await resp.json();
                    const text = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
                    if (text) {
                      res.setHeader("Content-Type", "application/json");
                      res.end(JSON.stringify({ ok: true, improvedText: text }));
                      return;
                    }
                  }
                } catch (e) {
                  // Fallback below
                }
              }

              // Fallback improver
              const improved = `I am looking to collaborate on a ${projectType} project. Specifically: ${message}. Let me know your current availability and timeline.`;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ ok: true, improvedText: improved }));
              return;
            }

            if (action === "submit") {
              const name = String(data.name || "").trim();
              const email = String(data.email || "").trim();
              const message = String(data.message || "").trim();

              if (!name || !email || !message) {
                res.statusCode = 400;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ ok: false, error: "Missing required fields" }));
                return;
              }

              // Emulate successful row insertion in Google Sheets
              const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST";
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  ok: true,
                  message: "Inquiry saved successfully to Google Sheets.",
                  timestamp,
                  rowNumber: Math.floor(Math.random() * 50) + 2,
                  classification: data.aiValidation?.classification || "RELEVANT",
                })
              );
              return;
            }

            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: false, error: "Invalid action" }));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: false, error: err.message }));
          }
        });
      });
    },
  };
}
