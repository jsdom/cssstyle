"use strict";

const propertyDefinitions = require("./generated/propertyDefinitions");
const propertyHandlers = require("./generated/propertyHandlers");
const { getPropertyDescriptor } = require("./utils/propertyDescriptors");

/**
 * Retrieves the handler definition for a specific property.
 *
 * @param {string} property - The name of the property to retrieve the handler for.
 * @returns {object} The property handler.
 */
const getHandler = (property) => {
  let handler;
  if (propertyHandlers.has(property)) {
    handler = propertyHandlers.get(property).definition;
  } else {
    handler = getPropertyDescriptor(property);
  }
  return handler;
};

/**
 * Prepares a map of properties associated with their corresponding handlers.
 *
 * @returns {Map<string, object>} A map where keys are property names and values are handlers.
 */
const prepareProperties = () => {
  const properties = new Map();
  for (const [key, value] of propertyDefinitions.entries()) {
    const { styleDeclaration } = value;
    const handler = getHandler(key);
    if (handler) {
      for (const property of styleDeclaration) {
        properties.set(property, handler);
      }
    }
  }
  return properties;
};

/**
 * Mixes the prepared properties into the target object.
 * Only defines properties that are not already present on the target.
 *
 * @param {object} [target={}] - The target object to define properties on.
 * @returns {object} The target object with the new properties defined.
 */
const mixinProperties = (target = {}) => {
  const properties = prepareProperties();
  for (const [property, handler] of properties.entries()) {
    if (!Object.hasOwn(target, property)) {
      Object.defineProperty(target, property, handler);
    }
  }
  return target;
};

module.exports = {
  mixinProperties,
  properties: Object.fromEntries(prepareProperties())
};
