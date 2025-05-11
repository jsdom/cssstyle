"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const parsers = require("../lib/parsers");

describe("valueType", () => {
  it("returns null or empty string for null", () => {
    const input = null;
    const output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.NULL_OR_EMPTY_STR);
  });

  it("returns null or empty string for empty string", () => {
    const input = "";
    const output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.NULL_OR_EMPTY_STR);
  });

  it("returns undefined for undefined", () => {
    const input = undefined;
    const output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.UNDEFINED);
  });

  it("returns number for 1", () => {
    const input = 1;
    const output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.NUMBER);
  });

  it("returns number for 1.1", () => {
    const input = 1.1;
    const output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.NUMBER);
  });

  it('returns number for ".1"', () => {
    const input = ".1";
    const output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.NUMBER);
  });

  it("returns length for 100ch", () => {
    const input = "100ch";
    const output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.LENGTH);
  });

  it("returns percent for 10%", () => {
    const input = "10%";
    const output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.PERCENT);
  });

  it("returns unidentified for url(https://example.com)", () => {
    const input = "url(https://example.com)";
    const output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.UNIDENT);
  });

  it('returns unidentified for url("https://example.com")', () => {
    const input = 'url("https://example.com")';
    const output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.UNIDENT);
  });

  it("returns unidentified for url(foo.png)", () => {
    const input = "url(foo.png)";
    const output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.UNIDENT);
  });

  it('returns unidentified for url("foo.png")', () => {
    const input = 'url("foo.png")';
    const output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.UNIDENT);
  });

  it("returns unidentified for url(var(--foo))", () => {
    const input = "url(var(--foo))";
    const output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.UNIDENT);
  });

  it("returns calc from calc(100px *  var(--foo))", () => {
    const input = "calc(100px *  var(--foo))";
    const output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.CALC);
  });

  it("returns var from var(--foo)", () => {
    const input = "var(--foo)";
    const output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.VAR);
  });

  it("returns var from var(--foo, var(--bar))", () => {
    const input = "var(--foo, var(--bar))";
    const output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.VAR);
  });

  it("returns var from var(--foo, calc(var(--bar) * 2))", () => {
    const input = "var(--foo, calc(var(--bar) * 2))";
    const output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.VAR);
  });

  it("returns calc from calc(100px * 2)", () => {
    const input = "calc(100px * 2)";
    const output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.CALC);
  });

  it("returns calc from calc(100px *  calc(2 * 1))", () => {
    const input = "calc(100px * calc(2 * 1))";
    const output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.CALC);
  });

  it('returns string from "foo"', () => {
    const input = '"foo"';
    const output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.STRING);
  });

  it("returns string from 'foo'", () => {
    const input = "'foo'";
    const output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.STRING);
  });

  it("returns angle for 90deg", () => {
    const input = "90deg";
    const output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.ANGLE);
  });

  it("returns color for red", () => {
    const input = "red";
    const output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.COLOR);
  });

  it("returns color for #nnnnnn", () => {
    const input = "#fefefe";
    const output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.COLOR);
  });

  it("returns color for rgb(n, n, n)", () => {
    const input = "rgb(10, 10, 10)";
    const output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.COLOR);
  });

  it("returns color for rgb(p, p, p)", () => {
    const input = "rgb(10%, 10%, 10%)";
    const output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.COLOR);
  });

  it("returns color for rgba(n, n, n, n)", () => {
    const input = "rgba(10, 10, 10, 1)";
    const output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.COLOR);
  });

  it("returns color for rgba(n, n, n, n) with decimal alpha", () => {
    const input = "rgba(10, 10, 10, 0.5)";
    const output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.COLOR);
  });

  it("returns color for rgba(p, p, p, n)", () => {
    const input = "rgba(10%, 10%, 10%, 1)";
    const output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.COLOR);
  });

  it("returns color for rgba(p, p, p, n) with decimal alpha", () => {
    const input = "rgba(10%, 10%, 10%, 0.5)";
    const output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.COLOR);
  });

  it("returns color for transparent keyword", () => {
    const input = "transparent";
    const output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.COLOR);
  });

  it("returns unidentified for linear-gradient(red, blue)", () => {
    const input = "linear-gradient(red, blue)";
    const output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.UNIDENT);
  });

  it("returns color for accentcolor", () => {
    const input = "AccentColor";
    const output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.COLOR);
  });

  it("returns color for legacy activeborder", () => {
    const input = "ActiveBorder";
    const output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.COLOR);
  });

  it("returns keyword for foo", () => {
    const input = "foo";
    const output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.KEYWORD);
  });

  it("returns keyword for foo-bar", () => {
    const input = "foo-bar";
    const output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.KEYWORD);
  });

  it("returns unidentified for foo(bar)", () => {
    const input = "foo(bar)";
    const output = parsers.valueType(input);

    assert.strictEqual(output, parsers.TYPES.UNIDENT);
  });
});

describe("parseNumber", () => {
  it("should return null", () => {
    const input = null;
    const output = parsers.parseNumber(input);

    assert.strictEqual(output, null);
  });

  it("should return empty string", () => {
    const input = "";
    const output = parsers.parseNumber(input);

    assert.strictEqual(output, "");
  });

  it("should return undefined", () => {
    const input = "foo";
    const output = parsers.parseNumber(input);

    assert.strictEqual(output, undefined);
  });

  it("should return undefined", () => {
    const input = undefined;
    const output = parsers.parseNumber(input);

    assert.strictEqual(output, undefined);
  });

  it('should return "1"', () => {
    const input = 1;
    const output = parsers.parseNumber(input);

    assert.strictEqual(output, "1");
  });

  it('should return "1"', () => {
    const input = "1";
    const output = parsers.parseNumber(input);

    assert.strictEqual(output, "1");
  });

  it('should return "0.5"', () => {
    const input = 0.5;
    const output = parsers.parseNumber(input);

    assert.strictEqual(output, "0.5");
  });

  it('should return "0.5"', () => {
    const input = "0.5";
    const output = parsers.parseNumber(input);

    assert.strictEqual(output, "0.5");
  });

  it('should return "0.5"', () => {
    const input = ".5";
    const output = parsers.parseNumber(input);

    assert.strictEqual(output, "0.5");
  });

  it("should return calculated value", () => {
    const input = "calc(2 / 3)";
    const output = parsers.parseLength(input);

    assert.strictEqual(output, "calc(0.666667)");
  });
});

describe("parseLength", () => {
  it("should return null", () => {
    const input = null;
    const output = parsers.parseLength(input);

    assert.strictEqual(output, null);
  });

  it("should return empty string", () => {
    const input = "";
    const output = parsers.parseLength(input);

    assert.strictEqual(output, "");
  });

  it("should return value as is", () => {
    const input = "var(/* comment */ --foo)";
    const output = parsers.parseLength(input);

    assert.strictEqual(output, "var(/* comment */ --foo)");
  });

  it("should return calculated value", () => {
    const input = "calc(2em / 3)";
    const output = parsers.parseLength(input);

    assert.strictEqual(output, "calc(0.666667em)");
  });

  it("should return serialized value", () => {
    const input = "calc(10px + 20%)";
    const output = parsers.parseLength(input);

    assert.strictEqual(output, "calc(20% + 10px)");
  });

  it("should return serialized value", () => {
    const input = "calc(100vh + 10px)";
    const output = parsers.parseLength(input);

    assert.strictEqual(output, "calc(10px + 100vh)");
  });
});

describe("parsePercent", () => {
  it("should return null", () => {
    const input = null;
    const output = parsers.parsePercent(input);

    assert.strictEqual(output, null);
  });

  it("should return empty string", () => {
    const input = "";
    const output = parsers.parsePercent(input);

    assert.strictEqual(output, "");
  });

  it("should return value as is", () => {
    const input = "var(/* comment */ --foo)";
    const output = parsers.parsePercent(input);

    assert.strictEqual(output, "var(/* comment */ --foo)");
  });

  it("should return calculated value", () => {
    const input = "calc(100% / 3)";
    const output = parsers.parsePercent(input);

    assert.strictEqual(output, "calc(33.3333%)");
  });

  it("should return serialized value", () => {
    const input = "calc(10px + 20%)";
    const output = parsers.parsePercent(input);

    assert.strictEqual(output, "calc(20% + 10px)");
  });
});

describe("parseMeasurement", () => {
  it("should return null", () => {
    const input = null;
    const output = parsers.parseMeasurement(input);

    assert.strictEqual(output, null);
  });

  it("should return empty string", () => {
    const input = "";
    const output = parsers.parseMeasurement(input);

    assert.strictEqual(output, "");
  });

  it("should return value with em unit", () => {
    const input = "1em";
    const output = parsers.parseMeasurement(input);

    assert.strictEqual(output, "1em");
  });

  it("should return value with percent", () => {
    const input = "100%";
    const output = parsers.parseMeasurement(input);

    assert.strictEqual(output, "100%");
  });

  it("should return value as is", () => {
    const input = "var(/* comment */ --foo)";
    const output = parsers.parseMeasurement(input);

    assert.strictEqual(output, "var(/* comment */ --foo)");
  });

  it("should return calculated value", () => {
    const input = "calc(2em / 3)";
    const output = parsers.parseMeasurement(input);

    assert.strictEqual(output, "calc(0.666667em)");
  });

  it("should return calculated value", () => {
    const input = "calc(100% / 3)";
    const output = parsers.parseMeasurement(input);

    assert.strictEqual(output, "calc(33.3333%)");
  });

  it("should return serialized value", () => {
    const input = "calc(10px + 20%)";
    const output = parsers.parseMeasurement(input);

    assert.strictEqual(output, "calc(20% + 10px)");
  });

  it("should return serialized value", () => {
    const input = "calc(100vh + 10px)";
    const output = parsers.parseMeasurement(input);

    assert.strictEqual(output, "calc(10px + 100vh)");
  });

  it("should return 0px for 0", () => {
    const input = 0;
    const output = parsers.parseMeasurement(input);

    assert.strictEqual(output, "0px");
  });

  it('should return 0px for "0"', () => {
    const input = "0";
    const output = parsers.parseMeasurement(input);

    assert.strictEqual(output, "0px");
  });
});

describe("parseInheritingMeasurement", () => {
  it("should return auto", () => {
    const input = "auto";
    const output = parsers.parseInheritingMeasurement(input);

    assert.strictEqual(output, "auto");
  });

  it("should return auto", () => {
    const input = "AUTO";
    const output = parsers.parseInheritingMeasurement(input);

    assert.strictEqual(output, "auto");
  });

  it("should return inherit", () => {
    const input = "inherit";
    const output = parsers.parseInheritingMeasurement(input);

    assert.strictEqual(output, "inherit");
  });

  it("should return inherit", () => {
    const input = "INHERIT";
    const output = parsers.parseInheritingMeasurement(input);

    assert.strictEqual(output, "inherit");
  });

  it("should return value with em unit", () => {
    const input = "1em";
    const output = parsers.parseInheritingMeasurement(input);

    assert.strictEqual(output, "1em");
  });

  it("should return value with percent", () => {
    const input = "100%";
    const output = parsers.parseInheritingMeasurement(input);

    assert.strictEqual(output, "100%");
  });
});

describe("parseUrl", () => {
  it("should return empty string", () => {
    const input = null;
    const output = parsers.parseUrl(input);

    assert.strictEqual(output, "");
  });

  it("should return empty string", () => {
    const input = "";
    const output = parsers.parseUrl(input);

    assert.strictEqual(output, "");
  });

  it("should return undefined", () => {
    const input = "url(var(--foo))";
    const output = parsers.parseUrl(input);

    assert.strictEqual(output, undefined);
  });

  it("should return undefined", () => {
    const input = undefined;
    const output = parsers.parseUrl(input);

    assert.strictEqual(output, undefined);
  });

  it("should return quoted url string", () => {
    const input = "url(sample.png)";
    const output = parsers.parseUrl(input);

    assert.strictEqual(output, 'url("sample.png")');
  });

  it("should return quoted url string", () => {
    const input = "url('sample.png')";
    const output = parsers.parseUrl(input);

    assert.strictEqual(output, 'url("sample.png")');
  });

  it("should return quoted url string", () => {
    const input = 'url("sample.png")';
    const output = parsers.parseUrl(input);

    assert.strictEqual(output, 'url("sample.png")');
  });

  it("should return quoted url string without escape", () => {
    const input = "url(sample\\-escaped.png)";
    const output = parsers.parseUrl(input);

    assert.strictEqual(output, 'url("sample-escaped.png")');
  });

  it("should return quoted url string with escape", () => {
    const input = "url(sample\\\\-escaped.png)";
    const output = parsers.parseUrl(input);

    assert.strictEqual(output, 'url("sample\\\\-escaped.png")');
  });

  it("should return undefined", () => {
    const input = "url(sample unescaped -space.png)";
    const output = parsers.parseUrl(input);

    assert.strictEqual(output, undefined);
  });

  it("should return quoted url string without escape", () => {
    const input = "url(sample\\ escaped\\ -space.png)";
    const output = parsers.parseUrl(input);

    assert.strictEqual(output, 'url("sample escaped -space.png")');
  });

  it("should return undefined", () => {
    const input = "url(sample\tunescaped\t-tab.png)";
    const output = parsers.parseUrl(input);

    assert.strictEqual(output, undefined);
  });

  it("should return quoted url string without escape", () => {
    const input = "url(sample\\\tescaped\\\t-tab.png)";
    const output = parsers.parseUrl(input);

    assert.strictEqual(output, 'url("sample\tescaped\t-tab.png")');
  });

  it("should return undefined", () => {
    const input = "url(sample\nunescaped\n-lf.png)";
    const output = parsers.parseUrl(input);

    assert.strictEqual(output, undefined);
  });

  it("should return quoted url string without escape", () => {
    const input = "url(sample\\\nescaped\\\n-lf.png)";
    const output = parsers.parseUrl(input);

    assert.strictEqual(output, 'url("sample\nescaped\n-lf.png")');
  });

  it("should return undefined", () => {
    const input = "url(sample'unescaped'-quote.png)";
    const output = parsers.parseUrl(input);

    assert.strictEqual(output, undefined);
  });

  it("should return quoted url string without escape", () => {
    const input = "url(sample\\'escaped\\'-quote.png)";
    const output = parsers.parseUrl(input);

    // prettier-ignore
    assert.strictEqual(output, "url(\"sample'escaped'-quote.png\")");
  });

  it("should return undefined", () => {
    const input = 'url(sample"unescaped"-double-quote.png)';
    const output = parsers.parseUrl(input);

    assert.strictEqual(output, undefined);
  });

  it("should return quoted url string with escape", () => {
    const input = 'url(sample\\"escaped\\"-double-quote.png)';
    const output = parsers.parseUrl(input);

    assert.strictEqual(output, 'url("sample\\"escaped\\"-double-quote.png")');
  });

  it("should return quoted empty url string", () => {
    const input = "url()";
    const output = parsers.parseUrl(input);

    assert.strictEqual(output, 'url("")');
  });

  it("should return quoted empty url string", () => {
    const input = 'url("")';
    const output = parsers.parseUrl(input);

    assert.strictEqual(output, 'url("")');
  });
});

describe("parseString", () => {
  it.todo("test");
});

describe("parseColor", () => {
  it("should return empty string", () => {
    const input = null;
    const output = parsers.parseColor(input);

    assert.strictEqual(output, "");
  });

  it("should return empty string", () => {
    const input = "";
    const output = parsers.parseColor(input);

    assert.strictEqual(output, "");
  });

  it("should return undefined", () => {
    const input = undefined;
    const output = parsers.parseColor(input);

    assert.strictEqual(output, undefined);
  });

  it("should return inherit", () => {
    const input = "inherit";
    const output = parsers.parseColor(input);

    assert.strictEqual(output, "inherit");
  });

  it("should convert hsl to rgb values", () => {
    const input = "hsla(0, 1%, 2%)";
    const output = parsers.parseColor(input);

    assert.strictEqual(output, "rgb(5, 5, 5)");
  });

  it("should convert hsla to rgba values", () => {
    const input = "hsla(0, 1%, 2%, 0.5)";
    const output = parsers.parseColor(input);

    assert.strictEqual(output, "rgba(5, 5, 5, 0.5)");
  });

  it("should convert not zero hsl with non zero hue 120 to rgb(0, 255, 0)", () => {
    const input = "hsl(120, 100%, 50%)";
    const output = parsers.parseColor(input);

    assert.strictEqual(output, "rgb(0, 255, 0)");
  });

  it("should convert not zero hsl with non zero hue 240 to rgb(0, 0, 255)", () => {
    const input = "hsl(240, 100%, 50%)";
    const output = parsers.parseColor(input);

    assert.strictEqual(output, "rgb(0, 0, 255)");
  });

  it("should convert modern rgb to rgb values", () => {
    const input = "rgb(128 0 128 / 1)";
    const output = parsers.parseColor(input);

    assert.strictEqual(output, "rgb(128, 0, 128)");
  });

  it("should convert modern rgb with none values to rgb values", () => {
    const input = "rgb(128 0 none)";
    const output = parsers.parseColor(input);

    assert.strictEqual(output, "rgb(128, 0, 0)");
  });

  it("should convert modern rgba to rgba values", () => {
    const input = "rgba(127.5 0 127.5 / .5)";
    const output = parsers.parseColor(input);

    assert.strictEqual(output, "rgba(128, 0, 128, 0.5)");
  });

  it("should normalize lab values", () => {
    const input = "lab(46.2775% -47.5621 48.5837 / 1.0)"; // green
    const output = parsers.parseColor(input);

    assert.strictEqual(output, "lab(46.2775 -47.5621 48.5837)");
  });

  it("should normalize color function values", () => {
    const input = "color(srgb 0 .5 0 / 1.0)";
    const output = parsers.parseColor(input);

    assert.strictEqual(output, "color(srgb 0 0.5 0)");
  });

  it("should normalize color-mix values", () => {
    const input = "color-mix(in srgb, rgb(255 0 0), #0000ff 40%)";
    const output = parsers.parseColor(input);

    assert.strictEqual(output, "color-mix(in srgb, rgb(255, 0, 0) 60%, rgb(0, 0, 255))");
  });

  it("should not remove comments, trim or lower case letters if var() is used", () => {
    const input = "var( --custom-Color /* comment */)";
    const output = parsers.parseColor(input);

    assert.strictEqual(output, "var( --custom-Color /* comment */)");
  });

  it("should output transparent keyword", () => {
    const input = "transparent";
    const output = parsers.parseColor(input);

    assert.strictEqual(output, "transparent");
  });

  it("should return value as is with var()", () => {
    const input = "rgb(var(--my-var, 0, 0, 0))";
    const output = parsers.parseColor(input);

    assert.strictEqual(output, "rgb(var(--my-var, 0, 0, 0))");
  });
});

describe("parseAngle", () => {
  it.todo("test");
});

describe("parseKeyword", () => {
  it("should return value", () => {
    const input = "inherit";
    const output = parsers.parseKeyword(input);

    assert.strictEqual(output, "inherit");
  });

  it("should return value", () => {
    const input = "foo";
    const output = parsers.parseKeyword(input, ["foo", "bar"]);

    assert.strictEqual(output, "foo");
  });

  it("should return value", () => {
    const input = "Bar";
    const output = parsers.parseKeyword(input, ["foo", "bar"]);

    assert.strictEqual(output, "bar");
  });

  it("should return undefined", () => {
    const input = "baz";
    const output = parsers.parseKeyword(input, ["foo", "bar"]);

    assert.strictEqual(output, undefined);
  });
});

describe("parseImage", () => {
  it("should return empty string", () => {
    const input = "";
    const output = parsers.parseImage(input);

    assert.strictEqual(output, "");
  });

  it("should return empty string", () => {
    const input = null;
    const output = parsers.parseImage(input);

    assert.strictEqual(output, "");
  });

  it("should return undefined", () => {
    const input = "foo";
    const output = parsers.parseImage(input);

    assert.strictEqual(output, undefined);
  });

  it("should return none", () => {
    const input = "none";
    const output = parsers.parseImage(input);

    assert.strictEqual(output, "none");
  });

  it("should return inherit", () => {
    const input = "inherit";
    const output = parsers.parseImage(input);

    assert.strictEqual(output, "inherit");
  });

  it("should return undefined for negative radii", () => {
    const input = "radial-gradient(circle -10px at center, red, blue)";
    const output = parsers.parseImage(input);

    assert.strictEqual(output, undefined);
  });

  it("should return value", () => {
    const input = "url(example.png)";
    const output = parsers.parseImage(input);

    assert.strictEqual(output, 'url("example.png")');
  });

  it("should return value", () => {
    const input = 'url(example.png), url("example2.png")';
    const output = parsers.parseImage(input);

    assert.strictEqual(output, 'url("example.png"), url("example2.png")');
  });

  it("should return value", () => {
    const input = "none, url(example.png)";
    const output = parsers.parseImage(input);

    assert.strictEqual(output, 'none, url("example.png")');
  });

  it("should return value", () => {
    const input = "linear-gradient(green, blue), url(example.png)";
    const output = parsers.parseImage(input);

    assert.strictEqual(output, 'linear-gradient(green, blue), url("example.png")');
  });

  it("should return value as is if var() is included", () => {
    const input =
      "radial-gradient(transparent, /* comment */ var(--custom-color)), url(example.png)";
    const output = parsers.parseImage(input);

    assert.strictEqual(
      output,
      'radial-gradient(transparent, /* comment */ var(--custom-color)), url("example.png")'
    );
  });

  it("should return undefined if invalid image type is included", () => {
    const input = "radial-gradient(transparent, var(--custom-color)), red";
    const output = parsers.parseImage(input);

    assert.strictEqual(output, undefined);
  });

  it("should return undefined if value is not image type", () => {
    const input = "rgb(var(--my-var, 0, 0, 0))";
    const output = parsers.parseImage(input);

    assert.strictEqual(output, undefined);
  });
});

describe("shorthandParser", () => {
  const flexGrow = require("../lib/properties/flexGrow");
  const flexShrink = require("../lib/properties/flexShrink");
  const flexBasis = require("../lib/properties/flexBasis");
  const shorthandFor = new Map([
    ["flex-grow", flexGrow],
    ["flex-shrink", flexShrink],
    ["flex-basis", flexBasis]
  ]);

  it("should return undefined for keyword", () => {
    const input = "none";
    const output = parsers.shorthandParser(input, shorthandFor);

    assert.strictEqual(output, undefined);
  });

  it("should return object", () => {
    const input = "0 0 auto";
    const output = parsers.shorthandParser(input, shorthandFor);

    assert.deepEqual(output, {
      "flex-grow": "0",
      "flex-shrink": "0",
      "flex-basis": "auto"
    });
  });

  it("should return object", () => {
    const input = "0 1 auto";
    const output = parsers.shorthandParser(input, shorthandFor);

    assert.deepEqual(output, {
      "flex-grow": "0",
      "flex-shrink": "1",
      "flex-basis": "auto"
    });
  });

  it("should return object", () => {
    const input = "2";
    const output = parsers.shorthandParser(input, shorthandFor);

    assert.deepEqual(output, {
      "flex-grow": "2"
    });
  });

  it("should return object", () => {
    const input = "2 1";
    const output = parsers.shorthandParser(input, shorthandFor);

    assert.deepEqual(output, {
      "flex-grow": "2",
      "flex-shrink": "1"
    });
  });

  it("should return object", () => {
    const input = "10px";
    const output = parsers.shorthandParser(input, shorthandFor);

    assert.deepEqual(output, {
      "flex-basis": "10px"
    });
  });

  it("should return object", () => {
    const input = "2 10px";
    const output = parsers.shorthandParser(input, shorthandFor);

    assert.deepEqual(output, {
      "flex-grow": "2",
      "flex-basis": "10px"
    });
  });

  it("should return undefined", () => {
    const input = "2 10px 20px";
    const output = parsers.shorthandParser(input, shorthandFor);

    assert.deepEqual(output, undefined);
  });

  it.todo("test");
});
