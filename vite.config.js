import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // server: {
  //   host: '192.168.168.169',
  //   port: 1703, // ya jo bhi port chahiye
  // },

})
