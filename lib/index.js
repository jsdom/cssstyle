"use strict";

const { CSSStyleDeclaration } = require("./CSSStyleDeclaration");
const propertyDefinitions = require("./generated/propertyDefinitions");
const propertyNames = require("./generated/allProperties");

module.exports = {
  CSSStyleDeclaration,
  propertyDefinitions: Object.fromEntries(propertyDefinitions),
  propertyNames: [...propertyNames]
};
