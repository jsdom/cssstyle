'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('border-top', v);
    },
    get: function () {
        return this.getPropertyValue('border-top');
    },
    enumerable: true
};
