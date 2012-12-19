'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('border-bottom-width', v);
    },
    get: function () {
        return this.getPropertyValue('border-bottom-width');
    },
    enumerable: true
};
