var padding = require('./padding.js');
var parsers = require('../parsers.ts');

module.exports.definition = {
  set: parsers.subImplicitSetter('padding', 'right', padding.isValid, padding.parser),
  get: function () {
    return this.getPropertyValue('padding-right');
  },
  enumerable: true,
  configurable: true,
};
