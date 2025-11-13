"use strict";

const propertyDefinitions = require("./generated/propertyDefinitions");
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

const BACKGROUND = "background";
const BACKGROUND_COLOR = "background-color";
const BACKGROUND_SIZE = "background-size";
const BORDER = "border";
const BORDER_BOTTOM = "border-bottom";
const BORDER_COLOR = "border-color";
const BORDER_IMAGE = "border-image";
const BORDER_LEFT = "border-left";
const BORDER_RIGHT = "border-right";
const BORDER_STYLE = "border-style";
const BORDER_TOP = "border-top";
const BORDER_WIDTH = "border-width";
const TOP = "top";
const RIGHT = "right";
const BOTTOM = "bottom";
const LEFT = "left";
const WIDTH = "width";
const STYLE = "style";
const COLOR = "color";
const NONE = "none";

const shorthandProperties = new Map([
  [BACKGROUND, background],
  [
    BORDER,
    {
      definition: border.definition,
      parse: border.parse,
      shorthandFor: new Map([
        ...border.shorthandFor,
        ...border.positionShorthandFor,
        [BORDER_IMAGE, null]
      ])
    }
  ],
  [BORDER_WIDTH, borderWidth],
  [BORDER_STYLE, borderStyle],
  [BORDER_COLOR, borderColor],
  [BORDER_TOP, borderTop],
  [BORDER_RIGHT, borderRight],
  [BORDER_BOTTOM, borderBottom],
  [BORDER_LEFT, borderLeft],
  ["flex", flex],
  ["font", font],
  ["margin", margin],
  ["padding", padding]
]);

const borderProperties = new Set([
  BORDER,
  BORDER_IMAGE,
  ...border.shorthandFor.keys(),
  ...border.positionShorthandFor.keys(),
  ...borderTop.shorthandFor.keys(),
  ...borderRight.shorthandFor.keys(),
  ...borderBottom.shorthandFor.keys(),
  ...borderLeft.shorthandFor.keys()
]);

const getPositionValue = (positionValues, position) => {
  switch (positionValues.length) {
    case 1: {
      const [val1] = positionValues;
      return val1;
    }
    case 2: {
      const [val1, val2] = positionValues;
      switch (position) {
        case TOP: {
          return val1;
        }
        case RIGHT: {
          return val2;
        }
        case BOTTOM: {
          return val1;
        }
        case LEFT: {
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
        case TOP: {
          return val1;
        }
        case RIGHT: {
          return val2;
        }
        case BOTTOM: {
          return val3;
        }
        case LEFT: {
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
        case TOP: {
          return val1;
        }
        case RIGHT: {
          return val2;
        }
        case BOTTOM: {
          return val3;
        }
        case LEFT: {
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

const getPropertyItem = (property, properties) => {
  const propertyItem = properties.get(property) ?? {
    property,
    value: "",
    priority: ""
  };
  return propertyItem;
};

const replaceBackgroundShorthand = (property, properties, opt) => {
  const { value: propertyValue } = properties.get(property);
  const parsedValue = background.shorthandFor.get(property).parse(propertyValue, opt);
  const values = splitValue(parsedValue, {
    delimiter: ","
  });
  const { value: shorthandValue } = properties.get(BACKGROUND);
  const bgValues = background.parse(shorthandValue, opt);
  const bgLength = bgValues.length;
  if (property === BACKGROUND_COLOR) {
    bgValues[bgLength - 1][property] = parsedValue[0];
  } else {
    for (let i = 0; i < bgLength; i++) {
      bgValues[i][property] = values[i];
    }
  }
  const backgrounds = [];
  for (const bgValue of bgValues) {
    const bg = [];
    for (const [longhand, value] of Object.entries(bgValue)) {
      if (value) {
        if (value !== background.initialValues.get(longhand)) {
          if (longhand === BACKGROUND_SIZE) {
            bg.push(`/ ${value}`);
          } else {
            bg.push(value);
          }
        }
      }
    }
    backgrounds.push(bg.join(" "));
  }
  return backgrounds.join(", ");
};

const borderElements = {
  name: BORDER,
  positions: [TOP, RIGHT, BOTTOM, LEFT],
  lines: [WIDTH, STYLE, COLOR]
};

const matchesBorderShorthandValue = (property, value, shorthandValue, opt = {}) => {
  const { globalObject, options } = opt;
  const obj = border.parse(shorthandValue, {
    globalObject,
    options
  });
  if (Object.hasOwn(obj, property)) {
    return value === obj[property];
  }
  return value === border.initialValues.get(property);
};

const replaceBorderShorthandValue = (value, shorthandValue, opt = {}) => {
  const { globalObject, options } = opt;
  const borderFirstInitialKey = border.initialValues.keys().next().value;
  const borderFirstInitialValue = border.initialValues.get(borderFirstInitialKey);
  const parseOpt = {
    globalObject,
    options
  };
  const valueObj = border.parse(value, parseOpt);
  const shorthandObj = shorthandValue
    ? border.parse(shorthandValue, parseOpt)
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

const replacePositionValue = (value, positionValues, position) => {
  switch (positionValues.length) {
    case 1: {
      const [val1] = positionValues;
      if (val1 === value) {
        return positionValues.join(" ");
      }
      switch (position) {
        case TOP: {
          return [value, val1, val1].join(" ");
        }
        case RIGHT: {
          return [val1, value, val1, val1].join(" ");
        }
        case BOTTOM: {
          return [val1, val1, value].join(" ");
        }
        case LEFT: {
          return [val1, val1, val1, value].join(" ");
        }
        default:
      }
      break;
    }
    case 2: {
      const [val1, val2] = positionValues;
      if (val1 === val2) {
        return replacePositionValue(value, [val1], position);
      }
      switch (position) {
        case TOP: {
          if (val1 === value) {
            return positionValues.join(" ");
          }
          return [value, val2, val1].join(" ");
        }
        case RIGHT: {
          if (val2 === value) {
            return positionValues.join(" ");
          }
          return [val1, value, val1, val2].join(" ");
        }
        case BOTTOM: {
          if (val1 === value) {
            return positionValues.join(" ");
          }
          return [val1, val2, value].join(" ");
        }
        case LEFT: {
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
        return replacePositionValue(value, [val1, val2], position);
      }
      switch (position) {
        case TOP: {
          if (val1 === value) {
            return positionValues.join(" ");
          } else if (val3 === value) {
            return [value, val2].join(" ");
          }
          return [value, val2, val3].join(" ");
        }
        case RIGHT: {
          if (val2 === value) {
            return positionValues.join(" ");
          }
          return [val1, value, val3, val2].join(" ");
        }
        case BOTTOM: {
          if (val3 === value) {
            return positionValues.join(" ");
          } else if (val1 === value) {
            return [val1, val2].join(" ");
          }
          return [val1, val2, value].join(" ");
        }
        case LEFT: {
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
        return replacePositionValue(value, [val1, val2, val3], position);
      }
      switch (position) {
        case TOP: {
          if (val1 === value) {
            return positionValues.join(" ");
          }
          return [value, val2, val3, val4].join(" ");
        }
        case RIGHT: {
          if (val2 === value) {
            return positionValues.join(" ");
          } else if (val4 === value) {
            return [val1, value, val3].join(" ");
          }
          return [val1, value, val3, val4].join(" ");
        }
        case BOTTOM: {
          if (val3 === value) {
            return positionValues.join(" ");
          }
          return [val1, val2, value, val4].join(" ");
        }
        case LEFT: {
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

const prepareBorderProperties = (property, value, priority, properties, opt = {}) => {
  if (typeof property !== "string" || value === null) {
    return;
  }
  const { globalObject, options } = opt;
  const parseOpt = {
    globalObject,
    options
  };
  const { lines, name, positions } = borderElements;
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
  // Empty string, global keywords, var(), value of longhands.
  if (typeof value === "string") {
    // Handle longhand properties
    if (prop3) {
      const nameItem = getPropertyItem(nameProperty, properties);
      const imageItem = getPropertyItem(BORDER_IMAGE, properties);
      const lineProperty = `${prop1}-${prop3}`;
      const lineItem = getPropertyItem(lineProperty, properties);
      const positionProperty = `${prop1}-${prop2}`;
      const positionItem = getPropertyItem(positionProperty, properties);
      const longhandProperty = `${prop1}-${prop2}-${prop3}`;
      const longhandItem = getPropertyItem(longhandProperty, properties);
      longhandItem.value = value;
      longhandItem.priority = priority;
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
          !matchesBorderShorthandValue(lineProperty, propertyValue, nameItem.value, parseOpt)
        ) {
          nameItem.value = "";
        }
        if (lineItem.value) {
          lineItem.value = replacePositionValue(propertyValue, splitValue(lineItem.value), prop2);
        }
        if (
          positionItem.value &&
          !matchesBorderShorthandValue(lineProperty, propertyValue, positionItem.value, parseOpt)
        ) {
          positionItem.value = "";
        }
      }
      borderItems.set(nameProperty, nameItem);
      borderItems.set(BORDER_IMAGE, imageItem);
      borderItems.set(lineProperty, lineItem);
      borderItems.set(positionProperty, positionItem);
      borderItems.set(longhandProperty, longhandItem);
      // Handle border-top, border-right, border-bottom, border-left shorthands
    } else if (prop2 && positions.includes(prop2)) {
      const nameItem = getPropertyItem(nameProperty, properties);
      const imageItem = getPropertyItem(BORDER_IMAGE, properties);
      const lineWidthProperty = `${prop1}-width`;
      const lineWidthItem = getPropertyItem(lineWidthProperty, properties);
      const lineStyleProperty = `${prop1}-style`;
      const lineStyleItem = getPropertyItem(lineStyleProperty, properties);
      const lineColorProperty = `${prop1}-color`;
      const lineColorItem = getPropertyItem(lineColorProperty, properties);
      const positionProperty = `${prop1}-${prop2}`;
      const positionItem = getPropertyItem(positionProperty, properties);
      positionItem.value = value;
      positionItem.priority = priority;
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
          !matchesBorderShorthandValue(property, propertyValue, nameItem.value, parseOpt)
        ) {
          nameItem.value = "";
        }
        if (
          lineWidthItem.value &&
          isValidPropertyValue(lineWidthProperty, propertyValue, globalObject)
        ) {
          lineWidthItem.value = propertyValue;
        }
        if (
          lineStyleItem.value &&
          isValidPropertyValue(lineStyleProperty, propertyValue, globalObject)
        ) {
          lineStyleItem.value = propertyValue;
        }
        if (
          lineColorItem.value &&
          isValidPropertyValue(lineColorProperty, propertyValue, globalObject)
        ) {
          lineColorItem.value = propertyValue;
        }
      }
      for (const line of lines) {
        const longhandProperty = `${prop1}-${prop2}-${line}`;
        const longhandItem = getPropertyItem(longhandProperty, properties);
        longhandItem.value = propertyValue;
        longhandItem.priority = priority;
        borderItems.set(longhandProperty, longhandItem);
      }
      borderItems.set(nameProperty, nameItem);
      borderItems.set(BORDER_IMAGE, imageItem);
      borderItems.set(lineWidthProperty, lineWidthItem);
      borderItems.set(lineStyleProperty, lineStyleItem);
      borderItems.set(lineColorProperty, lineColorItem);
      borderItems.set(positionProperty, positionItem);
      // Handle border-width, border-style, border-color shorthands
    } else if (prop2 && lines.includes(prop2)) {
      const nameItem = getPropertyItem(nameProperty, properties);
      const imageItem = getPropertyItem(BORDER_IMAGE, properties);
      const lineProperty = `${prop1}-${prop2}`;
      const lineItem = getPropertyItem(lineProperty, properties);
      lineItem.value = value;
      lineItem.priority = priority;
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
          positionItem.value = replaceBorderShorthandValue(
            propertyValue,
            positionItem.value,
            parseOpt
          );
        } else {
          positionItem.value = "";
        }
        longhandItem.value = propertyValue;
        longhandItem.priority = priority;
        borderItems.set(positionProperty, positionItem);
        borderItems.set(longhandProperty, longhandItem);
      }
      borderItems.set(nameProperty, nameItem);
      borderItems.set(BORDER_IMAGE, imageItem);
      borderItems.set(lineProperty, lineItem);
      // Handle border shorthand
    } else {
      const nameItem = getPropertyItem(nameProperty, properties);
      const imageItem = getPropertyItem(BORDER_IMAGE, properties);
      const propertyValue = hasVarFunc(value) ? "" : value;
      imageItem.value = propertyValue ? NONE : "";
      for (const line of lines) {
        const lineProperty = `${prop1}-${line}`;
        const lineItem = getPropertyItem(lineProperty, properties);
        lineItem.value = propertyValue;
        lineItem.priority = priority;
        borderItems.set(lineProperty, lineItem);
      }
      for (const position of positions) {
        const positionProperty = `${prop1}-${position}`;
        const positionItem = getPropertyItem(positionProperty, properties);
        positionItem.value = propertyValue;
        positionItem.priority = priority;
        borderItems.set(positionProperty, positionItem);
        for (const line of lines) {
          const longhandProperty = `${positionProperty}-${line}`;
          const longhandItem = getPropertyItem(longhandProperty, properties);
          longhandItem.value = propertyValue;
          longhandItem.priority = priority;
          borderItems.set(longhandProperty, longhandItem);
        }
      }
      borderItems.set(property, nameItem);
      borderItems.set(BORDER_IMAGE, imageItem);
    }
    // Values of border-width, border-style, border-color
  } else if (Array.isArray(value)) {
    if (!value.length || !lines.includes(prop2)) {
      return;
    }
    const nameItem = getPropertyItem(nameProperty, properties);
    const imageItem = getPropertyItem(BORDER_IMAGE, properties);
    const lineProperty = `${prop1}-${prop2}`;
    const lineItem = getPropertyItem(lineProperty, properties);
    if (value.length === 1) {
      const [propertyValue] = value;
      if (nameItem.value) {
        if (hasVarFunc(nameItem.value)) {
          nameItem.value = "";
        } else if (propertyValue) {
          nameItem.value = replaceBorderShorthandValue(propertyValue, nameItem.value, parseOpt);
        }
      }
    } else {
      nameItem.value = "";
    }
    lineItem.value = value.join(" ");
    lineItem.priority = priority;
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
        positionItem.value = replaceBorderShorthandValue(
          positionValues[position],
          positionItem.value,
          parseOpt
        );
      }
      const longhandProperty = `${positionProperty}-${prop2}`;
      const longhandItem = getPropertyItem(longhandProperty, properties);
      longhandItem.value = positionValues[position];
      longhandItem.priority = priority;
      borderItems.set(positionProperty, positionItem);
      borderItems.set(longhandProperty, longhandItem);
    }
    borderItems.set(nameProperty, nameItem);
    borderItems.set(BORDER_IMAGE, imageItem);
    borderItems.set(lineProperty, lineItem);
    // Values of border, border-top, border-right, border-bottom, border-top.
  } else if (value && typeof value === "object") {
    // Handle position shorthands
    if (prop2) {
      if (!positions.includes(prop2)) {
        return;
      }
      const nameItem = getPropertyItem(nameProperty, properties);
      const imageItem = getPropertyItem(BORDER_IMAGE, properties);
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
          if (!matchesBorderShorthandValue(property, positionValue, nameItem.value, parseOpt)) {
            nameItem.value = "";
            break;
          }
        }
      }
      positionItem.value = Object.values(value).join(" ");
      positionItem.priority = priority;
      for (const line of lines) {
        const longhandProperty = `${prop1}-${prop2}-${line}`;
        const longhandItem = getPropertyItem(longhandProperty, properties);
        if (Object.hasOwn(value, longhandProperty)) {
          const itemValue = value[longhandProperty];
          if (line === WIDTH) {
            if (lineWidthItem.value) {
              lineWidthItem.value = replacePositionValue(
                itemValue,
                splitValue(lineWidthItem.value),
                prop2
              );
            }
          } else if (line === STYLE) {
            if (lineStyleItem.value) {
              lineStyleItem.value = replacePositionValue(
                itemValue,
                splitValue(lineStyleItem.value),
                prop2
              );
            }
          } else if (line === COLOR) {
            if (lineColorItem.value) {
              lineColorItem.value = replacePositionValue(
                itemValue,
                splitValue(lineColorItem.value),
                prop2
              );
            }
          }
          longhandItem.value = itemValue;
          longhandItem.priority = priority;
        } else {
          const itemValue = border.initialValues.get(`${prop1}-${line}`);
          if (line === WIDTH) {
            if (lineWidthItem.value) {
              lineWidthItem.value = replacePositionValue(
                itemValue,
                splitValue(lineWidthItem.value),
                prop2
              );
            }
          } else if (line === STYLE) {
            if (lineStyleItem.value) {
              lineStyleItem.value = replacePositionValue(
                itemValue,
                splitValue(lineStyleItem.value),
                prop2
              );
            }
          } else if (line === COLOR) {
            if (lineColorItem.value) {
              lineColorItem.value = replacePositionValue(
                itemValue,
                splitValue(lineColorItem.value),
                prop2
              );
            }
          }
          longhandItem.value = itemValue;
          longhandItem.priority = priority;
        }
        borderItems.set(longhandProperty, longhandItem);
      }
      borderItems.set(nameProperty, nameItem);
      borderItems.set(BORDER_IMAGE, imageItem);
      borderItems.set(lineWidthProperty, lineWidthItem);
      borderItems.set(lineStyleProperty, lineStyleItem);
      borderItems.set(lineColorProperty, lineColorItem);
      borderItems.set(positionProperty, positionItem);
      // Handle border shorthand
    } else {
      const nameItem = getPropertyItem(prop1, properties);
      const imageItem = getPropertyItem(BORDER_IMAGE, properties);
      const lineWidthProperty = `${prop1}-width`;
      const lineWidthItem = getPropertyItem(lineWidthProperty, properties);
      const lineStyleProperty = `${prop1}-style`;
      const lineStyleItem = getPropertyItem(lineStyleProperty, properties);
      const lineColorProperty = `${prop1}-color`;
      const lineColorItem = getPropertyItem(lineColorProperty, properties);
      const propertyValue = Object.values(value).join(" ");
      nameItem.value = propertyValue;
      nameItem.priority = priority;
      imageItem.value = propertyValue ? NONE : "";
      if (Object.hasOwn(value, lineWidthProperty)) {
        lineWidthItem.value = value[lineWidthProperty];
      } else {
        lineWidthItem.value = border.initialValues.get(lineWidthProperty);
      }
      lineWidthItem.priority = priority;
      if (Object.hasOwn(value, lineStyleProperty)) {
        lineStyleItem.value = value[lineStyleProperty];
      } else {
        lineStyleItem.value = border.initialValues.get(lineStyleProperty);
      }
      lineStyleItem.priority = priority;
      if (Object.hasOwn(value, lineColorProperty)) {
        lineColorItem.value = value[lineColorProperty];
      } else {
        lineColorItem.value = border.initialValues.get(lineColorProperty);
      }
      lineColorItem.priority = priority;
      for (const position of positions) {
        const positionProperty = `${prop1}-${position}`;
        const positionItem = getPropertyItem(positionProperty, properties);
        positionItem.value = propertyValue;
        positionItem.priority = priority;
        for (const line of lines) {
          const longhandProperty = `${positionProperty}-${line}`;
          const longhandItem = getPropertyItem(longhandProperty, properties);
          const lineProperty = `${prop1}-${line}`;
          if (Object.hasOwn(value, lineProperty)) {
            longhandItem.value = value[lineProperty];
          } else {
            longhandItem.value = border.initialValues.get(lineProperty);
          }
          longhandItem.priority = priority;
          borderItems.set(longhandProperty, longhandItem);
        }
        borderItems.set(positionProperty, positionItem);
      }
      borderItems.set(property, nameItem);
      borderItems.set(BORDER_IMAGE, imageItem);
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
  const borderProps = new Map([[name, borderItems.get(name)]]);
  for (const line of lines) {
    const lineProperty = `${name}-${line}`;
    const lineItem = borderItems.get(lineProperty) ??
      properties.get(lineProperty) ?? {
        property: lineProperty,
        value: "",
        priority: ""
      };
    borderProps.set(lineProperty, lineItem);
  }
  for (const position of positions) {
    const positionProperty = `${name}-${position}`;
    const positionItem = borderItems.get(positionProperty) ??
      properties.get(positionProperty) ?? {
        property: positionProperty,
        value: "",
        priority: ""
      };
    borderProps.set(positionProperty, positionItem);
    for (const line of lines) {
      const longhandProperty = `${name}-${position}-${line}`;
      const longhandItem = borderItems.get(longhandProperty) ??
        properties.get(longhandProperty) ?? {
          property: longhandProperty,
          value: "",
          priority: ""
        };
      borderProps.set(longhandProperty, longhandItem);
    }
  }
  const borderImageItem = borderItems.get(BORDER_IMAGE) ?? {
    property: BORDER_IMAGE,
    value: "",
    priority: ""
  };
  borderProps.set(BORDER_IMAGE, borderImageItem);
  return borderProps;
};

const generateBorderLineShorthand = (items, property, prior) => {
  const values = [];
  for (const [, item] of items) {
    const { value: itemValue } = item;
    values.push(itemValue);
  }
  const value = getPositionValue(values);
  const priority = prior ? prior : "";
  return [property, { property, value, priority }];
};

const generateBorderPositionShorthand = (items, property, prior) => {
  const values = [];
  for (const [, item] of items) {
    const { value: itemValue } = item;
    values.push(itemValue);
  }
  const value = values.join(" ");
  const priority = prior ? prior : "";
  return [property, { property, value, priority }];
};

const generateBorderNameShorthand = (items, property, prior) => {
  const values = new Set(items);
  if (values.size === 1) {
    const value = values.keys().next().value;
    const priority = prior ? prior : "";
    return [property, { property, value, priority }];
  }
};

const prepareBorderShorthands = (properties) => {
  const lineWidthItems = new Map();
  const lineWidthPriorItems = new Map();
  const lineStyleItems = new Map();
  const lineStylePriorItems = new Map();
  const lineColorItems = new Map();
  const lineColorPriorItems = new Map();
  const positionTopItems = new Map();
  const positionTopPriorItems = new Map();
  const positionRightItems = new Map();
  const positionRightPriorItems = new Map();
  const positionBottomItems = new Map();
  const positionBottomPriorItems = new Map();
  const positionLeftItems = new Map();
  const positionLeftPriorItems = new Map();
  for (const [property, { priority, value }] of properties) {
    const [, positionPart, linePart] = property.split("-");
    switch (linePart) {
      case WIDTH: {
        if (priority) {
          lineWidthPriorItems.set(property, { property, value, priority });
        } else {
          lineWidthItems.set(property, { property, value, priority });
        }
        break;
      }
      case STYLE: {
        if (priority) {
          lineStylePriorItems.set(property, { property, value, priority });
        } else {
          lineStyleItems.set(property, { property, value, priority });
        }
        break;
      }
      case COLOR: {
        if (priority) {
          lineColorPriorItems.set(property, { property, value, priority });
        } else {
          lineColorItems.set(property, { property, value, priority });
        }
        break;
      }
      default:
    }
    switch (positionPart) {
      case TOP: {
        if (priority) {
          positionTopPriorItems.set(property, { property, value, priority });
        } else {
          positionTopItems.set(property, { property, value, priority });
        }
        break;
      }
      case RIGHT: {
        if (priority) {
          positionRightPriorItems.set(property, { property, value, priority });
        } else {
          positionRightItems.set(property, { property, value, priority });
        }
        break;
      }
      case BOTTOM: {
        if (priority) {
          positionBottomPriorItems.set(property, { property, value, priority });
        } else {
          positionBottomItems.set(property, { property, value, priority });
        }
        break;
      }
      case LEFT: {
        if (priority) {
          positionLeftPriorItems.set(property, { property, value, priority });
        } else {
          positionLeftItems.set(property, { property, value, priority });
        }
        break;
      }
      default:
    }
  }
  if (lineWidthItems.size === 4) {
    const [property, item] = generateBorderLineShorthand(lineWidthItems, BORDER_WIDTH) ?? [];
    if (property && item) {
      properties.set(property, item);
    }
  } else if (lineWidthPriorItems.size === 4) {
    const [property, item] =
      generateBorderLineShorthand(lineWidthPriorItems, BORDER_WIDTH, "important") ?? [];
    if (property && item) {
      properties.set(property, item);
    }
  }
  if (lineStyleItems.size === 4) {
    const [property, item] = generateBorderLineShorthand(lineStyleItems, BORDER_STYLE) ?? [];
    if (property && item) {
      properties.set(property, item);
    }
  } else if (lineStylePriorItems.size === 4) {
    const [property, item] =
      generateBorderLineShorthand(lineStylePriorItems, BORDER_STYLE, "important") ?? [];
    if (property && item) {
      properties.set(property, item);
    }
  }
  if (lineColorItems.size === 4) {
    const [property, item] = generateBorderLineShorthand(lineColorItems, BORDER_COLOR) ?? [];
    if (property && item) {
      properties.set(property, item);
    }
  } else if (lineColorPriorItems.size === 4) {
    const [property, item] =
      generateBorderLineShorthand(lineColorPriorItems, BORDER_COLOR, "important") ?? [];
    if (property && item) {
      properties.set(property, item);
    }
  }
  const nameItems = [];
  const namePriorItems = [];
  if (positionTopItems.size === 3) {
    const [property, item] = generateBorderPositionShorthand(positionTopItems, BORDER_TOP) ?? [];
    if (property && item) {
      properties.set(property, item);
      if (properties.has(BORDER_IMAGE)) {
        const { value: imageValue } = properties.get(BORDER_IMAGE);
        if (imageValue === NONE) {
          const { value: itemValue } = item;
          nameItems.push(itemValue);
        }
      }
    }
  } else if (positionTopPriorItems.size === 3) {
    const [property, item] =
      generateBorderPositionShorthand(positionTopPriorItems, BORDER_TOP, "important") ?? [];
    if (property && item) {
      properties.set(property, item);
      if (properties.has(BORDER_IMAGE)) {
        const { value: imageValue } = properties.get(BORDER_IMAGE);
        if (imageValue === NONE) {
          const { value: itemValue } = item;
          namePriorItems.push(itemValue);
        }
      }
    }
  }
  if (positionRightItems.size === 3) {
    const [property, item] =
      generateBorderPositionShorthand(positionRightItems, BORDER_RIGHT) ?? [];
    if (property && item) {
      properties.set(property, item);
      if (properties.has(BORDER_IMAGE)) {
        const { value: imageValue } = properties.get(BORDER_IMAGE);
        if (imageValue === NONE) {
          const { value: itemValue } = item;
          nameItems.push(itemValue);
        }
      }
    }
  } else if (positionRightPriorItems.size === 3) {
    const [property, item] =
      generateBorderPositionShorthand(positionRightPriorItems, BORDER_RIGHT, "important") ?? [];
    if (property && item) {
      properties.set(property, item);
      if (properties.has(BORDER_IMAGE)) {
        const { value: imageValue } = properties.get(BORDER_IMAGE);
        if (imageValue === NONE) {
          const { value: itemValue } = item;
          nameItems.push(itemValue);
        }
      }
    }
  }
  if (positionBottomItems.size === 3) {
    const [property, item] =
      generateBorderPositionShorthand(positionBottomItems, BORDER_BOTTOM) ?? [];
    if (property && item) {
      properties.set(property, item);
      if (properties.has(BORDER_IMAGE)) {
        const { value: imageValue } = properties.get(BORDER_IMAGE);
        if (imageValue === NONE) {
          const { value: itemValue } = item;
          nameItems.push(itemValue);
        }
      }
    }
  } else if (positionBottomPriorItems.size === 3) {
    const [property, item] =
      generateBorderPositionShorthand(positionBottomPriorItems, BORDER_BOTTOM, "important") ?? [];
    if (property && item) {
      properties.set(property, item);
      if (properties.has(BORDER_IMAGE)) {
        const { value: imageValue } = properties.get(BORDER_IMAGE);
        if (imageValue === NONE) {
          const { value: itemValue } = item;
          nameItems.push(itemValue);
        }
      }
    }
  }
  if (positionLeftItems.size === 3) {
    const [property, item] = generateBorderPositionShorthand(positionLeftItems, BORDER_LEFT) ?? [];
    if (property && item) {
      properties.set(property, item);
      if (properties.has(BORDER_IMAGE)) {
        const { value: imageValue } = properties.get(BORDER_IMAGE);
        if (imageValue === NONE) {
          const { value: itemValue } = item;
          nameItems.push(itemValue);
        }
      }
    }
  } else if (positionLeftPriorItems.size === 3) {
    const [property, item] =
      generateBorderPositionShorthand(positionLeftPriorItems, BORDER_LEFT, "important") ?? [];
    if (property && item) {
      properties.set(property, item);
      if (properties.has(BORDER_IMAGE)) {
        const { value: imageValue } = properties.get(BORDER_IMAGE);
        if (imageValue === NONE) {
          const { value: itemValue } = item;
          nameItems.push(itemValue);
        }
      }
    }
  }
  const mixedPriorities = nameItems.length && namePriorItems.length;
  const imageItem = {
    property: BORDER_IMAGE,
    value: NONE,
    priority: ""
  };
  if (nameItems.length === 4) {
    const [property, item] = generateBorderNameShorthand(nameItems, BORDER) ?? [];
    if (property && item) {
      properties.set(property, item);
      properties.delete(BORDER_IMAGE);
      properties.set(BORDER_IMAGE, imageItem);
    }
  } else if (namePriorItems.length === 4) {
    const [property, item] = generateBorderNameShorthand(namePriorItems, BORDER, "important") ?? [];
    if (property && item) {
      properties.set(property, item);
      properties.delete(BORDER_IMAGE);
      properties.set(BORDER_IMAGE, imageItem);
    }
  } else if (properties.has(BORDER_IMAGE)) {
    const { value: imageValue } = properties.get(BORDER_IMAGE);
    if (imageValue === NONE) {
      if (mixedPriorities) {
        properties.delete(BORDER_IMAGE);
        properties.set(BORDER_IMAGE, imageItem);
      } else {
        properties.delete(BORDER_IMAGE);
      }
    }
  }
  if (mixedPriorities) {
    const items = [];
    const priorItems = [];
    for (const item of properties) {
      const [, { priority }] = item;
      if (priority) {
        priorItems.push(item);
      } else {
        items.push(item);
      }
    }
    const firstPropertyKey = properties.keys().next().value;
    const { priority: firstPropertyPriority } = properties.get(firstPropertyKey);
    if (firstPropertyPriority) {
      return new Map([...priorItems, ...items]);
    }
    return new Map([...items, ...priorItems]);
  }
  if (properties.has(BORDER_IMAGE)) {
    properties.delete(BORDER_IMAGE);
    properties.set(BORDER_IMAGE, imageItem);
  }
  return properties;
};

const prepareProperties = (properties, opt = {}) => {
  const { globalObject, options } = opt;
  const parseOpt = {
    globalObject,
    options
  };
  const { positions } = borderElements;
  const parsedProperties = new Map();
  const prepareShorthands = new Map();
  const borderProps = new Map();
  let hasPrecedingBackground = false;
  for (const [property, item] of properties) {
    const { value, priority } = item;
    const { logicalPropertyGroup: shorthandProperty } = propertyDefinitions.get(property) ?? {};
    if (borderProperties.has(property)) {
      borderProps.set(property, { property, value, priority });
    } else if (shorthandProperties.has(shorthandProperty)) {
      if (!prepareShorthands.has(shorthandProperty)) {
        prepareShorthands.set(shorthandProperty, new Map());
      }
      const longhandItems = prepareShorthands.get(shorthandProperty);
      if (longhandItems.size) {
        const firstPropertyKey = longhandItems.keys().next().value;
        const { priority: firstPropertyPriority } = longhandItems.get(firstPropertyKey);
        if (priority === firstPropertyPriority) {
          longhandItems.set(property, { property, value, priority });
          prepareShorthands.set(shorthandProperty, longhandItems);
        } else {
          parsedProperties.delete(shorthandProperty);
        }
      } else {
        longhandItems.set(property, { property, value, priority });
        prepareShorthands.set(shorthandProperty, longhandItems);
      }
      parsedProperties.set(property, item);
    } else if (shorthandProperties.has(property)) {
      const shorthandItem = shorthandProperties.get(property);
      const parsedValues = shorthandItem.parse(value, parseOpt);
      let omitShorthandProperty = false;
      if (Array.isArray(parsedValues)) {
        const [parsedValue] = parsedValues;
        if (typeof parsedValue === "string") {
          for (const [longhandProperty, longhandItem] of shorthandItem.shorthandFor) {
            if (!priority && properties.has(longhandProperty)) {
              const { priority: longhandPriority } = properties.get(longhandProperty);
              if (longhandPriority) {
                omitShorthandProperty = true;
                continue;
              }
            }
            const { position } = longhandItem;
            const longhandValue = getPositionValue([parsedValue], position);
            parsedProperties.set(longhandProperty, {
              property: longhandProperty,
              value: longhandValue,
              priority
            });
          }
        } else if (parsedValue) {
          for (const longhandProperty of Object.keys(parsedValue)) {
            const longhandValue = parsedValue[longhandProperty];
            parsedProperties.set(longhandProperty, {
              property: longhandProperty,
              value: longhandValue,
              priority
            });
          }
        }
      } else if (parsedValues && typeof parsedValues !== "string") {
        for (const longhandProperty of Object.keys(parsedValues)) {
          const longhandValue = parsedValues[longhandProperty];
          parsedProperties.set(longhandProperty, {
            property: longhandProperty,
            value: longhandValue,
            priority
          });
        }
      }
      if (!omitShorthandProperty) {
        if (property === BACKGROUND) {
          hasPrecedingBackground = true;
          parsedProperties.set(property, { property, value, priority });
        } else {
          parsedProperties.set(property, { property, value, priority });
        }
      }
    } else {
      parsedProperties.set(property, { property, value, priority });
      if (hasPrecedingBackground) {
        const { value: shorthandValue, priority: shorthandPriority } = properties.get(BACKGROUND);
        if ((!shorthandPriority || priority) && !hasVarFunc(shorthandValue)) {
          const replacedShorthandValue = replaceBackgroundShorthand(
            property,
            parsedProperties,
            parseOpt
          );
          properties.delete(BACKGROUND);
          properties.set(BACKGROUND, {
            property: BACKGROUND,
            value: replacedShorthandValue,
            priority: shorthandPriority
          });
        }
      }
    }
  }
  if (prepareShorthands.size) {
    for (const [property, item] of prepareShorthands) {
      const shorthandItem = shorthandProperties.get(property);
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
          const value = getPositionValue(positionValues, shorthandItem.position);
          parsedProperties.set(property, {
            property,
            value,
            priority
          });
        }
      }
    }
  }
  if (borderProps.size) {
    const longhandProperties = new Map();
    for (const [property, item] of borderProps) {
      if (shorthandProperties.has(property)) {
        const { value, priority } = item;
        if (property === BORDER) {
          const lineItems = border.parse(value, parseOpt);
          for (const [key, initialValue] of border.initialValues) {
            if (!Object.hasOwn(lineItems, key)) {
              lineItems[key] = initialValue;
            }
          }
          for (const lineProperty of Object.keys(lineItems)) {
            const [namePart, linePart] = lineProperty.split("-");
            const lineValue = lineItems[lineProperty];
            for (const position of positions) {
              const longhandProperty = `${namePart}-${position}-${linePart}`;
              const longhandItem = {
                property: longhandProperty,
                value: lineValue,
                priority
              };
              if (longhandProperties.has(longhandProperty)) {
                const { priority: longhandPriority } = longhandProperties.get(longhandProperty);
                if (!longhandPriority) {
                  longhandProperties.delete(longhandProperty);
                  longhandProperties.set(longhandProperty, longhandItem);
                }
              } else {
                longhandProperties.set(longhandProperty, longhandItem);
              }
            }
          }
          if (value) {
            longhandProperties.set(BORDER_IMAGE, {
              property: BORDER_IMAGE,
              value: NONE,
              priority
            });
          }
        } else {
          const shorthandItem = shorthandProperties.get(property);
          const parsedItem = shorthandItem.parse(value, parseOpt);
          if (Array.isArray(parsedItem)) {
            const [namePart, linePart] = property.split("-");
            for (const position of positions) {
              const longhandProperty = `${namePart}-${position}-${linePart}`;
              const longhandValue = getPositionValue(parsedItem, position);
              const longhandItem = {
                property: longhandProperty,
                value: longhandValue,
                priority
              };
              if (longhandProperties.has(longhandProperty)) {
                const { priority: longhandPriority } = longhandProperties.get(longhandProperty);
                if (!longhandPriority) {
                  longhandProperties.delete(longhandProperty);
                  longhandProperties.set(longhandProperty, longhandItem);
                }
              } else {
                longhandProperties.set(longhandProperty, longhandItem);
              }
            }
          } else if (parsedItem) {
            for (const [key, initialValue] of shorthandItem.initialValues) {
              if (!Object.hasOwn(parsedItem, key)) {
                parsedItem[key] = initialValue;
              }
            }
            for (const longhandProperty of Object.keys(parsedItem)) {
              const longhandValue = parsedItem[longhandProperty];
              const longhandItem = {
                property: longhandProperty,
                value: longhandValue,
                priority
              };
              if (longhandProperties.has(longhandProperty)) {
                const { priority: longhandPriority } = longhandProperties.get(longhandProperty);
                if (!longhandPriority) {
                  longhandProperties.delete(longhandProperty);
                  longhandProperties.set(longhandProperty, longhandItem);
                }
              } else {
                longhandProperties.set(longhandProperty, longhandItem);
              }
            }
          }
        }
      } else if (longhandProperties.has(property)) {
        const { priority } = longhandProperties.get(property);
        if (!priority) {
          longhandProperties.delete(property);
          longhandProperties.set(property, item);
        }
      } else {
        longhandProperties.set(property, item);
      }
    }
    const normalizedProperties = prepareBorderShorthands(longhandProperties);
    for (const [property, item] of normalizedProperties) {
      parsedProperties.set(property, item);
    }
  }
  return parsedProperties;
};

const normalizeProperties = (properties) => {
  const { lines, name, positions } = borderElements;
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

module.exports = {
  borderProperties,
  getPositionValue,
  normalizeProperties,
  prepareBorderProperties,
  prepareProperties,
  shorthandProperties
};
