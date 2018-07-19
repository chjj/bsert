/*!
 * assert.js - assertions for javascript
 * Copyright (c) 2018, Christopher Jeffrey (MIT License).
 * https://github.com/chjj/bsert
 */

'use strict';

/**
 * AssertionError
 */

class AssertionError extends Error {
  constructor(options) {
    super();

    if (!options)
      options = {};

    if (typeof options === 'string')
      options = { message: options };

    this.type = 'AssertionError';
    this.name = 'AssertionError';
    this.code = 'ERR_ASSERTION';
    this.message = options.message ? String(options.message) : '';
    this.actual = options.actual;
    this.expected = options.expected;
    this.operator = options.operator || '===';

    if (!this.message) {
      const a = stringify(this.actual);
      const b = stringify(this.expected);

      this.message = `${a} ${this.operator} ${b}`;
    }

    if (Error.captureStackTrace)
      Error.captureStackTrace(this, options.start || AssertionError);
  }
}

/**
 * Assert
 */

function assert(value, message) {
  if (!value) {
    throw new AssertionError({
      message,
      actual: false,
      expected: true,
      operator: '==',
      start: assert
    });
  }
}

assert.assert = assert;
assert.AssertionError = AssertionError;

assert.enforce = function enforce(value, name, type) {
  if (!value) {
    const err = new TypeError(`'${name}' must be a(n) ${type}.`);
    if (Error.captureStackTrace)
      Error.captureStackTrace(err, enforce);
    throw err;
  }
};

assert.equal = function equal(actual, expected, message) {
  if (actual !== expected) {
    throw new AssertionError({
      message,
      actual,
      expected,
      operator: '===',
      start: equal
    });
  }
};

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual === expected) {
    throw new AssertionError({
      message,
      actual,
      expected,
      operator: '!==',
      start: notEqual
    });
  }
};

assert.strictEqual = assert.equal;
assert.notStrictEqual = assert.notEqual;

/*
 * Helpers
 */

function stringify(value) {
  switch (typeof value) {
    case 'undefined':
      return 'undefined';
    case 'object':
      if (value === null)
        return 'null';

      if (!value.constructor
          || !value.constructor.name) {
        return '[Object]';
      }

      return `[Object: ${value.constructor.name}]`;
    case 'boolean':
      return value.toString();
    case 'number':
      return value.toString(10);
    case 'string':
      if (value.length > 64)
        value = value.substring(0, 64);
      return JSON.stringify(value);
    case 'symbol':
      return value.toString();
    case 'function':
      if (!value.name)
        return '[Function]';
      return `[Function: ${value.name}]`;
    case 'bigint':
      return `${value.toString()}n`;
    default:
      return '[Unknown]';
  }
}

/*
 * Expose
 */

module.exports = assert;
