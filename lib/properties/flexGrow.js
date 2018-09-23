'use strict';

var parseNumber = require('../parsers').parseNumber;

module.exports.isValid = function isValid(v) {
    return parseNumber(v) !== undefined;
};

module.exports.definition = {
    set: function (v) {
        this._setProperty('flex-grow', parseNumber(v));
    },
    get: function () {
        return this.getPropertyValue('flex-grow');
    },
    enumerable: true,
    configurable: true
};
