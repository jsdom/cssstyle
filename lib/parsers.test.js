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
  it('returns null for invalid values', () => {
    const invalid = ['ninitial', 'initiall', '--initial', 'liquid'];
    const valid = ['solid'];
    invalid.forEach(input => expect(parsers.parseKeyword(input, valid)).toBeNull());
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
  it('returns null for invalid values', () => {
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
    invalid.forEach(input => expect(parsers.parseCustomIdentifier(input)).toBeNull());
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
describe('parseShorthand', () => {
  it('returns null with invalid component value(s)', () => {
    const longhands = { component: { parse: parsers.parseNumber } };
    expect(parsers.parseShorthand('1px', longhands)).toBeNull();
  });
  it('parses component values not sorted in canonical order', () => {
    const longhands = {
      component1: { parse: parsers.parseNumber },
      component2: { parse: parsers.parseLength },
    };
    expect(parsers.parseShorthand('1px 1', longhands)).toEqual({
      component1: '1',
      component2: '1px',
    });
  });
  it('replaces unspecified component with the inital keyword', () => {
    const longhands = {
      component1: { parse: parsers.parseNumber },
      component2: { parse: parsers.parseNumber },
    };
    expect(parsers.parseShorthand('1', longhands)).toEqual({
      component1: '1',
      component2: 'initial',
    });
  });
});
describe('parseImplicitShorthand', () => {
  it('returns null if some component value is parsed as invalid', () => {
    const longhands = { component: { parse: parsers.parseNumber } };
    expect(parsers.parseImplicitShorthand('1px', longhands)).toBeNull();
  });
  it('parses an implicit shorthand value with missing component values', () => {
    const component = { parse: parsers.parseNumber };
    const longhands = {
      component1: component,
      component2: component,
      component3: component,
      component4: component,
    };
    expect(parsers.parseImplicitShorthand('1', longhands)).toEqual({
      component1: '1',
      component2: '1',
      component3: '1',
      component4: '1',
    });
    expect(parsers.parseImplicitShorthand('1 2', longhands)).toEqual({
      component1: '1',
      component2: '2',
      component3: '1',
      component4: '2',
    });
    expect(parsers.parseImplicitShorthand('1 2 3', longhands)).toEqual({
      component1: '1',
      component2: '2',
      component3: '3',
      component4: '2',
    });
  });
});
describe('createShorthandSetter', () => {
  it('propagates shorthand component values to longhands', () => {
    const style = { _values: {} };
    const longhands = {
      component1: { parse: parsers.parseNumber },
      component2: { parse: parsers.parseLength },
    };
    const definition = {
      set: parsers.createShorthandSetter(longhands),
      get: parsers.createShorthandGetter(longhands),
    };
    Object.defineProperty(style, 'shorthand', definition);
    style.shorthand = '1px 2';
    expect(style.component1).toBe('2');
    expect(style.component2).toBe('1px');
  });
});
describe('serializeShorthand', () => {
  it('returns CSS wide keyword when all longhands are set with it', () => {
    expect(parsers.serializeShorthand(['initial', 'initial', 'initial'])).toBe('initial');
    expect(parsers.serializeShorthand(['inherit', 'inherit', 'inherit'])).toBe('inherit');
  });
  it('returns empty string if some components are a CSS wide keyword that is not initial but not all component values are set with it', () => {
    expect(parsers.serializeShorthand(['initial', 'inherit', 'initial'])).toBe('');
  });
  it('filters out empty string and initial', () => {
    expect(parsers.serializeShorthand(['red', 'initial', '', 'repeat'])).toBe('red repeat');
  });
});
describe('serializeImplicitShorthand', () => {
  it('returns empty string if some longhand values are not set (empty string)', () => {
    expect(parsers.serializeImplicitShorthand(['1', ''])).toBe('');
  });
  it('returns empty string if some longhand values are a CSS wide keyword', () => {
    expect(parsers.serializeImplicitShorthand(['1', 'initial'])).toBe('');
  });
  it('reduces value to its minimal expression', () => {
    expect(parsers.serializeImplicitShorthand(['1', '1', '1', '1'])).toBe('1');
    expect(parsers.serializeImplicitShorthand(['1', '2', '1', '2'])).toBe('1 2');
    expect(parsers.serializeImplicitShorthand(['1', '2', '3', '1'])).toBe('1 2 3 1');
    expect(parsers.serializeImplicitShorthand(['1', '2', '3', '4'])).toBe('1 2 3 4');
  });
});
describe('createShorthandGetter', () => {
  it('collects and serialize component values of the provided longhands', () => {
    const longhands = { component1: '', component2: '' };
    const style = { component1: '1', component2: '2' };
    const get = parsers.createShorthandGetter(longhands);
    expect(get.call(style)).toBe('1 2');
  });
});
describe('idlAttributeToCSSProperty', () => {
  it.todo('test');
});
