import { createAuthClient } from "better-auth/react";

const baseURL =
  process.env.NEXT_PUBLIC_API_URL || "https://social-development-api.fly.dev";

export const authClient = createAuthClient({
  baseURL,
  fetchOptions: {
    credentials: "include",
  },
});
