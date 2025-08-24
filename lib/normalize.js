"use strict";

const implementedProperties = require("./generated/implementedProperties");
const { hasVarFunc, isGlobalKeyword, isValidPropertyValue, splitValue } = require("./parsers");
const background = require("./properties/background");
const border = require("./properties/border");
const borderWidth = require("./properties/borderWidth");
const borderStyle = require("./properties/borderStyle");
const borderColor = require("./properties/borderColor");
const borderTop = require("./properties/borderTop");
const borderRight = require("./properties/borderRight");
const borderBottom = require("./properties/borderBottom");
const borderLeft = require("./properties/borderLeft");
const flex = require("./properties/flex");
const font = require("./properties/font");
const margin = require("./properties/margin");
const padding = require("./properties/padding");

module.exports.shorthandProperties = new Map([
  ["background", background],
  [
    "border",
    {
      definition: border.definition,
      parse: border.parse,
      shorthandFor: new Map([
        ...border.shorthandFor,
        ...border.positionShorthandFor,
        ["border-image", null]
      ])
    }
  ],
  ["border-width", borderWidth],
  ["border-style", borderStyle],
  ["border-color", borderColor],
  ["border-top", borderTop],
  ["border-right", borderRight],
  ["border-bottom", borderBottom],
  ["border-left", borderLeft],
  ["flex", flex],
  ["font", font],
  ["margin", margin],
  ["padding", padding]
]);

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
const borderFirstInitialKey = border.initialValues.keys().next().value;
const borderFirstInitialValue = border.initialValues.get(borderFirstInitialKey);

const getPropertyItem = (property, properties) => {
  const propertyItem = properties.get(property) ?? {
    property,
    value: "",
    priority: ""
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
        [borderFirstInitialKey]: borderFirstInitialValue
      };
  const keys = border.shorthandFor.keys();
  for (const key of keys) {
    const initialValue = border.initialValues.get(key);
    let parsedValue = initialValue;
    if (Object.hasOwn(valueObj, key)) {
      parsedValue = valueObj[key];
    }
    if (parsedValue === initialValue) {
      if (key === borderFirstInitialKey) {
        if (!Object.hasOwn(shorthandObj, key)) {
          shorthandObj[key] = parsedValue;
        }
      } else {
        delete shorthandObj[key];
      }
    } else {
      shorthandObj[key] = parsedValue;
      if (
        shorthandObj[borderFirstInitialKey] &&
        shorthandObj[borderFirstInitialKey] === borderFirstInitialValue
      ) {
        delete shorthandObj[borderFirstInitialKey];
      }
    }
  }
  return Object.values(shorthandObj).join(" ");
};

module.exports.getPositionValue = function getPositionValue(positionValues, position) {
  switch (positionValues.length) {
    case 1: {
      const [val1] = positionValues;
      return val1;
    }
    case 2: {
      const [val1, val2] = positionValues;
      switch (position) {
        case "top": {
          return val1;
        }
        case "right": {
          return val2;
        }
        case "bottom": {
          return val1;
        }
        case "left": {
          return val2;
        }
        default: {
          if (val1 === val2) {
            return val1;
          }
          return `${val1} ${val2}`;
        }
      }
    }
    case 3: {
      const [val1, val2, val3] = positionValues;
      switch (position) {
        case "top": {
          return val1;
        }
        case "right": {
          return val2;
        }
        case "bottom": {
          return val3;
        }
        case "left": {
          return val2;
        }
        default: {
          if (val1 === val3) {
            if (val1 === val2) {
              return val1;
            }
            return `${val1} ${val2}`;
          }
          return `${val1} ${val2} ${val3}`;
        }
      }
    }
    case 4: {
      const [val1, val2, val3, val4] = positionValues;
      switch (position) {
        case "top": {
          return val1;
        }
        case "right": {
          return val2;
        }
        case "bottom": {
          return val3;
        }
        case "left": {
          return val4;
        }
        default: {
          if (val2 === val4) {
            if (val1 === val3) {
              if (val1 === val2) {
                return val1;
              }
              return `${val1} ${val2}`;
            }
            return `${val1} ${val2} ${val3}`;
          }
          return `${val1} ${val2} ${val3} ${val4}`;
        }
      }
    }
    default:
  }
};

module.exports.replacePositionValue = function replacePositionValue(
  value,
  positionValues,
  position
) {
  switch (positionValues.length) {
    case 1: {
      const [val1] = positionValues;
      if (val1 === value) {
        return positionValues.join(" ");
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
      const [val1, val2] = positionValues;
      if (val1 === val2) {
        return module.exports.replacePositionValue(value, [val1], position);
      }
      switch (position) {
        case "top": {
          if (val1 === value) {
            return positionValues.join(" ");
          }
          return [value, val2, val1].join(" ");
        }
        case "right": {
          if (val2 === value) {
            return positionValues.join(" ");
          }
          return [val1, value, val1, val2].join(" ");
        }
        case "bottom": {
          if (val1 === value) {
            return positionValues.join(" ");
          }
          return [val1, val2, value].join(" ");
        }
        case "left": {
          if (val2 === value) {
            return positionValues.join(" ");
          }
          return [val1, val2, val1, value].join(" ");
        }
        default:
      }
      break;
    }
    case 3: {
      const [val1, val2, val3] = positionValues;
      if (val1 === val3) {
        return module.exports.replacePositionValue(value, [val1, val2], position);
      }
      switch (position) {
        case "top": {
          if (val1 === value) {
            return positionValues.join(" ");
          } else if (val3 === value) {
            return [value, val2].join(" ");
          }
          return [value, val2, val3].join(" ");
        }
        case "right": {
          if (val2 === value) {
            return positionValues.join(" ");
          }
          return [val1, value, val3, val2].join(" ");
        }
        case "bottom": {
          if (val3 === value) {
            return positionValues.join(" ");
          } else if (val1 === value) {
            return [val1, val2].join(" ");
          }
          return [val1, val2, value].join(" ");
        }
        case "left": {
          if (val2 === value) {
            return positionValues.join(" ");
          }
          return [val1, val2, val3, value].join(" ");
        }
        default:
      }
      break;
    }
    case 4: {
      const [val1, val2, val3, val4] = positionValues;
      if (val2 === val4) {
        return module.exports.replacePositionValue(value, [val1, val2, val3], position);
      }
      switch (position) {
        case "top": {
          if (val1 === value) {
            return positionValues.join(" ");
          }
          return [value, val2, val3, val4].join(" ");
        }
        case "right": {
          if (val2 === value) {
            return positionValues.join(" ");
          } else if (val4 === value) {
            return [val1, value, val3].join(" ");
          }
          return [val1, value, val3, val4].join(" ");
        }
        case "bottom": {
          if (val3 === value) {
            return positionValues.join(" ");
          }
          return [val1, val2, value, val4].join(" ");
        }
        case "left": {
          if (val4 === value) {
            return positionValues.join(" ");
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
          lineItem.value = module.exports.replacePositionValue(
            propertyValue,
            splitValue(lineItem.value),
            prop2
          );
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
      const nameItem = getPropertyItem(nameProperty, properties);
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
        for (const positionValue of Object.values(value)) {
          if (
            !matchesShorthandValue(property, positionValue, nameItem.value, {
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
              lineWidthItem.value = module.exports.replacePositionValue(
                itemValue,
                splitValue(lineWidthItem.value),
                prop2
              );
            }
          } else if (line === "style") {
            if (lineStyleItem.value) {
              lineStyleItem.value = module.exports.replacePositionValue(
                itemValue,
                splitValue(lineStyleItem.value),
                prop2
              );
            }
          } else if (line === "color") {
            if (lineColorItem.value) {
              lineColorItem.value = module.exports.replacePositionValue(
                itemValue,
                splitValue(lineColorItem.value),
                prop2
              );
            }
          }
          longhandItem.value = itemValue;
        } else {
          const itemValue = border.initialValues.get(`${prop1}-${line}`);
          if (line === "width") {
            if (lineWidthItem.value) {
              lineWidthItem.value = module.exports.replacePositionValue(
                itemValue,
                splitValue(lineWidthItem.value),
                prop2
              );
            }
          } else if (line === "style") {
            if (lineStyleItem.value) {
              lineStyleItem.value = module.exports.replacePositionValue(
                itemValue,
                splitValue(lineStyleItem.value),
                prop2
              );
            }
          } else if (line === "color") {
            if (lineColorItem.value) {
              lineColorItem.value = module.exports.replacePositionValue(
                itemValue,
                splitValue(lineColorItem.value),
                prop2
              );
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
        priority: ""
      };
    borderProperties.set(lineProperty, lineItem);
  }
  for (const position of positions) {
    const positionProperty = `${name}-${position}`;
    const positionItem = borderItems.get(positionProperty) ??
      properties.get(positionProperty) ?? {
        property: positionProperty,
        value: "",
        priority: ""
      };
    borderProperties.set(positionProperty, positionItem);
    for (const line of lines) {
      const longhandProperty = `${name}-${position}-${line}`;
      const longhandItem = borderItems.get(longhandProperty) ??
        properties.get(longhandProperty) ?? {
          property: longhandProperty,
          value: "",
          priority: ""
        };
      borderProperties.set(longhandProperty, longhandItem);
    }
  }
  const borderImageItem = borderItems.get(imageProperty) ?? {
    property: imageProperty,
    value: "",
    priority: ""
  };
  borderProperties.set(imageProperty, borderImageItem);
  return borderProperties;
};

module.exports.prepareProperties = function (properties) {
  const parsedProperties = new Map();
  const createShorthands = new Map();
  for (const [property, item] of properties) {
    const { value, priority } = item;
    const { logicalPropertyGroup: shorthandProperty } = implementedProperties.get(property) ?? {};
    if (module.exports.shorthandProperties.has(shorthandProperty)) {
      if (!createShorthands.has(shorthandProperty)) {
        createShorthands.set(shorthandProperty, new Map());
      }
      const longhandItems = createShorthands.get(shorthandProperty);
      if (longhandItems.size) {
        const firstPropertyKey = longhandItems.keys().next().value;
        const { priority: firstPropertyPriority } = longhandItems.get(firstPropertyKey);
        if (priority === firstPropertyPriority) {
          longhandItems.set(property, { property, value, priority });
          createShorthands.set(shorthandProperty, longhandItems);
        } else {
          parsedProperties.delete(shorthandProperty);
        }
      } else {
        longhandItems.set(property, { property, value, priority });
        createShorthands.set(shorthandProperty, longhandItems);
      }
      parsedProperties.set(property, item);
    } else if (module.exports.shorthandProperties.has(property)) {
      const shorthandItem = module.exports.shorthandProperties.get(property);
      const parsedValue = shorthandItem.parse(value);
      let omitShorthandProperty = false;
      if (Array.isArray(parsedValue)) {
        for (const [longhandProperty, longhandItem] of shorthandItem.shorthandFor) {
          if (!priority && properties.has(longhandProperty)) {
            const { priority: longhandPriority } = properties.get(longhandProperty);
            if (longhandPriority) {
              omitShorthandProperty = true;
              continue;
            }
          }
          const { position } = longhandItem;
          const longhandValue = module.exports.getPositionValue(parsedValue, position);
          parsedProperties.set(longhandProperty, {
            property: longhandProperty,
            value: longhandValue,
            priority
          });
        }
      }
      if (!omitShorthandProperty) {
        parsedProperties.set(property, item);
      }
    } else {
      parsedProperties.set(property, item);
    }
  }
  if (createShorthands.size) {
    for (const [property, item] of createShorthands) {
      const shorthandItem = module.exports.shorthandProperties.get(property);
      if (item.size === shorthandItem.shorthandFor.size) {
        if (shorthandItem.position) {
          const positionValues = [];
          let priority = "";
          for (const { value: longhandValue, priority: longhandPriority } of item.values()) {
            positionValues.push(longhandValue);
            if (longhandPriority) {
              priority = longhandPriority;
            }
          }
          const value = module.exports.getPositionValue(positionValues, shorthandItem.position);
          parsedProperties.set(property, {
            property,
            value,
            priority
          });
        }
      }
    }
  }
  return parsedProperties;
};

const normalizeBorderProperties = (properties) => {
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
      for (const position of positions) {
        const positionProperty = `${name}-${position}`;
        const longhandProperty = `${name}-${position}-${line}`;
        properties.delete(positionProperty);
        properties.delete(longhandProperty);
      }
    }
  }
  for (const position of positions) {
    const positionProperty = `${name}-${position}`;
    if (properties.has(positionProperty)) {
      const longhandProperties = [];
      for (const line of lines) {
        const longhandProperty = `${name}-${position}-${line}`;
        longhandProperties.push(longhandProperty);
      }
      if (longhandProperties.length === 3) {
        for (const longhandProperty of longhandProperties) {
          properties.delete(longhandProperty);
        }
      } else {
        properties.delete(positionProperty);
      }
    }
  }
  return properties;
};

module.exports.normalizeProperties = function (properties) {
  normalizeBorderProperties(properties);
  return properties;
};
