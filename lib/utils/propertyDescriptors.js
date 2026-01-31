"use strict";

const parsers = require("../parsers");

// Constants
const { AST_TYPES } = parsers;

/**
 * Creates a generic property descriptor for a given property. Such descriptors are used whenever we don't have a
 * specific handler in `./properties/*.js`. They perform some basic logic that works as a fallback, and is correct for
 * simple properties, but properties with more complex grammars will need their own handlers.
 *
 * @param {string} property - The canonical CSS property name (e.g. "backdrop-filter", not "backdropFilter").
 * @param {object} opts - The options object.
 * @param {boolean} opts.caseSensitive - True if value is case-sensitive, false otherwise.
 * @param {object} [opts.dimensionTypes] - The dimension types object.
 * @param {object} [opts.functionTypes] - The function types object.
 * @returns {object} The property descriptor object.
 */
function createGenericPropertyDescriptor(property, { caseSensitive, dimensionTypes, functionTypes }) {
  return {
    set(v) {
      const value = parsers.prepareValue(v);
      if (parsers.hasVarFunc(value)) {
        this._setProperty(property, value);
      } else {
        const parsedValue = parsers.parsePropertyValue(property, v, {
          caseSensitive
        });
        if (Array.isArray(parsedValue)) {
          if (parsedValue.length === 1) {
            const {
              angle: angleType,
              dimension: dimensionType,
              length: lengthType,
              number: numberType,
              percentage: percentageType
            } = dimensionTypes ?? {};
            const { color: colorType, image: imageType } = functionTypes ?? {};
            const [{ name, type, value: itemValue }] = parsedValue;
            switch (type) {
              case AST_TYPES.CALC: {
                this._setProperty(property, `${name}(${itemValue})`);
                break;
              }
              case AST_TYPES.DIMENSION: {
                let val;
                if (dimensionType && lengthType) {
                  val = parsers.parseLength(parsedValue, lengthType);
                  if (!val) {
                    val = parsers.parseDimension(parsedValue, dimensionType);
                  }
                } else if (lengthType) {
                  val = parsers.parseLength(parsedValue, lengthType);
                } else {
                  val = parsers.parseDimension(parsedValue, dimensionType);
                }
                this._setProperty(property, val);
                break;
              }
              case AST_TYPES.FUNCTION: {
                if (colorType) {
                  this._setProperty(property, parsers.parseColor(parsedValue));
                } else if (imageType) {
                  this._setProperty(property, parsers.parseGradient(parsedValue));
                } else {
                  this._setProperty(property, value);
                }
                break;
              }
              case AST_TYPES.HASH: {
                this._setProperty(property, parsers.parseColor(parsedValue));
                break;
              }
              case AST_TYPES.NUMBER: {
                let val;
                if (numberType) {
                  val = parsers.parseNumber(parsedValue, numberType);
                } else if (angleType) {
                  val = parsers.parseAngle(parsedValue, angleType);
                } else if (lengthType) {
                  val = parsers.parseLength(parsedValue, lengthType);
                } else if (percentageType) {
                  val = parsers.parsePercentage(parsedValue, percentageType);
                }
                this._setProperty(property, val);
                break;
              }
              case AST_TYPES.GLOBAL_KEYWORD:
              case AST_TYPES.IDENTIFIER: {
                this._setProperty(property, name);
                break;
              }
              case AST_TYPES.STRING: {
                this._setProperty(property, parsers.parseString(parsedValue));
                break;
              }
              case AST_TYPES.URL: {
                this._setProperty(property, parsers.parseUrl(parsedValue));
                break;
              }
              default: {
                let numericType;
                if (percentageType) {
                  numericType = percentageType;
                } else if (dimensionType) {
                  numericType = dimensionType;
                } else if (angleType) {
                  numericType = angleType;
                } else if (lengthType) {
                  numericType = lengthType;
                }
                if (numericType) {
                  this._setProperty(property, parsers.resolveNumericValue(parsedValue, numericType));
                } else {
                  this._setProperty(property, value);
                }
              }
            }
          } else {
            // Set the prepared value for lists containing multiple values.
            this._setProperty(property, value);
          }
        } else if (typeof parsedValue === "string") {
          // Empty string.
          this._setProperty(property, parsedValue);
        }
      }
    },
    get() {
      return this.getPropertyValue(property);
    },
    enumerable: true,
    configurable: true
  };
}

module.exports = {
  createGenericPropertyDescriptor
};
