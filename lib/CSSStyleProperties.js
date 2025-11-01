"use strict";

const { CSSStyleDeclaration } = require("./CSSStyleDeclaration");
const generatedProperties = require("./generated/properties");
const propertyList = require("./generated/propertyList");
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
for (const definition of propertyList.values()) {
  const { legacyAliasOf, name, styleDeclaration } = definition;
  const property = legacyAliasOf ?? name;
  if (!Object.hasOwn(generatedProperties, property)) {
    const declaration = getPropertyDescriptor(property);
    for (const aliasProperty of styleDeclaration) {
      Object.defineProperty(CSSStyleProperties.prototype, aliasProperty, declaration);
    }
  }
}

module.exports = {
  CSSStyleProperties
};
