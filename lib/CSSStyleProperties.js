"use strict";

const { CSSStyleDeclaration } = require("./CSSStyleDeclaration");
const allProperties = require("./generated/allProperties");
const implementedProperties = require("./generated/implementedProperties");
const generatedProperties = require("./generated/properties");
const allExtraProperties = require("./utils/allExtraProperties");
const { dashedToCamelCase } = require("./utils/camelize");
const { getPropertyDescriptor } = require("./utils/propertyDescriptors");

/**
 * @see https://drafts.csswg.org/cssom/#the-cssstyledeclaration-interface
 */
class CSSStyleProperties extends CSSStyleDeclaration {
  get cssFloat() {
    return this.getPropertyValue("float");
  }

  set cssFloat(value) {
    this.setProperty("float", value);
  }
}

// Properties
Object.defineProperties(CSSStyleProperties.prototype, generatedProperties);

// Additional properties
const unifiedProperties =
  typeof allProperties.union === "function"
    ? allProperties.union(allExtraProperties)
    : new Set([...allProperties, ...allExtraProperties]);

unifiedProperties.forEach((property) => {
  if (!implementedProperties.has(property)) {
    const declaration = getPropertyDescriptor(property);
    Object.defineProperty(CSSStyleProperties.prototype, property, declaration);
    const camel = dashedToCamelCase(property);
    if (camel !== property) {
      Object.defineProperty(CSSStyleProperties.prototype, camel, declaration);
      if (/^webkit[A-Z]/.test(camel)) {
        const pascal = camel.replace(/^webkit/, "Webkit");
        Object.defineProperty(CSSStyleProperties.prototype, pascal, declaration);
      }
    }
  }
});

module.exports = {
  CSSStyleProperties
};
