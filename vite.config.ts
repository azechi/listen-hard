import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {

    return {
        base: "",
        server: {
            allowedHosts: true,
        },
        build: {
            target: "esnext",
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

        plugins: [{
            name: 'accesslog',
            configureServer(server) {
                server.middlewares.use((req, res, next) => {
                    res.on('finish', () => {
                        console.log(`[${new Date().toISOString()}] ${req.originalUrl}`);
                        //console.log(res.getHeaders());
                    });
                    next();

                });
            },
            configurePreviewServer(server) {
                server.middlewares.use((req, res, next) => {
                    res.on('finish', () => {
                        console.log(`[${new Date().toISOString()}] ${req.originalUrl}`);
                        //console.log(res.getHeaders());
                    });
                    next();

                });
            },
        }]
    }
})
