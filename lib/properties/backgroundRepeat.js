"use strict";

const parsers = require("../parsers");
const constants = require("../utils/constants");

const PROPERTY = "background-repeat";
const SHORTHAND = "background";

module.exports.parse = function parse(v, opt = {}) {
  if (v === "") {
    return v;
  }
  const { AST_TYPES } = constants;
  const { globalObject, options } = opt;
  const values = parsers.splitValue(v, {
    delimiter: ","
  });
  const parsedValues = [];
  for (const val of values) {
    const value = parsers.parsePropertyValue(PROPERTY, val, {
      globalObject,
      options,
      inArray: true
    });
    if (Array.isArray(value) && value.length) {
      let parsedValue = "";
      switch (value.length) {
        case 1: {
          const [part1] = value;
          const val1 = part1.type === AST_TYPES.IDENTIFIER && part1.name;
          if (val1) {
            parsedValue = val1;
          }
          break;
        }
        case 2: {
          const [part1, part2] = value;
          const val1 = part1.type === AST_TYPES.IDENTIFIER && part1.name;
          const val2 = part2.type === AST_TYPES.IDENTIFIER && part2.name;
          if (val1 && val2) {
            if (val1 === "repeat" && val2 === "no-repeat") {
              parsedValue = "repeat-x";
            } else if (val1 === "no-repeat" && val2 === "repeat") {
              parsedValue = "repeat-y";
            } else if (val1 === val2) {
              parsedValue = val1;
            } else {
              parsedValue = `${val1} ${val2}`;
            }
          }
          break;
        }
        default:
      }
      if (parsedValue) {
        parsedValues.push(parsedValue);
      } else {
        return;
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
