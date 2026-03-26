import multer                       from 'multer'
import path                         from 'path'
import fs                           from 'fs'
import type { Request }             from 'express'
import type { FileFilterCallback }  from 'multer'

const ALLOWED_MIME = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'application/octet-stream', //
]

const MAX_SIZE_MB = 5

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    const dir = 'uploads/attachments'
    // Crea la carpeta si no existe — no falla en el primer arranque
    fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename(_req, file, cb) {
    // Nombre único en disco para evitar colisiones
    // Ejemplo: 1748392810000-k3j9x2.pdf
    const ext    = path.extname(file.originalname)
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
    cb(null, unique)
  },
})

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
): void {
  if (ALLOWED_MIME.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`))
  }
}

// .single('attachment') — espera un solo archivo en el campo 'attachment'
// Si no viene archivo, req.file = undefined y el controller lo maneja
export const uploadAttachment = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
}).single('attachment')