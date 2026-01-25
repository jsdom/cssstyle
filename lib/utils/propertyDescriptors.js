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
 * @returns {object} The property descriptor object.
 */
function createGenericPropertyDescriptor(property, { caseSensitive }) {
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
            const [{ name, type, value: itemValue }] = parsedValue;
            // TODO: Add handlers for AST_TYPES.DIMENSION, AST_TYPES.PERCENTAGE etc.
            switch (type) {
              case AST_TYPES.CALC: {
                this._setProperty(property, `${name}(${itemValue})`);
                break;
              }
              case AST_TYPES.GLOBAL_KEYWORD:
              case AST_TYPES.IDENTIFIER: {
                // Set the normalized name for keywords or identifiers.
                this._setProperty(property, name);
                break;
              }
              default: {
                // Set the prepared value for Dimension, Function, etc.
                this._setProperty(property, value);
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
