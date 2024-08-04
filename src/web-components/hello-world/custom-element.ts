export class HelloWorldCE extends HTMLElement {
  connectedCallback() {
    // Upgrade <hello-world /> Custom Element
    const button = this.shadowRoot?.querySelector("button");
    button?.addEventListener("click", () => alert("Hello, World!"));
  }
}
