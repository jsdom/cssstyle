"use strict";

const margin = require("./margin");

module.exports.definition = {
  set(v) {
    this._subImplicitSetter("margin", "left", v, margin.isValid, margin.parser);
  },
  get() {
    return this.getPropertyValue("margin-left");
  },
  enumerable: true,
  configurable: true
};
