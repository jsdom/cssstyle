"use strict";

const parsers = require("../parsers");
const backgroundImage = require("./backgroundImage");
const backgroundPosition = require("./backgroundPosition");
const backgroundRepeat = require("./backgroundRepeat");
const backgroundAttachment = require("./backgroundAttachment");
const backgroundColor = require("./backgroundColor");

const shorthandFor = new Map([
  ["background-image", backgroundImage],
  ["background-position", backgroundPosition],
  ["background-repeat", backgroundRepeat],
  ["background-attachment", backgroundAttachment],
  ["background-color", backgroundColor]
]);

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    this._shorthandSetter("background", v, shorthandFor);
  },
  get() {
    return this._shorthandGetter("background", shorthandFor);
  },
  enumerable: true,
  configurable: true
};
