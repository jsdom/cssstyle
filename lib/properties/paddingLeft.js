"use strict";

var padding = require("./padding");

module.exports.definition = {
  set(v) {
    this._subImplicitSetter("padding", "left", v, padding.isValid, padding.parser);
  },
  get() {
    return this.getPropertyValue("padding-left");
  },
  enumerable: true,
  configurable: true
};
