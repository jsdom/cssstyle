"use strict";

const padding = require("./padding");

module.exports.definition = {
  set(v) {
    this._subImplicitSetter("padding", "top", v, padding.isValid, padding.parser);
  },
  get() {
    return this.getPropertyValue("padding-top");
  },
  enumerable: true,
  configurable: true
};
