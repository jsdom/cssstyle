"use strict";

const parsers = require("../parsers");

module.exports.parse = function parse(v, opt = {}) {
  const { globalObject } = opt;
  if (v === "") {
    return v;
  }
  const value = parsers.parsePropertyValue("font-style", v, {
    globalObject,
    inArray: true
  });
  if (Array.isArray(value) && value.length) {
    if (value.length === 1) {
      const [{ name, type }] = value;
      switch (type) {
        case "GlobalKeyword":
        case "Identifier": {
          return name;
        }
        default:
      }
    } else if (value.length === 2) {
      const [part1, part2] = value;
      const val1 = part1.type === "Identifier" && part1.name;
      const val2 = parsers.parseAngle([part2]);
      if (val1 && val1 === "oblique" && val2) {
        return `${val1} ${val2}`;
      }
    }
  } else if (typeof value === "string") {
    return value;
  }
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    if (parsers.hasVarFunc(v)) {
      this._setProperty("font", "");
      this._setProperty("font-style", v);
    } else {
      this._setProperty(
        "font-style",
        module.exports.parse(v, {
          globalObject: this._global
        })
      );
    }
  },
  get() {
    return this.getPropertyValue("font-style");
  },
  enumerable: true,
  configurable: true
};
