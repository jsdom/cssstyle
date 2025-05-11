"use strict";

var backgroundImage = require("./backgroundImage");
var backgroundPosition = require("./backgroundPosition");
var backgroundRepeat = require("./backgroundRepeat");
var backgroundAttachment = require("./backgroundAttachment");
var backgroundColor = require("./backgroundColor");

var shorthandFor = new Map([
  ["background-image", backgroundImage],
  ["background-position", backgroundPosition],
  ["background-repeat", backgroundRepeat],
  ["background-attachment", backgroundAttachment],
  ["background-color", backgroundColor]
]);

module.exports.definition = {
  set(v) {
    this._shorthandSetter("background", v, shorthandFor);
  },
  get() {
    return this._shorthandGetter("background", shorthandFor);
  },
  enumerable: true,
  configurable: true
};
