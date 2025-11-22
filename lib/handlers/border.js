"use strict";

const { borderProperties, prepareBorderProperties } = require("../normalize");

/**
 * @param {object} styleDecl - CSSStyleDeclaration instance
 * @param {string} prop
 * @param {object|Array|string} val
 * @param {string} prior
 */
exports.handleBorder = (styleDecl, prop, val, prior) => {
  const properties = new Map();
  let originalText = null;
  if (prop === "border") {
    styleDecl._updating = true;
    if (typeof styleDecl._onChange === "function") {
      originalText = styleDecl.cssText;
    }
    let priority = "";
    if (typeof prior === "string") {
      priority = prior;
    } else {
      priority = styleDecl._priorities.get(prop) ?? "";
    }
    properties.set(prop, { propery: prop, value: val, priority });
  } else {
    for (let i = 0; i < styleDecl._length; i++) {
      const property = styleDecl[i];
      if (borderProperties.has(property)) {
        const value = styleDecl.getPropertyValue(property);
        const longhandPriority = styleDecl._priorities.get(property) ?? "";
        let priority = longhandPriority;
        if (prop === property && typeof prior === "string") {
          priority = prior;
        }
        properties.set(property, { property, value, priority });
      }
    }
  }
  const parsedProperties = prepareBorderProperties(prop, val, prior, properties, {
    globalObject: styleDecl._global,
    options: styleDecl._options
  });
  for (const [property, item] of parsedProperties) {
    const { priority, value } = item;
    styleDecl._setProperty(property, value, priority);
  }
  if (prop === "border") {
    styleDecl._updating = false;
    styleDecl._notifyChange(originalText);
  }
};
