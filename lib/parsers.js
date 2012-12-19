/*********************************************************************
 * These are commonly used parsers for CSS Values they take a string *
 * to parse and return a string after it's been converted, if needed *
 ********************************************************************/
'use strict';

exports.TYPES = {
    INTEGER: 1,
    NUMBER: 2,
    LENGTH: 3,
    PERCENT: 4,
    URL: 5,
    COLOR: 6,
    STRING: 7,
    ANGLE: 8,
    KEYWORD: 9
};

// rough regular expressions
var integerRegEx = /^[\-+]?[0-9]+$/;
var numberRegEx = /^[\-+]?[0-9]*\.[0-9]+$/;
var lengthRegEx = /^[\-+]?[0-9]?\.?[0-9]+(in|cm|mm|pt|pc|px)$/;
var percentRegEx = /^[\-+]?[0-9]?\.?[0-9]+%$/;
var urlRegEx = /^url\(\s*([^\)]*)\s*\)$/;
var stringRegEx = /^("[^"]*"|'[^']*')$/;
var colorRegEx1 = /^#[0-9a-fA-F][0-9a-fA-F][0-9a-fA-F]([0-9a-fA-F][0-9a-fA-F][0-9a-fA-F])?$/;
var colorRegEx2 = /^rgb\(([^\)]*)\)$/;
var colorRegEx3 = /^rgba\(([^\)]*)\)$/;
var angleRegEx = /^([\-+]?[0-9]?\.?[0-9]+)(deg|grad|rad)$/;

// This will return one of the above types based on the passed in string
exports.valueType = function valueType(val) {
    if (integerRegEx.test(val)) {
        return exports.TYPES.INTEGER;
    }
    if (numberRegEx.test(val)) {
        return exports.TYPES.NUMBER;
    }
    if (lengthRegEx.test(val)) {
        return exports.TYPES.LENGTH;
    }
    if (percentRegEx.test(val)) {
        return exports.TYPES.PERCENT;
    }
    if (urlRegEx.test(val)) {
        return exports.TYPES.URL;
    }
    if (stringRegEx.test(val)) {
        return exports.TYPES.STRING;
    }
    if (angleRegEx.test(val)) {
        return exports.TYPES.ANGLE;
    }
    if (colorRegEx1.test(val)) {
        return exports.TYPES.COLOR;
    }
    var res = colorRegEx2.exec(val);
    var parts;
    if (res !== null) {
        parts = res[1].split(/\s*,\s*/);
        if (parts.length !== 3) {
            return undefined;
        }
        if (parts.every(percentRegEx.test.bind()) || parts.every(integerRegEx.test.bind())) {
            return exports.TYPES.COLOR;
        }
        return undefined;
    }
    res = colorRegEx3.exec(val);
    if (res !== null) {
        parts = res[1].split(/\s*,\s*/);
        if (parts.length !== 4) {
            return undefined;
        }
        if (parts.every(percentRegEx.test.bind()) || parts.every(integerRegEx.test.bind())) {
            return exports.TYPES.COLOR;
        }
        return undefined;
    }

    // could still be a color, one of the standard keyword colors
    switch (val) {
    case 'maroon':
    case 'red':
    case 'orange':
    case 'yellow':
    case 'olive':
    case 'purple':
    case 'fuchsia':
    case 'white':
    case 'lime':
    case 'green':
    case 'navy':
    case 'blue':
    case 'aqua':
    case 'teal':
    case 'black':
    case 'silver':
    case 'gray':
        // the following are deprecated in CSS3
    case 'activeborder':
    case 'activecaption':
    case 'appworkspace':
    case 'background':
    case 'buttonface':
    case 'buttonhighlight':
    case 'buttonshadow':
    case 'buttontext':
    case 'captiontext':
    case 'graytext':
    case 'highlight':
    case 'highlighttext':
    case 'inactiveborder':
    case 'inactivecaption':
    case 'inactivecaptiontext':
    case 'infobackground':
    case 'infotext':
    case 'menu':
    case 'menutext':
    case 'scrollbar':
    case 'threeddarkshadow':
    case 'threedface':
    case 'threedhighlight':
    case 'threedlightshadow':
    case 'threedshadow':
    case 'window':
    case 'windowframe':
    case 'windowtext':
        return exports.TYPES.COLOR;
    default:
        return exports.TYPES.KEYWORD;
    }
};

exports.parseInteger = function parseInteger(val) {
    if (exports.valueType(val) !== exports.TYPES.INTEGER) {
        return undefined;
    }
    return String(parseInt(val, 10));
};

exports.parseNumber = function parseNumber(val) {
    if (exports.valueType(val) !== exports.TYPES.NUMBER) {
        return undefined;
    }
    return String(parseFloat(val, 10));
};

exports.parseLength = function parseLength(val) {
    if (exports.valueType(val) !== exports.TYPES.LENGTH) {
        return undefined;
    }
    return val;
};

exports.parsePercent = function parsePercent(val) {
    if (exports.valueType(val) !== exports.TYPES.PERCENT) {
        return undefined;
    }
    return val;
};

exports.parseMeasurement = function parseMeasurement(val) {
    var type = exports.valueType(val);
    if (type !== exports.TYPES.LENGTH && type !== exports.TYPES.PERCENT) {
        return undefined;
    }
    return val;
};

exports.parseUrl = function parseUrl(val) {
    var res = urlRegEx.exec(val);
    // does it match the regex?
    if (!res) {
        return undefined;
    }
    var str = res[1];
    // if it starts with single or double quotes, does it end with the same?
    if ((str[1] === '"' || str[1] === "'") && str[1] !== str[str.length - 1]) {
        return undefined;
    }
    if (str[1] === '"' || str[1] === "'") {
        str = str.substr(1, -1);
    }

    var i;
    for (i = 0; i < str.length; i++) {
        switch (str[i]) {
        case '(':
        case ')':
        case ' ':
        case '\t':
        case '\n':
        case "'":
        case '"':
            return undefined;
        case '\\':
            i++;
            break;
        }
    }
    return 'url(' + str + ')';
};

exports.parseString = function parseString(val) {
    if (exports.valueType(val) !== exports.TYPES.STRING) {
        return undefined;
    }
    var i;
    for (i = 1; i < val.length - 1; i++) {
        switch (val[i]) {
        case val[0]:
            return undefined;
        case '\\':
            i++;
            while (i < val.length - 1 && /[0-9A-Fa-f]/.test(val[i])) {
                i++;
            }
            break;
        }
    }
    if (i >= val.length) {
        return undefined;
    }
    return val;
};

exports.parseColor = function parseColor(val) {
    var red, green, blue, alpha = 1;
    var parts;
    var res = colorRegEx1.exec(val);
    // is it #aaa or #ababab
    if (res) {
        var hex = val.substr(1);
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        red = parseInt(hex.substr(0, 2), 16);
        green = parseInt(hex.substr(2, 2), 16);
        blue = parseInt(hex.substr(4, 2), 16);
        return 'rgb(' + red + ', ' + green + ', ' + blue + ')';
    }

    res = colorRegEx2.exec(val);
    if (res) {
        parts = res[1].split(/\s*,\s*/);
        if (parts.length !== 3) {
            return undefined;
        }
        if (parts.every(percentRegEx.test.bind(percentRegEx))) {
            red = parseFloat(parts[0].substr(0, -1));
            green = parseFloat(parts[1].substr(0, -1));
            blue = parseFloat(parts[2].substr(0, -1));
        } else if (parts.every(integerRegEx.test.bind(integerRegEx))) {
            red = parseInt(parts[0], 10);
            green = parseInt(parts[1], 10);
            blue = parseInt(parts[2], 10);
        } else {
            return undefined;
        }
        red = Math.min(255, Math.max(0, red));
        green = Math.min(255, Math.max(0, green));
        blue = Math.min(255, Math.max(0, blue));
        return 'rgb(' + red + ', ' + green + ', ' + blue + ')';
    }

    res = colorRegEx3.exec(val);
    if (res) {
        parts = res[1].split(/\s*,\s*/);
        if (parts.length !== 4) {
            return undefined;
        }
        if (parts.every(percentRegEx.test.bind(percentRegEx))) {
            red = parseFloat(parts[0].substr(0, -1));
            green = parseFloat(parts[1].substr(0, -1));
            blue = parseFloat(parts[2].substr(0, -1));
            alpha = parseFloat(parts[3]);
        } else if (parts.every(integerRegEx.test.bind(integerRegEx))) {
            red = parseInt(parts[0], 10);
            green = parseInt(parts[1], 10);
            blue = parseInt(parts[2], 10);
            alpha = parseFloat(parts[3]);
        } else {
            return undefined;
        }
        if (isNaN(alpha)) {
            alpha = 1;
        }
        red = Math.min(255, Math.max(0, red));
        green = Math.min(255, Math.max(0, green));
        blue = Math.min(255, Math.max(0, blue));
        alpha = Math.min(1, Math.max(0, alpha));
        if (alpha === 1) {
            return 'rgb(' + red + ', ' + green + ', ' + blue + ')';
        }
        return 'rgba(' + red + ', ' + green + ', ' + blue + ', ' + alpha + ')';
    }

    if (exports.valueType(val) === exports.TYPES.COLOR) {
        return val;
    }
    return undefined;
};

exports.parseAngle = function parseAngle(val) {
    if (exports.valueType(val) !== exports.TYPES.ANGLE) {
        return undefined;
    }
    var res = angleRegEx.exec(val);
    var flt = parseFloat(res[1]);
    if (res[2] === 'rad') {
        flt *= 180 / Math.PI;
    } else if (res[2] === 'grad') {
        flt *= 360 / 400;
    }

    while (flt < 0) {
        flt += 360;
    }
    while (flt > 360) {
        flt -= 360;
    }
    return flt + 'deg';
};