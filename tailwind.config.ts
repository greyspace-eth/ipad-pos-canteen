import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#f4f1e9",
        sand: "#e7e2d8",
        "sand-light": "#f0ebe1",
        "sand-muted": "#d9d3c7",
        ink: "#1a1714",
        "ink-dark": "#1f1b17",
        "ink-mid": "#3a342c",
        "ink-muted": "#8b857b",
        "ink-faint": "#a8a298",
        "ink-ghost": "#bcb6ab",
        green: "#1f8a5b",
        "green-dark": "#17714a",
        "green-light": "#e7f2ec",
        red: "#c0492f",
        "red-light": "#f7e6e1",
        "warm-white": "#faf8f3",
      },
      fontFamily: {
        grotesk: ['var(--font-grotesk)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      keyframes: {
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-8px)" },
          "40%": { transform: "translateX(8px)" },
          "60%": { transform: "translateX(-6px)" },
          "80%": { transform: "translateX(6px)" },
        },
        popin: {
          from: { transform: "scale(0.9)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        shake: "shake 0.45s ease",
        popin: "popin 0.18s ease",
      },
    },
  },
  plugins: [],
};
export default config;
