import express        from 'express'
import cors           from 'cors'
import { env }        from './config/env.js'
import { corsOptions } from './config/cors.js'
import { checkDb }    from './config/database.js'
import { tenantMiddleware }  from './middleware/tenant.middleware.js'
import { errorHandler }      from './middleware/errorHandler.middleware.js'
import { apiRouter }  from './routes/index.js'

const app = express()

// ① CORS — primero siempre, antes de todo
app.use(cors(corsOptions))

// ② Body parsers
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ③ Health check — sin tenant ni auth
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ④ Rutas de la API
app.use('/api', tenantMiddleware, apiRouter)

// ⑤ Error handler — siempre al final, después de las rutas
app.use(errorHandler)

async function bootstrap(): Promise<void> {
  await checkDb()
  app.listen(env.port, () => {
    console.log(`Server corriendo en http://localhost:${env.port}`)
  })
}

bootstrap().catch((err) => {
  console.error('Error al iniciar:', err)
  process.exit(1)
})