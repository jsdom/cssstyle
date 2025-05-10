"use strict";

var shorthandSetter = require("../parsers").shorthandSetter;
var shorthandGetter = require("../parsers").shorthandGetter;

var shorthandFor = {
  "border-left-width": require("./borderLeftWidth"),
  "border-left-style": require("./borderLeftStyle"),
  "border-left-color": require("./borderLeftColor")
};

module.exports.definition = {
  set: shorthandSetter("border-left", shorthandFor),
  get: shorthandGetter("border-left", shorthandFor),
  enumerable: true,
  configurable: true
};
