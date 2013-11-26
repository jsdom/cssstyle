'use strict';

var implicitSetter = require('../parsers').implicitSetter;

// the valid border-styles:
var styles = ['none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset'];

var isValid = module.exports.isValid = function parse(v) {
    return styles.indexOf(v) !== -1;
};

module.exports.definition = {
    set: implicitSetter('border', 'style', isValid),
    get: function () {
        return this.getPropertyValue('border-style');
    },
    enumerable: true,
    configurable: true
};
