"use strict";

var margin = require("./margin.js");
var parsers = require("../parsers.js");

module.exports.definition = {
  set: parsers.subImplicitSetter("margin", "top", margin.isValid, margin.parser),
  get() {
    return this.getPropertyValue("margin-top");
  },
  enumerable: true,
  configurable: true
};
