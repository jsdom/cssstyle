'use strict';

const {
  createShorthandGetter,
  createShorthandSetter,
  serializeShorthand,
  splitTokens,
  ws,
} = require('../parsers.js');

const longhands = {
  'background-color': require('./backgroundColor.js'),
  'background-image': require('./backgroundImage.js'),
  'background-repeat': require('./backgroundRepeat.js'),
  'background-attachment': require('./backgroundAttachment.js'),
  'background-position': require('./backgroundPosition.js'),
  'background-size': require('./backgroundSize.js'),
  'background-origin': require('./backgroundOrigin.js'),
  'background-clip': require('./backgroundClip.js'),
};
const singleComponent = [
  'background-color',
  'background-image',
  'background-attachment',
  'background-origin',
  'background-clip',
];
const splitIndex = Object.keys(longhands).indexOf('background-size');
const separatorRegExp = new RegExp(`${ws}/${ws}`);

/**
 * @param {string} value
 * @param {object} longhands
 * @returns {object | null}
 *
 * TODO: parse multiple <layer> and return null if <color> is parsed in the
 * first layers.
 */
function parse(value, longhands) {
  const parsed = {};
  const [components] = splitTokens(value);

  // First parse single component longhands
  for (let i = 0; i < components.length; i++) {
    const component = components[i];
    singleComponent.some(property => {
      if (!parsed[property]) {
        const value = longhands[property].parse(component);
        if (value) {
          parsed[property] = value;
          components.splice(i--, 1);
          return true;
        }
      }
      return false;
    });
  }

  // Assign default value to unparsed longhands
  Object.keys(longhands).forEach(property => {
    if (parsed[property]) {
      return;
    }
    if (property === 'background-clip') {
      parsed[property] = parsed['background-origin'];
    } else {
      parsed[property] = 'initial';
    }
  });

  if (components.length === 0) {
    return parsed;
  }

  // Parse <repeat>
  const repeatComponents = [];
  let repeatComponentIndex = 0;
  for (let j = 0; j < components.length; j++) {
    const component = components[j];
    const repeat = longhands['background-repeat'].parse(component);
    if (repeat) {
      // First or consecutive <repeat>
      if (repeatComponentIndex === 0 || repeatComponentIndex - j === -1) {
        repeatComponents.push(component);
        components.splice(j--, 1);
        continue;
      }
      return null;
    }
  }
  if (repeatComponents.length > 0) {
    parsed['background-repeat'] = longhands['background-repeat'].parse(repeatComponents.join(' '));
    if (!parsed['background-repeat']) {
      return null;
    }
  }

  if (components.length === 0) {
    return parsed;
  }

  // <position> and <size> are now the only component values left

  // Parse <position> / <size> (separator has been split as a component)
  const splitIndex = components.indexOf('/');
  if (splitIndex > -1) {
    parsed['background-position'] = longhands['background-position'].parse(
      components.slice(0, splitIndex).join(' ')
    );
    parsed['background-size'] = longhands['background-size'].parse(
      components.slice(splitIndex + 1).join(' ')
    );
    if (parsed['background-position'] && parsed['background-size']) {
      return parsed;
    }
    return null;
  }

  const splittedComponents = components.map(value => splitTokens(value, separatorRegExp));

  // <position> (without <size>)
  if (splittedComponents.filter(([values]) => values.length > 1).length === 0) {
    parsed['background-position'] = longhands['background-position'].parse(components.join(' '));
    if (parsed['background-position']) {
      return parsed;
    }
    return null;
  }

  // Flatten splitted <position> and <size> and filter out empty string
  const positionAndSize = splittedComponents.reduce(
    (components, [values]) => components.concat(values.filter(Boolean)),
    []
  );

  // <position>/<size> (both single component)
  if (components.length === 1) {
    const [position, size] = positionAndSize;
    parsed['background-position'] = longhands['background-position'].parse(position);
    parsed['background-size'] = longhands['background-size'].parse(size);
    if (parsed['background-position'] && parsed['background-size']) {
      return parsed;
    }
    return null;
  }

  // <position>/ <size>
  const lastPositionIndex = components.findIndex(value => value.endsWith('/'));
  if (lastPositionIndex > -1) {
    parsed['background-position'] = longhands['background-position'].parse(
      positionAndSize.slice(0, lastPositionIndex + 1).join(' ')
    );
    parsed['background-size'] = longhands['background-size'].parse(
      components.slice(lastPositionIndex + 1).join(' ')
    );
    if (parsed['background-position'] && parsed['background-size']) {
      return parsed;
    }
    return null;
  }

  // <position> /<size>
  const lastSizeIndex = components.findIndex(value => value.startsWith('/'));
  if (lastSizeIndex > -1) {
    parsed['background-position'] = longhands['background-position'].parse(
      components.slice(0, lastSizeIndex).join(' ')
    );
    parsed['background-size'] = longhands['background-size'].parse(
      positionAndSize.slice(lastSizeIndex).join(' ')
    );
    if (parsed['background-position'] && parsed['background-size']) {
      return parsed;
    }
    return null;
  }

  return parsed;
}

function serialize(components) {
  // <size> has not been specified
  if (components[splitIndex] === 'initial') {
    return serializeShorthand(components);
  }
  return serializeShorthand(
    [
      serializeShorthand(components.slice(0, splitIndex)),
      serializeShorthand(components.slice(splitIndex)),
    ],
    ' / '
  );
}

module.exports.definition = {
  set: createShorthandSetter(longhands, parse),
  get: createShorthandGetter(longhands, serialize),
  enumerable: true,
  configurable: true,
};
module.exports.longhands = Object.keys(longhands);
module.exports.serialize = serialize;
