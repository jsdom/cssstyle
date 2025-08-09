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
    const value = parsers.parsePropertyValue("background-image", val, {
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
          const parsedValue = parsers.parseImage(value);
          if (!parsedValue) {
            return;
          }
          parsedValues.push(parsedValue);
        }
      }
    } else if (typeof value === "string") {
      parsedValues.push(value);
    } else {
      return;
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
      this._setProperty("background-image", v);
    } else {
      this._setProperty(
        "background-image",
        module.exports.parse(v, {
          globalObject: this._global
        })
      );
    }
  },
  get() {
    return this.getPropertyValue("background-image");
  },
  enumerable: true,
  configurable: true
};
