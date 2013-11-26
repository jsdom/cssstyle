'use strict';

var parsers = require('../parsers');
var implicitSetter = require('../parsers').implicitSetter;

var isValid = module.exports.isValid = function parse(v) {
    return (v.toLowerCase() === 'transparent' || parsers.valueType(v) === parsers.TYPES.COLOR);
};

module.exports.definition = {
    set: implicitSetter('border', 'color', isValid),
    get: function () {
        return this.getPropertyValue('border-color');
    },
    enumerable: true,
    configurable: true
};
