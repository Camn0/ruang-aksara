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
                    DEFAULT: '#EADDBF',
                    light: '#F4EAD5',
                    dark: '#D2C19D',
                },
                ink: {
                    DEFAULT: '#3A2A18',
                    deep: '#2C241B',
                    faded: '#5D4B37',
                },
                pine: '#4A5D4E',
                gold: '#D4B872',
                'dried-red': '#9E473D',
            },
            fontFamily: {
                'journal-title': ['Permanent Marker', 'cursive'],
                'journal-body': ['Patrick Hand', 'cursive'],
                'marker': ['Caveat Brush', 'cursive'],
                'special': ['Special Elite', 'cursive'],
            },
            boxShadow: {
                'cartoon': '4px 4px 0px #3A2A18',
                'cartoon-sm': '2px 2px 0px #3A2A18',
                'cartoon-lg': '6px 6px 0px #3A2A18',
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
