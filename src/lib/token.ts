import { createHmac, randomBytes } from 'crypto'

const getSecret = () => {
    const secret = process.env.CANCELLATION_TOKEN_SECRET
    if (!secret) {
        throw new Error('CANCELLATION_TOKEN_SECRET environment variable is not set')
    }
    return secret
}

// Generate a unique cancellation token for a booking
export function generateCancellationToken(bookingId: string): string {
    const random = randomBytes(16).toString('hex')
    const payload = `${bookingId}:${random}`
    const hmac = createHmac('sha256', getSecret())
        .update(payload)
        .digest('hex')
    // Token format: base64url(payload:hmac)
    const token = Buffer.from(`${payload}:${hmac}`).toString('base64url')
    return token
}

// Verify a cancellation token is structurally valid (not tampered)
export function verifyCancellationToken(token: string): { valid: boolean; bookingId: string | null } {
    try {
        const decoded = Buffer.from(token, 'base64url').toString()
        const parts = decoded.split(':')
        if (parts.length !== 3) {
            return { valid: false, bookingId: null }
        }

        const [bookingId, random, receivedHmac] = parts
        const payload = `${bookingId}:${random}`
        const expectedHmac = createHmac('sha256', getSecret())
            .update(payload)
            .digest('hex')

        if (receivedHmac !== expectedHmac) {
            return { valid: false, bookingId: null }
        }

        return { valid: true, bookingId }
    } catch {
        return { valid: false, bookingId: null }
    }
}
