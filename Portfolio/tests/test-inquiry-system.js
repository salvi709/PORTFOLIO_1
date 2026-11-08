// Test suite for Contact Form Inquiry Management System

const BASE_URL = "http://127.0.0.1:5173/api/inquiry";

async function post(payload) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function runTests() {
  console.log("=== STARTING INQUIRY SYSTEM TESTS ===\n");
  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}: ${err.message}`);
    }
  }

  // 1. Health Ping
  await test("Endpoint ping check", async () => {
    const { status, data } = await post({ action: "ping" });
    if (status !== 200 || !data.ok) throw new Error("Ping failed");
  });

  // 2. Valid Website Project
  await test("Valid website project inquiry", async () => {
    const { status, data } = await post({
      action: "validate",
      projectType: "Website / Development",
      message: "Looking for a modern creative portfolio with GSAP animations and 3D interactions for our architecture studio.",
    });
    if (status !== 200 || data.classification !== "RELEVANT") {
      throw new Error(`Expected RELEVANT, got ${data.classification}`);
    }
  });

  // 3. Valid Video Editing
  await test("Valid video editing inquiry", async () => {
    const { status, data } = await post({
      action: "validate",
      projectType: "Video Editing",
      message: "Need a professional video editor for a 60-second product launch reel. We have raw 4K footage and voiceover ready.",
    });
    if (status !== 200 || data.classification !== "RELEVANT") {
      throw new Error(`Expected RELEVANT, got ${data.classification}`);
    }
  });

  // 4. Valid AI / Data Project
  await test("Valid AI / data project inquiry", async () => {
    const { status, data } = await post({
      action: "validate",
      projectType: "AI & Data Science Project",
      message: "We want to build a real-time anomaly detection dashboard with predictive analytics and a Next.js front end.",
    });
    if (status !== 200 || data.classification !== "RELEVANT") {
      throw new Error(`Expected RELEVANT, got ${data.classification}`);
    }
  });

  // 5. Very short inquiry needing clarification
  await test("Very short / vague inquiry triggers clarification", async () => {
    const { status, data } = await post({
      action: "validate",
      projectType: "Website / Development",
      message: "need site",
    });
    if (status !== 200 || data.classification !== "NEEDS_CLARIFICATION") {
      throw new Error(`Expected NEEDS_CLARIFICATION, got ${data.classification}`);
    }
    if (!data.feedback) throw new Error("Expected feedback message");
  });

  // 6. Gibberish description
  await test("Gibberish description classified as spam", async () => {
    const { status, data } = await post({
      action: "validate",
      projectType: "UI/UX Design",
      message: "asdfghjklllllll12345555555555",
    });
    if (status !== 200 || data.classification !== "SPAM_OR_IRRELEVANT") {
      throw new Error(`Expected SPAM_OR_IRRELEVANT, got ${data.classification}`);
    }
  });

  // 7. Spam / promotional keywords
  await test("Unrelated promotional spam classified as spam", async () => {
    const { status, data } = await post({
      action: "validate",
      projectType: "Something Else",
      message: "Boost your crypto forex earnings with guaranteed 100x loan returns now!",
    });
    if (status !== 200 || data.classification !== "SPAM_OR_IRRELEVANT") {
      throw new Error(`Expected SPAM_OR_IRRELEVANT, got ${data.classification}`);
    }
  });

  // 8. Description improvement helper
  await test("Improve Description generates clarified version", async () => {
    const { status, data } = await post({
      action: "improve",
      projectType: "Video Editing",
      message: "i have some travel clips and need an edit for instagram",
    });
    if (status !== 200 || !data.improvedText) {
      throw new Error("Failed to generate improved text");
    }
  });

  // 9. Bot Honeypot detection
  await test("Honeypot field triggers rejection", async () => {
    const { status, data } = await post({
      action: "submit",
      name: "Bot User",
      email: "bot@spammer.com",
      message: "Valid looking message",
      website: "http://bot-honeypot-trap.com", // Honeypot filled!
    });
    if (status !== 400 || data.ok) {
      throw new Error("Honeypot should return 400 Bad Request");
    }
  });

  // 10. Missing required fields
  await test("Missing required fields rejection", async () => {
    const { status, data } = await post({
      action: "submit",
      name: "",
      email: "test@example.com",
      message: "Some message",
    });
    if (status !== 400 || data.ok) {
      throw new Error("Missing name should be rejected");
    }
  });

  // 11. Full successful submission
  await test("Full successful submission records row", async () => {
    const { status, data } = await post({
      action: "submit",
      name: "Sophia Chen",
      email: "sophia@lumina-design.com",
      projectType: "Website / Development",
      budget: "$3k - $5k",
      message: "We need an interactive web platform with custom WebGL shaders and smooth page transitions.",
      aiValidation: { classification: "RELEVANT" },
    });
    if (status !== 200 || !data.ok) {
      throw new Error(`Submission failed: ${data.error}`);
    }
    if (!data.timestamp || !data.rowNumber) {
      throw new Error("Expected timestamp and rowNumber in response");
    }
  });

  console.log(`\n=== RESULTS: ${passed}/${total} TESTS PASSED ===`);
  if (passed === total) {
    console.log("All inquiry management system tests passed successfully!");
  } else {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error("Test runner failed:", e);
  process.exit(1);
});
