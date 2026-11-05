# Social Development Events Platform

SocialGood helps people discover, organize and join local community service events.

**Live website:** https://social-development-platform-delta.vercel.app

## Features

- Email/password registration and login, plus Google sign-in through Better Auth.
- Public event details and an upcoming-events grid that excludes past events.
- Six upcoming events on the homepage, limited and sorted by MongoDB.
- Create events with a required image URL, event type, location, description and future date.
- Join events once and review joined events in date order.
- Edit and delete only events owned by the signed-in organizer.
- Protected event requests use a signed JWT bound to the active session.
- Edit your own display name and profile photo URL through My profile.
- Persistent light/dark themes, shared navigation/footer and mobile navigation.
- Loading skeletons and success toast notifications.
- Community gallery and newsletter presentation.
- Event dates displayed consistently in Bangladesh time.

## Technology

- Next.js App Router, React, TypeScript and Tailwind CSS.
- shadcn/ui's manually installed Sonner toast component.
- Better Auth with its MongoDB adapter and JWT plugin.
- Express.js and MongoDB.
- Vercel frontend hosting and Fly.io API hosting.

## Repository and deployment

This is a monorepo:

- Client: https://github.com/JubaerDV/social-development-platform/tree/master/client
- Server: https://github.com/JubaerDV/social-development-platform/tree/master/server
- API: https://social-development-api.fly.dev

Vercel uses `client` as its root directory. Authentication and signed-in event requests use same-origin Next.js route handlers, which forward requests to the Fly.io API. The route handlers currently target the deployed API. The frontend's `NEXT_PUBLIC_API_URL` configures public data fetching where used.

## Install and build

Use a Node.js version supported by the installed Next.js release. The backend container uses Node.js 22.

From `client`:

```sh
npm ci
npm run build
```

From `server`:

```sh
npm ci
npm run build
node --test scripts/event-jwt.test.mjs scripts/event-validation.test.mjs
```

JWT regression tests use an isolated in-memory adapter. Event validation tests do not connect to MongoDB.

## Configuration

Set backend credentials in the deployment environment. Variable names are listed in `server/.env.example`; do not commit local credentials.

- `MONGODB_URI` and `MONGODB_DB_NAME`
- `BETTER_AUTH_URL` and `BETTER_AUTH_SECRET`
- `CLIENT_URL`
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- `PORT` when required by the host

For full local authentication, the proxy upstream URLs, Better Auth origins, cookie settings and Google callback configuration must match the local environment. Production Google sign-in uses this authorized redirect URI:

```text
https://social-development-platform-delta.vercel.app/api/auth/callback/google
```

The newsletter is a presentation section; it does not send subscriptions. Email verification and password-reset flows are intentionally outside this assignment.
