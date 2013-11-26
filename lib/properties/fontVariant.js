'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('font-variant', v);
    },
    get: function () {
        return this.getPropertyValue('font-variant');
    },
    enumerable: true,
    configurable: true
};
