import reactRefresh from '@vitejs/plugin-react-refresh';
import path from 'path';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@terra-money/terra.js': path.resolve(
        __dirname,
        'src/polyfills/terra.alias.js',
      ),
      'process': path.resolve(__dirname, 'src/polyfills/process-es6.js'),
    },
  },
  //define: {
  //  'process.env.NODE_DEBUG': 'false',
  //  //Buffer: 'buffer',
  //},
  server: {
    https: {
      cert: process.env.LOCALHOST_HTTPS_CERT,
      key: process.env.LOCALHOST_HTTPS_KEY,
      //@ts-ignore https://github.com/vitejs/vite/pull/3895
      maxSessionMemory: 100,
    },
  },
  plugins: [reactRefresh(), tsconfigPaths(), svgr()],
  //build: {
  //  rollupOptions: {
  //    input: {
  //      main: path.resolve(__dirname, 'index.html'),
  //      subpage: path.resolve(__dirname, 'subpage.html'),
  //    },
  //  },
  //},
});
