import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createVelkinMcpServer } from "./server.js";

const MCP_CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, mcp-session-id, Last-Event-ID, mcp-protocol-version",
  "Access-Control-Expose-Headers": "mcp-session-id, mcp-protocol-version",
};

/** Stateless Streamable HTTP handler for Next.js, Cloudflare Workers, etc. */
export async function handleVelkinMcpHttpRequest(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: MCP_CORS_HEADERS });
  }

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    // Prefer JSON bodies on serverless when the client allows it (still requires Accept SSE+JSON).
    enableJsonResponse: true,
  });
  const server = createVelkinMcpServer();
  await server.connect(transport);

  const response = await transport.handleRequest(request);
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(MCP_CORS_HEADERS)) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export { MCP_CORS_HEADERS };
