"use strict";

var shorthandFor = {
  "background-color": require("./backgroundColor"),
  "background-image": require("./backgroundImage"),
  "background-repeat": require("./backgroundRepeat"),
  "background-attachment": require("./backgroundAttachment"),
  "background-position": require("./backgroundPosition")
};

module.exports.definition = {
  set(v) {
    this._shorthandSetter("background", v, shorthandFor);
  },
  get() {
    return this._shorthandGetter("background", shorthandFor);
  },
  enumerable: true,
  configurable: true
};
