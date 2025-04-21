import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          border: "hsl(var(--sidebar-border))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          ring: "hsl(var(--sidebar-ring))",
        },
        success: {
          DEFAULT: "hsl(142, 76%, 36%)",
          foreground: "hsl(0, 0%, 100%)",
          muted: "hsl(142, 76%, 10%)",
        },
        warning: {
          DEFAULT: "hsl(38, 92%, 50%)",
          foreground: "hsl(0, 0%, 100%)",
          muted: "hsl(38, 92%, 10%)",
        },
        info: {
          DEFAULT: "hsl(220, 85%, 57%)",
          foreground: "hsl(0, 0%, 100%)",
          muted: "hsl(220, 85%, 10%)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "pulse-gentle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
        glow: {
          "0%, 100%": {
            boxShadow:
              "0 0 5px rgba(79, 70, 229, 0.2), 0 0 20px rgba(79, 70, 229, 0.1)",
          },
          "50%": {
            boxShadow:
              "0 0 15px rgba(79, 70, 229, 0.4), 0 0 30px rgba(79, 70, 229, 0.2)",
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-gentle": "pulse-gentle 3s ease-in-out infinite",
        glow: "glow 3s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
      },
      boxShadow: {
        "card-hover":
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        "card-dark": "0 4px 12px rgba(0, 0, 0, 0.5)",
        "glow-sm":
          "0 0 5px rgba(79, 70, 229, 0.2), 0 0 20px rgba(79, 70, 229, 0.1)",
        "glow-md":
          "0 0 15px rgba(79, 70, 229, 0.4), 0 0 30px rgba(79, 70, 229, 0.2)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
