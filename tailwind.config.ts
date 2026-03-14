import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: 'class',
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                'bg-cream': 'rgb(var(--bg-main))',
                'bg-dark': 'rgb(var(--bg-main))',
                'tan-primary': '#B08968',   // Caramel Roast
                'tan-light': '#D6BFA6',     // Warm Cappuccino
                'brown-dark': '#3B2A22',    // Espresso Shot
                'brown-mid': '#7A553A',     // Mocha Bean
                'olive-banner': '#3B3722',
                'text-accent': '#F3E9D7',   // Creamy Latte
                'text-main': 'rgb(var(--text-primary))',
            },
            fontFamily: {
                'inter': ['var(--font-inter)', 'sans-serif'],
                'lobster': ['var(--font-lobster)', 'cursive'],
                'open-sans': ['var(--font-open-sans)', 'sans-serif'],
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
        },
    },
    plugins: [],
};
export default config;