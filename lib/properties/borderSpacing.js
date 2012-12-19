'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('border-spacing', v);
    },
    get: function () {
        return this.getPropertyValue('border-spacing');
    },
    enumerable: true
};
