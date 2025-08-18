"use strict";

const { hasVarFunc, isGlobalKeyword, isValidPropertyValue, splitValue } = require("../parsers");
const border = require("../properties/border");
const borderTop = require("../properties/borderTop");
const borderRight = require("../properties/borderRight");
const borderBottom = require("../properties/borderBottom");
const borderLeft = require("../properties/borderLeft");

module.exports.borderProperties = new Set([
  "border",
  "border-image",
  ...border.shorthandFor.keys(),
  ...border.positionShorthandFor.keys(),
  ...borderTop.shorthandFor.keys(),
  ...borderRight.shorthandFor.keys(),
  ...borderBottom.shorthandFor.keys(),
  ...borderLeft.shorthandFor.keys()
]);

const borderElements = {
  name: "border",
  positions: ["top", "right", "bottom", "left"],
  lines: ["width", "style", "color"]
};
const firstInitialKey = border.initialValues.keys().next().value;
const firstInitialValue = border.initialValues.get(firstInitialKey);

const getPropertyItem = (property, properties) => {
  const propertyItem = properties.get(property) ?? {
    property,
    value: "",
    priority: null
  };
  return propertyItem;
};

const matchesShorthandValue = (property, value, shorthandValue, opt = {}) => {
  const { globalObject } = opt;
  const obj = border.parse(shorthandValue, {
    globalObject
  });
  if (Object.hasOwn(obj, property)) {
    return value === obj[property];
  }
  return value === border.initialValues.get(property);
};

const replaceShorthandValue = (value, shorthandValue, opt = {}) => {
  const { globalObject } = opt;
  const valueObj = border.parse(value, {
    globalObject
  });
  const shorthandObj = shorthandValue
    ? border.parse(shorthandValue, {
        globalObject
      })
    : {
        [firstInitialKey]: firstInitialValue
      };
  const keys = border.shorthandFor.keys();
  for (const key of keys) {
    const initialValue = border.initialValues.get(key);
    let parsedValue = initialValue;
    if (Object.hasOwn(valueObj, key)) {
      parsedValue = valueObj[key];
    }
    if (parsedValue === initialValue) {
      if (key === firstInitialKey) {
        if (!Object.hasOwn(shorthandObj, key)) {
          shorthandObj[key] = parsedValue;
        }
      } else {
        delete shorthandObj[key];
      }
    } else {
      shorthandObj[key] = parsedValue;
      if (shorthandObj[firstInitialKey] && shorthandObj[firstInitialKey] === firstInitialValue) {
        delete shorthandObj[firstInitialKey];
      }
    }
  }
  return Object.values(shorthandObj).join(" ");
};

const replaceLineValue = (value, lineValue, position) => {
  const values = splitValue(lineValue);
  switch (values.length) {
    case 1: {
      const [val1] = values;
      if (val1 === value) {
        return lineValue;
      }
      switch (position) {
        case "top": {
          return [value, val1, val1].join(" ");
        }
        case "right": {
          return [val1, value, val1, val1].join(" ");
        }
        case "bottom": {
          return [val1, val1, value].join(" ");
        }
        case "left": {
          return [val1, val1, val1, value].join(" ");
        }
        default:
      }
      break;
    }
    case 2: {
      const [val1, val2] = values;
      switch (position) {
        case "top": {
          if (val1 === value) {
            return lineValue;
          }
          return [value, val2, val1].join(" ");
        }
        case "right": {
          if (val2 === value) {
            return lineValue;
          }
          return [val1, value, val1, val2].join(" ");
        }
        case "bottom": {
          if (val1 === value) {
            return lineValue;
          }
          return [val1, val2, value].join(" ");
        }
        case "left": {
          if (val2 === value) {
            return lineValue;
          }
          return [val1, val2, val1, value].join(" ");
        }
        default:
      }
      break;
    }
    case 3: {
      const [val1, val2, val3] = values;
      switch (position) {
        case "top": {
          if (val1 === value) {
            return lineValue;
          } else if (val3 === value) {
            return [value, val2].join(" ");
          }
          return [value, val2, val3].join(" ");
        }
        case "right": {
          if (val2 === value) {
            return lineValue;
          }
          return [val1, value, val3, val2].join(" ");
        }
        case "bottom": {
          if (val3 === value) {
            return lineValue;
          } else if (val1 === value) {
            return [val1, val2].join(" ");
          }
          return [val1, val2, value].join(" ");
        }
        case "left": {
          if (val2 === value) {
            return lineValue;
          }
          return [val1, val2, val3, value].join(" ");
        }
        default:
      }
      break;
    }
    case 4: {
      const [val1, val2, val3, val4] = values;
      switch (position) {
        case "top": {
          if (val1 === value) {
            return lineValue;
          }
          return [value, val2, val3, val4].join(" ");
        }
        case "right": {
          if (val2 === value) {
            return lineValue;
          } else if (val4 === value) {
            return [val1, value, val3].join(" ");
          }
          return [val1, value, val3, val4].join(" ");
        }
        case "bottom": {
          if (val3 === value) {
            return lineValue;
          }
          return [val1, val2, value, val4].join(" ");
        }
        case "left": {
          if (val4 === value) {
            return lineValue;
          } else if (val2 === value) {
            return [val1, val2, val3].join(" ");
          }
          return [val1, val2, val3, value].join(" ");
        }
        default:
      }
      break;
    }
    default:
  }
};

module.exports.prepareBorderProperties = function prepareBorderProperties(
  property,
  value,
  properties = new Map(),
  opt = {}
) {
  if (typeof property !== "string" || value === null) {
    return;
  }
  const { globalObject } = opt;
  const { name, positions, lines } = borderElements;
  const [prop1, prop2, prop3] = property.split("-");
  if (prop1 !== name) {
    return;
  } else if (positions.includes(prop2)) {
    if (prop3) {
      if (!lines.includes(prop3)) {
        return;
      }
    }
  } else if (lines.includes(prop2)) {
    if (prop3) {
      return;
    }
  }
  const borderItems = new Map();
  const nameProperty = prop1;
  const imageProperty = `${prop1}-image`;
  // Empty string, global keywords, var(), value of longhands.
  if (typeof value === "string") {
    // longhand properties
    if (prop3) {
      const nameItem = getPropertyItem(nameProperty, properties);
      const imageItem = getPropertyItem(imageProperty, properties);
      const lineProperty = `${prop1}-${prop3}`;
      const lineItem = getPropertyItem(lineProperty, properties);
      const positionProperty = `${prop1}-${prop2}`;
      const positionItem = getPropertyItem(positionProperty, properties);
      const longhandProperty = `${prop1}-${prop2}-${prop3}`;
      const longhandItem = getPropertyItem(longhandProperty, properties);
      longhandItem.value = value;
      const propertyValue = hasVarFunc(value) ? "" : value;
      if (propertyValue === "") {
        nameItem.value = "";
        lineItem.value = "";
        positionItem.value = "";
      } else if (isGlobalKeyword(propertyValue)) {
        if (nameItem.value !== propertyValue) {
          nameItem.value = "";
        }
        if (lineItem.value !== propertyValue) {
          lineItem.value = "";
        }
        if (positionItem.value !== propertyValue) {
          positionItem.value = "";
        }
      } else {
        if (
          nameItem.value &&
          !matchesShorthandValue(lineProperty, propertyValue, nameItem.value, {
            globalObject
          })
        ) {
          nameItem.value = "";
        }
        if (lineItem.value) {
          lineItem.value = replaceLineValue(propertyValue, lineItem.value, prop2);
        }
        if (
          positionItem.value &&
          !matchesShorthandValue(lineProperty, propertyValue, positionItem.value, {
            globalObject
          })
        ) {
          positionItem.value = "";
        }
      }
      borderItems.set(nameProperty, nameItem);
      borderItems.set(imageProperty, imageItem);
      borderItems.set(lineProperty, lineItem);
      borderItems.set(positionProperty, positionItem);
      borderItems.set(longhandProperty, longhandItem);
      // border-top, border-right, border-bottom, border-left shorthands
    } else if (prop2 && positions.includes(prop2)) {
      const nameItem = getPropertyItem(nameProperty, properties);
      const imageItem = getPropertyItem(imageProperty, properties);
      const lineWidthProperty = `${prop1}-width`;
      const lineWidthItem = getPropertyItem(lineWidthProperty, properties);
      const lineStyleProperty = `${prop1}-style`;
      const lineStyleItem = getPropertyItem(lineStyleProperty, properties);
      const lineColorProperty = `${prop1}-color`;
      const lineColorItem = getPropertyItem(lineColorProperty, properties);
      const positionProperty = `${prop1}-${prop2}`;
      const positionItem = getPropertyItem(positionProperty, properties);
      positionItem.value = value;
      const propertyValue = hasVarFunc(value) ? "" : value;
      if (propertyValue === "") {
        nameItem.value = "";
        lineWidthItem.value = "";
        lineStyleItem.value = "";
        lineColorItem.value = "";
      } else if (isGlobalKeyword(propertyValue)) {
        if (nameItem.value !== propertyValue) {
          nameItem.value = "";
        }
        if (lineWidthItem.value !== propertyValue) {
          lineWidthItem.value = "";
        }
        if (lineStyleItem.value !== propertyValue) {
          lineStyleItem.value = "";
        }
        if (lineColorItem.value !== propertyValue) {
          lineColorItem.value = "";
        }
      } else {
        if (
          nameItem.value &&
          !matchesShorthandValue(property, propertyValue, nameItem.value, {
            globalObject
          })
        ) {
          nameItem.value = "";
        }
        if (lineWidthItem.value && isValidPropertyValue(lineWidthProperty, propertyValue)) {
          lineWidthItem.value = propertyValue;
        }
        if (lineStyleItem.value && isValidPropertyValue(lineStyleProperty, propertyValue)) {
          lineStyleItem.value = propertyValue;
        }
        if (lineColorItem.value && isValidPropertyValue(lineColorProperty, propertyValue)) {
          lineColorItem.value = propertyValue;
        }
      }
      for (const line of lines) {
        const longhandProperty = `${prop1}-${prop2}-${line}`;
        const longhandItem = getPropertyItem(longhandProperty, properties);
        longhandItem.value = propertyValue;
        borderItems.set(longhandProperty, longhandItem);
      }
      borderItems.set(nameProperty, nameItem);
      borderItems.set(imageProperty, imageItem);
      borderItems.set(lineWidthProperty, lineWidthItem);
      borderItems.set(lineStyleProperty, lineStyleItem);
      borderItems.set(lineColorProperty, lineColorItem);
      borderItems.set(positionProperty, positionItem);
      // border-width, border-style, border-color
    } else if (prop2 && lines.includes(prop2)) {
      const nameItem = getPropertyItem(nameProperty, properties);
      const imageItem = getPropertyItem(imageProperty, properties);
      const lineProperty = `${prop1}-${prop2}`;
      const lineItem = getPropertyItem(lineProperty, properties);
      lineItem.value = value;
      const propertyValue = hasVarFunc(value) ? "" : value;
      if (propertyValue === "") {
        nameItem.value = "";
      } else if (isGlobalKeyword(propertyValue)) {
        if (nameItem.value !== propertyValue) {
          nameItem.value = "";
        }
      }
      for (const position of positions) {
        const positionProperty = `${prop1}-${position}`;
        const positionItem = getPropertyItem(positionProperty, properties);
        const longhandProperty = `${prop1}-${position}-${prop2}`;
        const longhandItem = getPropertyItem(longhandProperty, properties);
        if (propertyValue) {
          positionItem.value = replaceShorthandValue(propertyValue, positionItem.value, {
            globalObject
          });
        } else {
          positionItem.value = "";
        }
        longhandItem.value = propertyValue;
        borderItems.set(positionProperty, positionItem);
        borderItems.set(longhandProperty, longhandItem);
      }
      borderItems.set(nameProperty, nameItem);
      borderItems.set(imageProperty, imageItem);
      borderItems.set(lineProperty, lineItem);
      // border shorthand
    } else {
      const nameItem = {
        property,
        value,
        priority: null
      };
      const imageItem = getPropertyItem(imageProperty, properties);
      const propertyValue = hasVarFunc(value) ? "" : value;
      imageItem.value = propertyValue ? "none" : "";
      for (const line of lines) {
        const lineProperty = `${prop1}-${line}`;
        const lineItem = getPropertyItem(lineProperty, properties);
        lineItem.value = propertyValue;
        borderItems.set(lineProperty, lineItem);
      }
      for (const position of positions) {
        const positionProperty = `${prop1}-${position}`;
        const positionItem = getPropertyItem(positionProperty, properties);
        positionItem.value = propertyValue;
        borderItems.set(positionProperty, positionItem);
        for (const line of lines) {
          const longhandProperty = `${positionProperty}-${line}`;
          const longhandItem = getPropertyItem(longhandProperty, properties);
          longhandItem.value = propertyValue;
          borderItems.set(longhandProperty, longhandItem);
        }
      }
      borderItems.set(property, nameItem);
      borderItems.set(imageProperty, imageItem);
    }
    // Values of border-width, border-style, border-color
  } else if (Array.isArray(value)) {
    if (!value.length || !lines.includes(prop2)) {
      return;
    }
    const nameItem = getPropertyItem(nameProperty, properties);
    const imageItem = getPropertyItem(imageProperty, properties);
    const lineProperty = `${prop1}-${prop2}`;
    const lineItem = getPropertyItem(lineProperty, properties);
    if (value.length === 1) {
      const [propertyValue] = value;
      if (nameItem.value && propertyValue) {
        nameItem.value = replaceShorthandValue(propertyValue, nameItem.value, {
          globalObject
        });
      }
    } else {
      nameItem.value = "";
    }
    lineItem.value = value.join(" ");
    const positionValues = {};
    switch (value.length) {
      case 1: {
        const [val1] = value;
        positionValues.top = val1;
        positionValues.right = val1;
        positionValues.bottom = val1;
        positionValues.left = val1;
        break;
      }
      case 2: {
        const [val1, val2] = value;
        positionValues.top = val1;
        positionValues.right = val2;
        positionValues.bottom = val1;
        positionValues.left = val2;
        break;
      }
      case 3: {
        const [val1, val2, val3] = value;
        positionValues.top = val1;
        positionValues.right = val2;
        positionValues.bottom = val3;
        positionValues.left = val2;
        break;
      }
      case 4: {
        const [val1, val2, val3, val4] = value;
        positionValues.top = val1;
        positionValues.right = val2;
        positionValues.bottom = val3;
        positionValues.left = val4;
        break;
      }
      default: {
        return;
      }
    }
    for (const position of positions) {
      const positionProperty = `${prop1}-${position}`;
      const positionItem = getPropertyItem(positionProperty, properties);
      if (positionItem.value && positionValues[position]) {
        positionItem.value = replaceShorthandValue(positionValues[position], positionItem.value, {
          globalObject
        });
      }
      const longhandProperty = `${positionProperty}-${prop2}`;
      const longhandItem = getPropertyItem(longhandProperty, properties);
      longhandItem.value = positionValues[position];
      borderItems.set(positionProperty, positionItem);
      borderItems.set(longhandProperty, longhandItem);
    }
    borderItems.set(nameProperty, nameItem);
    borderItems.set(imageProperty, imageItem);
    borderItems.set(lineProperty, lineItem);
    // Values of border, border-top, border-right, border-bottom, border-top.
  } else if (value && typeof value === "object") {
    // position shorthands
    if (prop2) {
      if (!positions.includes(prop2)) {
        return;
      }
      const nameItem = getPropertyItem(nameProperty, properties);
      const imageItem = getPropertyItem(imageProperty, properties);
      const lineWidthProperty = `${prop1}-width`;
      const lineWidthItem = getPropertyItem(lineWidthProperty, properties);
      const lineStyleProperty = `${prop1}-style`;
      const lineStyleItem = getPropertyItem(lineStyleProperty, properties);
      const lineColorProperty = `${prop1}-color`;
      const lineColorItem = getPropertyItem(lineColorProperty, properties);
      const positionProperty = `${prop1}-${prop2}`;
      const positionItem = getPropertyItem(positionProperty, properties);
      if (nameItem.value) {
        for (const lineValue of Object.values(value)) {
          if (
            !matchesShorthandValue(property, lineValue, nameItem.value, {
              globalObject
            })
          ) {
            nameItem.value = "";
            break;
          }
        }
      }
      positionItem.value = Object.values(value).join(" ");
      for (const line of lines) {
        const longhandProperty = `${prop1}-${prop2}-${line}`;
        const longhandItem = getPropertyItem(longhandProperty, properties);
        if (Object.hasOwn(value, longhandProperty)) {
          const itemValue = value[longhandProperty];
          if (line === "width") {
            if (lineWidthItem.value) {
              lineWidthItem.value = replaceLineValue(itemValue, lineWidthItem.value, prop2);
            }
          } else if (line === "style") {
            if (lineStyleItem.value) {
              lineStyleItem.value = replaceLineValue(itemValue, lineStyleItem.value, prop2);
            }
          } else if (line === "color") {
            if (lineColorItem.value) {
              lineColorItem.value = replaceLineValue(itemValue, lineColorItem.value, prop2);
            }
          }
          longhandItem.value = itemValue;
        } else {
          const itemValue = border.initialValues.get(`${prop1}-${line}`);
          if (line === "width") {
            if (lineWidthItem.value) {
              lineWidthItem.value = replaceLineValue(itemValue, lineWidthItem.value, prop2);
            }
          } else if (line === "style") {
            if (lineStyleItem.value) {
              lineStyleItem.value = replaceLineValue(itemValue, lineStyleItem.value, prop2);
            }
          } else if (line === "color") {
            if (lineColorItem.value) {
              lineColorItem.value = replaceLineValue(itemValue, lineColorItem.value, prop2);
            }
          }
          longhandItem.value = itemValue;
        }
        borderItems.set(longhandProperty, longhandItem);
      }
      borderItems.set(nameProperty, nameItem);
      borderItems.set(imageProperty, imageItem);
      borderItems.set(lineWidthProperty, lineWidthItem);
      borderItems.set(lineStyleProperty, lineStyleItem);
      borderItems.set(lineColorProperty, lineColorItem);
      borderItems.set(positionProperty, positionItem);
      // border shorthand
    } else {
      const nameItem = getPropertyItem(prop1, properties);
      const imageItem = getPropertyItem(imageProperty, properties);
      const lineWidthProperty = `${prop1}-width`;
      const lineWidthItem = getPropertyItem(lineWidthProperty, properties);
      const lineStyleProperty = `${prop1}-style`;
      const lineStyleItem = getPropertyItem(lineStyleProperty, properties);
      const lineColorProperty = `${prop1}-color`;
      const lineColorItem = getPropertyItem(lineColorProperty, properties);
      const propertyValue = Object.values(value).join(" ");
      nameItem.value = propertyValue;
      imageItem.value = propertyValue ? "none" : "";
      if (Object.hasOwn(value, lineWidthProperty)) {
        lineWidthItem.value = value[lineWidthProperty];
      } else {
        lineWidthItem.value = border.initialValues.get(lineWidthProperty);
      }
      if (Object.hasOwn(value, lineStyleProperty)) {
        lineStyleItem.value = value[lineStyleProperty];
      } else {
        lineStyleItem.value = border.initialValues.get(lineStyleProperty);
      }
      if (Object.hasOwn(value, lineColorProperty)) {
        lineColorItem.value = value[lineColorProperty];
      } else {
        lineColorItem.value = border.initialValues.get(lineColorProperty);
      }
      for (const position of positions) {
        const positionProperty = `${prop1}-${position}`;
        const positionItem = getPropertyItem(positionProperty, properties);
        positionItem.value = propertyValue;
        for (const line of lines) {
          const longhandProperty = `${positionProperty}-${line}`;
          const longhandItem = getPropertyItem(longhandProperty, properties);
          const lineProperty = `${prop1}-${line}`;
          if (Object.hasOwn(value, lineProperty)) {
            longhandItem.value = value[lineProperty];
          } else {
            longhandItem.value = border.initialValues.get(lineProperty);
          }
          borderItems.set(longhandProperty, longhandItem);
        }
        borderItems.set(positionProperty, positionItem);
      }
      borderItems.set(property, nameItem);
      borderItems.set(imageProperty, imageItem);
      borderItems.set(lineWidthProperty, lineWidthItem);
      borderItems.set(lineStyleProperty, lineStyleItem);
      borderItems.set(lineColorProperty, lineColorItem);
    }
  } else {
    return;
  }
  if (!borderItems.has(name)) {
    return;
  }
  const borderProperties = new Map([[`${name}`, borderItems.get(name)]]);
  for (const line of lines) {
    const lineProperty = `${name}-${line}`;
    const lineItem = borderItems.get(lineProperty) ??
      properties.get(lineProperty) ?? {
        property: lineProperty,
        value: "",
        priority: null
      };
    borderProperties.set(lineProperty, lineItem);
  }
  for (const position of positions) {
    const positionProperty = `${name}-${position}`;
    const positionItem = borderItems.get(positionProperty) ??
      properties.get(positionProperty) ?? {
        property: positionProperty,
        value: "",
        priority: null
      };
    borderProperties.set(positionProperty, positionItem);
    for (const line of lines) {
      const longhandProperty = `${name}-${position}-${line}`;
      const longhandItem = borderItems.get(longhandProperty) ??
        properties.get(longhandProperty) ?? {
          property: longhandProperty,
          value: "",
          priority: null
        };
      borderProperties.set(longhandProperty, longhandItem);
    }
  }
  const borderImageItem = borderItems.get(imageProperty) ?? {
    property: imageProperty,
    value: "",
    priority: null
  };
  borderProperties.set(imageProperty, borderImageItem);
  return borderProperties;
};

module.exports.normalizeBorderProperties = function (properties) {
  const { name, positions, lines } = borderElements;
  if (properties.has(name)) {
    for (const line of lines) {
      properties.delete(`${name}-${line}`);
    }
    for (const position of positions) {
      properties.delete(`${name}-${position}`);
      for (const line of lines) {
        properties.delete(`${name}-${position}-${line}`);
      }
    }
    properties.delete(`${name}-image`);
  }
  for (const line of lines) {
    const lineProperty = `${name}-${line}`;
    if (properties.has(lineProperty)) {
      const positionValues = [];
      for (const position of positions) {
        const positionProperty = `${name}-${position}`;
        if (properties.has(positionProperty)) {
          const positionItem = properties.get(positionProperty);
          positionValues.push(positionItem.value);
        }
        properties.delete(`${positionProperty}-${line}`);
      }
      if (positionValues.length === 4) {
        const lineItem = properties.get(lineProperty);
        if (positionValues.every((positionValue) => positionValue === lineItem.value)) {
          for (const position of positions) {
            properties.delete(`${name}-${position}`);
          }
        }
      }
    }
  }
  const initialValuePositionProperties = [];
  const omitPositionProperties = [];
  for (const position of positions) {
    const positionProperty = `${name}-${position}`;
    if (properties.has(positionProperty)) {
      const positionValue = properties.get(positionProperty);
      if (positionValue.value === firstInitialValue) {
        initialValuePositionProperties.push(positionProperty);
      }
      let omitPositionProperty = true;
      for (const line of lines) {
        const lineProperty = `${name}-${line}`;
        if (!properties.has(lineProperty)) {
          omitPositionProperty = false;
        }
        properties.delete(`${name}-${position}-${line}`);
      }
      if (omitPositionProperty) {
        omitPositionProperties.push(positionProperty);
      }
    } else {
      const lineValueItems = new Map();
      for (const line of lines) {
        const longhandProperty = `${name}-${position}-${line}`;
        if (properties.has(longhandProperty)) {
          const longhandItem = properties.get(longhandProperty);
          lineValueItems.set(`${name}-${line}`, longhandItem.value);
        }
      }
      if (lineValueItems.size === 3) {
        const obj = {
          [firstInitialKey]: firstInitialValue
        };
        for (const line of lines) {
          const lineProperty = `${name}-${line}`;
          const initialValue = border.initialValues.get(lineProperty);
          const lineValue = lineValueItems.get(lineProperty);
          if (lineValue !== initialValue) {
            obj[lineProperty] = lineValue;
            if (obj[firstInitialKey] && obj[firstInitialKey] === firstInitialValue) {
              delete obj[firstInitialKey];
            }
          }
          properties.delete(`${name}-${position}-${line}`);
        }
        properties.set(positionProperty, {
          property: positionProperty,
          value: Object.values(obj).join(" "),
          priority: null
        });
      }
    }
  }
  if (initialValuePositionProperties.length === 4) {
    for (const positionProperty of initialValuePositionProperties) {
      properties.delete(positionProperty);
    }
  }
  if (omitPositionProperties.length === 4) {
    for (const positionProperty of omitPositionProperties) {
      properties.delete(positionProperty);
    }
  }
  return properties;
};
