import type { Config } from "tailwindcss";

/**
 * Shared Tailwind preset for every web app in the monorepo
 * (control-plane-web, customer-portal). Apps add their own `content` globs
 * and extend from here so the design system stays visually consistent.
 *
 *   // apps/<app>/tailwind.config.ts
 *   import preset from "@migrationtower/ui/tailwind-preset";
 *   export default {
 *     presets: [preset],
 *     content: [
 *       "./src/**\/*.{ts,tsx}",
 *       "../../packages/ui/src/**\/*.{ts,tsx}",
 *     ],
 *   };
 *
 * Tokens are CSS variables (see src/styles/globals.css) so themes/dark mode
 * are swapped at the `:root` level without rebuilding Tailwind.
 */
const preset: Omit<Config, "content"> = {
  darkMode: ["class"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default preset;
