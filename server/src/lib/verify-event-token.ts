type Claims = Record<string, unknown>;
type Verify = (token: string) => Promise<{ payload: Claims | null }>;

// Verify signatures with Better Auth, then bind claims to the active session.
export async function verifyEventToken(
  authorization: unknown,
  userId: string,
  issuer: string,
  verify: Verify,
): Promise<boolean> {
  if (typeof authorization !== "string" || authorization.length > 16384) return false;
  const match = /^Bearer ([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/.exec(authorization);
  if (!match || !userId || !issuer) return false;
  try {
    const { payload } = await verify(match[1]);
    if (!payload || payload.sub !== userId || payload.iss !== issuer) return false;
    const audience = payload.aud;
    if (!(audience === issuer || (Array.isArray(audience) && audience.includes(issuer)))) return false;
    if (typeof payload.exp !== "number" || !Number.isFinite(payload.exp)) return false;
    return payload.exp > Date.now() / 1000;
  } catch {
    return false;
  }
}
