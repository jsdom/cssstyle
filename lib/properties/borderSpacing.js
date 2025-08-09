"use strict";

const parsers = require("../parsers");

module.exports.parse = function parse(v, opt = {}) {
  const { globalObject } = opt;
  if (v === "") {
    return v;
  }
  const value = parsers.parsePropertyValue("border-spacing", v, {
    globalObject,
    inArray: true
  });
  if (Array.isArray(value) && value.length) {
    switch (value.length) {
      case 1: {
        const [part1] = value;
        const val1 = parsers.parseLength([part1]);
        if (val1) {
          return val1;
        }
        break;
      }
      case 2: {
        const [part1, part2] = value;
        const val1 = parsers.parseLength([part1]);
        const val2 = parsers.parseLength([part2]);
        if (val1 && val2) {
          return `${val1} ${val2}`;
        }
        break;
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
      this._setProperty("border-spacing", v);
    } else {
      this._setProperty(
        "border-spacing",
        module.exports.parse(v, {
          globalObject: this._global
        })
      );
    }
  },
  get() {
    return this.getPropertyValue("border-spacing");
  },
  enumerable: true,
  configurable: true
};
