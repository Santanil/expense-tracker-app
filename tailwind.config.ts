import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#F2F4F3",        // primary text — near-white, reads on dark bg
        paper: "#0B0E10",      // page background — near-black
        ledger: "#2FE6C8",     // accent — electric teal (growth / money / focus)
        rust: "#FF5B4A",       // overspend / negative signal — bright coral-red
        line: "#242B2E",       // hairline rule color
        surface: "#14181B"     // boxed-section background — sits above `paper`
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
