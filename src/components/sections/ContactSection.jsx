import React, { useRef, useState } from "react";
import { personalInfo } from "../../data/portfolioData";
import SectionHeader from "../common/SectionHeader";
import useMagnetic from "../../hooks/useMagnetic";
import ContactForm from "./ContactForm";
export default function ContactSection() {
  const email = useRef(null);
  useMagnetic(email);
  const [status, setStatus] = useState("");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(personalInfo.email);
      setStatus("Email copied.");
    } catch {
      setStatus(
        "Copy unavailable. Select the email address or use the email link.",
      );
    }
  };
  return (
    <section id="contact" className="portfolio-section contact-section">
      <SectionHeader
        number="12"
        category="CONTACT / OPEN TO A GOOD WHAT-IF"
        title="ODD IDEA?"
        accentWord="Send the idea. We'll figure out the chaos."
      />
      <ContactForm />
      <div className="contact-line">
        <a ref={email} className="magnetic" href={"mailto:" + personalInfo.email}>
          {personalInfo.email}
          <span>↗</span>
        </a>
        <button onClick={copy} aria-label="Copy email address">
          COPY EMAIL
        </button>
      </div>
      <p className="copy-status" role="status">
        {status}
      </p>
      <div className="social-links">
        <a href={personalInfo.socials.github} target="_blank" rel="noreferrer">
          GitHub ↗
        </a>
        <a
          href={personalInfo.socials.linkedin}
          target="_blank"
          rel="noreferrer"
        >
          LinkedIn ↗
        </a>
        <a href={"mailto:" + personalInfo.email}>Email ↗</a>
      </div>
    </section>
  );
}
