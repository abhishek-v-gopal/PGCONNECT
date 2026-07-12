import { jwtVerify, createRemoteJWKSet } from 'jose'

// createRemoteJWKSet caches the JWKS response in-memory per Worker isolate,
// so this only hits the network once per isolate lifetime (not per request).
let jwks: ReturnType<typeof createRemoteJWKSet> | null = null
let jwksUrl = ''

export async function verifyAccessToken(token: string, supabaseUrl: string) {
  const url = `${supabaseUrl}/auth/v1/.well-known/jwks.json`
  if (!jwks || jwksUrl !== url) {
    jwks = createRemoteJWKSet(new URL(url))
    jwksUrl = url
  }

  const { payload } = await jwtVerify(token, jwks, {
    issuer: `${supabaseUrl}/auth/v1`,
  })

  return {
    id: payload.sub as string,
    email: (payload as { email?: string }).email,
  }
}
