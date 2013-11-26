'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('font-weight', v);
    },
    get: function () {
        return this.getPropertyValue('font-weight');
    },
    enumerable: true,
    configurable: true
};
