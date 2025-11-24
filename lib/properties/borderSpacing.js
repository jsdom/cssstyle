"use strict";

const parsers = require("../parsers");
const constants = require("../utils/constants");

const PROPERTY = "border-spacing";

module.exports.parse = function parse(v, opt = {}) {
  if (v === "") {
    return v;
  }
  const { AST_TYPES } = constants;
  const { globalObject, options } = opt;
  const value = parsers.parsePropertyValue(PROPERTY, v, {
    globalObject,
    options,
    inArray: true
  });
  if (Array.isArray(value)) {
    const l = value.length;
    const [part1, part2] = value;
    switch (l) {
      case 1: {
        const { name, type } = part1;
        if (type === AST_TYPES.GLOBAL_KEY) {
          return name;
        }
        const val1 = parsers.parseLength([part1], options);
        if (val1) {
          return val1;
        }
        break;
      }
      case 2: {
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
    if (this._values.get(PROPERTY) === v && !this._priorities.get(PROPERTY)) {
      return;
    }
    if (parsers.hasVarFunc(v)) {
      this._setProperty(PROPERTY, v);
    } else {
      const val = module.exports.parse(v, {
        globalObject: this._global,
        options: this._options
      });
      if (typeof val === "string") {
        const priority = this._priorities.get(PROPERTY) ?? "";
        this._setProperty(PROPERTY, val, priority);
      }
    }
  },
  get() {
    return this.getPropertyValue(PROPERTY);
  },
  enumerable: true,
  configurable: true
};
