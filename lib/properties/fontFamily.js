'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('font-family', v);
    },
    get: function () {
        return this.getPropertyValue('font-family');
    },
    enumerable: true,
    configurable: true
};
