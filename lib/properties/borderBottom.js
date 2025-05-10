"use strict";

var shorthandSetter = require("../parsers").shorthandSetter;
var shorthandGetter = require("../parsers").shorthandGetter;

var shorthandFor = {
  "border-bottom-width": require("./borderBottomWidth"),
  "border-bottom-style": require("./borderBottomStyle"),
  "border-bottom-color": require("./borderBottomColor")
};

module.exports.definition = {
  set: shorthandSetter("border-bottom", shorthandFor),
  get: shorthandGetter("border-bottom", shorthandFor),
  enumerable: true,
  configurable: true
};
