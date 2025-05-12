"use strict";

const padding = require("./padding");

module.exports.definition = {
  set(v) {
    this._subImplicitSetter("padding", "bottom", v, padding.isValid, padding.parser);
  },
  get() {
    return this.getPropertyValue("padding-bottom");
  },
  enumerable: true,
  configurable: true
};
