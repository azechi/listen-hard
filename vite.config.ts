import { defineConfig } from 'vite'

export default defineConfig({
    server: {
        headers: {
            "Cross-Origin-Embedder-Policy": "require-corp",
            "Cross-Origin-Opener-Policy": "same-origin",
        }
    },
    build: {
        rollupOptions: {
            input: {
                app: "./index.html",
                sw: "./sw.ts",
            },
            output: {
                entryFileNames: c => {
                    return c.name === "sw" ? '[name].js' : 'assets/[name]-[hash].js';
                },
            },
        },
    },
})
