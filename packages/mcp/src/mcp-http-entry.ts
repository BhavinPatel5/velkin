#!/usr/bin/env node
import { createServer } from "node:http";
import { handleVelkinMcpHttpRequest } from "./mcp-http-handler.js";

const port = Number(process.env.VELKIN_MCP_HTTP_PORT ?? process.env.PORT ?? 3100);

const server = createServer(async (req, res) => {
  const host = req.headers.host ?? `localhost:${port}`;
  const url = `http://${host}${req.url ?? "/"}`;
  const chunks: Buffer[] = [];
  req.on("data", (c) => chunks.push(c));
  await new Promise<void>((resolve) => req.on("end", resolve));

  const init: RequestInit = {
    method: req.method,
    headers: req.headers as HeadersInit,
  };
  if (chunks.length) init.body = Buffer.concat(chunks);

  const response = await handleVelkinMcpHttpRequest(new Request(url, init));
  res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
  if (response.body) {
    const buf = Buffer.from(await response.arrayBuffer());
    res.end(buf);
  } else {
    res.end();
  }
});

server.listen(port, () => {
  console.log(`Velkin MCP HTTP → http://localhost:${port}/mcp`);
});
