import React from "react";
import { CursorProvider } from "./context/CursorContext";
import CustomCursor from "./components/common/CustomCursor";
import InteractiveGrid from "./components/common/InteractiveGrid";
import NoiseOverlay from "./components/common/NoiseOverlay";
import Navbar from "./components/navbar/Navbar";
import ScrollStory from "./components/scroll-story/ScrollStory";
import ServicesSection from "./components/sections/ServicesSection";
import AboutSection from "./components/sections/AboutSection";
import SkillsSection from "./components/sections/SkillsSection";
import GitHubSection from "./components/sections/GitHubSection";
import ExploringSection from "./components/sections/ExploringSection";
import QuestionsSection from "./components/sections/QuestionsSection";
import ContactSection from "./components/sections/ContactSection";
import "./styles/personality.css";
import "./styles/services.css";
import "./styles/github-section.css";
import Footer from "./components/footer/Footer";
import useWheelSensitivity from "./hooks/useWheelSensitivity";
import EntryTransition from "./components/common/EntryTransition";

export default function App() {
  useWheelSensitivity();
  return (
    <CursorProvider>
      <div id="bg-underlay" className="bg-underlay" aria-hidden="true" />
      <EntryTransition />
      <a className="skip-link" href="#work">
        Skip introduction, view work
      </a>
      <InteractiveGrid />
      <NoiseOverlay />
      <CustomCursor />
      <Navbar />
      <main>
        <ScrollStory />
        <ServicesSection />
        <AboutSection />
        <SkillsSection />
        <GitHubSection />
        <ExploringSection />
        <QuestionsSection />
        <ContactSection />
      </main>
      <Footer />
    </CursorProvider>
  );
}
