import express from 'express'
import cors from 'cors'
import { env } from './config/env.js'
import { checkDb } from './config/database.js'
import { tenantMiddleware } from './middleware/tenant.middleware.js'
import { authRouter } from './modules/auth/auth.routes.js'

const app = express()

app.use(cors({ origin: env.frontendUrl, credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/auth', tenantMiddleware)
app.use('/auth', authRouter)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

async function bootstrap(): Promise<void> {
  await checkDb()
  app.listen(env.port, () => {
    console.log(`🚀 Server corriendo en http://localhost:${env.port}`)
  })
}

bootstrap().catch((err) => {
  console.error('Error al iniciar:', err)
  process.exit(1)
})