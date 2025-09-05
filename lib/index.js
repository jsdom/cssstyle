/**
 * This is a fork from the CSS Style Declaration part of
 * https://github.com/NV/CSSOM
 */
"use strict";

const { CSSStyleDeclaration } = require("./CSSStyleDeclaration");
const implementedProperties = require("./generated/implementedProperties");

module.exports = {
  CSSStyleDeclaration,
  propertyList: Object.fromEntries(implementedProperties)
};
