# Social Development Events API

Express and MongoDB API for the SocialGood frontend.

**API:** https://social-development-api.fly.dev

**Website:** https://social-development-platform-delta.vercel.app

## Routes

| Method | Route | Access |
| --- | --- | --- |
| GET | `/api/health` | Public |
| GET | `/api/events?upcoming=true&limit=6` | Public |
| GET | `/api/events/:id` | Public |
| POST | `/api/events` | Active session and verified JWT |
| GET | `/api/events/member/joined` | Active session and verified JWT |
| GET | `/api/events/member/managed` | Active session and verified JWT |
| POST | `/api/events/:id/join` | Active session and verified JWT |
| PUT | `/api/events/:id` | Organizer only; active session and verified JWT |
| DELETE | `/api/events/:id` | Organizer only; active session and verified JWT |

Better Auth owns `/api/auth/*`. The frontend's event proxy obtains a short-lived token using the session cookie and forwards it in the Authorization header. Event routes verify the signature, issuer, audience, expiry and subject, and require the subject to match the active session user.

## Event validation

Create and update share validation for required text, supported event types, HTTP/HTTPS image URLs and canonical future timestamps. Owner fields come from the authenticated user. Update operations preserve ownership and participant data. Join operations prevent duplicate participation.

## Build and check

```sh
npm ci
npm run build
node --test scripts/event-jwt.test.mjs scripts/event-validation.test.mjs
```

The regression tests do not connect to the application's MongoDB database. Configure runtime variables using `.env.example` as a list of variable names and keep real values outside source control.

## Deployment

The Fly.io app is `social-development-api`. Build from the Dockerfile and retain existing deployment secrets. A deployment must include `src`, `package.json`, `package-lock.json`, `tsconfig.json`, `Dockerfile` and `fly.toml`.

Changes that make protected requests depend on a new frontend proxy must be deployed after the matching frontend is live.
