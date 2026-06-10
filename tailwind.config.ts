import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#07120F",
        surface: "#0E1B17",
        surface2: "#122722",
        mint: "#EAF6F1",
        sage: "#A7C4BB",
        dim: "#56756C",
        teal: "#19E3C4",
        azure: "#0FA3E0",
        emerald: "#00C389",
        line: "rgba(25,227,196,0.14)",
      },
    },
  },
  plugins: [],
} satisfies Config;
