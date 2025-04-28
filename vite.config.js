import { defineConfig } from 'vite'
import fs from 'fs'
export default defineConfig({
server: {
host: '0.0.0.0', // All interfaces
port: 5173,
allowedHosts: [
'chatit.minidog.club', // Add your domain here
],
},
})