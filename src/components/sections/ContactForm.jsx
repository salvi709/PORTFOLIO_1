import React, { useRef, useState } from "react";
import { personalInfo } from "../../data/portfolioData";
import useContentRefresh from "../../hooks/useContentRefresh";
import {
  validateDescription,
  improveDescription,
  submitInquiry,
} from "../../lib/contactApi";

const projectTypes = [
  "Website / Development",
  "Frontend Engineering",
  "UI/UX Design",
  "Web Applications",
  "AI & Data Science Project",
  "Video Editing",
  "Motion Graphics",
  "Creative Development",
  "Something Else",
];

export default function ContactForm() {
  const root = useRef(null);
  useContentRefresh(root);

  // Form Fields
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    projectType: "",
    budget: "",
    message: "",
    website: "", // Honeypot field
  });

  // AI Validation State
  const [aiState, setAiState] = useState({
    status: "idle", // 'idle' | 'validating' | 'relevant' | 'needs_clarification' | 'spam'
    feedback: "",
    suggestion: null,
    improving: false,
    showSuggestion: false,
    lastCheckedMessage: "",
  });

  // Submission State
  const [submitState, setSubmitState] = useState({
    status: "idle", // 'idle' | 'submitting' | 'success' | 'error'
    message: "",
    resultData: null,
  });

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Reset error on modification
    if (submitState.status === "error") {
      setSubmitState({ status: "idle", message: "", resultData: null });
    }

    // Reset AI state if description changes meaningfully
    if (name === "message" && aiState.status !== "idle") {
      if (Math.abs(value.length - aiState.lastCheckedMessage.length) > 10) {
        setAiState((prev) => ({
          ...prev,
          status: "idle",
          feedback: "",
          suggestion: null,
          showSuggestion: false,
        }));
      }
    }
  };

  // Trigger AI Validation on Blur
  const handleDescriptionBlur = async () => {
    const msg = formData.message.trim();
    if (
      msg.length < 5 ||
      msg === aiState.lastCheckedMessage ||
      aiState.status === "validating"
    ) {
      return;
    }

    setAiState((prev) => ({ ...prev, status: "validating" }));

    try {
      const result = await validateDescription({
        message: msg,
        projectType: formData.projectType,
      });

      const classification = result.classification || "RELEVANT";
      const statusMap = {
        RELEVANT: "relevant",
        NEEDS_CLARIFICATION: "needs_clarification",
        SPAM_OR_IRRELEVANT: "spam",
      };

      setAiState({
        status: statusMap[classification] || "relevant",
        feedback:
          result.feedback ||
          (classification === "RELEVANT"
            ? "Inquiry looks relevant and clear."
            : "Could you tell me a little more about what you're looking to build?"),
        suggestion: result.suggestion || null,
        improving: false,
        showSuggestion: false,
        lastCheckedMessage: msg,
      });
    } catch {
      setAiState((prev) => ({
        ...prev,
        status: "idle",
        feedback: "",
      }));
    }
  };

  // Request AI Description Improvement
  const handleImproveDescription = async () => {
    if (!formData.message.trim() || aiState.improving) return;

    setAiState((prev) => ({ ...prev, improving: true }));

    try {
      const res = await improveDescription({
        message: formData.message,
        projectType: formData.projectType,
      });

      if (res && res.improvedText) {
        setAiState((prev) => ({
          ...prev,
          improving: false,
          suggestion: res.improvedText,
          showSuggestion: true,
        }));
      }
    } catch (err) {
      setAiState((prev) => ({
        ...prev,
        improving: false,
        feedback: "Could not generate suggestion. Please continue writing your thoughts.",
      }));
    }
  };

  // Apply Improved Text to Message
  const handleApplySuggestion = () => {
    if (!aiState.suggestion) return;
    setFormData((prev) => ({ ...prev, message: aiState.suggestion }));
    setAiState({
      status: "relevant",
      feedback: "Updated with suggested clarification. Ready to submit.",
      suggestion: null,
      improving: false,
      showSuggestion: false,
      lastCheckedMessage: aiState.suggestion,
    });
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent duplicate submits
    if (submitState.status === "submitting") return;

    // Validate Required Fields
    const name = formData.name.trim();
    const email = formData.email.trim();
    const message = formData.message.trim();

    if (!name || !email || !message) {
      setSubmitState({
        status: "error",
        message: "Please fill in all required fields (Name, Email, and Project Description).",
        resultData: null,
      });
      return;
    }

    // Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setSubmitState({
        status: "error",
        message: "Please enter a valid email address.",
        resultData: null,
      });
      return;
    }

    // If marked as SPAM, polite rejection
    if (aiState.status === "spam") {
      setSubmitState({
        status: "error",
        message:
          "This form is dedicated to project collaborations and creative work. Please adjust your message to describe your project.",
        resultData: null,
      });
      return;
    }

    setSubmitState({
      status: "submitting",
      message: "Sending inquiry to Google Sheets...",
      resultData: null,
    });

    try {
      // 1. Fast AI check if not yet checked
      let currentAiValidation = null;
      if (aiState.status === "idle" || aiState.lastCheckedMessage !== message) {
        const check = await validateDescription({
          message,
          projectType: formData.projectType,
        });
        if (check.classification === "SPAM_OR_IRRELEVANT") {
          setAiState({
            status: "spam",
            feedback: check.feedback,
            suggestion: null,
            improving: false,
            showSuggestion: false,
            lastCheckedMessage: message,
          });
          setSubmitState({
            status: "error",
            message: check.feedback || "This form is dedicated to project inquiries.",
            resultData: null,
          });
          return;
        }
        currentAiValidation = check;
      } else {
        currentAiValidation = {
          classification:
            aiState.status === "needs_clarification"
              ? "NEEDS_CLARIFICATION"
              : "RELEVANT",
          feedback: aiState.feedback,
        };
      }

      // 2. Submit to Google Sheets via serverless endpoint
      const response = await submitInquiry({
        name,
        email,
        projectType: formData.projectType,
        budget: formData.budget,
        message,
        honeypot: formData.website,
        aiValidation: currentAiValidation,
      });

      if (response && response.ok) {
        setSubmitState({
          status: "success",
          message: "Your inquiry has been recorded in Sarthak's project spreadsheet.",
          resultData: response,
        });
      } else {
        throw new Error(response?.error || "Failed to save inquiry to spreadsheet.");
      }
    } catch (err) {
      console.error("Submission failed:", err);
      setSubmitState({
        status: "error",
        message:
          err.message ||
          "Could not save inquiry to Google Sheets. You can retry or open a pre-filled email draft below.",
        resultData: null,
      });
    }
  };

  // Fallback: Open pre-filled email client draft
  const openEmailDraftFallback = () => {
    const subject = `Portfolio enquiry — ${formData.projectType || "New Project"}`;
    const body = `Hi Sarthak,\n\n${formData.message}\n\nName: ${formData.name}\nEmail: ${formData.email}\nProject type: ${formData.projectType || "General"}\nApproximate budget: ${formData.budget || "Not specified"}`;
    window.location.href = `mailto:${personalInfo.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  };

  // Reset form to send another inquiry
  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      projectType: "",
      budget: "",
      message: "",
      website: "",
    });
    setAiState({
      status: "idle",
      feedback: "",
      suggestion: null,
      improving: false,
      showSuggestion: false,
      lastCheckedMessage: "",
    });
    setSubmitState({
      status: "idle",
      message: "",
      resultData: null,
    });
  };

  return (
    <div ref={root} className="contact-form-extension" data-story-extra>
      {submitState.status === "success" ? (
        <div className="contact-result-card success" role="status">
          <h3 className="contact-result-heading">Inquiry Recorded.</h3>
          <p className="contact-result-body">
            Thank you, <strong>{formData.name}</strong>. Your project details have been
            saved directly into my spreadsheet. I typically review incoming briefs and reply
            within 24–48 hours at <em>{formData.email}</em>.
          </p>
          <div className="contact-result-meta">
            <span>
              Timestamp: <strong>{submitState.resultData?.timestamp || "Just now"}</strong>
            </span>
            <span>
              Status: <strong className="text-lavender-electric">New Inquiry</strong>
            </span>
            <span>
              Category: <strong>{formData.projectType || "General Inquiry"}</strong>
            </span>
          </div>
          <div className="contact-result-actions">
            <button
              type="button"
              onClick={handleReset}
              className="ai-btn-sm"
              aria-label="Send another inquiry"
            >
              Send another message ↗
            </button>
          </div>
        </div>
      ) : (
        <form className="contact-form" onSubmit={handleSubmit} noValidate>
          {/* Honeypot field for bot protection */}
          <input
            type="text"
            name="website"
            value={formData.website}
            onChange={handleChange}
            tabIndex={-1}
            autoComplete="off"
            style={{ display: "none" }}
            aria-hidden="true"
          />

          {/* Row 1: Name and Email */}
          <div className="contact-form-grid">
            <label htmlFor="contact-name">
              Your name *
              <input
                id="contact-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
                required
                maxLength={100}
                placeholder="What should I call you?"
                disabled={submitState.status === "submitting"}
              />
            </label>
            <label htmlFor="contact-email">
              Email address *
              <input
                id="contact-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
                maxLength={254}
                placeholder="Where the reply should land"
                disabled={submitState.status === "submitting"}
              />
            </label>
          </div>

          {/* Row 2: Project Type and Budget */}
          <div className="contact-form-grid">
            <label htmlFor="contact-type">
              Project type
              <select
                id="contact-type"
                name="projectType"
                value={formData.projectType}
                onChange={handleChange}
                disabled={submitState.status === "submitting"}
              >
                <option value="">Choose the closest fit</option>
                {projectTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label htmlFor="contact-budget">
              Approximate budget (optional)
              <input
                id="contact-budget"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                maxLength={80}
                placeholder="e.g. $1k–$3k, flexible, or open"
                disabled={submitState.status === "submitting"}
              />
            </label>
          </div>

          {/* Row 3: Description with AI feedback */}
          <label htmlFor="contact-message">
            What do you have in mind? *
            <textarea
              id="contact-message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              onBlur={handleDescriptionBlur}
              required
              maxLength={2500}
              rows={5}
              placeholder="Start with the idea. The neatly organised version can wait."
              disabled={submitState.status === "submitting"}
            />
          </label>

          {/* AI Validation Status Pill */}
          {aiState.status === "validating" && (
            <div className="ai-status-indicator analyzing" aria-live="polite">
              <span className="spinner-dot" /> Analyzing project description with AI...
            </div>
          )}

          {aiState.status === "relevant" && (
            <div className="ai-status-indicator relevant" aria-live="polite">
              <span>✓</span> {aiState.feedback || "Relevant inquiry • Ready to submit"}
            </div>
          )}

          {/* AI Clarification Box */}
          {aiState.status === "needs_clarification" && (
            <div className="ai-feedback-box clarification" aria-live="polite">
              <div className="ai-feedback-header">
                <span className="text-lavender-electric">Clarification note</span>
                <button
                  type="button"
                  onClick={handleImproveDescription}
                  disabled={aiState.improving}
                  className="ai-btn-sm"
                  title="Make this description clearer while preserving your exact meaning"
                >
                  {aiState.improving ? "Refining..." : "✨ Improve description"}
                </button>
              </div>
              <p className="ai-feedback-message">
                {aiState.feedback ||
                  "Could you tell me a little more about what you're looking to build?"}
              </p>

              {/* Optional Suggestion Preview */}
              {aiState.showSuggestion && aiState.suggestion && (
                <div className="ai-suggestion-preview">
                  <p className="text-xs font-semibold text-offwhite mb-1">
                    Suggested revision (client review):
                  </p>
                  <p className="text-sm italic text-secondary">
                    "{aiState.suggestion}"
                  </p>
                  <div className="ai-suggestion-actions">
                    <button
                      type="button"
                      onClick={handleApplySuggestion}
                      className="ai-btn-sm primary"
                    >
                      Apply revision ↗
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setAiState((prev) => ({ ...prev, showSuggestion: false }))
                      }
                      className="ai-btn-sm"
                    >
                      Keep my original
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI Spam / Irrelevant Warning */}
          {aiState.status === "spam" && (
            <div className="ai-feedback-box warning" role="alert">
              <div className="ai-feedback-header text-red-400">
                Notice: Inquiry Scope
              </div>
              <p className="ai-feedback-message text-offwhite-muted">
                {aiState.feedback ||
                  "This form is dedicated to project collaborations and creative work."}
              </p>
            </div>
          )}

          {/* Submission Error Card */}
          {submitState.status === "error" && (
            <div className="contact-result-card error" role="alert">
              <p className="text-sm text-red-300 font-medium mb-2">
                Submission notice:
              </p>
              <p className="text-xs text-secondary mb-3">{submitState.message}</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  className="ai-btn-sm primary"
                  disabled={submitState.status === "submitting"}
                >
                  Retry submission ↗
                </button>
                <button
                  type="button"
                  onClick={openEmailDraftFallback}
                  className="ai-btn-sm"
                >
                  Open pre-filled email draft instead ↗
                </button>
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="contact-form-action mt-6">
            <button
              type="submit"
              disabled={submitState.status === "submitting"}
              aria-describedby="sheets-workflow"
            >
              {submitState.status === "submitting" ? (
                <>
                  <span className="spinner-dot" /> Recording inquiry...
                </>
              ) : (
                <>
                  Send inquiry to spreadsheet <span aria-hidden="true">↗</span>
                </>
              )}
            </button>
            <p id="sheets-workflow">
              Records directly into Sarthak's project spreadsheet with AI validation.
              <br />
              No spam, no third-party tracking.
            </p>
          </div>

          {/* Privacy Notice */}
          <p className="contact-privacy-note">
            Privacy notice: Submitted details are processed securely and used solely to
            evaluate and respond to your project inquiry.
          </p>
        </form>
      )}
    </div>
  );
}
