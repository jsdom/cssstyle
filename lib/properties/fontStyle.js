"use strict";

const parsers = require("../parsers");
const constants = require("../utils/constants");

const PROPERTY = "font-style";
const SHORTHAND = "font";

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
  const l = Array.isArray(value) ? value.length : 0;
  if (l) {
    if (l === 1) {
      const [{ name, type }] = value;
      switch (type) {
        case AST_TYPES.GLOBAL_KEY:
        case AST_TYPES.IDENTIFIER: {
          return name;
        }
        default:
      }
    } else if (l === 2) {
      const [part1, part2] = value;
      const val1 = part1.type === AST_TYPES.IDENTIFIER && part1.name;
      const val2 = parsers.parseAngle([part2], options);
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
    // The value has already been set.
    if (this._values.get(PROPERTY) === v && !this._priorities.get(PROPERTY)) {
      return;
    }
    if (parsers.hasVarFunc(v)) {
      this._setProperty(SHORTHAND, "");
      this._setProperty(PROPERTY, v);
    } else {
      const val = module.exports.parse(v, {
        globalObject: this._global,
        options: this._options
      });
      if (typeof val === "string") {
        const shorthandPriority = this._priorities.get(SHORTHAND);
        const prior = this._priorities.get(PROPERTY) ?? "";
        const priority = shorthandPriority && prior ? "" : prior;
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
