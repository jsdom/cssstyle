"use strict";

const parsers = require("../parsers");
const constants = require("./constants");

exports.getPropertyDescriptor = function getPropertyDescriptor(property) {
  const { AST_TYPES } = constants;
  return {
    set(v) {
      const globalObject = this._global;
      v = parsers.prepareValue(v, globalObject);
      // The value has already been set.
      if (this._values.get(property) === v && !this._priorities.get(property)) {
        return;
      }
      if (v === "" || parsers.hasVarFunc(v)) {
        this._setProperty(property, v);
      } else {
        const options = this._options;
        const val = parsers.parsePropertyValue(property, v, {
          globalObject,
          options,
          inArray: true
        });
        let value;
        if (Array.isArray(val) && val.length === 1) {
          const [{ name, raw, type, value: itemValue }] = val;
          switch (type) {
            case AST_TYPES.ANGLE: {
              value = parsers.parseAngle(val, options);
              break;
            }
            case AST_TYPES.CALC: {
              value = `${name}(${itemValue})`;
              break;
            }
            case AST_TYPES.DIMENSION: {
              value = parsers.parseLength(val, options);
              break;
            }
            case AST_TYPES.GLOBAL_KEY:
            case AST_TYPES.IDENTIFIER: {
              value = name;
              break;
            }
            case AST_TYPES.NUMBER: {
              value = parsers.parseNumber(val, options);
              break;
            }
            case AST_TYPES.PERCENTAGE: {
              value = parsers.parsePercentage(val, options);
              break;
            }
            case AST_TYPES.STRING: {
              value = parsers.parseString(val, options);
              break;
            }
            case AST_TYPES.URL: {
              value = parsers.parseURL(val, options);
              break;
            }
            default: {
              value = raw;
            }
          }
        } else if (typeof val === "string") {
          value = val;
        }
        if (typeof value === "string") {
          const priority = this._priorities.get(property) ?? "";
          this._setProperty(property, value, priority);
        }
      }
    },
    get() {
      return this.getPropertyValue(property);
    },
    enumerable: true,
    configurable: true
  };
};
