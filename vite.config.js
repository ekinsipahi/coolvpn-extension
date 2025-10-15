import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { crx } from '@crxjs/vite-plugin'
import fs from 'node:fs'
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'


const manifest = JSON.parse(fs.readFileSync('./manifest.json', 'utf-8'))

export default defineConfig({
  plugins: [vue(), crx({ manifest }), tailwindcss()],
  root: '.', // kök
  build: {
    sourcemap: false,
    target: 'es2022',
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, 'src/popup/index.html'),
        options: path.resolve(__dirname, 'src/options/index.html')
      }
    }
  }
})
