"use strict";

const background = require("./properties/background");
const border = require("./properties/border");
const borderTop = require("./properties/borderTop");
const borderRight = require("./properties/borderRight");
const borderBottom = require("./properties/borderBottom");
const borderLeft = require("./properties/borderLeft");
const flex = require("./properties/flex");
const font = require("./properties/font");

module.exports.shorthandProperties = new Map([
  ["background", background.shorthandFor],
  ["border", border.shorthandFor],
  ["border-top", borderTop.shorthandFor],
  ["border-right", borderRight.shorthandFor],
  ["border-bottom", borderBottom.shorthandFor],
  ["border-left", borderLeft.shorthandFor],
  ["flex", flex.shorthandFor],
  ["font", font.shorthandFor]
]);
