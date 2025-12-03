import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                "bg-base": "#1a0000",
                "bg-secondary": "#260505",
                "bg-accent": "#500000",
                "text-primary": "#e0e0e0",
                "text-accent": "#cc9999",
                "border-main": "#550000",
                "line-main": "#880000",
            },
            fontFamily: {
                serif: ['"Noto Serif JP"', "serif"],
                sans: ['"Noto Sans JP"', "sans-serif"],
            },
            boxShadow: {
                vignette: "inset 0 0 100px #000000",
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
