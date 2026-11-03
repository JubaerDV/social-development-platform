# Social Development Events Platform

Live website: https://social-development-platform-71tm.vercel.app

A community-focused platform for discovering, organizing, and joining social development events.

## Features

- Browse upcoming community events.
- View event details without signing in.
- Register and log in with email and password.
- Sign in with Google.
- Create community events with descriptions, images, locations, categories, and dates.
- Join upcoming events while signed in.
- View events joined by the current user.
- Manage events created by the current user.
- Edit and delete events owned by the current user.
- Responsive layout for desktop, tablet, and mobile screens.
- Community gallery and newsletter presentation.

## Technology

- Next.js App Router
- React and TypeScript
- Express.js
- MongoDB
- Better Auth

## Run locally

### Server

1. Open a terminal in the `server` directory.
2. Install dependencies using `npm install`.
3. Configure the required environment variables locally.
4. Start the server using `npm run dev`.

### Client

1. Open another terminal in the `client` directory.
2. Install dependencies using `npm install`.
3. Set `NEXT_PUBLIC_API_URL` to the server URL.
4. Start the client using `npm run dev`.

## Project structure

- `client/` - Next.js frontend.
- `server/` - Express API and MongoDB integration.