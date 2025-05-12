"use strict";

const margin = require("./margin");

module.exports.definition = {
  set(v) {
    this._subImplicitSetter("margin", "top", v, margin.isValid, margin.parser);
  },
  get() {
    return this.getPropertyValue("margin-top");
  },
  enumerable: true,
  configurable: true
};
