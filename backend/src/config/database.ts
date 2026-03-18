import mysql from 'mysql2/promise'
import { env } from './env.js'

export const pool = mysql.createPool({
  host:               env.dbHost,
  port:               env.dbPort,
  user:               env.dbUser,
  password:           env.dbPassword,
  database:           env.dbName,
  waitForConnections: true,
  connectionLimit:    10,
  charset:            'utf8mb4',
})

export async function checkDb(): Promise<void> {
  const conn = await pool.getConnection()
  conn.release()
  console.log('✔ MySQL conectado')
}