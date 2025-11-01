"use strict";

const { CSSStyleDeclaration } = require("./CSSStyleDeclaration");
const { CSSStyleProperties } = require("./CSSStyleProperties");
const propertyList = require("./generated/propertyList");

module.exports = {
  CSSStyleDeclaration,
  CSSStyleProperties,
  propertyList: Object.fromEntries(propertyList)
};
