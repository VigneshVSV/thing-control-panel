import { defineConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'
import react from '@vitejs/plugin-react-swc'
import dns from 'dns'
dns.setDefaultResultOrder('verbatim')

import { appConfig } from './src/config.js';

const plugins= [react()] 
if(appConfig.useHTTPs)
    plugins.push(mkcert())

// https://vitejs.dev/config/
export default defineConfig({
    plugins: plugins,
    define: {
        'process.env': process.env
    },   
    server: {
        host: '0.0.0.0'
    }
})
