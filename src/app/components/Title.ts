class AppTitle extends HTMLElement {
  connectedCallback() {
    this.innerText = "Headline!!!🤘";
  }
}

customElements.define("app-title", AppTitle);
