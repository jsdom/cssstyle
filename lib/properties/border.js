'use strict';

var shorthandParser = require('../parsers').shorthandParser;
var shorthandSetter = require('../parsers').shorthandSetter;
var shorthandGetter = require('../parsers').shorthandGetter;
var implicitSetter = require('../parsers').implicitSetter;

var shorthand_for = {
    'border-width': require('./borderWidth'),
    'border-style': require('./borderStyle'),
    'border-color': require('./borderColor')
};

var isValid = function isValid(v) {
    return shorthandParser(v, shorthand_for) !== undefined;
};
module.exports.isValid = isValid;

var parser = function (v) {
    if (v.toString().toLowerCase() === 'none') {
        v = '';
    }
    if (isValid(v)) {
        return v;
    }
    return undefined;
};

var myShorthandSetter = shorthandSetter('border', shorthand_for);
var myShorthandGetter = shorthandGetter('border', shorthand_for);
var myImplicitSetter = implicitSetter('border', '', isValid, parser);

module.exports.definition = {
    set: function (v) {
        if (v.toString().toLowerCase() === 'none') {
            v = '';
        }
        myImplicitSetter.call(this, v);
        myShorthandSetter.call(this, v);
    },
    get: myShorthandGetter,
    enumerable: true,
    configurable: true
};
