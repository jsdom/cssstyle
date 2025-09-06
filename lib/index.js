/**
 * This is a fork from the CSS Style Declaration part of
 * https://github.com/NV/CSSOM
 */
"use strict";

const { CSSStyleDeclaration } = require("./CSSStyleDeclaration");
const { CSSStyleProperties } = require("./CSSStyleProperties");
const implementedProperties = require("./generated/implementedProperties");

module.exports = {
  CSSStyleDeclaration,
  CSSStyleProperties,
  propertyList: Object.fromEntries(implementedProperties)
};
