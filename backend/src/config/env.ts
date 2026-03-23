import 'dotenv/config'

function requireEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error(`Falta variable de entorno: ${name}`)
  return val
}

export const env = {
  port:        process.env.PORT ?? '3001',
  dbHost:      requireEnv('DB_HOST'),
  dbPort:      Number(process.env.DB_PORT ?? '3306'),
  dbUser:      requireEnv('DB_USER'),
  dbPassword:  requireEnv('DB_PASSWORD'),
  dbName:      requireEnv('DB_NAME'),
  jwtSecret:   requireEnv('JWT_SECRET'),
  jwtExpires:  process.env.JWT_EXPIRES_IN ?? '7d',
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',

  smtpHost:    process.env.SMTP_HOST    ?? '',
  smtpPort:    Number(process.env.SMTP_PORT ?? 587),
  smtpSecure:  process.env.SMTP_SECURE  === 'true',
  smtpUser:    process.env.SMTP_USER    ?? '',
  smtpPass:    process.env.SMTP_PASS    ?? '',


}