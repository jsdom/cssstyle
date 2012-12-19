'use strict';

var parseColor = require('../parsers').parseColor;

module.exports.definition = {
    set: function (v) {
        this.setProperty('border-left-color', parseColor(v));
    },
    get: function () {
        return this.getPropertyValue('border-left-color');
    },
    enumerable: true
};
