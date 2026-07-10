const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

export const generateReferralCode = (): string => {
  const bytes = new Uint8Array(8)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map((b) => CHARS[b % CHARS.length]).join('')
}
