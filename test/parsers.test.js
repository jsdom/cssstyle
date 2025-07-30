"use strict";
/* eslint-disable no-useless-escape */

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const parsers = require("../lib/parsers");

describe("prepareValue", () => {
  it("should return empty string for null", () => {
    const input = null;
    const output = parsers.prepareValue(input);

    assert.strictEqual(output, "");
  });

  it("should return string for string", () => {
    const input = "foo";
    const output = parsers.prepareValue(input);

    assert.strictEqual(output, "foo");
  });

  it("should return stringified number for number", () => {
    const input = 1.5;
    const output = parsers.prepareValue(input);

    assert.strictEqual(output, "1.5");
  });

  it("should return string for undefined", () => {
    const input = undefined;
    const output = parsers.prepareValue(input);

    assert.strictEqual(output, "undefined");
  });

  it("should return string for BigInt", () => {
    const input = BigInt(1);
    const output = parsers.prepareValue(input);

    assert.strictEqual(output, "1");
  });

  it("should return string for boolean", () => {
    const input = true;
    const output = parsers.prepareValue(input);

    assert.strictEqual(output, "true");
  });

  it("should return string for boolean", () => {
    const input = false;
    const output = parsers.prepareValue(input);

    assert.strictEqual(output, "false");
  });

  it("should throw for Symbol", () => {
    const input = Symbol("foo");

    assert.throws(
      () => parsers.prepareValue(input),
      (e) => {
        assert.strictEqual(e instanceof globalThis.TypeError, true);
        assert.strictEqual(e.message, "Can not convert symbol to string.");
        return true;
      }
    );
  });

  it("should throw with window global for Symbol", () => {
    const input = Symbol("foo");
    const window = {
      TypeError: globalThis.TypeError
    };

    assert.throws(
      () => parsers.prepareValue(input, window),
      (e) => {
        assert.strictEqual(e instanceof window.TypeError, true);
        assert.strictEqual(e.message, "Can not convert symbol to string.");
        return true;
      }
    );
  });

  it("should throw for object.toString() not converting to string", () => {
    const input = {
      toString: () => [1]
    };

    assert.throws(
      () => parsers.prepareValue(input),
      (e) => {
        assert.strictEqual(e instanceof globalThis.TypeError, true);
        assert.strictEqual(e.message, "Can not convert object to string.");
        return true;
      }
    );
  });

  it("should throw for object.toString() not converting to string", () => {
    const input = {
      toString: () => [1]
    };
    const window = {
      TypeError: globalThis.TypeError
    };

    assert.throws(
      () => parsers.prepareValue(input, window),
      (e) => {
        assert.strictEqual(e instanceof window.TypeError, true);
        assert.strictEqual(e.message, "Can not convert object to string.");
        return true;
      }
    );
  });
});

describe("hasVarFunc", () => {
  it("should return false", () => {
    const input = "";
    const output = parsers.hasVarFunc(input);

    assert.strictEqual(output, false);
  });

  it("should return false", () => {
    const input = "--foo";
    const output = parsers.hasVarFunc(input);

    assert.strictEqual(output, false);
  });

  it("should return true", () => {
    const input = "var(--foo)";
    const output = parsers.hasVarFunc(input);

    assert.strictEqual(output, true);
  });

  it("should return true", () => {
    const input = "bar var(--foo)";
    const output = parsers.hasVarFunc(input);

    assert.strictEqual(output, true);
  });
});

describe("parseNumber", () => {
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
    const input = "-1";
    const output = parsers.parseNumber(input, true);

    assert.strictEqual(output, undefined);
  });

  it('should return "1"', () => {
    const input = "1";
    const output = parsers.parseNumber(input);

    assert.strictEqual(output, "1");
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
  it("should return empty string", () => {
    const input = "";
    const output = parsers.parseLength(input);

    assert.strictEqual(output, "");
  });

  it("should return undefined for negative length", () => {
    const input = "-1em";
    const output = parsers.parseLength(input, true);

    assert.strictEqual(output, undefined);
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
  it("should return empty string", () => {
    const input = "";
    const output = parsers.parsePercent(input);

    assert.strictEqual(output, "");
  });

  it("should return value", () => {
    const input = "10%";
    const output = parsers.parsePercent(input);

    assert.strictEqual(output, "10%");
  });

  it("should return undefined for negative percent", () => {
    const input = "-10%";
    const output = parsers.parsePercent(input, true);

    assert.strictEqual(output, undefined);
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
  it("should return empty string", () => {
    const input = "";
    const output = parsers.parseMeasurement(input);

    assert.strictEqual(output, "");
  });

  it("should return undefined", () => {
    const input = "-1em";
    const output = parsers.parseMeasurement(input, true);

    assert.strictEqual(output, undefined);
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

describe("parseAngle", () => {
  it("should return empty string", () => {
    const input = "";
    const output = parsers.parseAngle(input);

    assert.strictEqual(output, "");
  });

  it("should return value with deg unit", () => {
    const input = "90deg";
    const output = parsers.parseAngle(input);

    assert.strictEqual(output, "90deg");
  });

  it("should return value with deg unit", () => {
    const input = "480deg";
    const output = parsers.parseAngle(input);

    assert.strictEqual(output, "120deg");
  });

  it("should return value with deg unit", () => {
    const input = "-90deg";
    const output = parsers.parseAngle(input);

    assert.strictEqual(output, "-90deg");
  });

  it("should return value with deg unit", () => {
    const input = "270deg";
    const output = parsers.parseAngle(input, true);

    assert.strictEqual(output, "270deg");
  });

  it("should return value with grad unit", () => {
    const input = "100grad";
    const output = parsers.parseAngle(input, true);

    assert.strictEqual(output, "100grad");
  });

  it("should return value as is", () => {
    const input = "var(/* comment */ --foo)";
    const output = parsers.parseAngle(input);

    assert.strictEqual(output, "var(/* comment */ --foo)");
  });

  it("should return calculated value", () => {
    const input = "calc(90deg / 3)";
    const output = parsers.parseAngle(input);

    assert.strictEqual(output, "calc(30deg)");
  });

  it('should return 0deg for "0"', () => {
    const input = "0";
    const output = parsers.parseAngle(input);

    assert.strictEqual(output, "0deg");
  });
});

describe("parseUrl", () => {
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
  it("should return empty string", () => {
    const input = "";
    const output = parsers.parseString(input);

    assert.strictEqual(output, "");
  });

  it("should return undefined", () => {
    const input = "foo";
    const output = parsers.parseString(input);

    assert.strictEqual(output, undefined);
  });

  it("should return undefined", () => {
    const input = "'foo bar\"";
    const output = parsers.parseString(input);

    assert.strictEqual(output, undefined);
  });

  it("should return quoted string", () => {
    const input = "'foo bar'";
    const output = parsers.parseString(input);

    assert.strictEqual(output, '"foo bar"');
  });

  it("should return quoted string", () => {
    const input = '"foo bar"';
    const output = parsers.parseString(input);

    assert.strictEqual(output, '"foo bar"');
  });

  it("should return quoted string", () => {
    const input = '"foo \ bar"';
    const output = parsers.parseString(input);

    assert.strictEqual(output, '"foo  bar"');
  });

  it("should return quoted string", () => {
    const input = '"foo \\\\ bar"';
    const output = parsers.parseString(input);

    assert.strictEqual(output, '"foo \\\\ bar"');
  });

  it("should return quoted string", () => {
    const input = "'foo \"bar\"'";
    const output = parsers.parseString(input);

    assert.strictEqual(output, '"foo \\"bar\\""');
  });
});

describe("parseColor", () => {
  it("should return empty string", () => {
    const input = "";
    const output = parsers.parseColor(input);

    assert.strictEqual(output, "");
  });

  it("should return inherit", () => {
    const input = "inherit";
    const output = parsers.parseColor(input);

    assert.strictEqual(output, "inherit");
  });

  it("should return lower cased keyword for system color", () => {
    const input = "CanvasText";
    const output = parsers.parseColor(input);

    assert.strictEqual(output, "canvastext");
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
    const input = "url(example.png)";
    const output = parsers.parseImage(input);

    assert.strictEqual(output, 'url("example.png")');
  });

  it("should return value", () => {
    const input = "linear-gradient(green, blue)";
    const output = parsers.parseImage(input);

    assert.strictEqual(output, "linear-gradient(green, blue)");
  });

  it("should return value as is if var() is included", () => {
    const input = "radial-gradient(transparent, /* comment */ var(--custom-color))";
    const output = parsers.parseImage(input);

    assert.strictEqual(output, "radial-gradient(transparent, /* comment */ var(--custom-color))");
  });

  it("should return undefined if value is not image type", () => {
    const input = "red";
    const output = parsers.parseImage(input);

    assert.strictEqual(output, undefined);
  });

  it("should return undefined if value contains var() but not gradient", () => {
    const input = "rgb(var(--my-var, 0, 0, 0))";
    const output = parsers.parseImage(input);

    assert.strictEqual(output, undefined);
  });
});

describe("parseFunction", () => {
  it("should return undefined for keyword", () => {
    const input = "inherit";
    const output = parsers.parseFunction(input);

    assert.strictEqual(output, undefined);
  });

  it("should return object with null name and empty value for empty string", () => {
    const input = "";
    const output = parsers.parseFunction(input);

    assert.deepEqual(output, {
      name: null,
      value: ""
    });
  });

  it("should return undefined for unmatched value (starting with digit)", () => {
    const input = "123go(foo)";
    const output = parsers.parseFunction(input);

    assert.strictEqual(output, undefined);
  });

  it("should return object with name var and value as is for var()", () => {
    const input = "var(--foo)";
    const output = parsers.parseFunction(input);

    assert.deepEqual(output, {
      name: "var",
      value: "var(--foo)"
    });
  });

  it("should return object with name var and value as is for function containing var()", () => {
    const input = "translate(var(--foo))";
    const output = parsers.parseFunction(input);

    assert.deepEqual(output, {
      name: "var",
      value: "translate(var(--foo))"
    });
  });

  it("should return object", () => {
    const input = "translate(0)";
    const output = parsers.parseFunction(input);

    assert.deepEqual(output, {
      name: "translate",
      value: "0"
    });
  });

  it("should return object", () => {
    const input = "translate(42px)";
    const output = parsers.parseFunction(input);

    assert.deepEqual(output, {
      name: "translate",
      value: "42px"
    });
  });

  it("should return object", () => {
    const input = "translate( 100px, 200px )";
    const output = parsers.parseFunction(input);

    assert.deepEqual(output, {
      name: "translate",
      value: "100px, 200px"
    });
  });

  it("should return object", () => {
    const input = "translateX(100px)";
    const output = parsers.parseFunction(input);

    assert.deepEqual(output, {
      name: "translateX",
      value: "100px"
    });
  });

  it("should return object", () => {
    const input = "translateY(100px)";
    const output = parsers.parseFunction(input);

    assert.deepEqual(output, {
      name: "translateY",
      value: "100px"
    });
  });

  it("should return object", () => {
    const input = "translateZ(100px)";
    const output = parsers.parseFunction(input);

    assert.deepEqual(output, {
      name: "translateZ",
      value: "100px"
    });
  });

  it("should return object", () => {
    const input = "translate3d(42px, -62px, -135px)";
    const output = parsers.parseFunction(input);

    assert.deepEqual(output, {
      name: "translate3d",
      value: "42px, -62px, -135px"
    });
  });

  it("should return object", () => {
    const input = "drop-shadow(30px 10px 4px #4444dd)";
    const output = parsers.parseFunction(input);

    assert.deepEqual(output, {
      name: "drop-shadow",
      value: "30px 10px 4px #4444dd"
    });
  });

  it("should return object", () => {
    const input = "foo-bar-baz(qux)";
    const output = parsers.parseFunction(input);

    assert.deepEqual(output, {
      name: "foo-bar-baz",
      value: "qux"
    });
  });
});

describe("parseShorthand", () => {
  const flexGrow = require("../lib/properties/flexGrow");
  const flexShrink = require("../lib/properties/flexShrink");
  const flexBasis = require("../lib/properties/flexBasis");
  const shorthandForFlex = new Map([
    ["flex-grow", flexGrow],
    ["flex-shrink", flexShrink],
    ["flex-basis", flexBasis]
  ]);

  it("should return undefined for keyword", () => {
    const input = "none";
    const output = parsers.parseShorthand(input, shorthandForFlex);

    assert.strictEqual(output, undefined);
  });

  it("should return object", () => {
    const input = "0 0 auto";
    const output = parsers.parseShorthand(input, shorthandForFlex);

    assert.deepEqual(output, {
      "flex-grow": "0",
      "flex-shrink": "0",
      "flex-basis": "auto"
    });
  });

  it("should return object", () => {
    const input = "0 1 auto";
    const output = parsers.parseShorthand(input, shorthandForFlex);

    assert.deepEqual(output, {
      "flex-grow": "0",
      "flex-shrink": "1",
      "flex-basis": "auto"
    });
  });

  it("should return object", () => {
    const input = "2";
    const output = parsers.parseShorthand(input, shorthandForFlex);

    assert.deepEqual(output, {
      "flex-grow": "2"
    });
  });

  it("should return object", () => {
    const input = "2 1";
    const output = parsers.parseShorthand(input, shorthandForFlex);

    assert.deepEqual(output, {
      "flex-grow": "2",
      "flex-shrink": "1"
    });
  });

  it("should return object", () => {
    const input = "10px";
    const output = parsers.parseShorthand(input, shorthandForFlex);

    assert.deepEqual(output, {
      "flex-basis": "10px"
    });
  });

  it("should return object", () => {
    const input = "2 10px";
    const output = parsers.parseShorthand(input, shorthandForFlex);

    assert.deepEqual(output, {
      "flex-grow": "2",
      "flex-basis": "10px"
    });
  });

  it("should return undefined", () => {
    const input = "2 10px 20px";
    const output = parsers.parseShorthand(input, shorthandForFlex);

    assert.deepEqual(output, undefined);
  });

  it("should return object", () => {
    const input = "calc(2/3)";
    const output = parsers.parseShorthand(input, shorthandForFlex);

    assert.deepEqual(output, {
      "flex-grow": "calc(0.666667)"
    });
  });

  it("should return object", () => {
    const input = "calc(2/3) calc(3*.5)";
    const output = parsers.parseShorthand(input, shorthandForFlex);

    assert.deepEqual(output, {
      "flex-grow": "calc(0.666667)",
      "flex-shrink": "calc(1.5)"
    });
  });

  it("should return object", () => {
    const input = "1 0 var(--foo)";
    const output = parsers.parseShorthand(input, shorthandForFlex);

    assert.deepEqual(output, {
      "flex-grow": "",
      "flex-shrink": "",
      "flex-basis": ""
    });
  });
});

describe("parseCSS", () => {
  it("should get ast", () => {
    const input = "color: green !important;";
    const opt = {
      context: "declarationList",
      parseValue: false
    };
    const output = parsers.parseCSS(input, opt);
    assert.strictEqual(output.type, "DeclarationList");
    assert.strictEqual(Object.hasOwn(output, "children"), true);
  });

  it("should get ast", () => {
    const input = "green";
    const opt = {
      context: "value",
      parseValue: false
    };
    const output = parsers.parseCSS(input, opt);
    assert.strictEqual(output.type, "Value");
    assert.strictEqual(Object.hasOwn(output, "children"), true);
  });

  it("should get object", () => {
    const input = "color: green !important;";
    const opt = {
      context: "declarationList",
      parseValue: false
    };
    const output = parsers.parseCSS(input, opt, true);
    const [
      {
        important,
        property,
        value: { value }
      }
    ] = output.children;
    assert.strictEqual(important, true);
    assert.strictEqual(property, "color");
    assert.strictEqual(value, "green");
  });
});

describe("isValidPropertyValue", () => {
  it("should return false", () => {
    const input = "foo";
    const output = parsers.isValidPropertyValue("color", input);

    assert.strictEqual(output, false);
  });

  it("should return true", () => {
    const input = "red";
    const output = parsers.isValidPropertyValue("color", input);

    assert.strictEqual(output, true);
  });

  it("should return true", () => {
    const input = "initial";
    const output = parsers.isValidPropertyValue("color", input);

    assert.strictEqual(output, true);
  });

  it("should return true", () => {
    const input = "canvas";
    const output = parsers.isValidPropertyValue("color", input);

    assert.strictEqual(output, true);
  });

  it("should return true", () => {
    const input = "Canvas";
    const output = parsers.isValidPropertyValue("color", input);

    assert.strictEqual(output, true);
  });

  it("should return true", () => {
    const input = "canvas";
    const output = parsers.isValidPropertyValue("-webkit-border-after-color", input);

    assert.strictEqual(output, true);
  });

  it("should return false", () => {
    const input = "canvas";
    const output = parsers.isValidPropertyValue("-moz-border-bottom-color", input);

    assert.strictEqual(output, false);
  });

  it("should return true", () => {
    const input = "canvas";
    const output = parsers.isValidPropertyValue("background-color", input);

    assert.strictEqual(output, true);
  });

  it("should return true", () => {
    const input = "appworkspace";
    const output = parsers.isValidPropertyValue("color", input);

    assert.strictEqual(output, true);
  });

  it("should return true", () => {
    const input = "AppWorkSpace";
    const output = parsers.isValidPropertyValue("color", input);

    assert.strictEqual(output, true);
  });

  it("should return true", () => {
    const input = "light-dark(green, blue)";
    const output = parsers.isValidPropertyValue("color", input);

    assert.strictEqual(output, true);
  });

  it("should return true", () => {
    const input = "light";
    const output = parsers.isValidPropertyValue("color-scheme", input);

    assert.strictEqual(output, true);
  });

  it("should return true", () => {
    const input = "dark";
    const output = parsers.isValidPropertyValue("color-scheme", input);

    assert.strictEqual(output, true);
  });

  it("should return true", () => {
    const input = "normal";
    const output = parsers.isValidPropertyValue("color-scheme", input);

    assert.strictEqual(output, true);
  });

  it("should return true", () => {
    const input = "only dark";
    const output = parsers.isValidPropertyValue("color-scheme", input);

    assert.strictEqual(output, true);
  });

  it("should return false for custom property", () => {
    const input = "red";
    const output = parsers.isValidPropertyValue("--foo", input);

    assert.strictEqual(output, false);
  });

  it("should return false for var()", () => {
    const input = "var(--foo)";
    const output = parsers.isValidPropertyValue("color", input);

    assert.strictEqual(output, false);
  });
});
