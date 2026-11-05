import type { NextRequest } from "next/server";

const EVENT_SERVER = "https://social-development-api.fly.dev";

function failure(message: string, status: number) {
  return Response.json({ success: false, message }, {
    status, headers: { "Cache-Control": "private, no-store" },
  });
}

async function proxyEvents(request: NextRequest) {
  const incoming = new URL(request.url);
  const method = request.method.toUpperCase();
  const protectedRequest = !["GET", "HEAD", "OPTIONS"].includes(method) ||
    incoming.pathname.startsWith("/api/events/member/");
  const headers = new Headers(request.headers);
  for (const name of ["host", "content-length", "connection", "authorization", "if-none-match", "if-modified-since"]) {
    headers.delete(name);
  }
  headers.set("x-forwarded-host", incoming.host);
  headers.set("x-forwarded-proto", incoming.protocol.replace(":", ""));
  const refreshedCookies: string[] = [];

  try {
    if (protectedRequest) {
      const cookie = request.headers.get("cookie");
      if (!cookie) return failure("Please log in to continue.", 401);

      const tokenResponse = await fetch(`${EVENT_SERVER}/api/auth/token`, {
        headers: {
          cookie,
          origin: incoming.origin,
          "x-forwarded-host": incoming.host,
          "x-forwarded-proto": incoming.protocol.replace(":", ""),
        },
        redirect: "manual",
        cache: "no-store",
      });

      if (tokenResponse.status === 401 || tokenResponse.status === 403) {
        return failure("Your session has expired. Please log in again.", 401);
      }
      if (!tokenResponse.ok || !tokenResponse.headers.get("content-type")?.includes("application/json")) {
        return failure("Unable to authorize this request. Please try again.", 503);
      }
      const data = await tokenResponse.json();
      if (typeof data.token !== "string" || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(data.token)) {
        return failure("Unable to authorize this request. Please try again.", 503);
      }
      headers.set("authorization", `Bearer ${data.token}`);
      refreshedCookies.push(...tokenResponse.headers.getSetCookie());
    }

    const upstream = await fetch(`${EVENT_SERVER}${incoming.pathname}${incoming.search}`, {
      method,
      headers,
      body: method === "GET" || method === "HEAD" ? undefined : await request.arrayBuffer(),
      redirect: "manual",
      cache: "no-store",
    });

    // Return JSON to event clients even if a platform/router responds with HTML.
    if (upstream.status !== 204 && !upstream.headers.get("content-type")?.includes("application/json")) {
      return failure("The event service returned an unexpected response. Please try again.", 502);
    }

    const responseHeaders = new Headers(upstream.headers);
    for (const name of ["content-encoding", "content-length", "transfer-encoding", "connection", "set-cookie", "set-auth-jwt"]) {
      responseHeaders.delete(name);
    }
    for (const cookie of [...refreshedCookies, ...upstream.headers.getSetCookie()]) {
      responseHeaders.append("set-cookie", cookie);
    }
    responseHeaders.set("Cache-Control", "private, no-store");
    responseHeaders.set("X-Events-Auth", "jwt-v1");
    return new Response(method === "HEAD" || upstream.status === 204 ? null : upstream.body, {
      status: upstream.status, statusText: upstream.statusText, headers: responseHeaders,
    });
  } catch {
    return failure("Unable to reach the event service. Please try again.", 502);
  }
}

export async function GET(request: NextRequest) { return proxyEvents(request); }
export async function HEAD(request: NextRequest) { return proxyEvents(request); }
export async function POST(request: NextRequest) { return proxyEvents(request); }
export async function PUT(request: NextRequest) { return proxyEvents(request); }
export async function PATCH(request: NextRequest) { return proxyEvents(request); }
export async function DELETE(request: NextRequest) { return proxyEvents(request); }
export async function OPTIONS(request: NextRequest) { return proxyEvents(request); }
