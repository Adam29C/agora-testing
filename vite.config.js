import { defineConfig } from 'vite'
 import react from '@vitejs/plugin-react'
 import fs from 'fs'
 
 // https://vite.dev/config/
 export default defineConfig({
   plugins: [react()],
   server: {
     https: {
       key: fs.readFileSync('key.pem'),
       cert: fs.readFileSync('cert.pem'),
     },
     host: true, 
     port: 9977,
   },
 })








//  import { defineConfig } from 'vite'
// import fs from 'fs'
// export default defineConfig({
// server: {
// host: '0.0.0.0', // All interfaces
// port: 9977,
// allowedHosts: [
// 'callit.minidog.club', // Add your domain here
// ],
// },
// })