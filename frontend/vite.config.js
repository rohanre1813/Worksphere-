import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteObfuscateFile } from 'vite-plugin-obfuscator'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    viteObfuscateFile({
      compact: true,
      controlFlowFlattening: true,
      deadCodeInjection: false,
      debugProtection: false,
      disableConsoleOutput: true,
      identifierNamesGenerator: 'hexadecimal',
      log: false,
      stringArray: true,
      stringArrayEncoding: ['base64'],
      stringArrayThreshold: 0.75
    })
  ],
})
