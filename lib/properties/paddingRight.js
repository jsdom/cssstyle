"use strict";

const padding = require("./padding");

module.exports.definition = {
  set(v) {
    this._subImplicitSetter("padding", "right", v, padding.isValid, padding.parser);
  },
  get() {
    return this.getPropertyValue("padding-right");
  },
  enumerable: true,
  configurable: true
};
