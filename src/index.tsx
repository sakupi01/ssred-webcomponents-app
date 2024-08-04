import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import type { FC } from "hono/jsx";
import { HelloWorldDsdButton } from "./web-components/hello-world/shadow-dom";

const app = new Hono();
app.use(
  "/static/*",
  serveStatic({
    root: "./",
  }),
);

const Layout: FC = (props) => {
  return (
    <html lang="en">
      <head>
        <title>SSRed with Web Components</title>
        <script src="/static/client.js" defer />
      </head>
      <body>{props.children}</body>
    </html>
  );
};

const SSRedPage = () => {
  return (
    <Layout>
      <h1>Rendered in Server Side</h1>
      <HelloWorldDsdButton label="Button1" />
      <HelloWorldDsdButton label="Button2" />
      <HelloWorldDsdButton label="Button3" />
      <div id="root" />
    </Layout>
  );
};

app.get("/", (c) => {
  return c.html(<SSRedPage />);
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
