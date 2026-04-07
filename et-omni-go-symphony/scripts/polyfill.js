if (typeof global.CustomEvent === "undefined") {
  global.CustomEvent = class CustomEvent {
    constructor(type, params = {}) {
      this.type = type;
      this.detail = params.detail;
    }
  };
}
``