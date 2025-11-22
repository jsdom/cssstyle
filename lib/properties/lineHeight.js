"use strict";

const parsers = require("../parsers");

const property = "line-height";
const shorthand = "font";

module.exports.parse = function parse(v, opt = {}) {
  if (v === "") {
    return v;
  }
  const { globalObject, options } = opt;
  const value = parsers.parsePropertyValue(property, v, {
    globalObject,
    options,
    inArray: true
  });
  if (Array.isArray(value) && value.length === 1) {
    const [{ name, type, value: itemValue }] = value;
    const parseOpt = {
      min: 0
    };
    for (const [key, val] of Object.entries(options)) {
      parseOpt[key] = val;
    }
    switch (type) {
      case "Calc": {
        return `${name}(${itemValue})`;
      }
      case "GlobalKeyword":
      case "Identifier": {
        return name;
      }
      case "Number": {
        return parsers.parseNumber(value, parseOpt);
      }
      default: {
        return parsers.parseLengthPercentage(value, parseOpt);
      }
    }
  } else if (typeof value === "string") {
    return value;
  }
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    // The value has already been set.
    if (this._values.get(property) === v && !this._priorities.get(property)) {
      return;
    }
    if (parsers.hasVarFunc(v)) {
      this._setProperty(shorthand, "");
      this._setProperty(property, v);
    } else {
      const val = module.exports.parse(v, {
        globalObject: this._global,
        options: this._options
      });
      if (typeof val === "string") {
        const shorthandPriority = this._priorities.get(shorthand);
        const prior = this._priorities.get(property) ?? "";
        const priority = shorthandPriority && prior ? "" : prior;
        this._setProperty(property, val, priority);
      }
    }
  },
  get() {
    return this.getPropertyValue(property);
  },
  enumerable: true,
  configurable: true
};
