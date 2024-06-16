import { defineConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'
import react from '@vitejs/plugin-react-swc'
import dns from 'dns'

dns.setDefaultResultOrder('verbatim')

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), mkcert()],
    define: {
        'process.env': process.env
    },   
    server: {
        host: '0.0.0.0'
    }
})
