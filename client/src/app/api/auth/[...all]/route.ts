import { NextRequest } from "next/server";


const AUTH_SERVER = "https://social-development-api.fly.dev";

async function proxyAuth(request: NextRequest) {
  const incomingUrl = new URL(request.url);
  const upstreamUrl =
    `${AUTH_SERVER}${incomingUrl.pathname}${incomingUrl.search}`;

  const headers = new Headers(request.headers);

  // Preserve browser cookies and the original public origin.
  headers.delete("host");
  headers.delete("content-length");
  headers.delete("connection");
  headers.set("x-forwarded-host", incomingUrl.host);
  headers.set("x-forwarded-proto", incomingUrl.protocol.replace(":", ""));

  const method = request.method.toUpperCase();
  const body =
    method === "GET" || method === "HEAD"
      ? undefined
      : await request.arrayBuffer();

  const upstream = await fetch(upstreamUrl, {
    method,
    headers,
    body,
    redirect: "manual",
    cache: "no-store",
  });

  const responseHeaders = new Headers(upstream.headers);

  // These headers describe the upstream connection/body encoding.
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");
  responseHeaders.delete("transfer-encoding");
  responseHeaders.delete("connection");

  // Preserve multiple Set-Cookie headers independently.
  const cookies = upstream.headers.getSetCookie();
  responseHeaders.delete("set-cookie");

  for (const cookie of cookies) {
    responseHeaders.append("set-cookie", cookie);
  }

  return new Response(
    method === "HEAD" ? null : upstream.body,
    {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    }
  );
}

export async function GET(request: NextRequest) {
  return proxyAuth(request);
}

export async function POST(request: NextRequest) {
  return proxyAuth(request);
}

export async function OPTIONS(request: NextRequest) {
  return proxyAuth(request);
}

export async function PUT(request: NextRequest) {
  return proxyAuth(request);
}

export async function PATCH(request: NextRequest) {
  return proxyAuth(request);
}

export async function DELETE(request: NextRequest) {
  return proxyAuth(request);
}