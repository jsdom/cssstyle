"use strict";

// AST Node types
exports.AST_TYPES = Object.freeze({
  DIMENSION: "Dimension",
  FUNCTION: "Function",
  HASH: "Hash",
  IDENTIFIER: "Identifier",
  NUMBER: "Number",
  PERCENTAGE: "Percentage",
  STRING: "String",
  URL: "Url"
});

// CSS calc() function names
exports.CALC_FUNC_NAMES =
  "(?:a?(?:cos|sin|tan)|abs|atan2|calc|clamp|exp|hypot|log|max|min|mod|pow|rem|round|sign|sqrt)";

// Default options
exports.DEFAULT_OPTS = {
  format: "specifiedValue"
};

// Node.ELEMENT_NODE
exports.ELEMENT_NODE = 1;

// CSS global keywords
// @see https://drafts.csswg.org/css-cascade-5/#defaulting-keywords
exports.GLOBAL_KEYS = Object.freeze(["initial", "inherit", "unset", "revert", "revert-layer"]);

// NoModificationAllowedError name
exports.NO_MODIFICATION_ALLOWED_ERR = "NoModificationAllowedError";

// System colors
// @see https://drafts.csswg.org/css-color/#css-system-colors
// @see https://drafts.csswg.org/css-color/#deprecated-system-colors
exports.SYS_COLORS = Object.freeze([
  "accentcolor",
  "accentcolortext",
  "activeborder",
  "activecaption",
  "activetext",
  "appworkspace",
  "background",
  "buttonborder",
  "buttonface",
  "buttonhighlight",
  "buttonshadow",
  "buttontext",
  "canvas",
  "canvastext",
  "captiontext",
  "field",
  "fieldtext",
  "graytext",
  "highlight",
  "highlighttext",
  "inactiveborder",
  "inactivecaption",
  "inactivecaptiontext",
  "infobackground",
  "infotext",
  "linktext",
  "mark",
  "marktext",
  "menu",
  "menutext",
  "scrollbar",
  "selecteditem",
  "selecteditemtext",
  "threeddarkshadow",
  "threedface",
  "threedhighlight",
  "threedlightshadow",
  "threedshadow",
  "visitedtext",
  "window",
  "windowframe",
  "windowtext"
]);
