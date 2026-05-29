import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#202124",
        paper: "#fffaf3",
        coral: "#ff6b57",
        mint: "#dff7ec",
        lemon: "#fff1a8"
      },
      boxShadow: {
        card: "0 10px 30px rgba(32, 33, 36, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
