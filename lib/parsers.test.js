'use strict';

const parsers = require('./parsers');

describe('parseInteger', () => {
  it.todo('test');
});
describe('parseNumber', () => {
  it.todo('test');
});
describe('parseLength', () => {
  it.todo('test');
});
describe('parsePercent', () => {
  it.todo('test');
});
describe('parseMeasurement', () => {
  it.todo('test');
});
describe('parseAngle', () => {
  it.todo('test');
});
describe('parseKeyword', () => {
  it('returns undefined for invalid values', () => {
    const invalid = ['ninitial', 'initiall', '--initial', 'liquid'];
    const valid = ['solid'];
    invalid.forEach(input => expect(parsers.parseKeyword(input, valid)).toBeUndefined());
  });
  it('parses CSS wide keywords', () => {
    expect(parsers.parseKeyword('INItial')).toBe('initial');
    expect(parsers.parseKeyword('initial', ['initial'])).toBe('initial');
    expect(parsers.parseKeyword('inherit')).toBe('inherit');
    expect(parsers.parseKeyword('revert')).toBe('revert');
    expect(parsers.parseKeyword('unset')).toBe('unset');
  });
  it('parses predefined keywords', () => {
    expect(parsers.parseKeyword('SOLId', ['solid'])).toBe('solid');
  });
});
describe('parseCustomIdentifier', () => {
  it('returns undefined for invalid values', () => {
    const invalid = [
      'initial',
      'inherit',
      'unset',
      'default',
      '1identifier',
      '#identifier',
      'ident ifier',
      '\\\nidentifier', // ie. not a valid escape sequence
    ];
    invalid.forEach(input => expect(parsers.parseCustomIdentifier(input)).toBeUndefined());
  });
  it('parses valid values', () => {
    const valid = [
      '_',
      '\\0 \\g', // ie. valid escape sequences
      'camelIdentifier',
      'snake_identifier',
      'kebab-identifier',
      '--',
      '--dashed-camelIdentifier',
      '--dashed-kebab-identifier',
      '--kebab-snake_identifier',
      '--\\0 \\g', // ie. valid escape sequences
    ];
    valid.forEach(value => expect(parsers.parseCustomIdentifier(value)).toBe(value));
  });
});
describe('parseUrl', () => {
  it.todo('test');
});
describe('parseString', () => {
  it.todo('test');
});
describe('parseColor', () => {
  it('should convert hsl to rgb values', () => {
    let input = 'hsla(0, 1%, 2%)';
    let output = parsers.parseColor(input);

    expect(output).toBe('rgb(5, 5, 5)');
  });
  it('should convert hsla to rgba values', () => {
    let input = 'hsla(0, 1%, 2%, 0.5)';
    let output = parsers.parseColor(input);

    expect(output).toBe('rgba(5, 5, 5, 0.5)');
  });

  it.todo('Add more tests');
});
describe('cssPropertyToIDLAttribute', () => {
  it.todo('test');
});
describe('shorthandParser', () => {
  it.todo('test');
});
describe('shorthandSetter', () => {
  it.todo('test');
});
describe('shorthandGetter', () => {
  it.todo('test');
});
describe('implicitSetter', () => {
  it.todo('test');
});
describe('subImplicitSetter', () => {
  it.todo('test');
});
describe('idlAttributeToCSSProperty', () => {
  it.todo('test');
});
