import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FAF8F3",
        ink: "#3F3B36",
        sage: {
          50: "#F1F5F0",
          100: "#E1EAE0",
          200: "#C4D6C2",
          400: "#8FAE8A",
          500: "#6F9569",
          600: "#587A54",
        },
        dusty: {
          50: "#EEF3F6",
          100: "#DCE7ED",
          200: "#B9D0DC",
          400: "#7DA3B8",
          500: "#5A879F",
        },
        coral: {
          100: "#FBE4DE",
          300: "#F0AC9B",
          400: "#E68A73",
          500: "#DA6F55",
        },
      },
      fontFamily: {
        sans: [
          "'Hiragino Sans'",
          "'Noto Sans JP'",
          "'Yu Gothic'",
          "system-ui",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
