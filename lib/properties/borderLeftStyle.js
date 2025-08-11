"use strict";

const parsers = require("../parsers");

module.exports.parse = function parse(v, opt = {}) {
  const { globalObject } = opt;
  if (v === "") {
    return v;
  }
  const value = parsers.parsePropertyValue("border-left-style", v, {
    globalObject,
    inArray: true
  });
  if (Array.isArray(value) && value.length === 1) {
    const [{ name, type }] = value;
    switch (type) {
      case "GlobalKeyword":
      case "Identifier": {
        return name;
      }
      default:
    }
  } else if (typeof value === "string") {
    return value;
  }
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    if (parsers.hasVarFunc(v)) {
      this._setProperty("border", "");
      this._setProperty("border-left", "");
      this._setProperty("border-style", "");
      this._setProperty("border-left-style", v);
    } else {
      this._setProperty(
        "border-left-style",
        module.exports.parse(v, {
          globalObject: this._global
        })
      );
    }
  },
  get() {
    return this.getPropertyValue("border-left-style");
  },
  enumerable: true,
  configurable: true
};
