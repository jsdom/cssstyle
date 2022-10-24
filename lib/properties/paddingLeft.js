var padding = require('./padding.js');
var parsers = require('../parsers.ts');

module.exports.definition = {
  set: parsers.subImplicitSetter('padding', 'left', padding.isValid, padding.parser),
  get: function () {
    return this.getPropertyValue('padding-left');
  },
  enumerable: true,
  configurable: true,
};
