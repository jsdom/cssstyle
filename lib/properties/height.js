'use strict';

var parseWidthOrHeight = require('../parsers').parseWidthOrHeight;

module.exports.definition = {
    set: function (v) {
        this._setProperty('height', parseWidthOrHeight(v));
    },
    get: function () {
        return this.getPropertyValue('height');
    },
    enumerable: true,
    configurable: true
};
