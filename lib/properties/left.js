'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('left', v);
    },
    get: function () {
        return this.getPropertyValue('left');
    },
    enumerable: true,
    configurable: true
};
