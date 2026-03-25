import type { CorsOptions } from 'cors'
import { env } from './env.js'
const allowedOrigins: string[] = [env.frontendUrl]

if (env.nodeEnv === 'development') {
  allowedOrigins.push(
    'http://localhost:3000',
    'http://localhost:3001',
  )
}

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // Sin origin = Postman, curl, mobile → permitir
    if (!origin) { callback(null, true); return }

    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error(`CORS bloqueado: ${origin}`))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-company-id',    // tu header de tenant
  ],
}