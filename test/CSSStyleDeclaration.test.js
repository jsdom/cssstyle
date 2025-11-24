"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { CSSStyleDeclaration } = require("../lib/CSSStyleDeclaration");
const propertyDefinitions = require("../lib/generated/propertyDefinitions");
const camelize = require("../scripts/camelize");

const window = {
  getComputedStyle: () => {},
  DOMException: globalThis.DOMException,
  TypeError: globalThis.TypeError
};

function testPropertyValue(property, value, expected) {
  const style = new CSSStyleDeclaration(window);
  let res;

  style.setProperty(property, value);
  res = style.getPropertyValue(property);
  assert.strictEqual(res, expected, `setProperty("${property}", '${value}')`);

  style.setProperty(property, undefined);
  res = style.getPropertyValue(property);
  assert.strictEqual(res, expected, `setProperty("${property}", undefined)`);

  style.setProperty(property, null);
  res = style.getPropertyValue(property);
  assert.strictEqual(res, "", `setProperty("${property}", null)`);

  style[property] = value;
  res = style[property];
  assert.strictEqual(res, expected, `set["${property}"] = '${value}'`);

  style[property] = undefined;
  res = style[property];
  assert.strictEqual(res, expected, `set["${property}"] = undefined`);

  style[property] = null;
  res = style[property];
  assert.strictEqual(res, "", `set["${property}"] = null`);
}

function testImplicitPropertyValue(property, value, expected, sub) {
  const style = new CSSStyleDeclaration();
  let res;

  style.setProperty(property, value);
  res = style.getPropertyValue(property);
  assert.strictEqual(res, expected, `setProperty("${property}", '${value}')`);
  for (const [key, subExpected] of sub) {
    res = style.getPropertyValue(key);
    assert.strictEqual(
      res,
      subExpected,
      `setProperty("${property}", '${value}') implicitly changes the value of ${key}`
    );
  }

  style.setProperty(property, undefined);
  res = style.getPropertyValue(property);
  assert.strictEqual(res, expected, `setProperty("${property}", undefined)`);
  for (const [key, subExpected] of sub) {
    res = style.getPropertyValue(key);
    assert.strictEqual(
      res,
      subExpected,
      `setProperty("${property}", undefined) does not change the value of ${key}`
    );
  }

  style.setProperty(property, null);
  res = style.getPropertyValue(property);
  assert.strictEqual(res, "", `setProperty("${property}", null)`);
  for (const [key] of sub) {
    res = style.getPropertyValue(key);
    assert.strictEqual(
      res,
      "",
      `setProperty("${property}", null) implicitly changes the value of ${key}`
    );
  }

  for (const key of sub.keys()) {
    style.setProperty(property, value);
    style.setProperty(key, "var(--foo)");
    res = style.getPropertyValue(property);
    assert.strictEqual(
      res,
      "",
      `setProperty("${key}", "var(--foo)") implicitly changes the value of ${property}`
    );
    style.setProperty(property, null);
  }

  style[property] = value;
  res = style[property];
  assert.strictEqual(res, expected, `set["${property}"] = '${value}'`);
  for (const [key, subExpected] of sub) {
    res = style.getPropertyValue(key);
    assert.strictEqual(
      res,
      subExpected,
      `set["${property}"] = '${value}' implicitly changes the value of ${key}`
    );
  }

  style[property] = undefined;
  res = style[property];
  assert.strictEqual(res, expected, `set["${property}"] = undefined`);
  for (const [key, subExpected] of sub) {
    res = style.getPropertyValue(key);
    assert.strictEqual(
      res,
      subExpected,
      `set["${property}"] = undefined does not change the value of ${key}`
    );
  }

  style[property] = null;
  res = style[property];
  assert.strictEqual(res, "", `set["${property}"] = null`);
  for (const [key] of sub) {
    res = style.getPropertyValue(key);
    assert.strictEqual(res, "", `set["${property}"] = null implicitly changes the value of ${key}`);
  }
}

describe("CSSStyleDeclaration", () => {
  it("has methods", () => {
    const style = new CSSStyleDeclaration(window);
    assert.strictEqual(typeof style.item, "function");
    assert.strictEqual(typeof style.getPropertyValue, "function");
    assert.strictEqual(typeof style.setProperty, "function");
    assert.strictEqual(typeof style.getPropertyPriority, "function");
    assert.strictEqual(typeof style.removeProperty, "function");
  });

  it("has attributes", () => {
    const style = new CSSStyleDeclaration(window);
    assert.ok(style.__lookupGetter__("cssText"));
    assert.ok(style.__lookupSetter__("cssText"));
    assert.ok(style.__lookupGetter__("length"));
    assert.ok(style.__lookupSetter__("length"));
    assert.ok(style.__lookupGetter__("parentRule"));
  });

  it("sets internals for Element", () => {
    const node = {
      nodeType: 1,
      style: {},
      ownerDocument: {
        defaultView: window
      }
    };
    let callCount = 0;
    const callback = () => {
      callCount++;
    };
    const style = new CSSStyleDeclaration(window, {
      context: node,
      onChange: callback
    });
    style.cssText = "color: green;";
    assert.strictEqual(callCount, 1);
  });

  it("sets internals for CSSRule", () => {
    const rule = {
      parentRule: {},
      parentStyleSheet: {
        ownerDocument: {
          defaultView: {
            DOMException: window.DOMException
          }
        }
      }
    };
    const style = new CSSStyleDeclaration(window, {
      context: rule
    });
    assert.deepEqual(style.parentRule, rule);
  });

  it("has format in internal options", () => {
    const style = new CSSStyleDeclaration(window, {
      foo: "bar"
    });
    assert.deepEqual(style._options, {
      format: "specifiedValue"
    });
  });

  it("should not override format if exists", () => {
    const style = new CSSStyleDeclaration(window, {
      format: "computedValue"
    });
    assert.deepEqual(style._options, {
      format: "computedValue"
    });
  });

  it("getting cssText returns empty string if computed flag is set", () => {
    const style = new CSSStyleDeclaration(window, {
      format: "computedValue"
    });
    style.cssText = "color: red;";
    assert.strictEqual(style.cssText, "");
  });

  it("setting improper css to cssText should not throw", () => {
    const style = new CSSStyleDeclaration(window);
    style.cssText = "color: ";
    assert.strictEqual(style.cssText, "");
    style.cssText = "color: red!";
    assert.strictEqual(style.cssText, "");
  });

  it("item() throws if argument is not given", () => {
    const style = new CSSStyleDeclaration(window);
    assert.throws(
      () => {
        style.item();
      },
      (e) => {
        assert.strictEqual(e instanceof window.TypeError, true);
        assert.strictEqual(e.message, "1 argument required, but only 0 present.");
        return true;
      }
    );
  });

  it("camelcase properties are not assigned with setproperty()", () => {
    const style = new CSSStyleDeclaration(window);
    style.setProperty("fontSize", "12px");
    assert.strictEqual(style.cssText, "");
  });

  it("custom properties are case-sensitive", () => {
    const style = new CSSStyleDeclaration(window);
    style.cssText = "--fOo: purple";
    assert.strictEqual(style.getPropertyValue("--foo"), "");
    assert.strictEqual(style.getPropertyValue("--fOo"), "purple");
  });

  it("getPropertyValue for custom properties in cssText", () => {
    const style = new CSSStyleDeclaration(window);
    style.cssText = "--foo: red";
    assert.strictEqual(style.getPropertyValue("--foo"), "red");
  });

  it("getPropertyValue for custom properties with setProperty", () => {
    const style = new CSSStyleDeclaration(window);
    style.setProperty("--bar", "blue");
    assert.strictEqual(style.getPropertyValue("--bar"), "blue");
  });

  it("getPropertyValue for custom properties with object setter", () => {
    const style = new CSSStyleDeclaration(window);
    style["--baz"] = "yellow";
    assert.strictEqual(style.getPropertyValue("--baz"), "");
  });

  it("getPropertyPriority for property", () => {
    const style = new CSSStyleDeclaration(window);
    style.setProperty("color", "green", "important");
    assert.strictEqual(style.getPropertyPriority("color"), "important");
  });

  it("getPropertyPriority for custom property", () => {
    const style = new CSSStyleDeclaration(window);
    style.setProperty("--foo", "green", "important");
    assert.strictEqual(style.getPropertyPriority("--foo"), "important");
  });
});

describe("properties", () => {
  it("is instanceof CSSStyleDeclaration", () => {
    const style = new CSSStyleDeclaration(window);
    assert.strictEqual(style instanceof CSSStyleDeclaration, true);
  });

  it("all dashed properties are included in propertyDefinitions", () => {
    const style = new CSSStyleDeclaration(window);
    for (const i in style) {
      if (/^[a-z]+(?:-[a-z]+)*$/.test(i)) {
        assert.strictEqual(propertyDefinitions.has(i), true, i);
      }
    }
  });

  it("has camelCased property for dashed property", () => {
    const style = new CSSStyleDeclaration(window);
    for (const i in style) {
      if (/^[a-z]+(?:-[a-z]+)*$/.test(i)) {
        const camel = camelize.dashedToCamelCase(i);
        assert.ok(style[camel] !== undefined, i);
      }
    }
  });

  // FIXME: https://github.com/jsdom/cssstyle/issues/210
  it.skip("all webkit prefixed properties are included in propertyDefinitions", () => {
    const style = new CSSStyleDeclaration(window);
    for (const i in style) {
      if (/^-webkit-[a-z]+(?:-[a-z]+)*$/.test(i)) {
        assert.strictEqual(propertyDefinitions.has(i), true, i);
      }
    }
  });

  it("has camelCased property for webkit prefixed property", () => {
    const style = new CSSStyleDeclaration(window);
    for (const i in style) {
      if (/^-webkit-[a-z]+(?:-[a-z]+)*$/.test(i)) {
        const camel = camelize.dashedToCamelCase(i);
        assert.ok(style[camel] !== undefined, i);
      }
    }
  });

  it("has PascalCased property for webkit prefixed property", () => {
    const style = new CSSStyleDeclaration(window);
    for (const i in style) {
      if (/^webkit[A-Z]/.test(i)) {
        const pascal = i.replace(/^webkit/, "Webkit");
        assert.ok(style[pascal] !== undefined);
      }
    }
  });

  it("from style string", () => {
    const style = new CSSStyleDeclaration(window);
    style.cssText = "color: blue; background-color: red; width: 78%; height: 50vh;";
    assert.strictEqual(style.length, 4);
    assert.strictEqual(
      style.cssText,
      "color: blue; background-color: red; width: 78%; height: 50vh;"
    );
    assert.strictEqual(style.getPropertyValue("color"), "blue");
    assert.strictEqual(style.item(0), "color");
    assert.strictEqual(style[1], "background-color");
    assert.strictEqual(style.backgroundColor, "red");
    style.cssText = "";
    assert.strictEqual(style.cssText, "");
    assert.strictEqual(style.length, 0);
  });

  it("from properties", () => {
    const style = new CSSStyleDeclaration(window);
    style.color = "blue";
    assert.strictEqual(style.length, 1);
    assert.strictEqual(style[0], "color");
    assert.strictEqual(style.cssText, "color: blue;");
    assert.strictEqual(style.item(0), "color");
    assert.strictEqual(style.color, "blue");
    style.backgroundColor = "red";
    assert.strictEqual(style.length, 2);
    assert.strictEqual(style[0], "color");
    assert.strictEqual(style[1], "background-color");
    assert.strictEqual(style.cssText, "color: blue; background-color: red;");
    assert.strictEqual(style.backgroundColor, "red");
    style.removeProperty("color");
    assert.strictEqual(style[0], "background-color");
  });

  it("ignores invalid properties", () => {
    const node = {
      nodeType: 1,
      style: {},
      ownerDocument: {
        defaultView: window
      }
    };
    const style = new CSSStyleDeclaration(window, {
      context: node
    });
    style.cssText = "color: green; color: invalid!; background: blue;";
    // ignores invalid properties
    assert.strictEqual(style.cssText, "color: green; background: blue;");
  });

  it("keeps the last one of the same property", () => {
    const node = {
      nodeType: 1,
      style: {},
      ownerDocument: {
        defaultView: window
      }
    };
    const style = new CSSStyleDeclaration(window, {
      context: node
    });
    // only valid properties
    style.cssText = "color: olivedrab; color: peru; background: bisque;";
    // keeps the last one of the same property
    assert.strictEqual(style.cssText, "color: peru; background: bisque;");
  });

  it("ignores the nested selector rule", () => {
    const node = {
      nodeType: 1,
      style: {},
      ownerDocument: {
        defaultView: window
      }
    };
    const style = new CSSStyleDeclaration(window, {
      context: node
    });
    // valid property followed by a nested selector rule
    style.cssText = "color: olivedrab; &.d { color: peru; }";
    // ignores the nested selector rule
    assert.strictEqual(style.cssText, "color: olivedrab;");
  });

  it("ignores the property immediately after the nested rule", () => {
    const node = {
      nodeType: 1,
      style: {},
      ownerDocument: {
        defaultView: window
      }
    };
    const style = new CSSStyleDeclaration(window, {
      context: node
    });
    // valid property followed by a nested selector rule followed by two valid properties and an invalid property
    style.cssText =
      "color: olivedrab; &.d { color: peru; } color: green; background: red; invalid: rule;";
    // ignores the property immediately after the nested rule
    assert.strictEqual(style.cssText, "color: olivedrab; background: red;");
  });

  it("includes the the property immediately after an at-rule", () => {
    const node = {
      nodeType: 1,
      style: {},
      ownerDocument: {
        defaultView: window
      }
    };
    const style = new CSSStyleDeclaration(window, {
      context: node
    });
    // valid property followed by a at-rule followed by a valid property
    style.cssText = "color: blue; @media screen { color: red; } color: orange;";
    // includes the the property immediately after an at-rule
    assert.strictEqual(style.cssText, "color: orange;");
  });

  it("ignores the first property found after the nested selector rule along with the at-rules", () => {
    const node = {
      nodeType: 1,
      style: {},
      ownerDocument: {
        defaultView: window
      }
    };
    const style = new CSSStyleDeclaration(window, {
      context: node
    });
    // valid property followed by a nested rule, two at-rules and two valid properties
    style.cssText = `
      color: blue;
      &.d { color: peru; }
      @media screen { color: red; }
      @layer { color: black; }
      color: pink;
      background: orange;`;
    // ignores the first property found after the nested selector rule along with the at-rules
    assert.strictEqual(style.cssText, "color: blue; background: orange;");
  });

  it("shorthand properties", () => {
    const style = new CSSStyleDeclaration(window);
    style.background = "blue url(http://www.example.com/some_img.jpg)";
    assert.strictEqual(style.backgroundColor, "blue");
    assert.strictEqual(style.backgroundImage, 'url("http://www.example.com/some_img.jpg")');
    assert.strictEqual(style.background, 'url("http://www.example.com/some_img.jpg") blue');
    style.border = "0 solid black";
    assert.strictEqual(style.borderWidth, "0px");
    assert.strictEqual(style.borderStyle, "solid");
    assert.strictEqual(style.borderColor, "black");
    assert.strictEqual(style.borderTopWidth, "0px");
    assert.strictEqual(style.borderLeftStyle, "solid");
    assert.strictEqual(style.borderBottomColor, "black");
    style.font = "12em monospace";
    assert.strictEqual(style.fontSize, "12em");
    assert.strictEqual(style.fontFamily, "monospace");
  });

  it("width and height properties and null and empty strings", () => {
    const style = new CSSStyleDeclaration(window);
    style.height = 6;
    assert.strictEqual(style.height, "");
    style.width = 0;
    assert.strictEqual(style.width, "0px");
    style.height = "34%";
    assert.strictEqual(style.height, "34%");
    style.height = "100vh";
    assert.strictEqual(style.height, "100vh");
    style.height = "100vw";
    assert.strictEqual(style.height, "100vw");
    style.height = "";
    assert.strictEqual(style.length, 1);
    assert.strictEqual(style.cssText, "width: 0px;");
    style.width = null;
    assert.strictEqual(style.length, 0);
    assert.strictEqual(style.cssText, "");
  });

  it("implicit properties", () => {
    const style = new CSSStyleDeclaration(window);
    style.borderWidth = 0;
    assert.strictEqual(style.border, "");
    assert.strictEqual(style.borderWidth, "0px");
    assert.strictEqual(style.borderTopWidth, "0px");
    assert.strictEqual(style.borderBottomWidth, "0px");
    assert.strictEqual(style.borderLeftWidth, "0px");
    assert.strictEqual(style.borderRightWidth, "0px");
    assert.strictEqual(style.cssText, "border-width: 0px;");
  });

  it("top, left, right, bottom properties", () => {
    const style = new CSSStyleDeclaration(window);
    style.top = 0;
    style.left = "0%";
    style.right = "5em";
    style.bottom = "12pt";
    assert.strictEqual(style.top, "0px");
    assert.strictEqual(style.left, "0%");
    assert.strictEqual(style.right, "5em");
    assert.strictEqual(style.bottom, "12pt");
    assert.strictEqual(style.length, 4);
    assert.strictEqual(style.cssText, "top: 0px; left: 0%; right: 5em; bottom: 12pt;");
  });

  it('top, left, right, bottom properties should accept "auto"', () => {
    const style = new CSSStyleDeclaration(window);
    style.cssText = `top: auto; right: auto; bottom: auto; left: auto;`;
    assert.strictEqual(style.top, "auto");
    assert.strictEqual(style.right, "auto");
    assert.strictEqual(style.bottom, "auto");
    assert.strictEqual(style.left, "auto");
  });

  it("clear and clip properties", () => {
    const style = new CSSStyleDeclaration(window);
    style.clear = "none";
    assert.strictEqual(style.clear, "none");
    style.clear = "lfet";
    assert.strictEqual(style.clear, "none");
    style.clear = "left";
    assert.strictEqual(style.clear, "left");
    style.clear = "right";
    assert.strictEqual(style.clear, "right");
    style.clear = "both";
    assert.strictEqual(style.clear, "both");
    style.clip = "elipse(5px, 10px)";
    assert.strictEqual(style.clip, "");
    assert.strictEqual(style.length, 1);
    style.clip = "rect(0, 3Em, 2pt, 5px)";
    assert.strictEqual(style.clip, "rect(0px, 3em, 2pt, 5px)");
    assert.strictEqual(style.length, 2);
    assert.strictEqual(style.cssText, "clear: both; clip: rect(0px, 3em, 2pt, 5px);");
  });

  it("colors", () => {
    const style = new CSSStyleDeclaration(window);
    style.color = "rgba(0,0,0,0)";
    assert.strictEqual(style.color, "rgba(0, 0, 0, 0)");
    style.color = "rgba(5%, 10%, 20%, 0.4)";
    assert.strictEqual(style.color, "rgba(13, 26, 51, 0.4)");
    style.color = "rgb(33%, 34%, 33%)";
    assert.strictEqual(style.color, "rgb(84, 87, 84)");
    style.color = "rgba(300, 200, 100, 1.5)";
    assert.strictEqual(style.color, "rgb(255, 200, 100)");
    style.color = "hsla(0, 1%, 2%, 0.5)";
    assert.strictEqual(style.color, "rgba(5, 5, 5, 0.5)");
    style.color = "hsl(0, 1%, 2%)";
    assert.strictEqual(style.color, "rgb(5, 5, 5)");
    style.color = "rebeccapurple";
    assert.strictEqual(style.color, "rebeccapurple");
    style.color = "transparent";
    assert.strictEqual(style.color, "transparent");
    style.color = "currentcolor";
    assert.strictEqual(style.color, "currentcolor");
    style.color = "#ffffffff";
    assert.strictEqual(style.color, "rgb(255, 255, 255)");
    style.color = "#fffa";
    assert.strictEqual(style.color, "rgba(255, 255, 255, 0.667)");
    style.color = "#ffffff66";
    assert.strictEqual(style.color, "rgba(255, 255, 255, 0.4)");
  });

  it("invalid hex color value", () => {
    const style = new CSSStyleDeclaration(window);
    style.color = "#1234567";
    assert.strictEqual(style.color, "");
  });

  it("shorthand properties with embedded spaces", () => {
    let style = new CSSStyleDeclaration(window);
    style.background = "rgb(0, 0, 0) url(/something/somewhere.jpg)";
    assert.strictEqual(style.backgroundColor, "rgb(0, 0, 0)");
    assert.strictEqual(style.backgroundImage, 'url("/something/somewhere.jpg")');
    assert.strictEqual(style.cssText, 'background: url("/something/somewhere.jpg") rgb(0, 0, 0);');
    style = new CSSStyleDeclaration(window);
    style.border = "  1px  solid   black  ";
    assert.strictEqual(style.border, "1px solid black");
  });

  it("setting shorthand properties to an empty string should clear all dependent properties", () => {
    const style = new CSSStyleDeclaration(window);
    style.borderWidth = "1px";
    assert.strictEqual(style.cssText, "border-width: 1px;");
    style.border = "";
    assert.strictEqual(style.cssText, "");
  });

  it("setting implicit properties to an empty string should clear all dependent properties", () => {
    const style = new CSSStyleDeclaration(window);
    style.borderTopWidth = "1px";
    assert.strictEqual(style.cssText, "border-top-width: 1px;");
    style.borderWidth = "";
    assert.strictEqual(style.cssText, "");
  });

  it("setting a shorthand property, whose shorthands are implicit properties, to an empty string should clear all dependent properties", () => {
    const style = new CSSStyleDeclaration(window);
    style.borderTopWidth = "2px";
    assert.strictEqual(style.cssText, "border-top-width: 2px;");
    style.border = "";
    assert.strictEqual(style.cssText, "");
    style.borderTop = "2px solid black";
    assert.strictEqual(style.cssText, "border-top: 2px solid black;");
    style.border = "";
    assert.strictEqual(style.cssText, "");
  });

  it("set border as none", () => {
    const style = new CSSStyleDeclaration(window);
    style.border = "none";
    assert.strictEqual(style.border, "medium", "border");
    assert.strictEqual(style.borderWidth, "medium", "border-width");
    assert.strictEqual(style.borderStyle, "none", "border-style");
    assert.strictEqual(style.borderTop, "medium", "border-top");
    assert.strictEqual(style.borderTopWidth, "medium", "border-top-width");
    assert.strictEqual(style.borderTopStyle, "none", "border-top-style");
    assert.strictEqual(style.borderImage, "none", "border-image");
    assert.strictEqual(style.cssText, "border: medium;", "cssText");
  });

  it("set border as none", () => {
    const style = new CSSStyleDeclaration(window);
    style.border = "none";
    assert.strictEqual(style.border, "medium", "border");
    assert.strictEqual(style.borderWidth, "medium", "border-width");
    assert.strictEqual(style.borderStyle, "none", "border-style");
    assert.strictEqual(style.borderTop, "medium", "border-top");
    assert.strictEqual(style.borderTopWidth, "medium", "border-top-width");
    assert.strictEqual(style.borderTopStyle, "none", "border-top-style");
    assert.strictEqual(style.borderImage, "none", "border-image");
    assert.strictEqual(style.cssText, "border: medium;", "cssText");
  });

  it("set border-style as none", () => {
    const style = new CSSStyleDeclaration(window);
    style.borderStyle = "none";
    assert.strictEqual(style.border, "", "border");
    assert.strictEqual(style.borderWidth, "", "border-width");
    assert.strictEqual(style.borderStyle, "none", "border-style");
    assert.strictEqual(style.borderTop, "", "border-top");
    assert.strictEqual(style.borderTopWidth, "", "border-top-width");
    assert.strictEqual(style.borderTopStyle, "none", "border-top-style");
    assert.strictEqual(style.borderImage, "", "border-image");
    assert.strictEqual(style.cssText, "border-style: none;", "cssText");
  });

  it("set border-top as none", () => {
    const style = new CSSStyleDeclaration(window);
    style.borderTop = "none";
    assert.strictEqual(style.border, "", "border");
    assert.strictEqual(style.borderWidth, "", "border-width");
    assert.strictEqual(style.borderStyle, "", "border-style");
    assert.strictEqual(style.borderTop, "medium", "border-top");
    assert.strictEqual(style.borderTopStyle, "none", "border-top-style");
    assert.strictEqual(style.borderTopWidth, "medium", "border-top-width");
    assert.strictEqual(style.borderImage, "", "border-image");
    assert.strictEqual(style.cssText, "border-top: medium;", "cssText");
  });

  it("set border as 1px and change border-style to none", () => {
    const style = new CSSStyleDeclaration(window);
    style.border = "1px";
    style.borderStyle = "none";
    assert.strictEqual(style.border, "1px", "border");
    assert.strictEqual(style.borderWidth, "1px", "border-width");
    assert.strictEqual(style.borderStyle, "none", "border-style");
    assert.strictEqual(style.borderTop, "1px", "border-top");
    assert.strictEqual(style.borderTopWidth, "1px", "border-top-width");
    assert.strictEqual(style.borderTopStyle, "none", "border-top-style");
    assert.strictEqual(style.borderImage, "none", "border-image");
    assert.strictEqual(style.cssText, "border: 1px;", "cssText");
  });

  it("set border as 1px and change border-style to none", () => {
    const style = new CSSStyleDeclaration(window);
    style.border = "1px";
    style.borderStyle = "none";
    assert.strictEqual(style.border, "1px", "border");
    assert.strictEqual(style.borderWidth, "1px", "border-width");
    assert.strictEqual(style.borderStyle, "none", "border-style");
    assert.strictEqual(style.borderTop, "1px", "border-top");
    assert.strictEqual(style.borderTopWidth, "1px", "border-top-width");
    assert.strictEqual(style.borderTopStyle, "none", "border-top-style");
    assert.strictEqual(style.borderImage, "none", "border-image");
    assert.strictEqual(style.cssText, "border: 1px;", "cssText");
  });

  it("set border as 1px and change border-top to none", () => {
    const style = new CSSStyleDeclaration(window);
    style.border = "1px";
    style.borderTop = "none";
    assert.strictEqual(style.border, "", "border");
    assert.strictEqual(style.borderWidth, "medium 1px 1px", "border-width");
    assert.strictEqual(style.borderStyle, "none", "border-style");
    assert.strictEqual(style.borderTop, "medium", "border-top");
    assert.strictEqual(style.borderTopWidth, "medium", "border-top-width");
    assert.strictEqual(style.borderTopStyle, "none", "border-top-style");
    assert.strictEqual(style.borderImage, "none", "border-image");
    assert.strictEqual(
      style.cssText,
      "border-width: medium 1px 1px; border-style: none; border-color: currentcolor; border-image: none;",
      "cssText"
    );
  });

  it("set border as 1px solid and change border-top to none", () => {
    const style = new CSSStyleDeclaration(window);
    style.border = "1px solid";
    style.borderTop = "none";
    assert.strictEqual(style.border, "", "border");
    assert.strictEqual(style.borderWidth, "medium 1px 1px", "border-width");
    assert.strictEqual(style.borderStyle, "none solid solid", "border-style");
    assert.strictEqual(style.borderTop, "medium", "border-top");
    assert.strictEqual(style.borderTopWidth, "medium", "border-top-width");
    assert.strictEqual(style.borderTopStyle, "none", "border-top-style");
    assert.strictEqual(style.borderImage, "none", "border-image");
    assert.strictEqual(
      style.cssText,
      "border-width: medium 1px 1px; border-style: none solid solid; border-color: currentcolor; border-image: none;",
      "cssText"
    );
  });

  it("set border as none and change border-style to null", () => {
    const style = new CSSStyleDeclaration(window);
    style.border = "none";
    style.borderStyle = null;
    assert.strictEqual(style.border, "", "border");
    assert.strictEqual(style.borderWidth, "medium", "border-width");
    assert.strictEqual(style.borderStyle, "", "border-style");
    assert.strictEqual(style.borderTop, "", "border-top");
    assert.strictEqual(style.borderTopWidth, "medium", "border-top-width");
    assert.strictEqual(style.borderTopStyle, "", "border-top-style");
    assert.strictEqual(style.borderImage, "none", "border-image");
    assert.strictEqual(
      style.cssText,
      "border-width: medium; border-color: currentcolor; border-image: none;",
      "cssText"
    );
  });

  it("set border as solid and change border-top to none", () => {
    const style = new CSSStyleDeclaration(window);
    style.border = "solid";
    style.borderTop = "none";
    assert.strictEqual(style.border, "", "border");
    assert.strictEqual(style.borderWidth, "medium", "border-width");
    assert.strictEqual(style.borderStyle, "none solid solid", "border-style");
    assert.strictEqual(style.borderTop, "medium", "border-top");
    assert.strictEqual(style.borderTopWidth, "medium", "border-top-width");
    assert.strictEqual(style.borderTopStyle, "none", "border-top-style");
    assert.strictEqual(style.borderImage, "none", "border-image");
    assert.strictEqual(
      style.cssText,
      "border-width: medium; border-style: none solid solid; border-color: currentcolor; border-image: none;",
      "cssText"
    );
  });

  it("set border as solid and change border-style to none", () => {
    const style = new CSSStyleDeclaration(window);
    style.border = "solid";
    style.borderStyle = "none";
    assert.strictEqual(style.border, "medium", "border");
    assert.strictEqual(style.borderWidth, "medium", "border-width");
    assert.strictEqual(style.borderStyle, "none", "border-style");
    assert.strictEqual(style.borderTop, "medium", "border-top");
    assert.strictEqual(style.borderTopWidth, "medium", "border-top-width");
    assert.strictEqual(style.borderTopStyle, "none", "border-top-style");
    assert.strictEqual(style.borderImage, "none", "border-image");
    assert.strictEqual(style.cssText, "border: medium;", "cssText");
  });

  it("set border-style as solid and change border-top to none", () => {
    const style = new CSSStyleDeclaration(window);
    style.borderStyle = "solid";
    style.borderTop = "none";
    assert.strictEqual(style.border, "", "border");
    assert.strictEqual(style.borderWidth, "", "border-width");
    assert.strictEqual(style.borderStyle, "none solid solid", "border-style");
    assert.strictEqual(style.borderTop, "medium", "border-top");
    assert.strictEqual(style.borderTopWidth, "medium", "border-top-width");
    assert.strictEqual(style.borderTopStyle, "none", "border-top-style");
    assert.strictEqual(style.borderImage, "", "border-image");
    assert.strictEqual(
      style.cssText,
      "border-style: none solid solid; border-top-width: medium; border-top-color: currentcolor;",
      "cssText"
    );
  });

  it("set border-top as solid and change border-style to none", () => {
    const style = new CSSStyleDeclaration(window);
    style.borderTop = "solid";
    style.borderStyle = "none";
    assert.strictEqual(style.border, "", "border");
    assert.strictEqual(style.borderWidth, "", "border-width");
    assert.strictEqual(style.borderStyle, "none", "border-style");
    assert.strictEqual(style.borderTop, "medium", "border-top");
    assert.strictEqual(style.borderTopWidth, "medium", "border-top-width");
    assert.strictEqual(style.borderTopStyle, "none", "border-top-style");
    assert.strictEqual(style.borderImage, "", "border-image");
    assert.strictEqual(
      style.cssText,
      "border-top-width: medium; border-top-color: currentcolor; border-style: none;",
      "cssText"
    );
  });

  it("set border-style as solid and change border-top to null", () => {
    const style = new CSSStyleDeclaration(window);
    style.borderStyle = "solid";
    style.borderTop = null;
    assert.strictEqual(
      style.cssText,
      "border-right-style: solid; border-bottom-style: solid; border-left-style: solid;",
      "cssText"
    );
    assert.strictEqual(style.border, "", "border");
    assert.strictEqual(style.borderWidth, "", "border-width");
    assert.strictEqual(style.borderStyle, "", "border-style");
    assert.strictEqual(style.borderTop, "", "border-top");
    assert.strictEqual(style.borderTopWidth, "", "border-top-width");
    assert.strictEqual(style.borderTopStyle, "", "border-top-style");
    assert.strictEqual(style.borderImage, "", "border-image");
  });

  it("setting border values to none should change dependent values", () => {
    const style = new CSSStyleDeclaration(window);
    style.borderTopWidth = "1px";
    assert.strictEqual(style.cssText, "border-top-width: 1px;");
    style.border = "none";
    assert.strictEqual(style.border, "medium");
    assert.strictEqual(style.borderTop, "medium");
    assert.strictEqual(style.borderTopStyle, "none");
    assert.strictEqual(style.borderTopWidth, "medium");
    assert.strictEqual(style.cssText, "border: medium;");

    style.border = null;
    style.borderImage = null;
    style.borderTopWidth = "1px";
    assert.strictEqual(style.cssText, "border-top-width: 1px;");
    style.borderStyle = "none";
    assert.strictEqual(style.borderTopStyle, "none");
    assert.strictEqual(style.borderTopWidth, "1px");
    assert.strictEqual(style.cssText, "border-top-width: 1px; border-style: none;");

    style.border = null;
    style.borderImage = null;
    style.borderTopWidth = "1px";
    assert.strictEqual(style.cssText, "border-top-width: 1px;");
    style.borderTop = "none";
    assert.strictEqual(style.borderTopStyle, "none");
    assert.strictEqual(style.borderTopWidth, "medium");
    assert.strictEqual(style.cssText, "border-top: medium;");

    style.border = null;
    style.borderImage = null;
    style.borderTopWidth = "1px";
    assert.strictEqual(style.cssText, "border-top-width: 1px;");
    style.borderTopStyle = "none";
    assert.strictEqual(style.borderTopStyle, "none");
    assert.strictEqual(style.borderTopWidth, "1px");
    assert.strictEqual(style.cssText, "border-top-width: 1px; border-top-style: none;");

    style.border = null;
    style.borderImage = null;
    style.border = "1px";
    assert.strictEqual(style.cssText, "border: 1px;");
    assert.strictEqual(style.border, "1px");
    assert.strictEqual(style.borderTopStyle, "none");
    assert.strictEqual(style.borderTopWidth, "1px");
    style.borderTop = "none";
    assert.strictEqual(
      style.cssText,
      "border-width: medium 1px 1px; border-style: none; border-color: currentcolor; border-image: none;"
    );
  });

  it("setting border to green", () => {
    const style = new CSSStyleDeclaration(window);
    style.border = "green";
    assert.strictEqual(style.cssText, "border: green;");
    assert.strictEqual(style.border, "green");
  });

  it("setting border to green", () => {
    const style = new CSSStyleDeclaration(window);
    style.border = "green";
    assert.strictEqual(style.cssText, "border: green;");
    assert.strictEqual(style.border, "green");
  });

  it("setting border to initial should set all properties initial", () => {
    const style = new CSSStyleDeclaration(window);
    style.border = "initial";
    assert.strictEqual(style.cssText, "border: initial;");
    assert.strictEqual(style.border, "initial");
    assert.strictEqual(style.borderWidth, "initial");
    assert.strictEqual(style.borderStyle, "initial");
    assert.strictEqual(style.borderColor, "initial");
    assert.strictEqual(style.borderTop, "initial");
    assert.strictEqual(style.borderTopWidth, "initial");
    assert.strictEqual(style.borderTopStyle, "initial");
    assert.strictEqual(style.borderTopColor, "initial");
    assert.strictEqual(style.borderImage, "none");
  });

  it("setting borderTop to initial should set top related properties initial", () => {
    const style = new CSSStyleDeclaration(window);
    style.borderTop = "initial";
    assert.strictEqual(style.cssText, "border-top: initial;");
    assert.strictEqual(style.border, "");
    assert.strictEqual(style.borderWidth, "");
    assert.strictEqual(style.borderStyle, "");
    assert.strictEqual(style.borderColor, "");
    assert.strictEqual(style.borderTop, "initial");
    assert.strictEqual(style.borderTopWidth, "initial");
    assert.strictEqual(style.borderTopStyle, "initial");
    assert.strictEqual(style.borderTopColor, "initial");
    assert.strictEqual(style.borderImage, "");
  });

  it("setting border to 0 should be okay", () => {
    const style = new CSSStyleDeclaration(window);
    style.border = 0;
    assert.strictEqual(style.cssText, "border: 0px;");
    assert.strictEqual(style.border, "0px");
  });

  it("setting borderColor to var() should be okay", () => {
    const style = new CSSStyleDeclaration(window);
    style.borderColor = "var(--foo)";
    assert.strictEqual(style.cssText, "border-color: var(--foo);");
  });

  it("setting borderColor to inherit should be okay", () => {
    const style = new CSSStyleDeclaration(window);
    style.borderColor = "inherit";
    assert.strictEqual(style.cssText, "border-color: inherit;");
  });

  it("setting values implicit and shorthand properties via csstext and setproperty should propagate to dependent properties", () => {
    const style = new CSSStyleDeclaration(window);
    style.cssText = "border: 1px solid black;";
    assert.strictEqual(style.cssText, "border: 1px solid black;");
    assert.strictEqual(style.borderTop, "1px solid black");
    style.border = "";
    assert.strictEqual(style.cssText, "");
    style.setProperty("border", "1px solid black");
    assert.strictEqual(style.cssText, "border: 1px solid black;");
  });

  it("setting opacity should work", () => {
    const style = new CSSStyleDeclaration(window);
    style.setProperty("opacity", 0.75);
    assert.strictEqual(style.cssText, "opacity: 0.75;");
    style.opacity = "0.50";
    assert.strictEqual(style.cssText, "opacity: 0.5;");
    style.opacity = 1;
    assert.strictEqual(style.cssText, "opacity: 1;");
  });

  it("width and height of auto should work", () => {
    let style = new CSSStyleDeclaration(window);
    style.width = "auto";
    assert.strictEqual(style.cssText, "width: auto;");
    assert.strictEqual(style.width, "auto");
    style = new CSSStyleDeclaration(window);
    style.height = "auto";
    assert.strictEqual(style.cssText, "height: auto;");
    assert.strictEqual(style.height, "auto");
  });

  it("Shorthand serialization with just longhands", () => {
    const style = new CSSStyleDeclaration(window);
    style.cssText = "margin-right: 10px; margin-left: 10px; margin-top: 10px; margin-bottom: 10px;";
    assert.strictEqual(style.cssText, "margin: 10px;");
    assert.strictEqual(style.margin, "10px");

    style.cssText =
      "margin-right: 10px; margin-left: 10px; margin-top: 10px; margin-bottom: 10px!important;";
    assert.strictEqual(
      style.cssText,
      "margin-right: 10px; margin-left: 10px; margin-top: 10px; margin-bottom: 10px !important;"
    );
    assert.strictEqual(style.margin, "");

    style.cssText =
      "margin-right: 10px !important; margin-left: 10px !important; margin-top: 10px !important; margin-bottom: 10px!important;";
    assert.strictEqual(style.cssText, "margin: 10px !important;");
    assert.strictEqual(style.margin, "10px");
  });

  it("padding and margin should set/clear shorthand properties", () => {
    const style = new CSSStyleDeclaration(window);
    const parts = ["Top", "Right", "Bottom", "Left"];
    const testParts = function (name, v, V) {
      style[name] = v;
      for (let i = 0; i < 4; i++) {
        const part = name + parts[i];
        assert.strictEqual(style[part], V[i]);
      }

      assert.strictEqual(style[name], v);
      style[name] = "";
    };
    testParts("padding", "1px", ["1px", "1px", "1px", "1px"]);
    testParts("padding", "1px 2%", ["1px", "2%", "1px", "2%"]);
    testParts("padding", "1px 2px 3px", ["1px", "2px", "3px", "2px"]);
    testParts("padding", "1px 2px 3px 4px", ["1px", "2px", "3px", "4px"]);
    style.paddingTop = style.paddingRight = style.paddingBottom = style.paddingLeft = "1px";
    testParts("padding", "", ["", "", "", ""]);
    testParts("margin", "1px", ["1px", "1px", "1px", "1px"]);
    testParts("margin", "1px auto", ["1px", "auto", "1px", "auto"]);
    testParts("margin", "1px 2% 3px", ["1px", "2%", "3px", "2%"]);
    testParts("margin", "1px 2px 3px 4px", ["1px", "2px", "3px", "4px"]);
    style.marginTop = style.marginRight = style.marginBottom = style.marginLeft = "1px";
    testParts("margin", "", ["", "", "", ""]);
  });

  it("padding and margin shorthands should set main properties", () => {
    const style = new CSSStyleDeclaration(window);
    const parts = ["Top", "Right", "Bottom", "Left"];
    const testParts = function (name, v, V) {
      let expected;
      for (let i = 0; i < 4; i++) {
        style[name] = v;
        style[name + parts[i]] = V;
        expected = v.split(/ /);
        expected[i] = V;
        expected = expected.join(" ");

        assert.strictEqual(style[name], expected);
      }
    };
    testParts("padding", "1px 2px 3px 4px", "10px");
    testParts("margin", "1px 2px 3px 4px", "10px");
    testParts("margin", "1px 2px 3px 4px", "auto");
  });

  it("setting individual padding and margin properties to an empty string should clear them", () => {
    const style = new CSSStyleDeclaration(window);

    const properties = ["padding", "margin"];
    const parts = ["Top", "Right", "Bottom", "Left"];
    for (let i = 0; i < properties.length; i++) {
      for (let j = 0; j < parts.length; j++) {
        const property = properties[i] + parts[j];
        style[property] = "12px";
        assert.strictEqual(style[property], "12px");

        style[property] = "";
        assert.strictEqual(style[property], "");
      }
    }
  });

  it("removing and setting individual margin properties updates the combined property accordingly", () => {
    const style = new CSSStyleDeclaration(window);
    style.margin = "1px 2px 3px 4px";
    style.marginTop = "";
    assert.strictEqual(style.margin, "");
    assert.strictEqual(style.marginRight, "2px");
    assert.strictEqual(style.marginBottom, "3px");
    assert.strictEqual(style.marginLeft, "4px");

    style.marginBottom = "";
    assert.strictEqual(style.margin, "");
    assert.strictEqual(style.marginRight, "2px");
    assert.strictEqual(style.marginLeft, "4px");

    style.marginBottom = "5px";
    assert.strictEqual(style.margin, "");
    assert.strictEqual(style.marginRight, "2px");
    assert.strictEqual(style.marginBottom, "5px");
    assert.strictEqual(style.marginLeft, "4px");

    style.marginTop = "6px";
    assert.strictEqual(style.cssText, "margin: 6px 2px 5px 4px;");
  });

  for (const property of ["padding", "margin"]) {
    it(`removing an individual ${property} property should remove the combined property and replace it with the remaining individual ones`, () => {
      const style = new CSSStyleDeclaration(window);
      const parts = ["Top", "Right", "Bottom", "Left"];
      const partValues = ["1px", "2px", "3px", "4px"];

      for (let j = 0; j < parts.length; j++) {
        const partToRemove = parts[j];
        style[property] = partValues.join(" ");
        style[property + partToRemove] = "";

        // Main property should have been removed
        assert.strictEqual(style[property], "");

        // Expect other parts to still be there
        for (let k = 0; k < parts.length; k++) {
          const propertyCss = `${property}-${parts[k].toLowerCase()}: ${partValues[k]};`;
          if (k === j) {
            assert.strictEqual(style[property + parts[k]], "");
            assert.strictEqual(style.cssText.includes(propertyCss), false);
          } else {
            assert.strictEqual(style[property + parts[k]], partValues[k]);
            assert.strictEqual(style.cssText.includes(propertyCss), true);
          }
        }
      }
    });

    it(`setting additional ${property} properties keeps important status of others`, () => {
      const style = new CSSStyleDeclaration(window);
      const importantProperty = `${property}-top: 3px !important;`;
      style.cssText = importantProperty;
      assert.strictEqual(style.cssText.includes(importantProperty), true);

      style[`${property}Right`] = "4px";
      style[`${property}Bottom`] = "5px";
      style[`${property}Left`] = "6px";
      assert.strictEqual(style.cssText.includes(importantProperty), true);
      assert.strictEqual(style.cssText.includes(`${property}-right: 4px;`), true);
      assert.strictEqual(style.cssText.includes(`${property}-bottom: 5px;`), true);
      assert.strictEqual(style.cssText.includes(`${property}-left: 6px;`), true);
      assert.strictEqual(style.cssText.includes("margin:"), false);
    });

    it(`setting individual ${property} keeps important status of others`, () => {
      const style = new CSSStyleDeclaration(window);
      style.cssText = `${property}: 3px !important;`;
      style[`${property}Top`] = "4px";
      assert.strictEqual(style.cssText.includes(`${property}-top: 4px;`), true);
      assert.strictEqual(style.cssText.includes(`${property}-right: 3px !important;`), true);
      assert.strictEqual(style.cssText.includes(`${property}-bottom: 3px !important;`), true);
      assert.strictEqual(style.cssText.includes(`${property}-left: 3px !important;`), true);
      assert.strictEqual(style.cssText.includes("margin:"), false);
    });
  }

  it("setting a value to 0 should return the string value", () => {
    const style = new CSSStyleDeclaration(window);
    style.setProperty("fill-opacity", 0);
    assert.strictEqual(style.fillOpacity, "0");
  });

  it("onchange callback should be called when the csstext changes", () => {
    const node = {
      nodeType: 1,
      style: {},
      ownerDocument: {
        defaultView: window
      }
    };
    let called = 0;
    const style = new CSSStyleDeclaration(window, {
      context: node,
      onChange: (cssText) => {
        called++;
        assert.strictEqual(cssText, "opacity: 0;");
      }
    });
    style.cssText = "opacity: 0;";
    assert.strictEqual(called, 1);
    style.cssText = "opacity: 0;";
    assert.strictEqual(called, 2);
  });

  it("onchange callback should be called only once when multiple properties were added", () => {
    const node = {
      nodeType: 1,
      style: {},
      ownerDocument: {
        defaultView: window
      }
    };
    let called = 0;
    const style = new CSSStyleDeclaration(window, {
      context: node,
      onChange: (cssText) => {
        called++;
        assert.strictEqual(cssText, "width: 100px; height: 100px;");
      }
    });
    style.cssText = "width: 100px;height:100px;";
    assert.strictEqual(called, 1);
  });

  it("onchange callback should not be called when property is set to the same value", () => {
    const node = {
      nodeType: 1,
      style: {},
      ownerDocument: {
        defaultView: window
      }
    };
    let called = 0;
    const style = new CSSStyleDeclaration(window, {
      context: node,
      onChange: () => {
        called++;
      }
    });

    style.setProperty("opacity", 0);
    assert.strictEqual(called, 1);
    style.setProperty("opacity", 0);
    assert.strictEqual(called, 1);
  });

  it("onchange callback should not be called when removeProperty was called on non-existing property", () => {
    const node = {
      nodeType: 1,
      style: {},
      ownerDocument: {
        defaultView: window
      }
    };
    let called = 0;
    const style = new CSSStyleDeclaration(window, {
      context: node,
      onChange: () => {
        called++;
      }
    });
    style.removeProperty("opacity");
    assert.strictEqual(called, 0);
  });

  it("setting improper css to csstext should not throw", () => {
    const style = new CSSStyleDeclaration(window);
    style.cssText = "color: ";
    assert.strictEqual(style.cssText, "");
    style.color = "black";
    style.cssText = "float: ";
    assert.strictEqual(style.cssText, "");
  });

  it("url parsing works with quotes", () => {
    const style = new CSSStyleDeclaration(window);
    style.backgroundImage = "url(http://some/url/here1.png)";
    assert.strictEqual(style.backgroundImage, 'url("http://some/url/here1.png")');
    style.backgroundImage = "url('http://some/url/here2.png')";
    assert.strictEqual(style.backgroundImage, 'url("http://some/url/here2.png")');
    style.backgroundImage = 'url("http://some/url/here3.png")';
    assert.strictEqual(style.backgroundImage, 'url("http://some/url/here3.png")');
  });

  it("setting 0 to a padding or margin works", () => {
    const style = new CSSStyleDeclaration(window);
    style.padding = 0;
    assert.strictEqual(style.cssText, "padding: 0px;");
    style.margin = "1em";
    style.marginTop = "0";
    assert.strictEqual(style.marginTop, "0px");
  });

  it("setting ex units to a padding or margin works", () => {
    const style = new CSSStyleDeclaration(window);
    style.padding = "1ex";
    assert.strictEqual(style.cssText, "padding: 1ex;");
    style.margin = "1em";
    style.marginTop = "0.5ex";
    assert.strictEqual(style.marginTop, "0.5ex");
  });

  it("setting empty string and null to a padding or margin works", () => {
    const style = new CSSStyleDeclaration(window);
    const parts = ["Top", "Right", "Bottom", "Left"];
    function testParts(base, nullValue) {
      const props = [base].concat(parts.map((part) => base + part));
      for (const prop of props) {
        assert.strictEqual(style[prop], "");
        style[prop] = "10px";
        assert.strictEqual(style[prop], "10px");
        style[prop] = nullValue;
        assert.strictEqual(style[prop], "");
      }
    }

    testParts("margin", "");
    testParts("margin", null);
    testParts("padding", "");
    testParts("padding", null);
  });

  it("setting undefined to a padding or margin does nothing", () => {
    const style = new CSSStyleDeclaration(window);
    const parts = ["Top", "Right", "Bottom", "Left"];
    function testParts(base) {
      const props = [base].concat(parts.map((part) => base + part));
      for (const prop of props) {
        style[prop] = "10px";
        assert.strictEqual(style[prop], "10px");
        style[prop] = undefined;
        assert.strictEqual(style[prop], "10px");
      }
    }

    testParts("margin");
    testParts("padding");
  });

  it("setting null to background works", () => {
    const style = new CSSStyleDeclaration(window);
    style.background = "red";
    assert.strictEqual(style.cssText, "background: red;");
    style.background = null;
    assert.strictEqual(style.cssText, "");
  });

  it("flex properties should keep their values", () => {
    const style = new CSSStyleDeclaration(window);
    style.flexDirection = "column";
    assert.strictEqual(style.cssText, "flex-direction: column;");
    style.flexDirection = "row";
    assert.strictEqual(style.cssText, "flex-direction: row;");
  });

  it("camelcase properties are not assigned with `.setproperty()`", () => {
    const style = new CSSStyleDeclaration(window);
    style.setProperty("fontSize", "12px");
    assert.strictEqual(style.cssText, "");
  });

  it("casing is ignored in `.setproperty()`", () => {
    const style = new CSSStyleDeclaration(window);
    style.setProperty("FoNt-SiZe", "12px");
    assert.strictEqual(style.fontSize, "12px");
    assert.strictEqual(style.getPropertyValue("font-size"), "12px");
  });

  it("support global keywords in border-spacing", () => {
    const style = new CSSStyleDeclaration(window);
    style.borderSpacing = "inherit";
    assert.strictEqual(style.cssText, "border-spacing: inherit;");
  });

  it("support 1 value in border-spacing", () => {
    const style = new CSSStyleDeclaration(window);
    style.borderSpacing = "1px";
    assert.strictEqual(style.cssText, "border-spacing: 1px;");
  });

  it("support 2 values in border-spacing", () => {
    const style = new CSSStyleDeclaration(window);
    style.borderSpacing = "1px 2px";
    assert.strictEqual(style.cssText, "border-spacing: 1px 2px;");
  });

  it("support non string entries in border-spacing", () => {
    const style = new CSSStyleDeclaration(window);
    style.borderSpacing = 0;
    assert.strictEqual(style.cssText, "border-spacing: 0px;");
  });

  it("float should be valid property for `.setproperty()`", () => {
    const style = new CSSStyleDeclaration(window);
    style.setProperty("float", "left");
    assert.strictEqual(style.float, "left");
    assert.strictEqual(style.getPropertyValue("float"), "left");
  });

  it("flex-shrink works", () => {
    const style = new CSSStyleDeclaration(window);
    style.setProperty("flex-shrink", 0);
    assert.strictEqual(style.getPropertyValue("flex-shrink"), "0");
    style.setProperty("flex-shrink", 1);
    assert.strictEqual(style.getPropertyValue("flex-shrink"), "1");
    assert.strictEqual(style.cssText, "flex-shrink: 1;");
  });

  it("flex-grow works", () => {
    const style = new CSSStyleDeclaration(window);
    style.setProperty("flex-grow", 2);
    assert.strictEqual(style.getPropertyValue("flex-grow"), "2");
    assert.strictEqual(style.cssText, "flex-grow: 2;");
  });

  it("flex-basis works", () => {
    const style = new CSSStyleDeclaration(window);
    style.setProperty("flex-basis", 0);
    assert.strictEqual(style.getPropertyValue("flex-basis"), "0px");
    style.setProperty("flex-basis", "250px");
    assert.strictEqual(style.getPropertyValue("flex-basis"), "250px");
    style.setProperty("flex-basis", "10em");
    assert.strictEqual(style.getPropertyValue("flex-basis"), "10em");
    style.setProperty("flex-basis", "30%");
    assert.strictEqual(style.getPropertyValue("flex-basis"), "30%");
    assert.strictEqual(style.cssText, "flex-basis: 30%;");
  });

  it("shorthand flex works", () => {
    const style = new CSSStyleDeclaration(window);
    style.setProperty("flex", "none");
    assert.strictEqual(style.getPropertyValue("flex-grow"), "0");
    assert.strictEqual(style.getPropertyValue("flex-shrink"), "0");
    assert.strictEqual(style.getPropertyValue("flex-basis"), "auto");
    style.removeProperty("flex");
    style.removeProperty("flex-basis");
    style.setProperty("flex", "auto");
    assert.strictEqual(style.getPropertyValue("flex-grow"), "1");
    assert.strictEqual(style.getPropertyValue("flex-shrink"), "1");
    assert.strictEqual(style.getPropertyValue("flex-basis"), "auto");
    style.removeProperty("flex");
    style.setProperty("flex", "0 1 250px");
    assert.strictEqual(style.getPropertyValue("flex"), "0 1 250px");
    assert.strictEqual(style.getPropertyValue("flex-grow"), "0");
    assert.strictEqual(style.getPropertyValue("flex-shrink"), "1");
    assert.strictEqual(style.getPropertyValue("flex-basis"), "250px");
    style.removeProperty("flex");
    style.setProperty("flex", "2");
    assert.strictEqual(style.getPropertyValue("flex-grow"), "2");
    assert.strictEqual(style.getPropertyValue("flex-shrink"), "1");
    assert.strictEqual(style.getPropertyValue("flex-basis"), "0%");
    style.removeProperty("flex");
    style.setProperty("flex", "20%");
    assert.strictEqual(style.getPropertyValue("flex-grow"), "1");
    assert.strictEqual(style.getPropertyValue("flex-shrink"), "1");
    assert.strictEqual(style.getPropertyValue("flex-basis"), "20%");
    style.removeProperty("flex");
    style.setProperty("flex", "2 2");
    assert.strictEqual(style.getPropertyValue("flex-grow"), "2");
    assert.strictEqual(style.getPropertyValue("flex-shrink"), "2");
    assert.strictEqual(style.getPropertyValue("flex-basis"), "0%");
    style.removeProperty("flex");
  });

  it("font-size get a valid value", () => {
    const style = new CSSStyleDeclaration(window);
    const invalidValue = "1r5px";
    style.cssText = "font-size: 15px";
    assert.strictEqual(1, style.length);
    style.cssText = `font-size: ${invalidValue}`;
    assert.strictEqual(0, style.length);
    assert.strictEqual(undefined, style[0]);
  });

  it("getPropertyValue for custom properties in cssText", () => {
    const style = new CSSStyleDeclaration(window);
    style.cssText = "--foo: red";

    assert.strictEqual(style.getPropertyValue("--foo"), "red");
  });

  it("getPropertyValue for custom properties with setProperty", () => {
    const style = new CSSStyleDeclaration(window);
    style.setProperty("--bar", "blue");

    assert.strictEqual(style.getPropertyValue("--bar"), "blue");
  });

  it("getPropertyValue for custom properties with object setter", () => {
    const style = new CSSStyleDeclaration(window);
    style["--baz"] = "yellow";

    assert.strictEqual(style.getPropertyValue("--baz"), "");
  });

  it("custom properties are case-sensitive", () => {
    const style = new CSSStyleDeclaration(window);
    style.cssText = "--fOo: purple";

    assert.strictEqual(style.getPropertyValue("--foo"), "");
    assert.strictEqual(style.getPropertyValue("--fOo"), "purple");
  });

  for (const property of [
    "width",
    "height",
    "margin",
    "margin-top",
    "bottom",
    "right",
    "padding"
  ]) {
    it(`supports calc for ${property}`, () => {
      const style = new CSSStyleDeclaration(window);
      style.setProperty(property, "calc(100% - 100px)");
      assert.strictEqual(style.getPropertyValue(property), "calc(100% - 100px)");
    });
  }

  it("supports nested calc", () => {
    const style = new CSSStyleDeclaration(window);
    style.setProperty("width", "calc(100% - calc(200px - 100px))");
    assert.strictEqual(style.getPropertyValue("width"), "calc(100% - 100px)");
  });

  it("supports nested calc", () => {
    const style = new CSSStyleDeclaration(window);
    style.setProperty("width", "calc(100% * calc(2 / 3))");
    assert.strictEqual(style.getPropertyValue("width"), "calc(66.6667%)");
  });

  it("supports var", () => {
    const style = new CSSStyleDeclaration(window);
    style.setProperty("width", "var(--foo)");
    assert.strictEqual(style.getPropertyValue("width"), "var(--foo)");
  });

  it("supports var with fallback", () => {
    const style = new CSSStyleDeclaration(window);
    style.setProperty("width", "var(--foo, 100px)");
    assert.strictEqual(style.getPropertyValue("width"), "var(--foo, 100px)");
  });

  it("supports var with var fallback", () => {
    const style = new CSSStyleDeclaration(window);
    style.setProperty("width", "var(--foo, var(--bar))");
    assert.strictEqual(style.getPropertyValue("width"), "var(--foo, var(--bar))");
  });

  it("supports calc with var inside", () => {
    const style = new CSSStyleDeclaration(window);
    style.setProperty("width", "calc(100% - var(--foo))");
    assert.strictEqual(style.getPropertyValue("width"), "calc(100% - var(--foo))");
  });

  it("supports var with calc inside", () => {
    const style = new CSSStyleDeclaration(window);
    style.setProperty("width", "var(--foo, calc(var(--bar) + 3px))");
    assert.strictEqual(style.getPropertyValue("width"), "var(--foo, calc(var(--bar) + 3px))");
  });

  it("supports color var", () => {
    const style = new CSSStyleDeclaration(window);
    style.setProperty("color", "var(--foo)");
    assert.strictEqual(style.getPropertyValue("color"), "var(--foo)");
  });

  it("should not normalize if var() is included", () => {
    const style = new CSSStyleDeclaration(window);
    style.setProperty("line-height", "calc( /* comment */ 100% - calc(var(--foo) *2 ))");
    assert.strictEqual(
      style.getPropertyValue("line-height"),
      "calc( /* comment */ 100% - calc(var(--foo) *2 ))"
    );
  });

  it("supports abs", () => {
    const style = new CSSStyleDeclaration(window);
    style.setProperty("line-height", "abs(1 - 2 * 3)");
    assert.strictEqual(style.getPropertyValue("line-height"), "calc(5)");
  });

  it("supports abs inside calc", () => {
    const style = new CSSStyleDeclaration(window);
    style.setProperty("line-height", "calc(abs(1) + abs(2))");
    assert.strictEqual(style.getPropertyValue("line-height"), "calc(3)");
  });

  it("supports sign", () => {
    const style = new CSSStyleDeclaration(window);
    style.setProperty("line-height", "sign(.1)");
    assert.strictEqual(style.getPropertyValue("line-height"), "calc(1)");
  });

  it("supports sign inside calc", () => {
    const style = new CSSStyleDeclaration(window);
    style.setProperty("line-height", "calc(sign(.1) + sign(.2))");
    assert.strictEqual(style.getPropertyValue("line-height"), "calc(2)");
  });

  it("no-op for setting undefined to width", () => {
    const style = new CSSStyleDeclaration(window);
    style.setProperty("width", "10px");
    assert.strictEqual(style.getPropertyValue("width"), "10px");

    style.setProperty("width", undefined);
    assert.strictEqual(style.getPropertyValue("width"), "10px");

    style.width = undefined;
    assert.strictEqual(style.getPropertyValue("width"), "10px");
  });

  it("shorthand serialization with shorthand and longhands mixed", () => {
    const style = new CSSStyleDeclaration(window);
    style.cssText = "background-color: blue; background: red !important; background-color: green;";
    assert.strictEqual(style.cssText, "background: red !important;");
  });

  it("shorthand serialization", () => {
    const style = new CSSStyleDeclaration(window);
    style.cssText =
      "border-top: 1px; border-right: 1px; border-bottom: 1px; border-left: 1px; border-image: none;";
    assert.strictEqual(style.cssText, "border: 1px;");
  });

  it("shorthand serialization", () => {
    const style = new CSSStyleDeclaration(window);
    style.cssText = "border-width: 1px;";
    assert.strictEqual(style.cssText, "border-width: 1px;");
  });

  it("shorthand serialization", () => {
    const style = new CSSStyleDeclaration(window);
    style.cssText = "border: 1px; border-top: 1px !important;";
    assert.strictEqual(
      style.cssText,
      "border-right: 1px; border-bottom: 1px; border-left: 1px; border-image: none; border-top: 1px !important;"
    );
  });

  it("set cssText as none", () => {
    const style = new CSSStyleDeclaration(window);
    style.cssText = "border: none;";
    assert.strictEqual(style.cssText, "border: medium;");
  });

  it("invalid cssText should be parsed", () => {
    const style = new CSSStyleDeclaration(window);
    style.cssText = "color: red; }";
    assert.strictEqual(style.cssText, "color: red;");
  });

  it("single value flex with CSS-wide keyword", () => {
    const style = new CSSStyleDeclaration(window);
    style.cssText = "flex: initial;";
    assert.strictEqual(style.flex, "initial");
    assert.strictEqual(style.flexGrow, "initial");
    assert.strictEqual(style.flexShrink, "initial");
    assert.strictEqual(style.flexBasis, "initial");
    assert.strictEqual(style.cssText, "flex: initial;");
  });

  it("single value flex with non-CSS-wide value", () => {
    const style = new CSSStyleDeclaration(window);
    style.cssText = "flex: 0;";
    assert.strictEqual(style.flex, "0 1 0%");
    assert.strictEqual(style.flexGrow, "0");
    assert.strictEqual(style.flexShrink, "1");
    assert.strictEqual(style.flexBasis, "0%");
    assert.strictEqual(style.cssText, "flex: 0 1 0%;");
  });

  it("multiple values flex with CSS-wide keyword", () => {
    const style = new CSSStyleDeclaration(window);
    style.cssText = "flex: initial; flex-basis: initial; flex-shrink: initial;";
    assert.strictEqual(style.flex, "initial");
    assert.strictEqual(style.flexGrow, "initial");
    assert.strictEqual(style.flexShrink, "initial");
    assert.strictEqual(style.flexBasis, "initial");
    assert.strictEqual(style.cssText, "flex: initial;");
  });

  it("multiple values flex with CSS-wide keywords and non-CSS-wide value", () => {
    const style = new CSSStyleDeclaration(window);
    style.cssText = "flex: initial; flex-shrink: 0;";
    assert.strictEqual(style.flex, "");
    assert.strictEqual(style.flexGrow, "initial");
    assert.strictEqual(style.flexShrink, "0");
    assert.strictEqual(style.flexBasis, "initial");
    assert.strictEqual(style.cssText, "flex-grow: initial; flex-basis: initial; flex-shrink: 0;");
  });

  it("multiple values flex with CSS-wide and two non-CSS-wide-keyword values", () => {
    const style = new CSSStyleDeclaration(window);
    style.cssText = "flex: initial; flex-basis: 0; flex-shrink: 2;";
    assert.strictEqual(style.flex, "");
    assert.strictEqual(style.flexGrow, "initial");
    assert.strictEqual(style.flexShrink, "2");
    assert.strictEqual(style.flexBasis, "0px");
    assert.strictEqual(style.cssText, "flex-grow: initial; flex-basis: 0px; flex-shrink: 2;");
  });
});

describe("background", () => {
  it("background-attachment should set / get keyword", () => {
    testPropertyValue("background-attachment", "fixed", "fixed");
  });

  it("background-attachment should set / get multiple values", () => {
    testPropertyValue("background-attachment", "fixed, scroll", "fixed, scroll");
  });

  it("background-clip should set / get keyword", () => {
    testPropertyValue("background-clip", "border-box", "border-box");
  });

  it("background-clip should set / get multiple values", () => {
    testPropertyValue("background-clip", "padding-box, content-box", "padding-box, content-box");
  });

  it("background-color should set / get color", () => {
    testPropertyValue("background-color", "green", "green");
  });

  it("background-color should set / get color", () => {
    testPropertyValue("background-color", "#008000", "rgb(0, 128, 0)");
  });

  it("background-color should set / get color", () => {
    testPropertyValue("background-color", "rgb(0 128 0)", "rgb(0, 128, 0)");
  });

  it("background-color should not set / get multiple values", () => {
    testPropertyValue("background-color", "green, blue", "");
  });

  it("background-image should set / get keyword", () => {
    testPropertyValue("background-image", "none", "none");
  });

  it("background-image should set / get image URL", () => {
    testPropertyValue("background-image", "url(example.png)", 'url("example.png")');
  });

  it("background-image should set / get gradient image", () => {
    testPropertyValue(
      "background-image",
      "linear-gradient(to right, green, blue)",
      "linear-gradient(to right, green, blue)"
    );
  });

  it("background-image should set / get gradient image", () => {
    testPropertyValue(
      "background-image",
      "radial-gradient(ellipse closest-side, #1e90ff 50%, #008000)",
      "radial-gradient(closest-side, rgb(30, 144, 255) 50%, rgb(0, 128, 0))"
    );
  });

  it("background-image should set / get multiple values", () => {
    testPropertyValue(
      "background-image",
      "url(example.png), linear-gradient(to right, green, blue)",
      'url("example.png"), linear-gradient(to right, green, blue)'
    );
  });

  it("background-origin should set / get keyword", () => {
    testPropertyValue("background-origin", "border-box", "border-box");
  });

  it("background-origin should set / get multiple values", () => {
    testPropertyValue("background-origin", "padding-box, content-box", "padding-box, content-box");
  });

  it("background-position should set / get keywords", () => {
    testPropertyValue("background-position", "center", "center center");
  });

  it("background-position should set / get keywords", () => {
    testPropertyValue("background-position", "left", "left center");
  });

  it("background-position should set / get keywords", () => {
    testPropertyValue("background-position", "top", "center top");
  });

  it("background-position should set / get keywords", () => {
    testPropertyValue("background-position", "left center", "left center");
  });

  it("background-position should set / get keywords", () => {
    testPropertyValue("background-position", "top left", "left top");
  });

  it("background-position should set / get keywords", () => {
    testPropertyValue("background-position", "top center", "center top");
  });

  it("background-position should not set / get keyword", () => {
    testPropertyValue("background-position", "left right", "");
  });

  it("background-position should set / get length keyword", () => {
    testPropertyValue("background-position", "10px", "10px center");
  });

  it("background-position should set / get length", () => {
    testPropertyValue("background-position", "10px 20px", "10px 20px");
  });

  it("background-position should set / get percent keyword", () => {
    testPropertyValue("background-position", "10%", "10% center");
  });

  it("background-position should set / get percents", () => {
    testPropertyValue("background-position", "10% 20%", "10% 20%");
  });

  it("background-position should set / get length percent", () => {
    testPropertyValue("background-position", "10px 20%", "10px 20%");
  });

  it("background-position should set / get keyword length", () => {
    testPropertyValue("background-position", "left 10px", "left 10px");
  });

  it("background-position should not set / get keyword length", () => {
    testPropertyValue("background-position", "10px left", "");
  });

  it("background-position should set / get keyword length", () => {
    testPropertyValue("background-position", "10px top", "10px top");
  });

  it("background-position should not set / get keyword length", () => {
    testPropertyValue("background-position", "top 10px", "");
  });

  it("background-position should not set / get keyword", () => {
    testPropertyValue("background-position", "left right bottom", "");
  });

  it("background-position should not set / get length percent", () => {
    testPropertyValue("background-position", "10px 20% 30px", "");
  });

  it("background-position should set / get keyword length with offset", () => {
    testPropertyValue("background-position", "center 10px center", "");
  });

  it("background-position should set / get keyword length with offset", () => {
    testPropertyValue("background-position", "center center 10px", "");
  });

  it("background-position should set / get keyword length with offset", () => {
    testPropertyValue("background-position", "left 10px top", "left 10px top");
  });

  it("background-position should set / get keyword length with offset", () => {
    testPropertyValue("background-position", "left top 20px", "left top 20px");
  });

  it("background-position should set / get keyword length with offset", () => {
    testPropertyValue("background-position", "top 20px left", "left top 20px");
  });

  it("background-position should set / get keyword length with offset", () => {
    testPropertyValue("background-position", "top left 10px", "left 10px top");
  });

  it("background-position should not set / get keyword", () => {
    testPropertyValue("background-position", "left right top bottom", "");
  });

  it("background-position should not set / get length percent", () => {
    testPropertyValue("background-position", "10px 20% 30px 40%", "");
  });

  it("background-position should set / get keyword length with offset", () => {
    testPropertyValue("background-position", "center 10px center 20px", "");
  });

  it("background-position should set / get keyword length with offset", () => {
    testPropertyValue("background-position", "left 10px top 20px", "left 10px top 20px");
  });

  it("background-position should set / get keyword length with offset", () => {
    testPropertyValue("background-position", "top 10px left 20px", "left 20px top 10px");
  });

  it("background-position should set / get multiple values", () => {
    testPropertyValue("background-position", "left top, bottom right", "left top, right bottom");
  });

  it("background-repeat should set / get keyword", () => {
    testPropertyValue("background-repeat", "repeat", "repeat");
  });

  it("background-repeat should set / get keyword keyword", () => {
    testPropertyValue("background-repeat", "repeat no-repeat", "repeat-x");
  });

  it("background-repeat should set / get keyword keyword", () => {
    testPropertyValue("background-repeat", "no-repeat repeat", "repeat-y");
  });

  it("background-repeat should set / get keyword keyword", () => {
    testPropertyValue("background-repeat", "repeat repeat", "repeat");
  });

  it("background-repeat should set / get keyword keyword", () => {
    testPropertyValue("background-repeat", "repeat space", "repeat space");
  });

  it("background-repeat should not set / get multiple axis keywords", () => {
    testPropertyValue("background-repeat", "repeat-x repeat-y", "");
  });

  it("background-repeat should set / get multiple values", () => {
    testPropertyValue("background-repeat", "repeat, no-repeat", "repeat, no-repeat");
  });

  it("background-size should set / get keyword", () => {
    testPropertyValue("background-size", "contain", "contain");
  });

  it("background-size should not set / get multiple ratio keywords", () => {
    testPropertyValue("background-size", "contain cover", "");
  });

  it("background-size should set / get keyword", () => {
    testPropertyValue("background-size", "auto auto", "auto");
  });

  it("background-size should set / get length and length", () => {
    testPropertyValue("background-size", "10px 20px", "10px 20px");
  });

  it("background-size should not set / get negative length", () => {
    testPropertyValue("background-size", "-10px 20px", "");
  });

  it("background-size should not set / get negative length", () => {
    testPropertyValue("background-size", "10px -20px", "");
  });

  it("background-size should set / get percent", () => {
    testPropertyValue("background-size", "10% 20%", "10% 20%");
  });

  it("background-size should not set / get negative percent", () => {
    testPropertyValue("background-size", "-10% 20%", "");
  });

  it("background-size should not set / get negative percent", () => {
    testPropertyValue("background-size", "10% -20%%", "");
  });

  it("background-size should set / get keyword and length", () => {
    testPropertyValue("background-size", "auto 10px", "auto 10px");
  });

  it("background-size should set / get length", () => {
    testPropertyValue("background-size", "10px auto", "10px");
  });

  it("background-size should set / get multiple values", () => {
    testPropertyValue("background-size", "contain, cover", "contain, cover");
  });

  it("background shorthand should set / get value", () => {
    testImplicitPropertyValue(
      "background",
      "none",
      "none",
      new Map([
        ["background-image", "none"],
        ["background-position", "0% 0%"],
        ["background-size", "auto"],
        ["background-repeat", "repeat"],
        ["background-origin", "padding-box"],
        ["background-clip", "border-box"],
        ["background-attachment", "scroll"],
        ["background-color", "transparent"]
      ])
    );
  });

  it("background shorthand should set / get value", () => {
    testImplicitPropertyValue(
      "background",
      "transparent",
      "transparent",
      new Map([
        ["background-image", "none"],
        ["background-position", "0% 0%"],
        ["background-size", "auto"],
        ["background-repeat", "repeat"],
        ["background-origin", "padding-box"],
        ["background-clip", "border-box"],
        ["background-attachment", "scroll"],
        ["background-color", "transparent"]
      ])
    );
  });

  it("background shorthand should set / get sub longhand values", () => {
    testImplicitPropertyValue(
      "background",
      "fixed left / 50% repeat url(example.png) green",
      'url("example.png") left center / 50% fixed green',
      new Map([
        ["background-image", 'url("example.png")'],
        ["background-position", "left center"],
        ["background-size", "50%"],
        ["background-repeat", "repeat"],
        ["background-origin", "padding-box"],
        ["background-clip", "border-box"],
        ["background-attachment", "fixed"],
        ["background-color", "green"]
      ])
    );
  });

  it("background shorthand should set / get multiple values", () => {
    testImplicitPropertyValue(
      "background",
      "fixed left / 50% repeat url(example.png), linear-gradient(to right, green, blue) green",
      'url("example.png") left center / 50% fixed, linear-gradient(to right, green, blue) green',
      new Map([
        ["background-image", 'url("example.png"), linear-gradient(to right, green, blue)'],
        ["background-position", "left center, 0% 0%"],
        ["background-size", "50%, auto"],
        ["background-repeat", "repeat, repeat"],
        ["background-origin", "padding-box, padding-box"],
        ["background-clip", "border-box, border-box"],
        ["background-attachment", "fixed, scroll"],
        ["background-color", "green"]
      ])
    );
  });

  it("background shorthand should set / get value", () => {
    testImplicitPropertyValue(
      "background",
      "fixed left repeat url(example.png) var(--foo)",
      "fixed left repeat url(example.png) var(--foo)",
      new Map([
        ["background-image", ""],
        ["background-position", ""],
        ["background-size", ""],
        ["background-repeat", ""],
        ["background-origin", ""],
        ["background-clip", ""],
        ["background-attachment", ""],
        ["background-color", ""]
      ])
    );
  });
});

describe("border", () => {
  it("border-top-color should set / get color", () => {
    testPropertyValue("border-top-color", "green", "green");
  });

  it("border-top-color should set / get color", () => {
    testPropertyValue("border-top-color", "#008000", "rgb(0, 128, 0)");
  });

  it("border-top-color should set / get color", () => {
    testPropertyValue("border-top-color", "rgb(0 128 0)", "rgb(0, 128, 0)");
  });

  it("border-right-color should set / get color", () => {
    testPropertyValue("border-right-color", "green", "green");
  });

  it("border-right-color should set / get color", () => {
    testPropertyValue("border-right-color", "#008000", "rgb(0, 128, 0)");
  });

  it("border-right-color should set / get color", () => {
    testPropertyValue("border-right-color", "rgb(0 128 0)", "rgb(0, 128, 0)");
  });

  it("border-bottom-color should set / get color", () => {
    testPropertyValue("border-bottom-color", "green", "green");
  });

  it("border-bottom-color should set / get color", () => {
    testPropertyValue("border-bottom-color", "#008000", "rgb(0, 128, 0)");
  });

  it("border-bottom-color should set / get color", () => {
    testPropertyValue("border-bottom-color", "rgb(0 128 0)", "rgb(0, 128, 0)");
  });

  it("border-left-color should set / get color", () => {
    testPropertyValue("border-left-color", "green", "green");
  });

  it("border-left-color should set / get color", () => {
    testPropertyValue("border-left-color", "#008000", "rgb(0, 128, 0)");
  });

  it("border-left-color should set / get color", () => {
    testPropertyValue("border-left-color", "rgb(0 128 0)", "rgb(0, 128, 0)");
  });

  it("border-top-width should set / get keyword", () => {
    testPropertyValue("border-top-width", "medium", "medium");
  });

  it("border-top-width should set / get length", () => {
    testPropertyValue("border-top-width", "10px", "10px");
  });

  it("border-top-width should not set / get negative length", () => {
    testPropertyValue("border-top-width", "-10px", "");
  });

  it("border-right-width should set / get keyword", () => {
    testPropertyValue("border-right-width", "medium", "medium");
  });

  it("border-right-width should set / get length", () => {
    testPropertyValue("border-right-width", "10px", "10px");
  });

  it("border-right-width should not set / get negative length", () => {
    testPropertyValue("border-right-width", "-10px", "");
  });

  it("border-bottom-width should set / get keyword", () => {
    testPropertyValue("border-bottom-width", "medium", "medium");
  });

  it("border-bottom-width should set / get length", () => {
    testPropertyValue("border-bottom-width", "10px", "10px");
  });

  it("border-bottom-width should not set / get negative length", () => {
    testPropertyValue("border-bottom-width", "-10px", "");
  });

  it("border-left-width should set / get keyword", () => {
    testPropertyValue("border-left-width", "medium", "medium");
  });

  it("border-left-width should set / get length", () => {
    testPropertyValue("border-left-width", "10px", "10px");
  });

  it("border-left-width should not set / get negative length", () => {
    testPropertyValue("border-left-width", "-10px", "");
  });

  it("border-top-style should set / get keyword", () => {
    testPropertyValue("border-top-style", "dotted", "dotted");
  });

  it("border-right-style should set / get keyword", () => {
    testPropertyValue("border-right-style", "dotted", "dotted");
  });

  it("border-bottom-style should set / get keyword", () => {
    testPropertyValue("border-bottom-style", "dotted", "dotted");
  });

  it("border-left-style should set / get keyword", () => {
    testPropertyValue("border-left-style", "dotted", "dotted");
  });

  it("border-color should set / get color", () => {
    testImplicitPropertyValue(
      "border-color",
      "green",
      "green",
      new Map([
        ["border-top-color", "green"],
        ["border-right-color", "green"],
        ["border-bottom-color", "green"],
        ["border-left-color", "green"]
      ])
    );
  });

  it("border-color should set / get color", () => {
    testImplicitPropertyValue(
      "border-color",
      "green blue",
      "green blue",
      new Map([
        ["border-top-color", "green"],
        ["border-right-color", "blue"],
        ["border-bottom-color", "green"],
        ["border-left-color", "blue"]
      ])
    );
  });

  it("border-color should set / get color", () => {
    testImplicitPropertyValue(
      "border-color",
      "green blue yellow",
      "green blue yellow",
      new Map([
        ["border-top-color", "green"],
        ["border-right-color", "blue"],
        ["border-bottom-color", "yellow"],
        ["border-left-color", "blue"]
      ])
    );
  });

  it("border-color should set / get color", () => {
    testImplicitPropertyValue(
      "border-color",
      "green blue yellow purple",
      "green blue yellow purple",
      new Map([
        ["border-top-color", "green"],
        ["border-right-color", "blue"],
        ["border-bottom-color", "yellow"],
        ["border-left-color", "purple"]
      ])
    );
  });

  it("border-width should set / get keyword", () => {
    testImplicitPropertyValue(
      "border-width",
      "thick",
      "thick",
      new Map([
        ["border-top-width", "thick"],
        ["border-right-width", "thick"],
        ["border-bottom-width", "thick"],
        ["border-left-width", "thick"]
      ])
    );
  });

  it("border-width should set / get keyword", () => {
    testImplicitPropertyValue(
      "border-width",
      "thick thin",
      "thick thin",
      new Map([
        ["border-top-width", "thick"],
        ["border-right-width", "thin"],
        ["border-bottom-width", "thick"],
        ["border-left-width", "thin"]
      ])
    );
  });

  it("border-width should set / get keyword", () => {
    testImplicitPropertyValue(
      "border-width",
      "thick thin medium",
      "thick thin medium",
      new Map([
        ["border-top-width", "thick"],
        ["border-right-width", "thin"],
        ["border-bottom-width", "medium"],
        ["border-left-width", "thin"]
      ])
    );
  });

  it("border-width should set / get keyword and value", () => {
    testImplicitPropertyValue(
      "border-width",
      "thick thin medium 10px",
      "thick thin medium 10px",
      new Map([
        ["border-top-width", "thick"],
        ["border-right-width", "thin"],
        ["border-bottom-width", "medium"],
        ["border-left-width", "10px"]
      ])
    );
  });

  it("border-style should set / get keyword", () => {
    testImplicitPropertyValue(
      "border-style",
      "dotted",
      "dotted",
      new Map([
        ["border-top-style", "dotted"],
        ["border-right-style", "dotted"],
        ["border-bottom-style", "dotted"],
        ["border-left-style", "dotted"]
      ])
    );
  });

  it("border-style should set / get keyword", () => {
    testImplicitPropertyValue(
      "border-style",
      "none",
      "none",
      new Map([
        ["border-top-style", "none"],
        ["border-right-style", "none"],
        ["border-bottom-style", "none"],
        ["border-left-style", "none"]
      ])
    );
  });

  it("border-style should set / get keyword", () => {
    testImplicitPropertyValue(
      "border-style",
      "dotted groove",
      "dotted groove",
      new Map([
        ["border-top-style", "dotted"],
        ["border-right-style", "groove"],
        ["border-bottom-style", "dotted"],
        ["border-left-style", "groove"]
      ])
    );
  });

  it("border-style should set / get keyword", () => {
    testImplicitPropertyValue(
      "border-style",
      "dotted groove double",
      "dotted groove double",
      new Map([
        ["border-top-style", "dotted"],
        ["border-right-style", "groove"],
        ["border-bottom-style", "double"],
        ["border-left-style", "groove"]
      ])
    );
  });

  it("border-style should set / get keyword", () => {
    testImplicitPropertyValue(
      "border-style",
      "dotted groove double none",
      "dotted groove double none",
      new Map([
        ["border-top-style", "dotted"],
        ["border-right-style", "groove"],
        ["border-bottom-style", "double"],
        ["border-left-style", "none"]
      ])
    );
  });

  it("border-collapse should set / get keyword", () => {
    testPropertyValue("border-collapse", "collapse", "collapse");
  });

  it("border-spacing should set / get length", () => {
    testPropertyValue("border-spacing", "10px", "10px");
  });

  it("border-spacing should set / get length", () => {
    testPropertyValue("border-spacing", "10px 20px", "10px 20px");
  });

  it("border-top shorthand should set / get value", () => {
    testImplicitPropertyValue(
      "border-top",
      "1px solid green",
      "1px solid green",
      new Map([
        ["border-top-width", "1px"],
        ["border-top-style", "solid"],
        ["border-top-color", "green"]
      ])
    );
  });

  it("border-top shorthand should set / get value", () => {
    testImplicitPropertyValue(
      "border-top",
      "1px var(--foo) green",
      "1px var(--foo) green",
      new Map([
        ["border-top-width", ""],
        ["border-top-style", ""],
        ["border-top-color", ""]
      ])
    );
  });

  it("border-right shorthand should set / get value", () => {
    testImplicitPropertyValue(
      "border-right",
      "1px solid green",
      "1px solid green",
      new Map([
        ["border-right-width", "1px"],
        ["border-right-style", "solid"],
        ["border-right-color", "green"]
      ])
    );
  });

  it("border-right shorthand should set / get value", () => {
    testImplicitPropertyValue(
      "border-right",
      "1px var(--foo) green",
      "1px var(--foo) green",
      new Map([
        ["border-right-width", ""],
        ["border-right-style", ""],
        ["border-right-color", ""]
      ])
    );
  });

  it("border-bottom shorthand should set / get value", () => {
    testImplicitPropertyValue(
      "border-bottom",
      "1px solid green",
      "1px solid green",
      new Map([
        ["border-bottom-width", "1px"],
        ["border-bottom-style", "solid"],
        ["border-bottom-color", "green"]
      ])
    );
  });

  it("border-bottom shorthand should set / get value", () => {
    testImplicitPropertyValue(
      "border-bottom",
      "1px var(--foo) green",
      "1px var(--foo) green",
      new Map([
        ["border-bottom-width", ""],
        ["border-bottom-style", ""],
        ["border-bottom-color", ""]
      ])
    );
  });

  it("border-left shorthand should set / get value", () => {
    testImplicitPropertyValue(
      "border-left",
      "1px solid green",
      "1px solid green",
      new Map([
        ["border-left-width", "1px"],
        ["border-left-style", "solid"],
        ["border-left-color", "green"]
      ])
    );
  });

  it("border-left shorthand should set / get value", () => {
    testImplicitPropertyValue(
      "border-left",
      "1px var(--foo) green",
      "1px var(--foo) green",
      new Map([
        ["border-left-width", ""],
        ["border-left-style", ""],
        ["border-left-color", ""]
      ])
    );
  });

  it("border shorthand should set / get value", () => {
    testImplicitPropertyValue(
      "border",
      "1px solid green",
      "1px solid green",
      new Map([
        ["border-top-width", "1px"],
        ["border-top-style", "solid"],
        ["border-top-color", "green"],
        ["border-right-width", "1px"],
        ["border-right-style", "solid"],
        ["border-right-color", "green"],
        ["border-bottom-width", "1px"],
        ["border-bottom-style", "solid"],
        ["border-bottom-color", "green"],
        ["border-left-width", "1px"],
        ["border-left-style", "solid"],
        ["border-left-color", "green"]
      ])
    );
  });

  it("border shorthand should set / get value", () => {
    testImplicitPropertyValue(
      "border",
      "1px var(--foo) green",
      "1px var(--foo) green",
      new Map([
        ["border-top-width", ""],
        ["border-top-style", ""],
        ["border-top-color", ""],
        ["border-right-width", ""],
        ["border-right-style", ""],
        ["border-right-color", ""],
        ["border-bottom-width", ""],
        ["border-bottom-style", ""],
        ["border-bottom-color", ""],
        ["border-left-width", ""],
        ["border-left-style", ""],
        ["border-left-color", ""]
      ])
    );
  });
});

describe("box model", () => {
  it("margin-top should set / get keyword", () => {
    testPropertyValue("margin-top", "auto", "auto");
  });

  it("margin-top should set / get length", () => {
    testPropertyValue("margin-top", "0", "0px");
  });

  it("margin-top should set / get length", () => {
    testPropertyValue("margin-top", "10px", "10px");
  });

  it("margin-top should set / get negative length", () => {
    testPropertyValue("margin-top", "-10px", "-10px");
  });

  it("margin-top should set / get percent", () => {
    testPropertyValue("margin-top", "10%", "10%");
  });

  it("margin-top should set / get negative percent", () => {
    testPropertyValue("margin-top", "-10%", "-10%");
  });

  it("margin-right should set / get keyword", () => {
    testPropertyValue("margin-right", "auto", "auto");
  });

  it("margin-right should set / get length", () => {
    testPropertyValue("margin-right", "0", "0px");
  });

  it("margin-right should set / get length", () => {
    testPropertyValue("margin-right", "10px", "10px");
  });

  it("margin-right should set / get negative length", () => {
    testPropertyValue("margin-right", "-10px", "-10px");
  });

  it("margin-right should set / get percent", () => {
    testPropertyValue("margin-right", "10%", "10%");
  });

  it("margin-right should set / get negative percent", () => {
    testPropertyValue("margin-right", "-10%", "-10%");
  });

  it("margin-bottom should set / get keyword", () => {
    testPropertyValue("margin-bottom", "auto", "auto");
  });

  it("margin-bottom should set / get length", () => {
    testPropertyValue("margin-bottom", "0", "0px");
  });

  it("margin-bottom should set / get length", () => {
    testPropertyValue("margin-bottom", "10px", "10px");
  });

  it("margin-bottom should set / get negative length", () => {
    testPropertyValue("margin-bottom", "-10px", "-10px");
  });

  it("margin-bottom should set / get percent", () => {
    testPropertyValue("margin-bottom", "10%", "10%");
  });

  it("margin-bottom should set / get negative percent", () => {
    testPropertyValue("margin-bottom", "-10%", "-10%");
  });

  it("margin-left should set / get keyword", () => {
    testPropertyValue("margin-left", "auto", "auto");
  });

  it("margin-left should set / get length", () => {
    testPropertyValue("margin-left", "0", "0px");
  });

  it("margin-left should set / get length", () => {
    testPropertyValue("margin-left", "10px", "10px");
  });

  it("margin-left should set / get negative length", () => {
    testPropertyValue("margin-left", "-10px", "-10px");
  });

  it("margin-left should set / get percent", () => {
    testPropertyValue("margin-left", "10%", "10%");
  });

  it("margin-left should set / get negative percent", () => {
    testPropertyValue("margin-left", "-10%", "-10%");
  });

  it("margin shorthand should set / get keyword", () => {
    testImplicitPropertyValue(
      "margin",
      "auto",
      "auto",
      new Map([
        ["margin-top", "auto"],
        ["margin-right", "auto"],
        ["margin-bottom", "auto"],
        ["margin-left", "auto"]
      ])
    );
  });

  it("margin shorthand should set / get value", () => {
    testImplicitPropertyValue(
      "margin",
      "10px",
      "10px",
      new Map([
        ["margin-top", "10px"],
        ["margin-right", "10px"],
        ["margin-bottom", "10px"],
        ["margin-left", "10px"]
      ])
    );
  });

  it("margin shorthand should set / get value", () => {
    testImplicitPropertyValue(
      "margin",
      "10px 20px",
      "10px 20px",
      new Map([
        ["margin-top", "10px"],
        ["margin-right", "20px"],
        ["margin-bottom", "10px"],
        ["margin-left", "20px"]
      ])
    );
  });

  it("margin shorthand should set / get value", () => {
    testImplicitPropertyValue(
      "margin",
      "10px 20px 30px",
      "10px 20px 30px",
      new Map([
        ["margin-top", "10px"],
        ["margin-right", "20px"],
        ["margin-bottom", "30px"],
        ["margin-left", "20px"]
      ])
    );
  });

  it("margin shorthand should set / get value", () => {
    testImplicitPropertyValue(
      "margin",
      "10px 20px 30px 40px",
      "10px 20px 30px 40px",
      new Map([
        ["margin-top", "10px"],
        ["margin-right", "20px"],
        ["margin-bottom", "30px"],
        ["margin-left", "40px"]
      ])
    );
  });

  it("margin shorthand should set / get value", () => {
    testImplicitPropertyValue(
      "margin",
      "10px var(--foo)",
      "10px var(--foo)",
      new Map([
        ["margin-top", ""],
        ["margin-right", ""],
        ["margin-bottom", ""],
        ["margin-left", ""]
      ])
    );
  });

  it("margin shorthand should set / get value", () => {
    testImplicitPropertyValue(
      "margin",
      "initial",
      "initial",
      new Map([
        ["margin-top", "initial"],
        ["margin-right", "initial"],
        ["margin-bottom", "initial"],
        ["margin-left", "initial"]
      ])
    );
  });

  it("padding-top should set / get length", () => {
    testPropertyValue("padding-top", "0", "0px");
  });

  it("padding-top should set / get length", () => {
    testPropertyValue("padding-top", "10px", "10px");
  });

  it("padding-top should not set / get negative length", () => {
    testPropertyValue("padding-top", "-10px", "");
  });

  it("padding-top should set / get percent", () => {
    testPropertyValue("padding-top", "10%", "10%");
  });

  it("padding-top should not set / get negative percent", () => {
    testPropertyValue("padding-top", "-10%", "");
  });

  it("padding-right should set / get length", () => {
    testPropertyValue("padding-right", "0", "0px");
  });

  it("padding-right should set / get length", () => {
    testPropertyValue("padding-right", "10px", "10px");
  });

  it("padding-right should not set / get negative length", () => {
    testPropertyValue("padding-right", "-10px", "");
  });

  it("padding-right should set / get percent", () => {
    testPropertyValue("padding-right", "10%", "10%");
  });

  it("padding-right should not set / get negative percent", () => {
    testPropertyValue("padding-right", "-10%", "");
  });

  it("padding-bottom should set / get length", () => {
    testPropertyValue("padding-bottom", "0", "0px");
  });

  it("padding-bottom should set / get length", () => {
    testPropertyValue("padding-bottom", "10px", "10px");
  });

  it("padding-bottom should not set / get negative length", () => {
    testPropertyValue("padding-bottom", "-10px", "");
  });

  it("padding-bottom should set / get percent", () => {
    testPropertyValue("padding-bottom", "10%", "10%");
  });

  it("padding-bottom should not set / get negative percent", () => {
    testPropertyValue("padding-bottom", "-10%", "");
  });

  it("padding-left should set / get length", () => {
    testPropertyValue("padding-left", "0", "0px");
  });

  it("padding-left should set / get length", () => {
    testPropertyValue("padding-left", "10px", "10px");
  });

  it("padding-left should not set / get negative length", () => {
    testPropertyValue("padding-left", "-10px", "");
  });

  it("padding-left should set / get percent", () => {
    testPropertyValue("padding-left", "10%", "10%");
  });

  it("padding-left should not set / get negative percent", () => {
    testPropertyValue("padding-left", "-10%", "");
  });

  it("padding shorthand should set / get value", () => {
    testImplicitPropertyValue(
      "padding",
      "10px",
      "10px",
      new Map([
        ["padding-top", "10px"],
        ["padding-right", "10px"],
        ["padding-bottom", "10px"],
        ["padding-left", "10px"]
      ])
    );
  });

  it("padding shorthand should set / get value", () => {
    testImplicitPropertyValue(
      "padding",
      "10px 20px",
      "10px 20px",
      new Map([
        ["padding-top", "10px"],
        ["padding-right", "20px"],
        ["padding-bottom", "10px"],
        ["padding-left", "20px"]
      ])
    );
  });

  it("padding shorthand should set / get value", () => {
    testImplicitPropertyValue(
      "padding",
      "10px 20px 30px",
      "10px 20px 30px",
      new Map([
        ["padding-top", "10px"],
        ["padding-right", "20px"],
        ["padding-bottom", "30px"],
        ["padding-left", "20px"]
      ])
    );
  });

  it("padding shorthand should set / get value", () => {
    testImplicitPropertyValue(
      "padding",
      "10px 20px 30px 40px",
      "10px 20px 30px 40px",
      new Map([
        ["padding-top", "10px"],
        ["padding-right", "20px"],
        ["padding-bottom", "30px"],
        ["padding-left", "40px"]
      ])
    );
  });

  it("padding shorthand should set / get value", () => {
    testImplicitPropertyValue(
      "padding",
      "10px var(--foo)",
      "10px var(--foo)",
      new Map([
        ["padding-top", ""],
        ["padding-right", ""],
        ["padding-bottom", ""],
        ["padding-left", ""]
      ])
    );
  });

  it("padding shorthand should set / get value", () => {
    testImplicitPropertyValue(
      "padding",
      "initial",
      "initial",
      new Map([
        ["padding-top", "initial"],
        ["padding-right", "initial"],
        ["padding-bottom", "initial"],
        ["padding-left", "initial"]
      ])
    );
  });
});

describe("box sizing", () => {
  it("height should set / get keyword", () => {
    testPropertyValue("height", "auto", "auto");
  });

  it("height should set / get length", () => {
    testPropertyValue("height", "0", "0px");
  });

  it("height should set / get length", () => {
    testPropertyValue("height", "10px", "10px");
  });

  it("height should not set / get negative length", () => {
    testPropertyValue("height", "-10px", "");
  });

  it("height should set / get percent", () => {
    testPropertyValue("height", "10%", "10%");
  });

  it("height should not set / get negative percent", () => {
    testPropertyValue("height", "-10%", "");
  });

  it("width should set / get keyword", () => {
    testPropertyValue("width", "auto", "auto");
  });

  it("height should set / get length", () => {
    testPropertyValue("width", "0", "0px");
  });

  it("width should set / get length", () => {
    testPropertyValue("width", "10px", "10px");
  });

  it("width should not set / get negative length", () => {
    testPropertyValue("width", "-10px", "");
  });

  it("width should set / get percent", () => {
    testPropertyValue("width", "10%", "10%");
  });

  it("width should not set / get negative percent", () => {
    testPropertyValue("width", "-10%", "");
  });
});

describe("color", () => {
  it("color should set / get color name", () => {
    testPropertyValue("color", "green", "green");
  });

  it("color should set / get hex color", () => {
    testPropertyValue("color", "#008000", "rgb(0, 128, 0)");
  });

  it("color should set / get color function", () => {
    testPropertyValue("color", "rgb(0 128 0)", "rgb(0, 128, 0)");
  });

  it("color should set / get color function", () => {
    testPropertyValue(
      "color",
      "light-dark(#008000, #0000ff)",
      "light-dark(rgb(0, 128, 0), rgb(0, 0, 255))"
    );
  });

  it("color should not should set / get invalid value", () => {
    testPropertyValue(
      "color",
      "color-mix(in hsl, hsl(120deg 10% 20%) 0%, hsl(30deg 30% 40%) 0%)",
      ""
    );
  });

  it("color should not should set / get invalid value", () => {
    testPropertyValue("color", "color(srgb 0 0 0 0)", "");
  });

  it("opacity should set / get keyword", () => {
    testPropertyValue("opacity", "inherit", "inherit");
  });

  it("opacity should set / get number", () => {
    testPropertyValue("opacity", "0.5", "0.5");
  });

  it("opacity should set / get number", () => {
    testPropertyValue("opacity", ".5", "0.5");
  });

  it("opacity should set / get number", () => {
    testPropertyValue("opacity", "1.5", "1.5");
  });

  it("opacity should set / get number", () => {
    testPropertyValue("opacity", "-1", "-1");
  });

  it("opacity should set / get percent", () => {
    testPropertyValue("opacity", "50%", "50%");
  });

  it("opacity should set / get percent", () => {
    testPropertyValue("opacity", "150%", "150%");
  });

  it("opacity should set / get percent", () => {
    testPropertyValue("opacity", "-50%", "-50%");
  });
});

describe("display", () => {
  it("display should set / get keyword", () => {
    testPropertyValue("display", "block", "block");
  });

  it("display should set / get keyword", () => {
    testPropertyValue("display", "inline", "inline");
  });

  it("display should set / get keyword", () => {
    testPropertyValue("display", "inline-block", "inline-block");
  });

  it("display should set / get keyword", () => {
    testPropertyValue("display", "flex", "flex");
  });

  it("display should set / get keyword", () => {
    testPropertyValue("display", "inline-flex", "inline-flex");
  });

  it("display should set / get keyword", () => {
    testPropertyValue("display", "grid", "grid");
  });

  it("display should set / get keyword", () => {
    testPropertyValue("display", "inline-grid", "inline-grid");
  });

  it("display should set / get keyword", () => {
    testPropertyValue("display", "flow", "block");
  });

  it("display should set / get keyword", () => {
    testPropertyValue("display", "flow-root", "flow-root");
  });

  it("display should set / get keyword", () => {
    testPropertyValue("display", "none", "none");
  });

  it("display should set / get keyword", () => {
    testPropertyValue("display", "contents", "contents");
  });

  it("display should set / get keyword", () => {
    testPropertyValue("display", "table-row", "table-row");
  });

  it("display should set / get keyword", () => {
    testPropertyValue("display", "flow list-item", "list-item");
  });

  it("display should set / get keyword", () => {
    testPropertyValue("display", "list-item flow", "list-item");
  });

  it("display should set / get keyword", () => {
    testPropertyValue("display", "block list-item", "list-item");
  });

  it("display should not set / get keyword", () => {
    testPropertyValue("display", "list-item block", "list-item");
  });

  it("display should set / get keyword", () => {
    testPropertyValue("display", "flow-root list-item", "flow-root list-item");
  });

  it("display should not set / get keyword", () => {
    testPropertyValue("display", "list-item flow-root", "flow-root list-item");
  });

  it("display should set / get keyword", () => {
    testPropertyValue("display", "block flow list-item", "list-item");
  });

  it("display should set / get keyword", () => {
    testPropertyValue("display", "block list-item flow", "list-item");
  });

  it("display should set / get keyword", () => {
    testPropertyValue("display", "block flow-root list-item", "flow-root list-item");
  });

  it("display should set / get keyword", () => {
    testPropertyValue("display", "block list-item flow-root", "flow-root list-item");
  });

  it("display should set / get keyword", () => {
    testPropertyValue("display", "flow block list-item", "list-item");
  });

  it("display should set / get keyword", () => {
    testPropertyValue("display", "flow list-item block", "list-item");
  });

  it("display should set / get keyword", () => {
    testPropertyValue("display", "flow-root block list-item", "flow-root list-item");
  });

  it("display should set / get keyword", () => {
    testPropertyValue("display", "flow-root list-item block", "flow-root list-item");
  });

  it("display should not set / get keyword", () => {
    testPropertyValue("display", "list-item block flow", "list-item");
  });

  it("display should not set / get keyword", () => {
    testPropertyValue("display", "list-item flow block", "list-item");
  });

  it("display should not set / get keyword", () => {
    testPropertyValue("display", "list-item block flow-root", "flow-root list-item");
  });

  it("display should not set / get keyword", () => {
    testPropertyValue("display", "list-item flow-root block", "flow-root list-item");
  });

  it("display should set / get keyword", () => {
    testPropertyValue("display", "inline flow list-item", "inline list-item");
  });

  it("display should set / get keyword", () => {
    testPropertyValue("display", "inline flow-root list-item", "inline flow-root list-item");
  });

  it("display should set / get keyword", () => {
    testPropertyValue("display", "run-in flow list-item", "run-in list-item");
  });

  it("display should set / get keyword", () => {
    testPropertyValue("display", "run-in flow-root list-item", "run-in flow-root list-item");
  });

  it("display should set / get keyword", () => {
    testPropertyValue("display", "block flow", "block");
  });

  it("display should set / get keyword", () => {
    testPropertyValue("display", "flow block", "block");
  });

  it("display should set / get keyword", () => {
    testPropertyValue("display", "block flow-root", "flow-root");
  });

  it("display should set / get keyword", () => {
    testPropertyValue("display", "block flex", "flex");
  });

  it("display should set / get keyword", () => {
    testPropertyValue("display", "block ruby", "block ruby");
  });

  it("display should set / get keyword", () => {
    testPropertyValue("display", "inline flow", "inline");
  });

  it("display should set / get keyword", () => {
    testPropertyValue("display", "flow inline", "inline");
  });

  it("display should set / get keyword", () => {
    testPropertyValue("display", "inline flow-root", "inline-block");
  });

  it("display should set / get keyword", () => {
    testPropertyValue("display", "inline flex", "inline-flex");
  });

  it("display should set / get keyword", () => {
    testPropertyValue("display", "inline ruby", "ruby");
  });

  it("display should set / get keyword", () => {
    testPropertyValue("display", "run-in flow", "run-in");
  });

  it("display should set / get keyword", () => {
    testPropertyValue("display", "flow run-in", "run-in");
  });

  it("display should set / get keyword", () => {
    testPropertyValue("display", "run-in flow-root", "run-in flow-root");
  });

  it("display should set / get keyword", () => {
    testPropertyValue("display", "run-in flex", "run-in flex");
  });

  it("display should set / get keyword", () => {
    testPropertyValue("display", "run-in ruby", "run-in ruby");
  });
});

describe("flex box", () => {
  it("flex-grow should set / get number", () => {
    testPropertyValue("flex-grow", ".5", "0.5");
  });

  it("flex-grow should not set / get negative number", () => {
    testPropertyValue("flex-grow", "-1", "");
  });

  it("flex-shrink should set / get number", () => {
    testPropertyValue("flex-shrink", ".5", "0.5");
  });

  it("flex-shrink should not set / get negative number", () => {
    testPropertyValue("flex-shrink", "-1", "");
  });

  it("flex-basis should set / get keyword", () => {
    testPropertyValue("flex-basis", "content", "content");
  });

  it("flex-basis should not set / get length", () => {
    testPropertyValue("flex-basis", "10px", "10px");
  });

  it("flex-basis should not set / get length", () => {
    testPropertyValue("flex-basis", "0", "0px");
  });

  it("flex-basis should not set / get percent", () => {
    testPropertyValue("flex-basis", "10%", "10%");
  });

  it("flex-basis should not set / get percent", () => {
    testPropertyValue("flex-basis", "0%", "0%");
  });

  it("flex should set / get keyword", () => {
    testPropertyValue("flex", "none", "0 0 auto");
  });

  it("flex should set / get keyword", () => {
    testPropertyValue("flex", "auto", "1 1 auto");
  });

  it("flex should set / get keyword", () => {
    testPropertyValue("flex", "initial", "initial");
  });

  it("flex should set / get keyword", () => {
    testPropertyValue("flex", "unset", "unset");
  });

  it("flex shorthand should not set / get longhand value", () => {
    testPropertyValue("flex", "2 1 3", "");
  });

  it("flex shorthand should not set / get longhand value", () => {
    testPropertyValue("flex", "2 1 calc(3)", "");
  });

  it("flex shorthand should set / get longhand value", () => {
    testPropertyValue("flex", "2", "2 1 0%");
  });

  it("flex shorthand should set / get longhand value", () => {
    testPropertyValue("flex", "10%", "1 1 10%");
  });

  it("flex shorthand should set / get longhand value", () => {
    testPropertyValue("flex", "2 10px", "2 1 10px");
  });

  it("flex shorthand should set / get longhand value", () => {
    testPropertyValue("flex", "2 3", "2 3 0%");
  });

  it("flex shorthand should set / get longhand value", () => {
    testPropertyValue("flex", "2 3 10px", "2 3 10px");
  });

  it("flex shorthand should set / get longhand value", () => {
    testImplicitPropertyValue(
      "flex",
      "2 var(--foo) 10px",
      "2 var(--foo) 10px",
      new Map([
        ["flex-grow", ""],
        ["flex-shrink", ""],
        ["flex-basis", ""]
      ])
    );
  });

  it("flex shorthand should set / get longhand value", () => {
    testImplicitPropertyValue(
      "flex",
      "calc(2px * 3)",
      "1 1 calc(6px)",
      new Map([
        ["flex-grow", "1"],
        ["flex-shrink", "1"],
        ["flex-basis", "calc(6px)"]
      ])
    );
  });

  it("flex shorthand should set / get longhand value", () => {
    testImplicitPropertyValue(
      "flex",
      "calc(2 * 3)",
      "calc(6) 1 0%",
      new Map([
        ["flex-grow", "calc(6)"],
        ["flex-shrink", "1"],
        ["flex-basis", "0%"]
      ])
    );
  });

  it("flex shorthand should set / get longhand value", () => {
    testImplicitPropertyValue(
      "flex",
      "initial",
      "initial",
      new Map([
        ["flex-grow", "initial"],
        ["flex-shrink", "initial"],
        ["flex-basis", "initial"]
      ])
    );
  });
});

describe("font", () => {
  it("font-style should set / get keyword", () => {
    testPropertyValue("font-style", "italic", "italic");
  });

  it("font-variant should set / get keyword", () => {
    testPropertyValue("font-variant", "normal", "normal");
  });

  it("font-variant should set / get keyword", () => {
    testPropertyValue("font-variant", "none", "none");
  });

  it("font-variant should set / get keyword", () => {
    testPropertyValue("font-variant", "none", "none");
  });

  it("font-variant should set / get keyword", () => {
    testPropertyValue("font-variant", "common-ligatures", "common-ligatures");
  });

  it("font-variant should set / get keyword", () => {
    testPropertyValue("font-variant", "no-common-ligatures", "no-common-ligatures");
  });

  it("font-variant should set / get keyword", () => {
    testPropertyValue("font-variant", "small-caps", "small-caps");
  });

  it("font-variant should set / get keyword", () => {
    testPropertyValue("font-variant", "stylistic(flowing)", "stylistic(flowing)");
  });

  it("font-variant should set / get keyword", () => {
    testPropertyValue(
      "font-variant",
      "stylistic(flowing) historical-forms styleset(flowing) character-variant(flowing) swash(flowing) ornaments(flowing) annotation(flowing)",
      "stylistic(flowing) historical-forms styleset(flowing) character-variant(flowing) swash(flowing) ornaments(flowing) annotation(flowing)"
    );
  });

  it("font-variant should set / get keyword", () => {
    testPropertyValue("font-variant", "jis78", "jis78");
  });

  it("font-variant should set / get keyword", () => {
    testPropertyValue("font-variant", "ruby", "ruby");
  });

  it("font-variant should set / get keyword", () => {
    testPropertyValue("font-variant", "sub", "sub");
  });

  it("font-variant should set / get keyword", () => {
    testPropertyValue("font-variant", "super", "super");
  });

  it("font-variant should not set / get invalid keywords", () => {
    testPropertyValue("font-variant", "normal none", "");
  });

  it("font-variant should not set / get invalid keywords", () => {
    testPropertyValue("font-variant", "normal small-caps", "");
  });

  it("font-variant should not set / get invalid keywords", () => {
    testPropertyValue("font-variant", "none small-caps", "");
  });

  it("font-weight should set / get keyword", () => {
    testPropertyValue("font-weight", "bold", "bold");
  });

  it("font-weight should set / get number", () => {
    testPropertyValue("font-weight", "400", "400");
  });

  it("font-weight should not set / get number greater than 1000", () => {
    testPropertyValue("font-weight", "1001", "");
  });

  it("font-weight should not set / get negative number", () => {
    testPropertyValue("font-weight", "-1", "");
  });

  it("font-size should set / get keyword", () => {
    testPropertyValue("font-size", "medium", "medium");
  });

  it("font-size should set / get keyword", () => {
    testPropertyValue("font-size", "larger", "larger");
  });

  it("font-size should set / get length", () => {
    testPropertyValue("font-size", "1em", "1em");
  });

  it("font-size not should set / get negative length", () => {
    testPropertyValue("font-size", "-1em", "");
  });

  it("font-size should set / get percent", () => {
    testPropertyValue("font-size", "90%", "90%");
  });

  it("font-size should not set / get negative percent", () => {
    testPropertyValue("font-size", "-10%", "");
  });

  it("line-height should set / get keyword", () => {
    testPropertyValue("line-height", "normal", "normal");
  });

  it("line-height should set / get number", () => {
    testPropertyValue("line-height", "1.2", "1.2");
  });

  it("line-height should not set / get negative number", () => {
    testPropertyValue("line-height", "-1", "");
  });

  it("line-height should set / get length", () => {
    testPropertyValue("line-height", "10px", "10px");
  });

  it("line-height should not set / get negative length", () => {
    testPropertyValue("line-height", "-10px", "");
  });

  it("line-height should set / get percent", () => {
    testPropertyValue("line-height", "10%", "10%");
  });

  it("line-height should not set / get negative percent", () => {
    testPropertyValue("line-height", "-10%", "");
  });

  it("font-family should set / get keyword", () => {
    testPropertyValue("font-family", "sans-serif", "sans-serif");
  });

  it("font-family should set / get keyword", () => {
    testPropertyValue("font-family", '"sans-serif"', '"sans-serif"');
  });

  it("font-family should set / get family name", () => {
    testPropertyValue("font-family", "Times", "Times");
  });

  it("font-family should set / get quoted family name", () => {
    testPropertyValue("font-family", '"Times New Roman"', '"Times New Roman"');
  });

  it("font-family should set / get family values", () => {
    testPropertyValue(
      "font-family",
      'Times, "Times New Roman", Georgia, serif',
      'Times, "Times New Roman", Georgia, serif'
    );
  });

  it("font-family should set / get family values", () => {
    testPropertyValue("font-family", "Times\\ New Roman, serif", '"Times New Roman", serif');
  });

  it("font-family should set / get family values", () => {
    testPropertyValue("font-family", '"Times\\ New Roman", serif', '"Times New Roman", serif');
  });

  it("font-family should set / get family values", () => {
    testPropertyValue(
      "font-family",
      '"Gill Sans Extrabold", sans-serif',
      '"Gill Sans Extrabold", sans-serif'
    );
  });

  it("font-family should set / get family values", () => {
    testPropertyValue(
      "font-family",
      '"Goudy Bookletter 1911", sans-serif',
      '"Goudy Bookletter 1911", sans-serif'
    );
  });

  it("font-family should not set / get invalid family values", () => {
    testPropertyValue("font-family", "Goudy Bookletter 1911, sans-serif", "");
  });

  it("font-family should not set / get invalid family values", () => {
    testPropertyValue("font-family", "Red/Black, sans-serif", "");
  });

  it("font-family should not set / get invalid family values", () => {
    testPropertyValue("font-family", '"Lucida" Grande, sans-serif', "");
  });

  it("font-family should not set / get invalid family values", () => {
    testPropertyValue("font-family", 'Lucida "Grande", sans-serif', "");
  });

  it("font-family should not set / get invalid family values", () => {
    testPropertyValue("font-family", "Ahem!, sans-serif", "");
  });

  it("font-family should not set / get invalid family values", () => {
    testPropertyValue("font-family", "test@foo, sans-serif", "");
  });

  it("font-family should not set / get invalid family values", () => {
    testPropertyValue("font-family", "#POUND, sans-serif", "");
  });

  it("font-family should not set / get invalid family values", () => {
    testPropertyValue("font-family", "Hawaii 5-0, sans-serif", "");
  });

  it("font-family should set / get family values", () => {
    testPropertyValue("font-family", "generic(fangsong)", "generic(fangsong)");
  });

  it("font-family should set / get family values", () => {
    testPropertyValue("font-family", "generic(kai)", "generic(kai)");
  });

  it("font-family should set / get family values", () => {
    testPropertyValue("font-family", "generic(khmer-mul)", "generic(khmer-mul)");
  });

  it("font-family should set / get family values", () => {
    testPropertyValue("font-family", "generic(nastaliq)", "generic(nastaliq)");
  });

  it("font-family should not set / get invalid family values", () => {
    testPropertyValue("font-family", "generic(foo)", "");
  });

  it("font shorthand should set / get values", () => {
    testImplicitPropertyValue(
      "font",
      'normal medium Times, "Times New Roman", Georgia, serif',
      'medium Times, "Times New Roman", Georgia, serif',
      new Map([
        ["font-style", "normal"],
        ["font-variant", "normal"],
        ["font-weight", "normal"],
        ["font-size", "medium"],
        ["line-height", "normal"],
        ["font-family", 'Times, "Times New Roman", Georgia, serif']
      ])
    );
  });

  it("font shorthand should set / get values", () => {
    testImplicitPropertyValue(
      "font",
      "normal medium Gill Sans Extrabold, sans-serif",
      'medium "Gill Sans Extrabold", sans-serif',
      new Map([
        ["font-style", "normal"],
        ["font-variant", "normal"],
        ["font-weight", "normal"],
        ["font-size", "medium"],
        ["line-height", "normal"],
        ["font-family", '"Gill Sans Extrabold", sans-serif']
      ])
    );
  });

  it("font shorthand should set / get values", () => {
    testImplicitPropertyValue(
      "font",
      'normal medium "Goudy Bookletter 1911", sans-serif',
      'medium "Goudy Bookletter 1911", sans-serif',
      new Map([
        ["font-style", "normal"],
        ["font-variant", "normal"],
        ["font-weight", "normal"],
        ["font-size", "medium"],
        ["line-height", "normal"],
        ["font-family", '"Goudy Bookletter 1911", sans-serif']
      ])
    );
  });

  it("font shorthand should set / get values", () => {
    testImplicitPropertyValue(
      "font",
      "normal medium generic(fangsong)",
      "medium generic(fangsong)",
      new Map([
        ["font-style", "normal"],
        ["font-variant", "normal"],
        ["font-weight", "normal"],
        ["font-size", "medium"],
        ["line-height", "normal"],
        ["font-family", "generic(fangsong)"]
      ])
    );
  });

  it("font shorthand should not set / get invalid values", () => {
    testImplicitPropertyValue(
      "font",
      "normal medium Goudy Bookletter 1911, sans-serif",
      "",
      new Map([
        ["font-style", ""],
        ["font-variant", ""],
        ["font-weight", ""],
        ["font-size", ""],
        ["line-height", ""],
        ["font-family", ""]
      ])
    );
  });

  it("font shorthand should not set / get invalid values", () => {
    testImplicitPropertyValue(
      "font",
      "normal medium Red/Black, sans-serif",
      "",
      new Map([
        ["font-style", ""],
        ["font-variant", ""],
        ["font-weight", ""],
        ["font-size", ""],
        ["line-height", ""],
        ["font-family", ""]
      ])
    );
  });

  it("font shorthand should not set / get invalid values", () => {
    testImplicitPropertyValue(
      "font",
      'normal medium "Lucida" Grande, sans-serif',
      "",
      new Map([
        ["font-style", ""],
        ["font-variant", ""],
        ["font-weight", ""],
        ["font-size", ""],
        ["line-height", ""],
        ["font-family", ""]
      ])
    );
  });

  it("font shorthand should not set / get invalid values", () => {
    testImplicitPropertyValue(
      "font",
      'normal medium Lucida "Grande", sans-serif',
      "",
      new Map([
        ["font-style", ""],
        ["font-variant", ""],
        ["font-weight", ""],
        ["font-size", ""],
        ["line-height", ""],
        ["font-family", ""]
      ])
    );
  });

  it("font shorthand should not set / get invalid values", () => {
    testImplicitPropertyValue(
      "font",
      "normal medium Ahem!, sans-serif",
      "",
      new Map([
        ["font-style", ""],
        ["font-variant", ""],
        ["font-weight", ""],
        ["font-size", ""],
        ["line-height", ""],
        ["font-family", ""]
      ])
    );
  });

  it("font shorthand should not set / get invalid values", () => {
    testImplicitPropertyValue(
      "font",
      "normal medium test@foo, sans-serif",
      "",
      new Map([
        ["font-style", ""],
        ["font-variant", ""],
        ["font-weight", ""],
        ["font-size", ""],
        ["line-height", ""],
        ["font-family", ""]
      ])
    );
  });

  it("font shorthand should not set / get invalid values", () => {
    testImplicitPropertyValue(
      "font",
      "normal medium #POUND, sans-serif",
      "",
      new Map([
        ["font-style", ""],
        ["font-variant", ""],
        ["font-weight", ""],
        ["font-size", ""],
        ["line-height", ""],
        ["font-family", ""]
      ])
    );
  });

  it("font shorthand should not set / get invalid values", () => {
    testImplicitPropertyValue(
      "font",
      "normal medium Hawaii 5-0, sans-serif",
      "",
      new Map([
        ["font-style", ""],
        ["font-variant", ""],
        ["font-weight", ""],
        ["font-size", ""],
        ["line-height", ""],
        ["font-family", ""]
      ])
    );
  });

  it("font shorthand should set / get values", () => {
    testImplicitPropertyValue(
      "font",
      'italic bold medium/1.2 Times, "Times New Roman", Georgia, serif',
      'italic bold medium / 1.2 Times, "Times New Roman", Georgia, serif',
      new Map([
        ["font-style", "italic"],
        ["font-variant", "normal"],
        ["font-weight", "bold"],
        ["font-size", "medium"],
        ["line-height", "1.2"],
        ["font-family", 'Times, "Times New Roman", Georgia, serif']
      ])
    );
  });

  it("font shorthand should set / get values", () => {
    testImplicitPropertyValue(
      "font",
      'italic bold calc(3em/2)/1.2 Times, "Times New Roman", Georgia, serif',
      'italic bold calc(1.5em) / 1.2 Times, "Times New Roman", Georgia, serif',
      new Map([
        ["font-style", "italic"],
        ["font-variant", "normal"],
        ["font-weight", "bold"],
        ["font-size", "calc(1.5em)"],
        ["line-height", "1.2"],
        ["font-family", 'Times, "Times New Roman", Georgia, serif']
      ])
    );
  });

  it("font shorthand should set / get values", () => {
    testImplicitPropertyValue(
      "font",
      'italic bold var(--foo)/1.2 Times, "Times New Roman", Georgia, serif',
      'italic bold var(--foo)/1.2 Times, "Times New Roman", Georgia, serif',
      new Map([
        ["font-style", ""],
        ["font-variant", ""],
        ["font-weight", ""],
        ["font-size", ""],
        ["line-height", ""],
        ["font-family", ""]
      ])
    );
  });

  it("font shorthand should set / get values", () => {
    testImplicitPropertyValue(
      "font",
      "initial",
      "initial",
      new Map([
        ["font-style", "initial"],
        ["font-variant", "initial"],
        ["font-weight", "initial"],
        ["font-size", "initial"],
        ["line-height", "initial"],
        ["font-family", "initial"]
      ])
    );
  });
});

describe("logical", () => {
  it("clear should set / get keyword", () => {
    testPropertyValue("clear", "left", "left");
  });

  it("clear should set / get keyword", () => {
    testPropertyValue("clear", "none", "none");
  });

  it("float should set / get keyword", () => {
    testPropertyValue("float", "left", "left");
  });

  it("float should set / get keyword", () => {
    testPropertyValue("float", "none", "none");
  });
});

describe("masking", () => {
  it("clip should set / get keyword", () => {
    testPropertyValue("clip", "auto", "auto");
  });

  it("clip should set / get legacy <shape>", () => {
    testPropertyValue("clip", "rect(0, 10px, 2cm, 40EM)", "rect(0px, 10px, 2cm, 40em)");
  });
});

describe("positioning", () => {
  it("bottom should set / get keyword", () => {
    testPropertyValue("bottom", "auto", "auto");
  });

  it("bottom should set / get length", () => {
    testPropertyValue("bottom", "10px", "10px");
  });

  it("bottom should set / get percent", () => {
    testPropertyValue("bottom", "10%", "10%");
  });

  it("left should set / get keyword", () => {
    testPropertyValue("left", "auto", "auto");
  });

  it("left should set / get length", () => {
    testPropertyValue("left", "10px", "10px");
  });

  it("left should set / get percent", () => {
    testPropertyValue("left", "10%", "10%");
  });

  it("right should set / get keyword", () => {
    testPropertyValue("right", "auto", "auto");
  });

  it("right should set / get length", () => {
    testPropertyValue("right", "10px", "10px");
  });

  it("right should set / get percent", () => {
    testPropertyValue("right", "10%", "10%");
  });

  it("top should set / get keyword", () => {
    testPropertyValue("top", "auto", "auto");
  });

  it("top should set / get length", () => {
    testPropertyValue("top", "10px", "10px");
  });

  it("top should set / get percent", () => {
    testPropertyValue("top", "10%", "10%");
  });
});

describe("user interface", () => {
  it("outline-color should set / get color name", () => {
    testPropertyValue("outline-color", "green", "green");
  });

  it("outline-color should set / get hex color", () => {
    testPropertyValue("outline-color", "#008000", "rgb(0, 128, 0)");
  });

  it("outline-color should set / get color function", () => {
    testPropertyValue("outline-color", "rgb(0 128 0)", "rgb(0, 128, 0)");
  });
});

/* regression tests */
describe("regression test for https://github.com/jsdom/jsdom/issues/3833", () => {
  it("should set global value unset", () => {
    const style = new CSSStyleDeclaration(window);
    style.setProperty("width", "10px");
    assert.strictEqual(style.getPropertyValue("width"), "10px");

    style.setProperty("width", "unset");
    assert.strictEqual(style.getPropertyValue("width"), "unset");
  });
});

describe("regression test for https://github.com/jsdom/jsdom/issues/3878", () => {
  it("should not set custom properties twice", () => {
    const style = new CSSStyleDeclaration(window);
    style.setProperty("--foo", 0);
    style.setProperty("--foo", 1);

    assert.strictEqual(style.length, 1);
    assert.strictEqual(style.item(0), "--foo");
    assert.strictEqual(style.item(1), "");
    assert.strictEqual(style.getPropertyValue("--foo"), "1");
  });
});

describe("regression test for https://github.com/jsdom/cssstyle/issues/129", () => {
  it("should set stringified value", () => {
    const style = new CSSStyleDeclaration(window);
    style.setProperty("--foo", true);
    assert.strictEqual(style.getPropertyValue("--foo"), "true");
  });

  it("throws for setting Symbol", () => {
    const style = new CSSStyleDeclaration(window);
    assert.throws(
      () => style.setProperty("width", Symbol("foo")),
      (e) => {
        assert.strictEqual(e instanceof TypeError, true);
        assert.strictEqual(e.message, "Can not convert symbol to string.");
        return true;
      }
    );
    assert.throws(
      () => {
        style.width = Symbol("foo");
      },
      (e) => {
        assert.strictEqual(e instanceof TypeError, true);
        assert.strictEqual(e.message, "Can not convert symbol to string.");
        return true;
      }
    );
  });
});

describe("regression test for https://github.com/jsdom/cssstyle/issues/70", () => {
  it('returns empty string for "webkit-*", without leading "-"', () => {
    const style = new CSSStyleDeclaration(window);
    style.cssText = "background-color: green; webkit-transform: scale(3);";
    assert.strictEqual(style.backgroundColor, "green");
    assert.strictEqual(style.webkitTransform, "");
  });

  it('should set/get value for "-webkit-*"', () => {
    const style = new CSSStyleDeclaration(window);
    style.cssText = "background-color: green; -webkit-transform: scale(3);";
    assert.strictEqual(style.backgroundColor, "green");
    assert.strictEqual(style.webkitTransform, "scale(3)");
  });

  it('returns undefined for unknown "-webkit-*"', () => {
    const style = new CSSStyleDeclaration(window);
    style.cssText = "background-color: green; -webkit-foo: scale(3);";
    assert.strictEqual(style.backgroundColor, "green");
    assert.strictEqual(style.webkitFoo, undefined);
  });
});

describe("regression test for https://github.com/jsdom/cssstyle/issues/124", () => {
  it("no-op when setting undefined to border", () => {
    const style = new CSSStyleDeclaration(window);
    style.border = "1px solid green";
    assert.strictEqual(style.border, "1px solid green");
    style.border = undefined;
    assert.strictEqual(style.border, "1px solid green");
  });

  it("no-op when setting undefined to borderWidth", () => {
    const style = new CSSStyleDeclaration(window);
    style.borderWidth = "1px";
    assert.strictEqual(style.borderWidth, "1px");
    style.border = undefined;
    assert.strictEqual(style.borderWidth, "1px");
  });
});

describe("regression test for https://github.com/jsdom/cssstyle/issues/212", () => {
  it("should support <generic-family> keywords", () => {
    const keywords = [
      "serif",
      "sans-serif",
      "cursive",
      "fantasy",
      "monospace",
      "system-ui",
      "math",
      "ui-serif",
      "ui-sans-serif",
      "ui-monospace",
      "ui-rounded"
    ];
    const style = new CSSStyleDeclaration(window);
    for (const keyword of keywords) {
      style.fontFamily = keyword;
      assert.strictEqual(style.fontFamily, keyword);
    }
  });

  it("should support generic() function keywords", () => {
    const keywords = [
      "generic(fangsong)",
      "generic(kai)",
      "generic(khmer-mul)",
      "generic(nastaliq)"
    ];
    const style = new CSSStyleDeclaration(window);
    for (const keyword of keywords) {
      style.fontFamily = keyword;
      assert.strictEqual(style.fontFamily, keyword);
    }
  });

  // see https://drafts.csswg.org/css-fonts-4/#changes-2021-12-21
  it("should support removed generic keywords as non generic family name", () => {
    const keywords = ["emoji", "fangsong"];
    const style = new CSSStyleDeclaration(window);
    for (const keyword of keywords) {
      style.fontFamily = keyword;
      assert.strictEqual(style.fontFamily, keyword);
    }
  });

  it("should support `-webkit-` prefixed family name", () => {
    const style = new CSSStyleDeclaration(window);
    style.fontFamily = "-webkit-body";
    assert.strictEqual(style.fontFamily, "-webkit-body");
  });
});

describe("regression test for https://github.com/jsdom/jsdom/issues/3021", () => {
  it("should get normalized value for font shorthand", () => {
    const style = new CSSStyleDeclaration(window);
    style.font = "normal bold 4px sans-serif";
    assert.strictEqual(style.font, "bold 4px sans-serif");
  });
});

describe("regression test for https://github.com/jsdom/cssstyle/issues/214", () => {
  it("should return value for each property", () => {
    const style = new CSSStyleDeclaration(window);
    const key = "background-color";
    const camel = "backgroundColor";
    const value = "var(--foo)";
    style[key] = value;
    assert.strictEqual(style[key], value);
    style[key] = null;
    style[camel] = value;
    assert.strictEqual(style[camel], value);
  });

  it("should set var() values for background-attachment correctly", () => {
    const style = new CSSStyleDeclaration(window);
    style.backgroundAttachment = "var(--foo)";
    assert.strictEqual(style.backgroundAttachment, "var(--foo)");
    style.setProperty("background-attachment", "var(--bar)");
    assert.strictEqual(style.backgroundAttachment, "var(--bar)");
  });

  it("should allow changing a single property on a border, when border contains a css variable", () => {
    const style = new CSSStyleDeclaration(window);
    style.border = "0.1rem solid var(--my-color-value)";
    assert.strictEqual(style.border, "0.1rem solid var(--my-color-value)");
    style.borderWidth = "0.2rem";
    assert.strictEqual(style.borderWidth, "0.2rem");
    assert.strictEqual(style.border, "");
  });

  it("should get value and priority", () => {
    const style = new CSSStyleDeclaration(window);
    style.cssText = "word-spacing: 1px !important;";
    assert.strictEqual(style.cssText, "word-spacing: 1px !important;", "cssText");
    assert.strictEqual(style.getPropertyValue("word-spacing"), "1px", "value");
    assert.strictEqual(style.getPropertyPriority("word-spacing"), "important", "priority");
  });
});

describe("regression test for https://github.com/jsdom/jsdom/issues/3944", () => {
  it("should get overwritten value", () => {
    const style = new CSSStyleDeclaration(window);
    style.cssText =
      "background: linear-gradient(rgb(0 0 255 / 0.5), rgb(255 255 0 / 0.5)) center center;";
    assert.strictEqual(
      style.cssText,
      "background: linear-gradient(rgba(0, 0, 255, 0.5), rgba(255, 255, 0, 0.5)) center center;"
    );
    assert.strictEqual(style.backgroundPosition, "center center");

    style.cssText =
      "background:linear-gradient(rgb(0 0 255 / 0.5), rgb(255 255 0 / 0.5)) center center; background-position: top;";
    assert.strictEqual(
      style.cssText,
      "background: linear-gradient(rgba(0, 0, 255, 0.5), rgba(255, 255, 0, 0.5)) center top;"
    );
    assert.strictEqual(style.backgroundPosition, "center top");
  });

  it("should not overwrite value", () => {
    const style = new CSSStyleDeclaration(window);
    style.cssText =
      "background: linear-gradient(rgb(0 0 255 / 0.5), rgb(255 255 0 / 0.5)) center center !important; background-position: top;";
    assert.strictEqual(
      style.cssText,
      "background: linear-gradient(rgba(0, 0, 255, 0.5), rgba(255, 255, 0, 0.5)) center center !important;"
    );
    assert.strictEqual(style.backgroundPosition, "center center");
  });

  it("should get overwritten value", () => {
    const style = new CSSStyleDeclaration(window);
    style.cssText =
      "background:linear-gradient(rgb(0 0 255 / 0.5), rgb(255 255 0 / 0.5)) center center !important; background-position: top !important;";
    assert.strictEqual(
      style.cssText,
      "background: linear-gradient(rgba(0, 0, 255, 0.5), rgba(255, 255, 0, 0.5)) center top !important;"
    );
    assert.strictEqual(style.backgroundPosition, "center top");
  });
});
