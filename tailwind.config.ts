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
                parchment: {
                    DEFAULT: 'var(--parchment-dark)',
                    light: 'var(--parchment)',
                    dark: 'var(--parchment-dark)',
                },
                ink: {
                    DEFAULT: 'var(--ink)',
                    deep: 'var(--ink-deep)',
                    faded: 'var(--ink/40)', // This might need careful handling
                },
                pine: {
                    DEFAULT: 'var(--pine)',
                    light: 'var(--pine-light)',
                },
                gold: {
                    DEFAULT: 'var(--gold)',
                    light: 'var(--gold-light)',
                },
                'dried-red': 'var(--dried-red)',
                paper: 'var(--paper)',
            },
            fontFamily: {
                'journal-title': ['Permanent Marker', 'cursive'],
                'journal-body': ['Patrick Hand', 'cursive'],
                'marker': ['Caveat Brush', 'cursive'],
                'special': ['Special Elite', 'cursive'],
            },
            boxShadow: {
                'cartoon': '4px 4px 0px var(--ink)',
                'cartoon-sm': '2px 2px 0px var(--ink)',
                'cartoon-lg': '6px 6px 0px var(--ink)',
                'paper': '5px 5px 15px rgba(0,0,0,0.08), 10px 10px 20px rgba(0,0,0,0.05)',
                'paper-dark': '5px 5px 15px rgba(0,0,0,0.4), 10px 10px 20px rgba(0,0,0,0.3)',
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
