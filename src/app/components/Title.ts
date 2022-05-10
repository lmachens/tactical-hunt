class AppTitle extends HTMLElement {
  connectedCallback() {
    this.innerHTML = "<h1>Headline!!!🤘</h1>";
  }
}

customElements.define("app-title", AppTitle);
