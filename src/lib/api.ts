// Central API base. Set VITE_API_URL in the environment (Vercel) to the
// deployed backend; falls back to local dev.
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'
