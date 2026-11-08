export const personalInfo = {
  name: "Sarthak Salvi",
  email: "sarthaksalvi2004@gmail.com",
  role: "AI & Data Science Engineering Student · Developer · Video Editor",
  tagline: "Code × Design × Motion × Storytelling",
  location: "Mumbai, India",
  socials: {
    github: "https://github.com/SarthakSalvi",
    linkedin: "https://www.linkedin.com/in/sarthak-salvi-b52936278",
    email: "mailto:sarthaksalvi2004@gmail.com",
  },
};

export const developmentProjects = [
  {
    id: "splitzy",
    number: "01",
    title: "Splitzy",
    subtitle: "Shared expenses. A little less complicated.",
    category: "PRODUCT / DEVELOPMENT",
    year: "2026",
    role: "Fullstack Developer & Product Designer",
    status: "Active Prototype / Concept",
    description:
      "A mobile-first group expense and bill-splitting application built to eliminate awkward bill math. Engineered with smart graph-simplification algorithms that minimize the total number of transactions needed across friend groups, alongside a smooth, gesture-driven mobile interface.",
    overview:
      "Traditional expense splitters are cluttered with nested forms and confusing settlement math. Splitzy strips away the friction with a clean, tactile interface designed for real-world scenarios — weekend trips, shared apartment rent, and dinners out.",
    highlights: [
      "Optimal Debt Settlement Algorithm reducing complex N-way debts to minimum cash transactions.",
      "Instant offline-first local state management with responsive transaction ledger.",
      "Tactile mobile-first UI with custom quick-split dials and receipt itemization.",
      "Exportable summary cards and automated group balance notifications.",
    ],
    architecture:
      "Client-side React with custom state reducers, Tailwind CSS styling tokens, and an optimized transaction graph solver running in Web Workers for instant settlement calculations.",
    tags: ["React", "JavaScript", "Tailwind CSS", "Mobile UX", "Algorithms"],
    links: {
      github: "https://github.com/SarthakSalvi/splitzy",
      demo: "",
    },
  },
  {
    id: "bis-sahayak",
    number: "02",
    title: "BIS Sahayak",
    subtitle: "Making Indian Standards easier to navigate with AI.",
    category: "AI / DATA SCIENCE",
    year: "2025",
    role: "AI Developer & NLP Engineer",
    status: "Research & Prototype",
    description:
      "An intelligent conversational assistant and document intelligence system built around Bureau of Indian Standards (BIS) technical codes. Leverages Retrieval-Augmented Generation (RAG) and domain-specific document embeddings to answer complex compliance and engineering queries in plain language.",
    overview:
      "Navigating thousands of pages of official Indian Standards (IS codes) is time-consuming for engineers, architects, and manufacturers. BIS Sahayak ingests official standard documentation and provides accurate, cited, and contextual explanations in seconds.",
    highlights: [
      "Custom RAG pipeline indexing multi-domain IS technical standards with semantic chunking.",
      "Context-aware citation generator linking queries directly to relevant IS clause numbers.",
      "Multilingual query translation pipeline supporting English and regional language inquiries.",
      "Interactive conversational UI with follow-up clarification prompts and document previews.",
    ],
    architecture:
      "Python backend with LangChain/LlamaIndex, sentence-transformer vector embeddings, vector database retrieval, and a high-performance React conversational interface.",
    tags: ["Python", "Generative AI", "NLP & RAG", "React", "Vector Search"],
    links: {
      github: "https://github.com/SarthakSalvi/bis-sahayak",
      demo: "",
    },
  },
  {
    id: "trade-quest",
    number: "03",
    title: "Trade Quest",
    subtitle: "A playground for financial curiosity and market simulation.",
    category: "FINTECH / PRODUCT",
    year: "2025",
    role: "Fullstack Developer & Data Visualizer",
    status: "Interactive Simulator",
    description:
      "A stock-market learning playground and paper-trading simulator. Explores interactive financial charts, risk simulation metrics, and scenario analysis to demystify equity trading for students and beginners without financial risk.",
    overview:
      "Most trading platforms are intimidating walls of numbers. Trade Quest gamifies the learning curve with interactive technical indicators, portfolio health diagnostics, and historical replay simulations.",
    highlights: [
      "Interactive Canvas-based candlestick charting engine with dynamic timeframe switching.",
      "Virtual portfolio tracking with real-time P&L calculation, Sharpe ratio, and drawdown analysis.",
      "Simulated market order execution engine modeling slippage and transaction costs.",
      "Curated guided learning modules connecting market concepts directly to live charts.",
    ],
    architecture:
      "Modular React frontend with custom D3/Canvas data visualization layers, Python financial data processing scripts, and WebSocket price-feed simulators.",
    tags: ["React", "Python", "Data Visualization", "FinTech", "Canvas API"],
    links: {
      github: "https://github.com/SarthakSalvi/trade-quest",
      demo: "",
    },
  },
];

export const videoProjects = [
  {
    id: "edit-01",
    number: "01",
    title: "Cinematic Edit",
    subtitle: "After hours — a study in rhythm and atmosphere.",
    category: "CINEMATIC FILM",
    year: "2026",
    role: "Video Editor & Colorist",
    status: "Visual Study / 24 FPS",
    previewType: "urban-pulse",
    description:
      "A cinematic edit exploring nocturnal urban rhythm, deliberate pacing, and color grading. Structured around contrasting quiet moments with kinetic transitions to build atmosphere and emotional resonance.",
    overview:
      "This piece explores how micro-rhythms in editing can change the emotional gravity of a scene. By synchronizing precise match cuts with multi-layered ambient sound design, the piece creates an immersive mood study.",
    highlights: [
      "Custom DaVinci Resolve film emulation color grade with rich shadow tones and warm highlight rolloff.",
      "Multi-track layered sound design incorporating foley, sub-bass pulses, and spatial atmospheric textures.",
      "Intentional pacing dynamics moving between slow observational pauses and rapid match-action cuts.",
    ],
    architecture:
      "Edited and graded in DaVinci Resolve Studio. Audio stems mixed with custom EQ curves and dynamic sound design.",
    tags: ["DaVinci Resolve", "Color Grading", "Sound Design", "Cinematography", "Pacing"],
  },
  {
    id: "edit-02",
    number: "02",
    title: "Short Form",
    subtitle: "Make it move — small format, strong feeling.",
    category: "SHORT FORM & REELS",
    year: "2026",
    role: "Motion Designer & Editor",
    status: "Vertical 9:16 Showcase",
    previewType: "short-form",
    description:
      "A high-retention vertical video study combining kinetic typography, snappy beat-matching, and expressive visual hooks designed for mobile feeds.",
    overview:
      "Capturing and sustaining attention in 9:16 mobile feeds requires seamless motion choreography. Every cut, text animation, and sound hit is tuned to maintain continuous visual momentum.",
    highlights: [
      "Frame-by-frame kinetic typography synced to vocal cadence and transient sound spikes.",
      "Seamless loop transitions ensuring continuous replay value.",
      "Graphic overlays, custom textures, and visual accents highlighting core messaging.",
    ],
    architecture:
      "Vertical 1080x1920 workflow in DaVinci Resolve & Motion Graphics suite with custom type animation presets.",
    tags: ["Vertical Video", "Kinetic Typography", "High Retention", "Motion Graphics"],
  },
  {
    id: "edit-03",
    number: "03",
    title: "Motion Experiment",
    subtitle: "Synapse — finding a visual rhythm between light and form.",
    category: "MOTION DESIGN",
    year: "2025",
    role: "Creative Technologist & Motion Artist",
    status: "Experimental Animation",
    previewType: "motion-experiment",
    description:
      "An open canvas for experiments in geometric motion, typography distortions, and sound-reactive visual forms exploring the intersection of creative coding and post-production.",
    overview:
      "Synapse bridges generative digital aesthetics and organic cinematic motion. It explores procedural geometries, light refractions, and neural-inspired topologies.",
    highlights: [
      "Procedural particle vectors and fluid distortion mapping.",
      "Audio-reactive motion modulation linking frequencies directly to scale and displacement.",
      "High-contrast monochrome and neon color palettes.",
    ],
    architecture:
      "Motion graphics composition combined with generative SVG filters and post-processed visual effects.",
    tags: ["Motion Design", "Composition", "Generative Art", "Sound Reactive"],
  },
  {
    id: "edit-04",
    number: "04",
    title: "Visual Story",
    subtitle: "The in-between — a little room to breathe.",
    category: "DOCUMENTARY & NARRATIVE",
    year: "2025",
    role: "Director & Lead Editor",
    status: "Narrative Piece",
    previewType: "visual-story",
    description:
      "A slower, observational narrative film exploring spaces between action. Built on natural soundscapes, lingering wide shots, and subtle human moments.",
    overview:
      "In a world of constant over-stimulation, this piece takes the opposite approach — giving scenes room to breathe and allowing natural lighting and environmental textures to carry the narrative weight.",
    highlights: [
      "Observational pacing allowing subjects and architecture to settle naturally in frame.",
      "Rich diegetic sound design captured on-location and mixed with subtle minimal score.",
      "Natural-light cinematography and authentic color reproduction.",
    ],
    architecture:
      "Full documentary post-production pipeline: rough cut assembly, fine cutting, dialogue cleanup, and final film master.",
    tags: ["Storytelling", "Atmosphere", "Documentary", "Narrative Pacing"],
  },
];

export const skillCategories = [
  {
    id: "dev",
    name: "Development",
    skills: [
      "HTML",
      "CSS",
      "JavaScript",
      "React",
      "Python",
      "Java",
      "C",
      "C++",
      "SQL",
    ],
  },
  {
    id: "ai",
    name: "AI & Data",
    skills: [
      "Data Science",
      "NumPy",
      "Pandas",
      "Matplotlib",
      "Generative AI",
      "AI-assisted development",
    ],
  },
  {
    id: "design",
    name: "Design",
    skills: ["Figma", "Framer", "Canva", "UI/UX"],
  },
  {
    id: "motion",
    name: "Video & Motion",
    skills: [
      "DaVinci Resolve",
      "Filmora",
      "Video Editing",
      "Motion Design",
      "Visual Storytelling",
    ],
  },
  {
    id: "tools",
    name: "Tools",
    skills: ["Git", "GitHub", "Firebase", "VS Code"],
  },
].map((group) => ({
  ...group,
  skills: group.skills.map((name) => ({ name })),
}));

export const currentlyExploring = [
  "AI Systems",
  "Data Science",
  "FinTech",
  "Creative Development",
  "Product Design",
  "Motion & Editing",
];

export const galleryOrder = [
  "splitzy",
  "edit-01",
  "bis-sahayak",
  "edit-02",
  "trade-quest",
  "edit-03",
  "edit-04",
];
