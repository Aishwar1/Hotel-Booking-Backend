import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// ============================================================
// Vite Configuration – QuickStay Frontend
// ============================================================
// KEY CHANGES for Replit:
//   • server.host: true        → listen on all interfaces (required by Replit)
//   • server.allowedHosts: true → allow Replit's proxied preview domain
//   • server.port: 5000        → Replit shows port 5000 in the preview pane
//   • server.proxy             → API calls (/api/*) are forwarded to the
//                                Express backend on port 3000 so the browser
//                                never needs to know the backend URL.
// ============================================================

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
    server: {
        host: true,              // Bind to 0.0.0.0
        port: 5000,
        allowedHosts: true,      // Allow Replit's *.replit.dev preview domain
        proxy: {
            // Forward /api/* → Express backend on port 3000
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
            },
        },
    },
})
