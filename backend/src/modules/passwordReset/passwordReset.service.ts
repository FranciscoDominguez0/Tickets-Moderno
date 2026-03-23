
import crypto       from 'crypto'
import bcrypt from 'bcrypt'
import nodemailer   from 'nodemailer'
import { env }      from '../../config/env.js'
import { hashTocken } from '../../utils/hashToken.js'
import {
  findUserForReset,
  createPasswordResetToken,
  findValidResetToken,
  updateUserPassword,
  markTokenAsUsed,
} from './passwordReset.repository.js'
import { ValidationError } from '../auth/auth.errors.js'

// ── Caso de uso principal ─────────────────────────────────────

export async function forgotPassword(params: {
  empresa_id: number
  email:      string
}): Promise<void> {
  // 1. Buscar usuario — si no existe terminamos silenciosamente
  const user = await findUserForReset({
    empresa_id: params.empresa_id,
    email:      params.email,
  })
  if (!user) return

  // 2. Generar token aleatorio de 48 bytes (96 caracteres hex)
  const rawToken  = crypto.randomBytes(48).toString('hex')
  const tokenHash = hashTocken(rawToken)

  // 3. Expiración: 1 hora desde ahora
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

  // 4. Persistir en DB (invalida tokens anteriores automáticamente)
  await createPasswordResetToken({
    empresa_id: params.empresa_id,
    user_id:    user.id,
    token_hash: tokenHash,
    expires_at: expiresAt,
  })

  // 5. Enviar el email con el token crudo en la URL
  await sendResetEmail({
    to:       user.email,
    name:     user.firstname,
    rawToken,
  })
}

// ── Envío de correo ───────────────────────────────────────────

async function sendResetEmail(params: {
  to:       string
  name:     string
  rawToken: string
}): Promise<void> {
  // La URL apunta al frontend — el frontend luego llama al backend con el token
  const resetUrl = `${env.frontendUrl}/reset-password?token=${params.rawToken}`

  if (!env.smtpHost || !env.smtpUser || !env.smtpPass) {
    console.warn(
      'SMTP no configurado. Configura SMTP_HOST, SMTP_USER y SMTP_PASS para enviar correos de recuperación.',
    )
    return
  }

  const transporter = nodemailer.createTransport({
    host:   env.smtpHost,
    port:   env.smtpPort,
    secure: env.smtpSecure,

    auth: {
      user: env.smtpUser,
      pass: env.smtpPass,
    },
  })

  await transporter.sendMail({
    from:    `"Sistema de Tickets" <${env.smtpUser}>`,
    to:      params.to,
    subject: 'Recuperación de contraseña',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1B3A6B;">Recuperación de contraseña</h2>
        <p>Hola <strong>${params.name}</strong>,</p>
        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
        <p style="margin: 24px 0;">
          <a
            href="${resetUrl}"
            style="
              background: #2563EB;
              color: #fff;
              padding: 12px 24px;
              border-radius: 6px;
              text-decoration: none;
              font-weight: bold;
              display: inline-block;
            "
          >
            Cambiar contraseña
          </a>
        </p>
        <p style="color: #6B7280; font-size: 13px;">
          Este enlace expira en <strong>1 hora</strong>.<br/>
          Si no solicitaste este cambio, ignora este correo — tu contraseña no cambiará.
        </p>
      </div>
    `,
  })
}

export async function resetPassword(params: {
  empresa_id:  number
  rawToken:    string
  newPassword: string
}): Promise<void> {
  
  const tokenHash = hashTocken(params.rawToken)


  const resetToken = await findValidResetToken({
    empresa_id: params.empresa_id,
    token_hash: tokenHash,
  })

 
  if (!resetToken) {
    throw new ValidationError('El enlace no es válido o ya expiró')
  }

  const passwordHash = await bcrypt.hash(params.newPassword, 10)

  await updateUserPassword({
    user_id:      resetToken.user_id,
    empresa_id:   params.empresa_id,
    passwordHash,
  })
  
  await markTokenAsUsed(resetToken.id)
}