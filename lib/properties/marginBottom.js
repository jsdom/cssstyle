"use strict";

const margin = require("./margin");

module.exports.definition = {
  set(v) {
    this._subImplicitSetter("margin", "bottom", v, margin.isValid, margin.parser);
  },
  get() {
    return this.getPropertyValue("margin-bottom");
  },
  enumerable: true,
  configurable: true
};
