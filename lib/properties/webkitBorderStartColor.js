"use strict";

const parsers = require("../parsers");

module.exports.parse = function parse(v, opt = {}) {
  const { globalObject } = opt;
  if (v === "") {
    return v;
  }
  const value = parsers.parsePropertyValue("-webkit-border-start-color", v, {
    globalObject,
    inArray: true
  });
  if (Array.isArray(value) && value.length === 1) {
    const [{ name, type }] = value;
    switch (type) {
      case "GlobalKeyword": {
        return name;
      }
      default: {
        return parsers.parseColor(value);
      }
    }
  } else if (typeof value === "string") {
    return value;
  }
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    this._setProperty(
      "-webkit-border-start-color",
      module.exports.parse(v, {
        globalObject: this._global
      })
    );
  },
  get() {
    return this.getPropertyValue("-webkit-border-start-color");
  },
  enumerable: true,
  configurable: true
};
