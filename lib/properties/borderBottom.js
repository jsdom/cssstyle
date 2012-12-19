'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('border-bottom', v);
    },
    get: function () {
        return this.getPropertyValue('border-bottom');
    },
    enumerable: true
};
