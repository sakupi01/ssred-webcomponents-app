// 2. Custom Elementを実装
// 2.1. HTMLElementを継承した`HelloWorldCE`クラスを作成
export class HelloWorldCE extends HTMLElement {
  // 2.2. Custom Elementの持つ機能を`connectedCallback`メソッド内で実装
  connectedCallback() {
    const button = this.shadowRoot?.querySelector("button");
    button?.addEventListener("click", () => alert("Hello, World!"));
  }
}
