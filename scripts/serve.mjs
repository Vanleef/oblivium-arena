import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
process.env.PMA_LOCAL_DATA_PATH ||= resolve(root, ".pma-dev-data.json");
const apiHandlers = {
  "/api/account": (await import("../api/account.js")).default,
  "/api/campaign": (await import("../api/campaign.js")).default,
  "/api/arena": (await import("../api/arena.js")).default
};
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".json": "application/json; charset=utf-8"
};
const port = Number(process.env.PORT || 4173);

createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url || "/", "http://localhost").pathname);
  if (apiHandlers[pathname]) {
    let body;
    if (request.method === "POST") {
      try { let raw = ""; for await (const chunk of request) { raw += chunk; if (raw.length > 140000) throw Error("large"); } body = JSON.parse(raw); }
      catch { response.writeHead(400, { "content-type": "application/json" }).end(JSON.stringify({ error: "Pedido inválido." })); return; }
    }
    const res = { status(code) { this.code = code; return this; }, setHeader(name, value) { response.setHeader(name, value); }, json(value) { response.writeHead(this.code || 200, { "content-type": "application/json; charset=utf-8" }); response.end(JSON.stringify(value)); } };
    try { await apiHandlers[pathname]({ method: request.method, headers: request.headers, body }, res); }
    catch { if (!response.headersSent) response.writeHead(503, { "content-type": "application/json" }).end(JSON.stringify({ error: "Serviço indisponível." })); }
    return;
  }
  const requested = resolve(root, "." + pathname);
  if (requested !== root && !requested.startsWith(root + sep)) {
    response.writeHead(403).end("Forbidden");
    return;
  }
  const file = requested.endsWith(sep) ? resolve(requested, "index.html") : requested;
  try {
    const body = await readFile(file);
    const ext = file.slice(file.lastIndexOf("."));
    response.writeHead(200, { "content-type": types[ext] || "application/octet-stream", "cache-control": "no-store" });
    response.end(body);
  } catch {
    if (!pathname.includes(".")) {
      const body = await readFile(resolve(root, "index.html"));
      response.writeHead(200, { "content-type": types[".html"] });
      response.end(body);
      return;
    }
    response.writeHead(404).end("Not Found");
  }
}).listen(port, () => {
  process.stdout.write("Oblivium Arena em http://localhost:" + port + "\n");
});

