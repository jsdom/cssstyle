"use strict";

const { shorthandProperties } = require("../normalize");
const { hasVarFunc, isGlobalKeyword } = require("../parsers");

/**
 * Handles flex shorthand property.
 *
 * @param {object} styleDecl - CSSStyleDeclaration instance
 * @param {string} prop
 * @param {string} val
 * @param {string} prior
 * @param {string} shorthandProperty
 */
exports.handleFlex = (styleDecl, prop, val, prior, shorthandProperty) => {
  if (!shorthandProperty || !shorthandProperties.has(shorthandProperty)) {
    return;
  }
  let originalText = null;
  if (prop === "flex") {
    styleDecl._updating = true;
    if (typeof styleDecl._onChange === "function") {
      originalText = styleDecl.cssText;
    }
  }
  const shorthandPriority = styleDecl._priorities.get(shorthandProperty);
  styleDecl.removeProperty(shorthandProperty);
  let priority = "";
  if (typeof prior === "string") {
    priority = prior;
  } else {
    priority = styleDecl._priorities.get(prop) ?? "";
  }
  styleDecl.removeProperty(prop);
  if (shorthandPriority && priority) {
    styleDecl._setProperty(prop, val);
  } else {
    styleDecl._setProperty(prop, val, priority);
  }
  if (val && !hasVarFunc(val)) {
    const longhandValues = [];
    const shorthandItem = shorthandProperties.get(shorthandProperty);
    let hasGlobalKeywordInValue = false;
    for (const [longhandProperty] of shorthandItem.shorthandFor) {
      if (longhandProperty === prop) {
        if (isGlobalKeyword(val)) {
          hasGlobalKeywordInValue = true;
        }
        longhandValues.push(val);
      } else {
        const longhandValue = styleDecl.getPropertyValue(longhandProperty);
        const longhandPriority = styleDecl._priorities.get(longhandProperty) ?? "";
        if (!longhandValue || longhandPriority !== priority) {
          break;
        }
        if (isGlobalKeyword(longhandValue)) {
          hasGlobalKeywordInValue = true;
        }
        longhandValues.push(longhandValue);
      }
    }
    if (longhandValues.length === shorthandItem.shorthandFor.size) {
      if (hasGlobalKeywordInValue) {
        const [firstValue, ...restValues] = longhandValues;
        if (restValues.every((value) => value === firstValue)) {
          styleDecl._setProperty(shorthandProperty, firstValue, priority);
        }
      } else {
        const parsedValue = shorthandItem.parse(longhandValues.join(" "));
        if (parsedValue) {
          const shorthandValue = Object.values(parsedValue).join(" ");
          styleDecl._setProperty(shorthandProperty, shorthandValue, priority);
        }
      }
    }
  }
  if (prop === "flex") {
    styleDecl._updating = false;
    styleDecl._notifyChange(originalText);
  }
};
