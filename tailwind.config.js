/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        charcoal: {
          950: "#080808", // --bg-primary
          900: "#0C0C0C", // --bg-secondary
          850: "#121212", // --bg-surface
          800: "#1A1A1A", // --bg-elevated
          750: "#202020",
          700: "#292929",
        },
        offwhite: {
          DEFAULT: "#F7F7F3", // --text-primary
          muted: "#A5A5A0",   // --text-secondary
          dim: "#81817B",     // --text-muted
          faint: "#555550",
        },
        lavender: {
          electric: "#315BDB", // Cobalt Blue primary accent
          bright: "#4871F7",   // Cobalt Blue hover
          soft: "#A5B8FC",     // Cobalt Blue light
          deep: "#2444A8",
          glow: "#102366",
        },
        coral: {
          DEFAULT: "#315BDB",
          glow: "#4871F7",
        },
        darkborder: "rgba(255, 255, 255, 0.09)", // --border-subtle
        strongborder: "rgba(255, 255, 255, 0.15)", // --border-visible
        glowborder: "rgba(49, 91, 219, 0.35)",
      },
      fontFamily: {
        sans: ["Manrope", "system-ui", "-apple-system", "sans-serif"],
        display: ["Instrument Serif", "Georgia", "serif"],
        fuzamic: ["Instrument Serif", "Georgia", "serif"],
        modero: ["Manrope", "sans-serif"],
        serif: ["Manrope", "sans-serif"],
        accent: ["Manrope", "sans-serif"],
        tech: ["Manrope", "sans-serif"],
        editorial: ["Instrument Serif", "Georgia", "serif"],
        body: ["Manrope", "sans-serif"],
      },
      letterSpacing: {
        tighter: "-0.05em",
        tight: "-0.025em",
        widest: "0.25em",
      },
      boxShadow: {
        glow: "0 0 25px rgba(49, 91, 219, 0.22)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        glowPulse: {
          "0%, 100%": { opacity: 0.4 },
          "50%": { opacity: 0.8 },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 8s ease-in-out infinite",
        "glow-pulse": "glowPulse 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
