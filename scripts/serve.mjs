import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8"
};
const port = Number(process.env.PORT || 4173);

createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url || "/", "http://localhost").pathname);
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
  process.stdout.write("Eidoveyl Arena em http://localhost:" + port + "\n");
});
