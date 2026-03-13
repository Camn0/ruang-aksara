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
                'bg-cream': '#F8F4E1',
                'tan-primary': '#AF8F6F',
                'tan-light': '#D7BFA7',
                'brown-dark': '#3B2A22',
                'brown-mid': '#7A553A',
                'olive-banner': '#3B3722',
                'text-accent': '#F2EAD7',
                'text-main': '#1B1310',
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
