import { SignJWT, importPKCS8 } from "jose";

// App Store Connect API auth — ES256 JWT (≤20 min lifetime), cached per run.
let cached: { token: string; exp: number } | null = null;

export async function getAscToken(): Promise<string | null> {
  const keyId = process.env.ASC_KEY_ID;
  const issuerId = process.env.ASC_ISSUER_ID;
  const pemRaw = process.env.ASC_PRIVATE_KEY;
  if (!keyId || !issuerId || !pemRaw) return null;

  const now = Math.floor(Date.now() / 1000);
  if (cached && cached.exp - 120 > now) return cached.token;

  // Vercel may store the .p8 with literal "\n" — restore real newlines.
  const pem = pemRaw.replace(/\\n/g, "\n");
  const key = await importPKCS8(pem, "ES256");
  const exp = now + 19 * 60; // under the 20-min ceiling

  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "ES256", kid: keyId, typ: "JWT" })
    .setIssuer(issuerId)
    .setIssuedAt(now)
    .setExpirationTime(exp)
    .setAudience("appstoreconnect-v1")
    .sign(key);

  cached = { token, exp };
  return token;
}
