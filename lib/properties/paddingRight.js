"use strict";

var padding = require("./padding.js");
var parsers = require("../parsers.js");

module.exports.definition = {
  set: parsers.subImplicitSetter("padding", "right", padding.isValid, padding.parser),
  get() {
    return this.getPropertyValue("padding-right");
  },
  enumerable: true,
  configurable: true
};
