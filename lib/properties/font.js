'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('font', v);
    },
    get: function () {
        return this.getPropertyValue('font');
    },
    enumerable: true,
    configurable: true
};
