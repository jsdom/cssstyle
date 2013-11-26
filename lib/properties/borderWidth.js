'use strict';

var parsers = require('../parsers');
var parsers = require('../parsers');
var implicitSetter = require('../parsers').implicitSetter;

// the valid border-widths:
var widths = ['thin', 'medium', 'thick'];

var isValid = module.exports.isValid = function parse(v) {
    return (widths.indexOf(v.toLowerCase()) !== -1) || parsers.parseLength(v);
};

module.exports.definition = {
    set: implicitSetter('border', 'width', isValid),
    get: function () {
        return this.getPropertyValue('border-width');
    },
    enumerable: true,
    configurable: true
};
