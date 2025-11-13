"use strict";

const { CSSStyleDeclaration } = require("./CSSStyleDeclaration");
const propertyList = require("./generated/propertyList");
const propertyNames = require("./generated/allProperties");

module.exports = {
  CSSStyleDeclaration,
  propertyList: Object.fromEntries(propertyList),
  propertyNames: [...propertyNames]
};
