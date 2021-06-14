'use strict';

const {
  createShorthandGetter,
  createShorthandSetter,
  parseBorderRadius,
  serializeBorderRadius,
  splitTokens,
} = require('../parsers');

function parse(v, longhands) {
  longhands = { ...longhands };
  const parts = parseBorderRadius(v, false);

  if (parts) {
    const [horizontal, vertical = horizontal] = parts;

    longhands['border-top-left-radius'] = `${horizontal[0]} ${vertical[0]}`;
    longhands['border-top-right-radius'] = `${horizontal[1]} ${vertical[1]}`;
    longhands['border-bottom-right-radius'] = `${horizontal[2]} ${vertical[2]}`;
    longhands['border-bottom-left-radius'] = `${horizontal[3]} ${vertical[3]}`;

    return longhands;
  }
}

const longhands = {
  'border-top-left-radius': '',
  'border-top-right-radius': '',
  'border-bottom-right-radius': '',
  'border-bottom-left-radius': '',
};

function serialize(longhands) {
  return serializeBorderRadius(
    Object.values(longhands).reduce(
      (parts, value) => {
        const [[horizontal, vertical = horizontal]] = splitTokens(value);
        parts[0].push(horizontal);
        parts[1].push(vertical);
        return parts;
      },
      [[], []]
    )
  );
}

const get = createShorthandGetter(longhands, serialize);

module.exports.definition = {
  set: createShorthandSetter(longhands, parse),
  get,
  enumerable: true,
  configurable: true,
};
module.exports.longhands = Object.keys(longhands);
module.exports.serialize = serialize;
