"use strict";

var shorthandSetter = require("../parsers").shorthandSetter;
var shorthandGetter = require("../parsers").shorthandGetter;

var shorthandFor = {
  "border-top-width": require("./borderTopWidth"),
  "border-top-style": require("./borderTopStyle"),
  "border-top-color": require("./borderTopColor")
};

module.exports.definition = {
  set: shorthandSetter("border-top", shorthandFor),
  get: shorthandGetter("border-top", shorthandFor),
  enumerable: true,
  configurable: true
};
