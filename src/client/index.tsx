import { render } from "hono/jsx/dom";
import { HelloWorldCE } from "../web-components/hello-world/custom-element";

// 3. クライアントサイドのエントリーポイント（./src/client/index.tsx）を作成
// 3.1. `window.customElements.define`でCustom Elementを定義
// 3.2. `./src/client/index.tsx`はビルド時に`./static/client.js`として出力される
customElements.define("hello-world-button", HelloWorldCE);

const helloWorldComponent = (label: string) => `
      <hello-world-button>
        <template shadowrootmode="open">
          <style>
              button {
                background-color: pink;
                color: white;
                padding: 15px 32px;
                font-size: 16px;
                margin: 4px 2px;
                cursor: pointer;
                }
          </style>
          <button type="button">${label}</button>
        </template>
      </hello-world-button>
`;

// 👇setHTMLUnsafeを使ってDSDを利用した <hello-world /> Custom Elementを追加するボタン
const SetHtmlUnsafeDSDAddButton = () => {
  const handleAddDsd = () => {
    const tempDiv = document.createElement("div");
    // 👇setHTMLUnsafeを使ってDSDを追加
    tempDiv.setHTMLUnsafe(helloWorldComponent("I'm DSD Button"));
    document.body.appendChild(
      tempDiv.getElementsByTagName("hello-world-button")[0],
    );
  };
  return (
    <button type="button" onClick={handleAddDsd}>
      Add Say DSD!(setHTMLUnsafe)
    </button>
  );
};

// 👇innerHTMLを使ってDSDを利用した <hello-world /> Custom Elementを追加するボタン
const InnerHtmlDSDAddButton = () => {
  const handleAddDsd = () => {
    const tempDiv = document.createElement("div");
    // 👇innerHTMLを使ってDSDを追加
    tempDiv.innerHTML = helloWorldComponent("I'm DSD Button");
    document.body.appendChild(
      tempDiv.getElementsByTagName("hello-world-button")[0],
    );
  };
  return (
    <button type="button" onClick={handleAddDsd}>
      Add Say DSD!(innerHTML)
    </button>
  );
};

function ClientApp() {
  return (
    <>
      <h2>↓Under Here is generated after Hydration!↓</h2>
      <SetHtmlUnsafeDSDAddButton />
      <InnerHtmlDSDAddButton />
    </>
  );
}

const root = document.getElementById("root");
if (root) {
  render(<ClientApp />, root);
} else {
  console.error("root element not found");
}
