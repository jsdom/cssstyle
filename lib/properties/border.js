"use strict";

var shorthandFor = {
  "border-width": require("./borderWidth"),
  "border-style": require("./borderStyle"),
  "border-color": require("./borderColor")
};

module.exports.definition = {
  set(v) {
    if (v === undefined) {
      return;
    }
    if (v === null) {
      v = "";
    }
    if (v.toString().toLowerCase() === "none") {
      v = "";
    }
    this._midShorthandSetter("border", v, shorthandFor);
  },
  get() {
    return this._shorthandGetter("border", shorthandFor);
  },
  enumerable: true,
  configurable: true
};
