"use strict";

const parsers = require("../parsers");

const property = "border-spacing";

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
  if (Array.isArray(value) && value.length) {
    switch (value.length) {
      case 1: {
        const [part1] = value;
        const val1 = parsers.parseLength([part1], options);
        if (val1) {
          return val1;
        }
        break;
      }
      case 2: {
        const [part1, part2] = value;
        const val1 = parsers.parseLength([part1], options);
        const val2 = parsers.parseLength([part2], options);
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
    // The value has already been set.
    if (this._values.get(property) === v && !this._priorities.get(property)) {
      return;
    }
    if (parsers.hasVarFunc(v)) {
      this._setProperty(property, v);
    } else {
      const val = module.exports.parse(v, {
        globalObject: this._global,
        options: this._options
      });
      if (typeof val === "string") {
        const priority = this._priorities.get(property) ?? "";
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
