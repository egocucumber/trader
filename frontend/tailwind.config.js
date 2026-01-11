/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                crypto: {
                    dark: "#0b0e11",
                    card: "#151a21",
                    accent: "#00E0FF",
                    green: "#00C076",
                    red: "#FF3B30",
                }
            }
        },
    },
    plugins: [],
}