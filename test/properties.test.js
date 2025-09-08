"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { CSSStyleDeclaration } = require("../lib/CSSStyleDeclaration");

function testPropertyValue(property, value, expected) {
  const style = new CSSStyleDeclaration();
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
    testPropertyValue("clip", "rect(0, 10px, 20%, 40EM)", "rect(0px, 10px, 20%, 40em)");
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
