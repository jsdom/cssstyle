// Forked from https://github.com/asamuzaK/cssColor/blob/main/src/js/cache.ts

"use strict";

const { LRUCache } = require("lru-cache");

class CacheItem {
  #isNull;
  #item;

  constructor(item, isNull = false) {
    this.#item = item;
    this.#isNull = Boolean(isNull);
  }

  get item() {
    return this.#item;
  }

  get isNull() {
    return this.#isNull;
  }
}

class NullObject extends CacheItem {
  constructor() {
    super(Symbol("null"), true);
  }
}

// lru cache
const lruCache = new LRUCache({
  max: 4096
});

/**
 * @param key - cache key
 * @param value - value to cache
 * @returns void
 */
const setCache = (key, value) => {
  if (key) {
    if (value === null) {
      lruCache.set(key, new NullObject());
    } else if (value instanceof CacheItem) {
      lruCache.set(key, value);
    } else {
      lruCache.set(key, new CacheItem(value));
    }
  }
};

/**
 * @param key - cache key
 * @returns cached item or false otherwise
 */
const getCache = (key) => {
  if (key && lruCache.has(key)) {
    const cachedItem = lruCache.get(key);
    if (cachedItem instanceof CacheItem) {
      if (cachedItem.isNull) {
        return null;
      }
      return cachedItem.item;
    }
    // delete unexpected cached item
    lruCache.delete(key);
    return false;
  }
  return false;
};

/**
 * @param value - CSS value
 * @returns stringified value in JSON notation
 */
const valueToJsonString = (value) => {
  if (typeof value === "undefined") {
    return "";
  }
  const res = JSON.stringify(value, (_key, val) => {
    let replacedValue;
    if (typeof val === "undefined") {
      replacedValue = null;
    } else if (typeof val === "function") {
      replacedValue = val.name;
    } else if (val instanceof Map || val instanceof Set) {
      replacedValue = [...val];
    } else if (typeof val === "bigint") {
      replacedValue = val.toString();
    } else {
      replacedValue = val;
    }
    return replacedValue;
  });
  return res;
};

/**
 * @param keyData - key data
 * @param [opt] - options
 * @returns cache key
 */
const createCacheKey = (keyData, opt = {}) => {
  const { customProperty = {}, dimension = {} } = opt;
  let cacheKey = "";
  if (
    keyData &&
    Object.keys(keyData).length &&
    typeof customProperty.callback !== "function" &&
    typeof dimension.callback !== "function"
  ) {
    keyData.opt = valueToJsonString(opt);
    cacheKey = valueToJsonString(keyData);
  }
  return cacheKey;
};

module.exports = {
  createCacheKey,
  getCache,
  setCache
};
