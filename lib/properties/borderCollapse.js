"use strict";

const parsers = require("../parsers");

module.exports.definition = {
  set(v) {
    if (v === undefined) {
      return;
    }
    if (v === null) {
      v = "";
    }
    if (
      parsers.valueType(v) === parsers.TYPES.KEYWORD &&
      (v.toLowerCase() === "collapse" ||
        v.toLowerCase() === "separate" ||
        v.toLowerCase() === "inherit")
    ) {
      v = v.toLowerCase();
      this._setProperty("border-collapse", v);
    }
  },
  get() {
    return this.getPropertyValue("border-collapse");
  },
  enumerable: true,
  configurable: true
};
