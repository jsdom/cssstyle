'use strict';

var parseColor = require('../parsers').parseColor;

module.exports.definition = {
    set: function (v) {
        this.setProperty('border-right-color', parseColor(v));
    },
    get: function () {
        return this.getPropertyValue('border-right-color');
    },
    enumerable: true
};
