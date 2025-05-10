"use strict";

var shorthandSetter = require("../parsers").shorthandSetter;
var shorthandGetter = require("../parsers").shorthandGetter;

var shorthandFor = {
  "border-right-width": require("./borderRightWidth"),
  "border-right-style": require("./borderRightStyle"),
  "border-right-color": require("./borderRightColor")
};

module.exports.definition = {
  set: shorthandSetter("border-right", shorthandFor),
  get: shorthandGetter("border-right", shorthandFor),
  enumerable: true,
  configurable: true
};
