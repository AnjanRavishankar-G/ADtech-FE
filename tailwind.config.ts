import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: "class", // Enable class-based dark mode
    theme: {
        extend: {
            fontFamily: {
                sans: ["Arial", "sans-serif"],
                mono: ["Roboto Mono", "monospace"],
            },
            colors: {
                dark: {
                    bg: "var(--background)",
                    surface1: "var(--surface-1)",
                    surface2: "var(--surface-2)",
                    text: {
                        primary: "#ffffff", // Pure white for primary text
                        secondary: "#e0e0e0", // Light gray for secondary text
                        tertiary: "#a0a0a0", // Medium gray for tertiary text
                    },
                    sidebar: {
                        bg: "#1a1a1a", // Darker background for sidebar
                        hover: "#2a2a2a", // Lighter color for hover states
                    },
                    header: "#1a1a1a", // New darker color for table headers
                    toggle: {
                        bg: "#2a2a2a", // Darker background for toggle
                        hover: "#333333", // Darker hover state
                        border: "rgba(255, 255, 255, 0.1)",
                        icon: "#ffffff",
                    },
                },
            },
        },
    },
    plugins: [],
};

export default config;
