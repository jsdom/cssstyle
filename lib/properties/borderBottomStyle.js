'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('border-bottom-style', v);
    },
    get: function () {
        return this.getPropertyValue('border-bottom-style');
    },
    enumerable: true
};
