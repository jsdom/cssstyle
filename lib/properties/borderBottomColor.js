'use strict';

var parseColor = require('../parsers').parseColor;

module.exports.definition = {
    set: function (v) {
        this.setProperty('border-bottom-color', parseColor(v));
    },
    get: function () {
        return this.getPropertyValue('border-bottom-color');
    },
    enumerable: true
};
