"use strict";

const { CSSStyleDeclaration } = require("./CSSStyleDeclaration");
const { CSSStyleProperties } = require("./CSSStyleProperties");
const implementedProperties = require("./generated/implementedProperties");

module.exports = {
  CSSStyleDeclaration,
  CSSStyleProperties,
  propertyList: Object.fromEntries(implementedProperties)
};
