'use strict';

const allProperties = require('./allProperties.js');
const extraProperties = require('./extraProperties.js');
const vendorPrefixedProperties = require('./vendorPrefixedProperties.js');

// https://drafts.csswg.org/cssom/#supported-css-property
module.exports = new Set(
  [...allProperties, ...extraProperties, ...vendorPrefixedProperties].sort()
);
