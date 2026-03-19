// src/server.ts

import express from 'express'
import cors from 'cors'
import { env } from './config/env.js'
import { checkDb } from './config/database.js'
import { tenantMiddleware } from './middleware/tenant.middleware.js'
import { apiRouter } from './routes/index.js'

const app = express()

// Middlewares globales de Express
app.use(cors({ origin: env.frontendUrl, credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check — fuera del /api porque lo usa el servidor, no el cliente
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Todas las rutas bajo /api
app.use('/api', tenantMiddleware, apiRouter)

async function bootstrap(): Promise<void> {
  await checkDb()
  app.listen(env.port, () => {
    console.log(` Server corriendo en http://localhost:${env.port}`)
  })
}

bootstrap().catch((err) => {
  console.error('Error al iniciar:', err)
  process.exit(1)
})