"use strict";

const parsers = require("../parsers");

module.exports.parse = function parse(v, opt = {}) {
  const { globalObject } = opt;
  if (v === "") {
    return v;
  }
  const values = parsers.splitValue(v, { delimiter: "," });
  const parsedValues = [];
  for (const val of values) {
    const value = parsers.parsePropertyValue("background-attachment", val, {
      globalObject,
      inArray: true
    });
    if (Array.isArray(value) && value.length === 1) {
      const [{ name, type }] = value;
      switch (type) {
        case "GlobalKeyword":
        case "Identifier": {
          parsedValues.push(name);
          break;
        }
        default: {
          return;
        }
      }
    } else if (typeof value === "string") {
      parsedValues.push(value);
    }
  }
  if (parsedValues.length) {
    return parsedValues.join(", ");
  }
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    if (parsers.hasVarFunc(v)) {
      this._setProperty("background", "");
      this._setProperty("background-attachment", v);
    } else {
      this._setProperty(
        "background-attachment",
        module.exports.parse(v, {
          globalObject: this._global
        })
      );
    }
  },
  get() {
    return this.getPropertyValue("background-attachment");
  },
  enumerable: true,
  configurable: true
};
