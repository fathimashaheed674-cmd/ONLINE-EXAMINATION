/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#3b82f6",
                secondary: "#111111",
                accent: "#8b5cf6",
                success: "#10b981",
                error: "#ef4444",
                warning: "#f59e0b",
                "glass-bg": "rgba(17, 17, 17, 0.8)",
                "glass-border": "rgba(255, 255, 255, 0.1)",
            },
        },
    },
    plugins: [],
}
