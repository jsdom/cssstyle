"use strict";

const { handleBorder } = require("./border");
const { handleFlex } = require("./flex");
const { handlePositionShorthand, handlePositionLonghand } = require("./position");

module.exports = {
  handleBorder,
  handleFlex,
  handlePositionShorthand,
  handlePositionLonghand
};
