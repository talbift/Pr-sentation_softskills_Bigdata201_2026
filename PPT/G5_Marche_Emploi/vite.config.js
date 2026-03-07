import { defineConfig } from 'vite';

export default defineConfig({
    // Le fichier index.html est à la racine du projet
    root: '.',
    server: {
        port: 5173,
        open: true,
    },
    build: {
        outDir: 'dist',
    },
});
