import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { test } from "node:test";
import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { jwt } from "better-auth/plugins";
import { verifyEventToken } from "../dist/lib/verify-event-token.js";

// Isolated memory database; never import the application's auth or Mongo client.
const issuer = "http://localhost:9876";
const auth = betterAuth({
  baseURL: issuer,
  secret: randomBytes(32).toString("hex"),
  database: memoryAdapter({ jwks: [] }),
  plugins: [jwt({ jwt: { issuer, audience: issuer } })],
});
const verify = token => auth.api.verifyJWT({ body: { token } });
const check = (token, userId = "member-a") =>
  verifyEventToken(token ? `Bearer ${token}` : undefined, userId, issuer, verify);
async function sign(payload = {}) {
  const result = await auth.api.signJWT({ body: { payload: { sub: "member-a", ...payload } } });
  return result.token;
}

test("accepts a valid signed JWT for the active session", async () => {
  assert.equal(await check(await sign()), true);
});
test("rejects missing and malformed credentials", async () => {
  assert.equal(await check(), false);
  assert.equal(await check("not-a-jwt"), false);
});
test("rejects a JWT whose signature was changed", async () => {
  const parts = (await sign()).split(".");
  parts[2] = (parts[2][0] === "A" ? "B" : "A") + parts[2].slice(1);
  assert.equal(await check(parts.join(".")), false);
});
test("rejects an expired JWT", async () => {
  assert.equal(await check(await sign({ exp: Math.floor(Date.now() / 1000) - 60 })), false);
});
test("rejects another user's JWT", async () => {
  assert.equal(await check(await sign(), "member-b"), false);
});
test("rejects another audience or issuer", async () => {
  assert.equal(await check(await sign({ aud: "https://other.example" })), false);
  assert.equal(await check(await sign({ iss: "https://other.example" })), false);
});
