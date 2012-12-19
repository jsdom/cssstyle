'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('border-right-style', v);
    },
    get: function () {
        return this.getPropertyValue('border-right-style');
    },
    enumerable: true
};
