'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('clip-rule', v);
    },
    get: function () {
        return this.getPropertyValue('clip-rule');
    },
    enumerable: true,
    configurable: true
};
