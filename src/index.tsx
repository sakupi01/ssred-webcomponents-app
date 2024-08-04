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
        {/* 5. `./static/client.js`を`<script>`タグで読み込む */}
        {/* 6. Hydration時にclient.jsで定義されたCustom Elementが登録され、Web Componentの機能がアップグレードされる（ = Custom Elementが有効になり、Custom Element内で実装した機能がShadow DOMに適用される）*/}
        <script src="/static/client.js" defer />
      </head>
      <body>{props.children}</body>
    </html>
  );
};

// 2. SSRされる`SSRedPage`に`HelloWorldDsdButton`コンポーネントを追加
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
