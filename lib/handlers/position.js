"use strict";

const { getPositionValue, shorthandProperties } = require("../normalize");
const { hasVarFunc } = require("../parsers");

/**
 * @param {object} styleDecl - CSSStyleDeclaration instance
 * @param {string} prop
 * @param {Array|string} val
 * @param {string} prior
 */
exports.handlePositionShorthand = (styleDecl, prop, val, prior) => {
  if (!shorthandProperties.has(prop)) {
    return;
  }
  let originalText = null;
  if (prop === "margin" || prop === "padding") {
    styleDecl._updating = true;
    if (typeof styleDecl._onChange === "function") {
      originalText = styleDecl.cssText;
    }
  }
  const shorthandValues = [];
  if (Array.isArray(val)) {
    shorthandValues.push(...val);
  } else if (typeof val === "string") {
    shorthandValues.push(val);
  } else {
    return;
  }
  let priority = "";
  if (typeof prior === "string") {
    priority = prior;
  } else {
    priority = styleDecl._priorities.get(prop) ?? "";
  }
  const { position, shorthandFor } = shorthandProperties.get(prop);
  let hasPriority = false;
  for (const [longhandProperty, longhandItem] of shorthandFor) {
    const { position: longhandPosition } = longhandItem;
    const longhandValue = getPositionValue(shorthandValues, longhandPosition);
    if (priority) {
      styleDecl._setProperty(longhandProperty, longhandValue, priority);
    } else {
      const longhandPriority = styleDecl._priorities.get(longhandProperty) ?? "";
      if (longhandPriority) {
        hasPriority = true;
      } else {
        styleDecl._setProperty(longhandProperty, longhandValue, priority);
      }
    }
  }
  if (hasPriority) {
    styleDecl.removeProperty(prop);
  } else {
    const shorthandValue = getPositionValue(shorthandValues, position);
    styleDecl._setProperty(prop, shorthandValue, priority);
  }
  if (prop === "margin" || prop === "padding") {
    styleDecl._updating = false;
    styleDecl._notifyChange(originalText);
  }
};

/**
 * @param {object} styleDecl - CSSStyleDeclaration instance
 * @param {string} prop
 * @param {string} val
 * @param {string} prior
 * @param {string} shorthandProperty
 */
exports.handlePositionLonghand = (styleDecl, prop, val, prior, shorthandProperty) => {
  if (!shorthandProperty || !shorthandProperties.has(shorthandProperty)) {
    return;
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
    const { shorthandFor, position: shorthandPosition } =
      shorthandProperties.get(shorthandProperty);
    for (const [longhandProperty] of shorthandFor) {
      const longhandValue = styleDecl.getPropertyValue(longhandProperty);
      const longhandPriority = styleDecl._priorities.get(longhandProperty) ?? "";
      if (!longhandValue || longhandPriority !== priority) {
        return;
      }
      longhandValues.push(longhandValue);
    }
    if (longhandValues.length === shorthandFor.size) {
      const replacedValue = getPositionValue(longhandValues, shorthandPosition);
      styleDecl._setProperty(shorthandProperty, replacedValue, priority);
    }
  }
};
