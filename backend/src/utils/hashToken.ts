import crypto from 'crypto'

export function hashTocken(raw: string): string{
    return crypto.createHash('sha256').update(raw).digest('hex')
}