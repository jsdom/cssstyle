"use strict";

const parsers = require("../parsers");

exports.getPropertyDescriptor = function getPropertyDescriptor(property) {
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
            case "Angle": {
              value = parsers.parseAngle(val, options);
              break;
            }
            case "Calc": {
              value = `${name}(${itemValue})`;
              break;
            }
            case "Dimension": {
              value = parsers.parseLength(val, options);
              break;
            }
            case "GlobalKeyword":
            case "Identifier": {
              value = name;
              break;
            }
            case "Number": {
              value = parsers.parseNumber(val, options);
              break;
            }
            case "Percentage": {
              value = parsers.parsePercentage(val, options);
              break;
            }
            case "String": {
              value = parsers.parseString(val, options);
              break;
            }
            case "Url": {
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
