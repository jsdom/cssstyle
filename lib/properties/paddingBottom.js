"use strict";

var padding = require("./padding.js");
var parsers = require("../parsers.js");

module.exports.definition = {
  set: parsers.subImplicitSetter("padding", "bottom", padding.isValid, padding.parser),
  get() {
    return this.getPropertyValue("padding-bottom");
  },
  enumerable: true,
  configurable: true
};
