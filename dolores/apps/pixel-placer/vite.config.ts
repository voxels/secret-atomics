import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    base: '/dolores/',
    resolve: {
        alias: {
            '@dolores/mock-harness': path.resolve(__dirname, '../../packages/mock-harness/src/index.ts'),
            '@dolores/signal-integrity': path.resolve(__dirname, '../../packages/signal-integrity/src/index.ts'),
            '@dolores/ui-templates': path.resolve(__dirname, '../../packages/ui-templates/src/index.ts'),
            'process': 'node-stdlib-browser/mock/process',
            'buffer': 'node-stdlib-browser/mock/buffer',
        },
    },
    optimizeDeps: {
        include: ['buffer', 'process']
    },
    server: {
        port: 3000,
        open: true
    }
});
