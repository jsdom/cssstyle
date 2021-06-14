'use strict';

const parsers = require('./parsers');

describe('parseInteger', () => {
  it('works with calc', () => {
    expect(parsers.parseInteger('calc(1 + 1)')).toBe('2');
  });
  it.todo('more tests');
});
describe('parseNumber', () => {
  it('works with calc', () => {
    expect(parsers.parseNumber('calc(1.5 + 1.5)')).toBe('3');
  });
  it.todo('more tests');
});
describe('parseLength', () => {
  it('works with calc', () => {
    expect(parsers.parseLength('calc(1px + 1px)')).toBe('calc(2px)');
  });
  it.todo('more tests');
});
describe('parsePercentage', () => {
  it('works with calc', () => {
    expect(parsers.parsePercentage('calc(1% + 1%)')).toBe('calc(2%)');
  });
  it.todo('more tests');
});
describe('parseLengthOrPercentage', () => {
  it.todo('test');
});
describe('parseAngle', () => {
  it('works with calc', () => {
    expect(parsers.parseAngle('calc(1deg + 1deg)')).toBe('calc(2deg)');
  });
  it.todo('test');
});
describe('parseTime', () => {
  it('works with calc', () => {
    expect(parsers.parseTime('calc(1s + 1s)')).toBe('calc(2s)');
  });
  it.todo('more tests');
});
describe('parseCalc', () => {
  const resolveAngle = v => parsers.parseAngle(v, true);
  const resolveLengthOrPercentage = v => parsers.parseLengthOrPercentage(v, true);
  const resolveTime = v => parsers.parseTime(v, true);
  it('returns null with 0 and <dimension-percentage> as operands', () => {
    expect(parsers.parseCalc('calc(0 + 1px)', resolveLengthOrPercentage)).toBeNull();
    expect(parsers.parseCalc('calc(1% * 1px)', resolveLengthOrPercentage)).toBeNull();
  });
  it('parses a single operand', () => {
    expect(parsers.parseCalc('calc(1)')).toBe('1');
    expect(parsers.parseCalc('calc(1px)', resolveLengthOrPercentage)).toBe('calc(1px)');
  });
  it('resolves numbers', () => {
    expect(parsers.parseCalc('calc(1 - 2)')).toBe('-1');
    expect(parsers.parseCalc('calc(1 + 2)')).toBe('3');
    expect(parsers.parseCalc('calc(1 * 2)')).toBe('2');
    expect(parsers.parseCalc('calc(1 / 2)')).toBe('0.5');
    expect(parsers.parseCalc('calc(1.5 + 2.5 * 3)')).toBe('9');
    expect(parsers.parseCalc('calc((1 + 2) * 3)')).toBe('9');
    expect(parsers.parseCalc('calc(1 + 2 * (3 + 4))')).toBe('15');
    expect(parsers.parseCalc('calc(calc(1 + 2) * 3 * calc(2 - 1))')).toBe('9');
    expect(parsers.parseCalc('CALc(1 - 2)')).toBe('-1');
  });
  it('resolves numerics of the same type', () => {
    expect(parsers.parseCalc('calc(1% + 2 * 1%)', resolveLengthOrPercentage)).toBe('calc(3%)');
    expect(parsers.parseCalc('calc(1px + 2px * 1)', resolveLengthOrPercentage)).toBe('calc(3px)');
    expect(parsers.parseCalc('calc(1px + 2em * 2)', resolveLengthOrPercentage)).toBe(
      'calc(1px + 4em)'
    );
    expect(parsers.parseCalc('calc(1px + 1pc)', resolveLengthOrPercentage)).toBe('calc(17px)');
    expect(parsers.parseCalc('calc(1turn + 180deg)', resolveAngle)).toBe('calc(180deg)');
    expect(parsers.parseCalc('calc(1s + 1000ms)', resolveTime)).toBe('calc(2000ms)');
    expect(parsers.parseCalc('CALc(1px + 1em)', resolveLengthOrPercentage)).toBe('calc(1px + 1em)');
  });
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
describe('splitTokens', () => {
  it('should split value components separated by space', () => {
    expect(parsers.splitTokens('1px solid red')).toEqual([['1px', 'solid', 'red'], [' ', ' ']]);
  });
  it('should split value components separated by space and forward slash', () => {
    expect(parsers.splitTokens('url(bg.jpq) center / 50%', /[ /]/)).toEqual([
      ['url(bg.jpq)', 'center', '50%'],
      [' ', ' / '],
    ]);
  });
  it('should split a list of values', () => {
    expect(parsers.splitTokens('1px 1px black, 2px 2px silver', /,/)).toEqual([
      ['1px 1px black', '2px 2px silver'],
      [', '],
    ]);
  });
  it('should split color function arguments', () => {
    const separators = /[,/ ]/;
    expect(parsers.splitTokens('0,0,0', separators)).toEqual([['0', '0', '0'], [',', ',']]);
    expect(parsers.splitTokens('0,1%,2%', separators)).toEqual([['0', '1%', '2%'], [',', ',']]);
    expect(parsers.splitTokens('0   ,   0   , 0', separators)).toEqual([
      ['0', '0', '0'],
      [' , ', ' , '],
    ]);
    expect(parsers.splitTokens('0deg, 1%, 2%', separators)).toEqual([
      ['0deg', '1%', '2%'],
      [', ', ', '],
    ]);
    expect(parsers.splitTokens('0deg 1%   /   2%', separators)).toEqual([
      ['0deg', '1%', '2%'],
      [' ', ' / '],
    ]);
  });
  it('should split nested function arguments', () => {
    expect(parsers.splitTokens('calc(45deg * 2) to left, rgb(255, 0, 0), cyan', /,/)).toEqual([
      ['calc(45deg * 2) to left', 'rgb(255, 0, 0)', 'cyan'],
      [', ', ', '],
    ]);
    expect(parsers.splitTokens('calc(1 + 1) + var(--number, calc(1 + 1)) * 1', /[+*]/)).toEqual([
      ['calc(1 + 1)', 'var(--number, calc(1 + 1))', '1'],
      [' + ', ' * '],
    ]);
  });
  it('should split function with empty arguments', () => {
    expect(parsers.splitTokens(', ,   ,, 1%,', /,/)).toEqual([
      ['', '', '', '', '1%', ''],
      [', ', ',   ', ',', ', ', ','],
    ]);
  });
});
