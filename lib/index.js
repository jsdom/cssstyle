"use strict";

const { CSSStyleDeclaration } = require("./CSSStyleDeclaration");
const { CSSStyleProperties } = require("./CSSStyleProperties");
const propertyList = require("./generated/propertyList");
const propertyNames = require("./generated/allProperties");

module.exports = {
  CSSStyleDeclaration,
  CSSStyleProperties,
  propertyList: Object.fromEntries(propertyList),
  propertyNames: [...propertyNames]
};
