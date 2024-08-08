import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";

const app = new Hono();

app.use(
  "/static/*",
  serveStatic({
    root: "./",
  }),
);

const readHtml = () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const _destinationFile = path.join(__dirname, "index.html");
  const indexHtml = fs.readFileSync(_destinationFile, "utf8");
  return indexHtml;
};

app.get("/", (c) => {
  const indexHtml = readHtml();
  return c.html(indexHtml);
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
