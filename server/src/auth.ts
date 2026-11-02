import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { jwt } from "better-auth/plugins";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { client } from "./config/database.js";

const databaseName = process.env.MONGODB_DB_NAME;

if (!databaseName) {
  throw new Error("MONGODB_DB_NAME is missing.");
}

if (
  !process.env.BETTER_AUTH_SECRET ||
  process.env.BETTER_AUTH_SECRET.length < 32
) {
  throw new Error("BETTER_AUTH_SECRET must contain at least 32 characters.");
}

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

export const auth = betterAuth({
  appName: "Social Development Platform",

  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5000",

  secret: process.env.BETTER_AUTH_SECRET,

  trustedOrigins: [
    process.env.CLIENT_URL || "http://localhost:3000"
  ],

  database: mongodbAdapter(client.db(databaseName), {
    client
  }),

  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
      requireLocalEmailVerified: false
    }
  },

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-up/email") {
        return;
      }

      const password = ctx.body?.password;

      if (typeof password !== "string" || password.length < 6) {
        throw new APIError("BAD_REQUEST", {
          message: "Password must contain at least 6 characters."
        });
      }

      if (!/[A-Z]/.test(password)) {
        throw new APIError("BAD_REQUEST", {
          message: "Password must contain at least one uppercase letter."
        });
      }

      if (!/[a-z]/.test(password)) {
        throw new APIError("BAD_REQUEST", {
          message: "Password must contain at least one lowercase letter."
        });
      }
    })
  },

  ...(googleClientId && googleClientSecret
    ? {
        socialProviders: {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret
          }
        }
      }
    : {}),

  plugins: [
    jwt()
  ]
});
