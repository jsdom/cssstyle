"use strict";

const margin = require("./margin");

module.exports.definition = {
  set(v) {
    this._subImplicitSetter("margin", "right", v, margin.isValid, margin.parser);
  },
  get() {
    return this.getPropertyValue("margin-right");
  },
  enumerable: true,
  configurable: true
};
