import jwt, { type Secret, type SignOptions } from 'jsonwebtoken'
import { env } from '../../config/env.js'
import type { JwtPayload } from './auth.types.js'

export function signAuthToken(payload: JwtPayload): string {
  const secret: Secret = env.jwtSecret
  const options: SignOptions = { expiresIn: env.jwtExpires as SignOptions['expiresIn'] }
  return jwt.sign(payload, secret, options)
}
