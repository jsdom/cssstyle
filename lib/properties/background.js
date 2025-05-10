"use strict";

var shorthandSetter = require("../parsers").shorthandSetter;
var shorthandGetter = require("../parsers").shorthandGetter;

var shorthandFor = {
  "background-color": require("./backgroundColor"),
  "background-image": require("./backgroundImage"),
  "background-repeat": require("./backgroundRepeat"),
  "background-attachment": require("./backgroundAttachment"),
  "background-position": require("./backgroundPosition")
};

module.exports.definition = {
  set: shorthandSetter("background", shorthandFor),
  get: shorthandGetter("background", shorthandFor),
  enumerable: true,
  configurable: true
};
