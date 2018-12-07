/*!
 * assert.js - assertions for javascript
 * Copyright (c) 2018, Christopher Jeffrey (MIT License).
 * https://github.com/chjj/bsert
 */

'use strict';

/*
 * Constants
 */

const MAX_LENGTH = 300;

/**
 * AssertionError
 */

class AssertionError extends Error {
  constructor(options) {
    if (typeof options === 'string')
      options = { message: options };

    if (options === null || typeof options !== 'object')
      options = {};

    let message = '';
    let operator = '!=';
    let generatedMessage = false;

    if (options.message != null)
      message = toString(options.message);

    if (typeof options.operator === 'string')
      operator = options.operator;

    if (!message) {
      const a = stringify(options.actual);
      const b = stringify(options.expected);

      message = `${a} ${operator} ${b}`;
      generatedMessage = true;
    }

    super(message);

    let start = this.constructor;

    if (typeof options.start === 'function')
      start = options.start;
    else if (typeof options.stackStartFn === 'function')
      start = options.stackStartFn;
    else if (typeof options.stackStartFunction === 'function')
      start = options.stackStartFunction;

    this.type = 'AssertionError';
    this.name = 'AssertionError [ERR_ASSERTION]';
    this.code = 'ERR_ASSERTION';
    this.generatedMessage = generatedMessage;
    this.actual = options.actual;
    this.expected = options.expected;
    this.operator = operator;

    if (Error.captureStackTrace)
      Error.captureStackTrace(this, start);
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

function equal(actual, expected, message) {
  if (actual !== expected) {
    throw new AssertionError({
      message,
      actual,
      expected,
      operator: '===',
      start: equal
    });
  }
}

function notEqual(actual, expected, message) {
  if (actual === expected) {
    throw new AssertionError({
      message,
      actual,
      expected,
      operator: '!==',
      start: notEqual
    });
  }
}

function fail(message) {
  if (message == null || message === '')
    message = 'Failed';

  throw new AssertionError({
    message,
    actual: false,
    expected: true,
    operator: '==',
    start: fail
  });
}

function throws(func, expected, message) {
  if (typeof expected === 'string') {
    message = expected;
    expected = null;
  }

  let thrown = false;
  let err = null;

  try {
    func();
  } catch (e) {
    thrown = true;
    err = e;
  }

  if (!thrown || !testError(err, expected, throws)) {
    throw new AssertionError({
      message,
      actual: false,
      expected: true,
      operator: 'throws',
      start: throws
    });
  }
}

async function rejects(func, expected, message) {
  if (typeof expected === 'string') {
    message = expected;
    expected = null;
  }

  let thrown = false;
  let err = null;

  try {
    await func();
  } catch (e) {
    thrown = true;
    err = e;
  }

  if (!thrown || !testError(err, expected, rejects)) {
    throw new AssertionError({
      message,
      actual: false,
      expected: true,
      operator: 'rejects',
      start: rejects
    });
  }
}

function ifError(err) {
  if (err != null) {
    let message = 'ifError got unwanted exception: ';

    if (typeof err === 'object' && typeof err.message === 'string') {
      if (err.message.length === 0 && err.constructor)
        message += err.constructor.name;
      else
        message += err.message;
    } else {
      message += stringify(err);
    }

    throw new AssertionError({
      message,
      actual: err,
      expected: null,
      operator: 'ifError',
      start: ifError
    });
  }
}

function deepEqual(actual, expected, message) {
  if (!isDeepEqual(actual, expected)) {
    throw new AssertionError({
      message,
      actual,
      expected,
      operator: 'deepEqual',
      start: deepEqual
    });
  }
}

function notDeepEqual(actual, expected, message) {
  if (isDeepEqual(actual, expected)) {
    throw new AssertionError({
      message,
      actual,
      expected,
      operator: 'notDeepEqual',
      start: notDeepEqual
    });
  }
}

function bufferEqual(actual, expected, enc, message) {
  if (!isEncoding(enc)) {
    message = enc;
    enc = null;
  }

  expected = bufferize(actual, expected, enc);

  enforce(isBuffer(actual), 'actual', 'buffer', bufferEqual);
  enforce(isBuffer(expected), 'expected', 'buffer', bufferEqual);

  if (actual !== expected && !actual.equals(expected)) {
    throw new AssertionError({
      message,
      actual: actual.toString('hex'),
      expected: expected.toString('hex'),
      operator: 'bufferEqual',
      start: bufferEqual
    });
  }
}

function notBufferEqual(actual, expected, enc, message) {
  if (!isEncoding(enc)) {
    message = enc;
    enc = null;
  }

  expected = bufferize(actual, expected, enc);

  enforce(isBuffer(actual), 'actual', 'buffer', notBufferEqual);
  enforce(isBuffer(expected), 'expected', 'buffer', notBufferEqual);

  if (actual === expected || actual.equals(expected)) {
    throw new AssertionError({
      message,
      actual: actual.toString('hex'),
      expected: expected.toString('hex'),
      operator: 'notBufferEqual',
      start: notBufferEqual
    });
  }
}

function enforce(value, name, type, func) {
  if (!value) {
    const err = new TypeError(`'${name}' must be a(n) ${type}.`);
    if (Error.captureStackTrace)
      Error.captureStackTrace(err, func || enforce);
    throw err;
  }
}

function range(value, name, func) {
  if (!value) {
    const err = new RangeError(`'${name}' is out of range.`);
    if (Error.captureStackTrace)
      Error.captureStackTrace(err, func || range);
    throw err;
  }
}

/*
 * Helpers
 */

function stringify(value) {
  const max = assert.MAX_LENGTH;

  switch (typeof value) {
    case 'undefined':
      return 'undefined';
    case 'object':
      if (value === null)
        return 'null';

      if (isBuffer(value)) {
        value = value.slice(0, max >>> 1);
        return `[Buffer: ${value.toString('hex')}]`;
      }

      if (!value.constructor
          || typeof value.constructor.name !== 'string'
          || value.constructor.name === 'Object') {
        return '[Object]';
      }

      return `[Object: ${value.constructor.name}]`;
    case 'boolean':
      return value.toString();
    case 'number':
      return value.toString(10);
    case 'string':
      value = value.substring(0, max);
      return JSON.stringify(value);
    case 'symbol':
      return value.toString();
    case 'function':
      if (typeof value.name !== 'string')
        return '[Function]';
      return `[Function: ${value.name}]`;
    case 'bigint':
      return `${value.toString()}n`;
    default:
      return '[Unknown]';
  }
}

function toString(str) {
  if (typeof str === 'string')
    return str;

  return stringify(str);
}

function testError(err, expected, func) {
  if (expected == null)
    return true;

  if (expected instanceof RegExp)
    return expected.test(err);

  if (typeof expected !== 'function') {
    if (typeof expected !== 'object')
      return false;

    if (err == null)
      return false;

    const keys = Object.keys(expected);

    if (expected instanceof Error)
      keys.push('name', 'message');

    if (keys.length === 0)
      return false;

    for (const key of keys) {
      const expect = expected[key];

      if (!(key in err))
        return false;

      const value = err[key];

      if ((expect instanceof RegExp) && typeof value === 'string') {
        if (!expect.test(value))
          return false;

        continue;
      }

      if (!isDeepEqual(value, expect))
        return false;
    }

    return true;
  }

  if (expected.prototype !== undefined && (err instanceof expected))
    return true;

  if (Error.isPrototypeOf(expected))
    return false;

  return expected.call({}, err) === true;
}

function objectString(obj) {
  return Object.prototype.toString.call(obj);
}

function hasOwnProperty(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function isObject(buf) {
  return buf && typeof buf === 'object';
}

function isBuffer(buf) {
  return isObject(buf)
      && typeof buf.writeUInt32LE === 'function'
      && typeof buf.equals === 'function';
}

function isArguments(object) {
  return objectString(object) === '[object Arguments]';
}

function isView(view) {
  if (isBuffer(view))
    return false;

  if (typeof ArrayBuffer.isView === 'function')
    return ArrayBuffer.isView(view);

  if (!view)
    return false;

  if (view instanceof DataView)
    return true;

  if (view.buffer && (view.buffer instanceof ArrayBuffer))
    return true;

  return false;
}

function isEqual(x, y) {
  if (x === y)
    return x !== 0 || 1 / x === 1 / y;
  return x !== x && y !== y;
}

function isDeepEqual(x, y) {
  return compare(x, y, null);
}

function compare(a, b, cache) {
  // Primitives
  if (isEqual(a, b))
    return true;

  if (!isObject(a) || !isObject(b))
    return false;

  // Semi-primitives
  if (objectString(a) !== objectString(b))
    return false;

  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b))
    return false;

  if (isBuffer(a) && isBuffer(b))
    return a.equals(b);

  if ((a instanceof Date) && (b instanceof Date))
    return a.getTime() === b.getTime();

  if ((a instanceof RegExp) && (b instanceof RegExp)) {
    return a.source === b.source
        && a.global === b.global
        && a.multiline === b.multiline
        && a.lastIndex === b.lastIndex
        && a.ignoreCase === b.ignoreCase;
  }

  if ((a instanceof Error) && (b instanceof Error)) {
    if (a.message !== b.message)
      return false;
  }

  if ((a instanceof ArrayBuffer) && (b instanceof ArrayBuffer)) {
    a = new Uint8Array(a);
    b = new Uint8Array(b);
  }

  if (isView(a) && isView(b)
      && !(a instanceof Float32Array)
      && !(b instanceof Float64Array)) {
    const x = new Uint8Array(a.buffer);
    const y = new Uint8Array(b.buffer);

    if (x.length !== y.length)
      return false;

    for (let i = 0; i < x.length; i++) {
      if (x[i] !== y[i])
        return false;
    }

    return true;
  }

  if ((a instanceof Set) && (b instanceof Set)) {
    if (a.size !== b.size)
      return false;

    const keys = [...a, ...b];

    for (const key of keys) {
      if (a.has(key) !== b.has(key))
        return false;
    }

    return true;
  }

  // Recursive
  if (!cache) {
    cache = {
      a: new Map(),
      b: new Map(),
      p: 0
    };
  } else {
    const aa = cache.a.get(a);

    if (aa != null) {
      const bb = cache.b.get(b);
      if (bb != null)
        return aa === bb;
    }

    cache.p += 1;
  }

  cache.a.set(a, cache.p);
  cache.b.set(b, cache.p);

  const ret = recurse(a, b, cache);

  cache.a.delete(a);
  cache.b.delete(b);

  return ret;
}

function recurse(a, b, cache) {
  if (isArguments(a) && isArguments(b)) {
    const x = Array.prototype.slice.call(a);
    const y = Array.prototype.slice.call(b);

    if (!isDeepEqual(x, y))
      return false;

    return true;
  }

  if ((a instanceof Map) && (b instanceof Map)) {
    if (a.size !== b.size)
      return false;

    const keys = new Set([...a.keys(), ...b.keys()]);

    for (const key of keys) {
      if (a.has(key) !== b.has(key))
        return false;

      if (!compare(a.get(key), b.get(key), cache))
        return false;
    }

    return true;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length)
      return false;

    for (let i = 0; i < a.length; i++) {
      if (!compare(a[i], b[i], cache))
        return false;
    }

    return true;
  }

  const ak = Object.keys(a);
  const bk = Object.keys(b);

  if (ak.length !== bk.length)
    return false;

  const keys = new Set([...ak, ...bk]);

  for (const key of keys) {
    if (hasOwnProperty(a, key) !== hasOwnProperty(b, key))
      return false;

    if (!compare(a[key], b[key], cache))
      return false;
  }

  return true;
}

function isEncoding(enc) {
  if (typeof enc !== 'string')
    return false;

  switch (enc) {
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'hex':
    case 'latin1':
    case 'ucs2':
    case 'utf8':
    case 'utf16le':
      return true;
  }

  return false;
}

function bufferize(actual, expected, enc) {
  if (enc == null)
    enc = 'hex';

  if (typeof expected === 'string') {
    const ctor = actual ? actual.constructor : null;

    if (!ctor || typeof ctor.from !== 'function')
      return null;

    if (!isEncoding(enc))
      return null;

    if (enc === 'hex' && (expected.length & 1))
      return null;

    const raw = ctor.from(expected, enc);

    if (enc === 'hex' && raw.length !== (expected.length >>> 1))
      return null;

    return raw;
  }

  return expected;
}

/*
 * API
 */

assert.MAX_LENGTH = MAX_LENGTH;
assert.AssertionError = AssertionError;
assert.assert = assert;
assert.strict = assert;
assert.ok = assert;
assert.equal = equal;
assert.notEqual = notEqual;
assert.strictEqual = equal;
assert.notStrictEqual = notEqual;
assert.fail = fail;
assert.throws = throws;
assert.rejects = rejects;
assert.ifError = ifError;
assert.deepEqual = deepEqual;
assert.notDeepEqual = notDeepEqual;
assert.deepStrictEqual = deepEqual;
assert.notDeepStrictEqual = notDeepEqual;
assert.bufferEqual = bufferEqual;
assert.notBufferEqual = notBufferEqual;
assert.enforce = enforce;
assert.range = range;

/*
 * Expose
 */

module.exports = assert;
