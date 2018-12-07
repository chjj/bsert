'use strict';

const assert = require('assert');
const bsert = require('../');

if (process.browser) {
  assert.deepStrictEqual = bsert.deepStrictEqual;
  assert.notDeepStrictEqual = bsert.notDeepStrictEqual;
}

function makeObj() {
  const now = 1544200539595;
  return {
    undef: undefined,
    nil: null,
    nan: NaN,
    inf: Infinity,
    ninf: -Infinity,
    number: 1,
    string: 'foo',
    error: new Error('foobar'),
    buffer: Buffer.from([1, 2, 3]),
    time: new Date(now),
    regex: /hello/,
    arraybuffer: new Uint8Array([1, 2, 3]).buffer,
    uint8array: new Uint8Array([1, 2, 3]),
    float32array: new Float32Array([1, 2, 3]),
    args: arguments,
    map: new Map([[1, 'a'], [2, 'b'], [3, 'c']]),
    set: new Set([1, 2, 3]),
    array: [1, 2, 3],
    object: { a: 1, b: 2, c: 3 }
  };
}

function makeArr() {
  const out = [];

  for (let i = 0; i < 10; i++) {
    const obj = makeObj();

    obj.one = makeObj(makeObj());
    obj.two = makeObj(makeObj());
    obj.three = makeObj(makeObj());

    if (i > 0)
      obj.prev = out[i - 1];

    out.push(obj);
  }

  out[0].prev = out[9];

  return out;
}

function equal(a, b) {
  assert.deepStrictEqual(a, b);
  bsert.deepStrictEqual(a, b);

  assert.deepStrictEqual(b, a);
  bsert.deepStrictEqual(b, a);

  assert.throws(() => {
    assert.notDeepStrictEqual(a, b);
  });

  assert.throws(() => {
    bsert.notDeepStrictEqual(a, b);
  });

  bsert.throws(() => {
    assert.notDeepStrictEqual(a, b);
  });

  bsert.throws(() => {
    bsert.notDeepStrictEqual(a, b);
  });

  assert.throws(() => {
    assert.notDeepStrictEqual(b, a);
  });

  assert.throws(() => {
    bsert.notDeepStrictEqual(b, a);
  });

  bsert.throws(() => {
    assert.notDeepStrictEqual(b, a);
  });

  bsert.throws(() => {
    bsert.notDeepStrictEqual(b, a);
  });
}

function notEqual(a, b) {
  assert.notDeepStrictEqual(a, b);
  bsert.notDeepStrictEqual(a, b);

  assert.notDeepStrictEqual(b, a);
  bsert.notDeepStrictEqual(b, a);

  assert.throws(() => {
    assert.deepStrictEqual(a, b);
  });

  assert.throws(() => {
    bsert.deepStrictEqual(a, b);
  });

  bsert.throws(() => {
    assert.deepStrictEqual(a, b);
  });

  bsert.throws(() => {
    bsert.deepStrictEqual(a, b);
  });

  assert.throws(() => {
    assert.deepStrictEqual(b, a);
  });

  assert.throws(() => {
    bsert.deepStrictEqual(b, a);
  });

  bsert.throws(() => {
    assert.deepStrictEqual(b, a);
  });

  bsert.throws(() => {
    bsert.deepStrictEqual(b, a);
  });
}

describe('Assert', function() {
  it('should have environment', () => {
    assert(typeof bsert === 'function');
    assert(bsert.strict);
    assert(bsert.strict === bsert);
    assert(bsert.MAX_LENGTH === 300);
  });

  it('should do assert', () => {
    bsert({});
    bsert('null');
    bsert('false');
    bsert('0');
    bsert(true);
    bsert(1);

    assert.throws(() => bsert());
    assert.throws(() => bsert(null));
    assert.throws(() => bsert(undefined));
    assert.throws(() => bsert(false));
    assert.throws(() => bsert(NaN));
    assert.throws(() => bsert(0));
    assert.throws(() => bsert(''));
  });

  it('should do assert.equal', () => {
    bsert.equal(1, 1);
    bsert.equal(true, true);
    bsert.notEqual(null, undefined);
    bsert.notEqual({}, {});
    bsert.notEqual(0, '0');
    bsert.notEqual(1, '1');

    assert.throws(() => bsert.notEqual(1, 1));
    assert.throws(() => bsert.notEqual(true, true));
    assert.throws(() => bsert.equal(false, true));
    assert.throws(() => bsert.equal(null, undefined));
    assert.throws(() => bsert.equal({}, {}));
    assert.throws(() => bsert.equal(1, '1'));
  });

  it('should do assert.strictEqual', () => {
    bsert.strictEqual(1, 1);
    bsert.strictEqual(true, true);
    bsert.notStrictEqual(null, undefined);
    bsert.notStrictEqual({}, {});
    bsert.notStrictEqual(0, '0');
    bsert.notStrictEqual(1, '1');

    assert.throws(() => bsert.notStrictEqual(1, 1));
    assert.throws(() => bsert.notStrictEqual(true, true));
    assert.throws(() => bsert.strictEqual(false, true));
    assert.throws(() => bsert.strictEqual(null, undefined));
    assert.throws(() => bsert.strictEqual({}, {}));
    assert.throws(() => bsert.strictEqual(1, '1'));
  });

  it('should do assert.fail', () => {
    assert.throws(() => bsert.fail('foobar'), /foobar/);
  });

  it('should do assert.throws', () => {
    bsert.throws(() => {
      throw new Error('foobar');
    });

    assert.throws(() => {
      bsert.throws(() => {});
    });

    bsert.throws(() => {
      throw new Error('foobar');
    }, /foobar/);

    assert.throws(() => {
      bsert.throws(() => {
        throw new Error('foobar');
      }, /foobaz/);
    });

    bsert.throws(() => {
      throw new Error('foobar');
    }, e => /foobar/.test(e));

    assert.throws(() => {
      bsert.throws(() => {
        throw new Error('foobar');
      }, e => /foobaz/.test(e));
    });

    bsert.throws(() => {
      throw new RangeError('foobar');
    }, RangeError);

    assert.throws(() => {
      bsert.throws(() => {
        throw new Error('foobar');
      }, RangeError);
    });

    bsert.throws(() => {
      throw new RangeError('foobar');
    }, new RangeError('foobar'));

    assert.throws(() => {
      bsert.throws(() => {
        throw new Error('foobar');
      }, new RangeError('foobar'));
    });

    if (process.browser)
      return;

    bsert.throws(() => {
      throw new RangeError('foobar');
    }, { message: 'foobar' });

    assert.throws(() => {
      bsert.throws(() => {
        throw new Error('foobar');
      }, { message: 'foobaz' });
    });

    bsert.throws(() => {
      throw new RangeError('foobar');
    }, { message: /foobar/ });

    assert.throws(() => {
      bsert.throws(() => {
        throw new Error('foobar');
      }, { message: /foobaz/ });
    });
  });

  it('should do assert.rejects', async () => {
    await bsert.rejects(async () => {
      throw new Error('foobar');
    });

    await assert.rejects(async () => {
      await bsert.rejects(async () => {});
    });

    await bsert.rejects(async () => {
      throw new Error('foobar');
    }, /foobar/);

    await assert.rejects(async () => {
      await bsert.rejects(async () => {
        throw new Error('foobar');
      }, /foobaz/);
    });

    await bsert.rejects(async () => {
      throw new Error('foobar');
    }, e => /foobar/.test(e));

    await assert.rejects(async () => {
      await bsert.rejects(async () => {
        throw new Error('foobar');
      }, e => /foobaz/.test(e));
    });

    await bsert.rejects(async () => {
      throw new RangeError('foobar');
    }, RangeError);

    await assert.rejects(async () => {
      await bsert.rejects(async () => {
        throw new Error('foobar');
      }, RangeError);
    });

    await bsert.rejects(async () => {
      throw new RangeError('foobar');
    }, new RangeError('foobar'));

    await assert.rejects(async () => {
      await bsert.rejects(async () => {
        throw new Error('foobar');
      }, new RangeError('foobar'));
    });

    if (process.browser)
      return;

    await bsert.rejects(async () => {
      throw new RangeError('foobar');
    }, { message: 'foobar' });

    await assert.rejects(async () => {
      await bsert.rejects(async () => {
        throw new Error('foobar');
      }, { message: 'foobaz' });
    });

    await bsert.rejects(async () => {
      throw new RangeError('foobar');
    }, { message: /foobar/ });

    await assert.rejects(async () => {
      await bsert.rejects(async () => {
        throw new Error('foobar');
      }, { message: /foobaz/ });
    });
  });

  it('should do assert.ifError', () => {
    bsert.ifError();
    bsert.ifError(null);

    assert.throws(() => {
      bsert.ifError(new Error('foobar'));
    }, /foobar/);

    assert.throws(() => {
      bsert.ifError('foobar');
    }, /foobar/);
  });

  it('should do deep equal', () => {
    const now = 1544200539595;

    equal(undefined, undefined);
    notEqual(undefined, null);
    notEqual(undefined, NaN);
    notEqual(undefined, 0);
    notEqual(undefined, '');
    notEqual(undefined, []);

    equal(null, null);
    notEqual(null, undefined);
    notEqual(null, NaN);
    notEqual(null, 0);
    notEqual(null, '');
    notEqual(null, []);

    equal(NaN, NaN);
    notEqual(NaN, undefined);
    notEqual(NaN, null);
    notEqual(NaN, 0);
    notEqual(NaN, '');
    notEqual(NaN, []);

    equal(Infinity, Infinity);
    notEqual(Infinity, -Infinity);
    notEqual(Infinity, NaN);

    notEqual(0, '');
    notEqual(0, null);
    notEqual(0, NaN);
    notEqual('', null);
    notEqual(NaN, null);
    notEqual(NaN, undefined);
    notEqual(null, undefined);
    notEqual(0, undefined);
    notEqual('', undefined);
    notEqual(Infinity, NaN);
    notEqual(Infinity, -Infinity);
    notEqual(-0, 0);

    equal(-0, -0);
    equal(Infinity, Infinity);
    equal(NaN, NaN);

    if (typeof BigInt === 'function') {
      equal(BigInt(0), BigInt(0));
      notEqual(0, BigInt(0));
    }

    equal(1, 1);
    notEqual(1, 0);
    notEqual(1, '1');
    notEqual(1, /1/);
    notEqual(1, [1]);
    notEqual(1, {});

    equal('foo', 'foo');
    notEqual('foo', 'bar');
    notEqual('foo', /foo/);
    notEqual('foo', ['foo']);
    notEqual('foo', {});

    equal(Buffer.from([1, 2, 3]), Buffer.from([1, 2, 3]));
    notEqual(Buffer.from([1, 2, 3, 4]), Buffer.from([1, 2, 3]));
    notEqual(Buffer.from([1, 2]), Buffer.from([1, 2, 3]));
    notEqual(Buffer.from([2, 2, 3]), Buffer.from([1, 2, 3]));
    notEqual(Buffer.from([1, 2, 3]), [1, 2, 3]);
    notEqual(Buffer.from([1, 2, 3]), '1,2,3');
    notEqual(Buffer.from([1, 2, 3]), { 0: 1, 0: 2, 0: 3, length: 3 });
    notEqual(Buffer.from([1, 2, 3]), {});

    equal(new Date(now), new Date(now));
    notEqual(new Date(now + 1), new Date(now));
    notEqual(new Date(now), now);
    notEqual(new Date(now), String(now));
    notEqual(new Date(now), new Date(now).toString());
    notEqual(new Date(now), [now]);
    notEqual(new Date(now), {});

    equal(/a/, /a/);
    notEqual(/^a/, /a/);
    notEqual(/a/, 'a');
    notEqual(/a/, '/a/');
    notEqual(/a/, [/a/]);
    notEqual(/a/, {});

    equal(new Uint8Array([1, 2, 3]).buffer,
          new Uint8Array([1, 2, 3]).buffer);
    notEqual(new Uint8Array([1, 2, 3, 4]).buffer,
             new Uint8Array([1, 2, 3]).buffer);
    notEqual(new Uint8Array([1, 2]).buffer,
             new Uint8Array([1, 2, 3]).buffer);
    notEqual(new Uint8Array([2, 2, 3]).buffer,
             new Uint8Array([1, 2, 3]).buffer);
    notEqual(new Uint8Array([1, 2, 3]).buffer, [1, 2, 3]);
    notEqual(new Uint8Array([1, 2, 3]).buffer, '1,2,3');
    notEqual(new Uint8Array([1, 2, 3]).buffer, {});
    notEqual(new Uint8Array([1, 2, 3]).buffer,
             { 0: 1, 0: 2, 0: 3, length: 3 });

    equal(new Uint8Array([1, 2, 3]), new Uint8Array([1, 2, 3]));
    notEqual(new Uint8Array([1, 2, 3, 4]), new Uint8Array([1, 2, 3]));
    notEqual(new Uint8Array([1, 2]), new Uint8Array([1, 2, 3]));
    notEqual(new Uint8Array([2, 2, 3]), new Uint8Array([1, 2, 3]));
    notEqual(new Uint8Array([1, 2, 3]), [1, 2, 3]);
    notEqual(new Uint8Array([1, 2, 3]), '1,2,3');
    notEqual(new Uint8Array([1, 2, 3]), {});
    notEqual(new Uint8Array([1, 2, 3]),
             { 0: 1, 0: 2, 0: 3, length: 3 });

    equal(new Float32Array([1, 2, 3]), new Float32Array([1, 2, 3]));
    notEqual(new Float32Array([1, 2, 3, 4]), new Float32Array([1, 2, 3]));
    notEqual(new Float32Array([1, 2]), new Float32Array([1, 2, 3]));
    notEqual(new Float32Array([2, 2, 3]), new Float32Array([1, 2, 3]));
    notEqual(new Float32Array([1, 2, 3]), [1, 2, 3]);
    notEqual(new Float32Array([1, 2, 3]), '1,2,3');
    notEqual(new Float32Array([1, 2, 3]),
             { 0: 1, 0: 2, 0: 3, length: 3 });
    notEqual(new Float32Array([1, 2, 3]), {});

    equal(arguments, arguments);
    notEqual(arguments, Object.assign({}, arguments));
    notEqual(arguments, { length: arguments.length });
    notEqual(arguments, {});

    equal(new Map([[1, 'a'], [2, 'b']]), new Map([[1, 'a'], [2, 'b']]));
    notEqual(new Map([[1, 'b'], [2, 'b']]), new Map([[1, 'a'], [2, 'b']]));
    notEqual(new Map([[3, 'a'], [2, 'b']]), new Map([[1, 'a'], [2, 'b']]));
    notEqual(new Map([[1, 'a'], [2, 'b'], [3, 'c']]),
             new Map([[1, 'a'], [2, 'b']]));
    notEqual(new Map([[1, 'a'], [2, 'b']]), { 1: 'a', 2: 'b' });
    notEqual(new Map([[1, 'a'], [2, 'b']]), { 1: 'a', 2: 'b', size: 2 });
    notEqual(new Map([[1, 'a'], [2, 'b']]), ['a', 'b']);
    notEqual(new Map([[1, 'a'], [2, 'b']]), { size: 2 });
    notEqual(new Map([[1, 'a'], [2, 'b']]), {});

    equal(new Set([1, 2, 3]), new Set([1, 2, 3]));
    notEqual(new Set([4, 2, 3]), new Set([1, 2, 3]));
    notEqual(new Set([1, 2, 3, 4]), new Set([1, 2, 3]));
    notEqual(new Set([2, 3]), new Set([1, 2, 3]));
    notEqual(new Set([1, 2]), new Set([1, 2, 3]));
    notEqual(new Set([1, 2]), [1, 2]);
    notEqual(new Set([1, 2]), '1,2');
    notEqual(new Set([1, 2]), { 0: 1, 1: 2, size: 2 });
    notEqual(new Set([1, 2]), { size: 2 });
    notEqual(new Set([1, 2]), {});

    equal([1, 2, 3], [1, 2, 3]);
    notEqual([4, 2, 3], [1, 2, 3]);
    notEqual([1, 2, 3, 4], [1, 2, 3]);
    notEqual([2, 3], [1, 2, 3]);
    notEqual([1, 2], [1, 2, 3]);
    notEqual([1, 2], { 1: 1, 2: 2 });
    notEqual([1, 2], new Set([1, 2]));
    notEqual([1, 2], '1,2');
    notEqual([1, 2], 3);
    notEqual([1, 2], 2);
    notEqual([1, 2], { 0: 1, 1: 2, length: 2 });
    notEqual([1, 2], { length: 2 });
    notEqual([1, 2], {});

    equal({ a: 1, b: 2, c: 3 }, { a: 1, b: 2, c: 3 });
    notEqual({ a: 0, b: 2, c: 3 }, { a: 1, b: 2, c: 3 });
    notEqual({ a: 1, b: 2, c: 3, d: 4 }, { a: 1, b: 2, c: 3 });
    notEqual({ a: 1, b: 2 }, { a: 1, b: 2, c: 3 });
    notEqual({ a: 1, b: 2 }, new Map([['a', 1], ['b', 2]]));
    notEqual({ a: 1, b: 2 }, {});
    notEqual({ a: 1, b: 2 }, [1, 2]);
    notEqual({ a: 1, b: 2 }, 3);

    equal(
      {
        a: {
          b: {
            c: 1,
            d: 'foo'
          }
        }
      },
      {
        a: {
          b: {
            c: 1,
            d: 'foo'
          }
        }
      }
    );

    notEqual(
      {
        a: {
          b: {
            c: 1,
            d: 'bar'
          }
        }
      },
      {
        a: {
          b: {
            c: 1,
            d: 'foo'
          }
        }
      }
    );

    notEqual(
      {
        a: {
          b: {
            c: 1,
            d: 'bar'
          }
        }
      },
      {
        a: {
          b: {
            c: 1,
            d: 'bar',
            e: 'baz'
          }
        }
      }
    );
  });

  it('should do deep equal (change)', () => {
    const a = makeArr();
    const b = makeArr();

    a[0].a = a;
    a[0].b = b;

    b[0].a = a;
    b[0].b = b;

    assert.deepStrictEqual(a, b);
    bsert.deepStrictEqual(a, b);
    assert.deepStrictEqual(b, a);
    bsert.deepStrictEqual(b, a);

    a[1].number = 0;
    assert.notDeepStrictEqual(a, b);
    bsert.notDeepStrictEqual(a, b);
    assert.notDeepStrictEqual(b, a);
    bsert.notDeepStrictEqual(b, a);

    a[1].number = 1;
    assert.deepStrictEqual(a, b);
    bsert.deepStrictEqual(a, b);
    assert.deepStrictEqual(b, a);
    bsert.deepStrictEqual(b, a);

    a[1].string = 'fo';
    assert.notDeepStrictEqual(a, b);
    bsert.notDeepStrictEqual(a, b);
    assert.notDeepStrictEqual(b, a);
    bsert.notDeepStrictEqual(b, a);

    a[1].string = 'foo';
    assert.deepStrictEqual(a, b);
    bsert.deepStrictEqual(a, b);
    assert.deepStrictEqual(b, a);
    bsert.deepStrictEqual(b, a);

    a[1].buffer[2] = 8;
    assert.notDeepStrictEqual(a, b);
    bsert.notDeepStrictEqual(a, b);
    assert.notDeepStrictEqual(b, a);
    bsert.notDeepStrictEqual(b, a);

    a[1].buffer[2] = 3;
    assert.deepStrictEqual(a, b);
    bsert.deepStrictEqual(a, b);
    assert.deepStrictEqual(b, a);
    bsert.deepStrictEqual(b, a);

    a[1].time.setTime(0);
    assert.notDeepStrictEqual(a, b);
    bsert.notDeepStrictEqual(a, b);
    assert.notDeepStrictEqual(b, a);
    bsert.notDeepStrictEqual(b, a);

    a[1].time.setTime(1544200539595);
    assert.deepStrictEqual(a, b);
    bsert.deepStrictEqual(a, b);
    assert.deepStrictEqual(b, a);
    bsert.deepStrictEqual(b, a);

    a[1].regex = /^hello/;
    assert.notDeepStrictEqual(a, b);
    bsert.notDeepStrictEqual(a, b);
    assert.notDeepStrictEqual(b, a);
    bsert.notDeepStrictEqual(b, a);

    a[1].regex = /hello/;
    assert.deepStrictEqual(a, b);
    bsert.deepStrictEqual(a, b);
    assert.deepStrictEqual(b, a);
    bsert.deepStrictEqual(b, a);

    (new Uint8Array(a[1].arraybuffer))[2] = 8;
    assert.notDeepStrictEqual(a, b);
    bsert.notDeepStrictEqual(a, b);
    assert.notDeepStrictEqual(b, a);
    bsert.notDeepStrictEqual(b, a);

    (new Uint8Array(a[1].arraybuffer))[2] = 3;
    assert.deepStrictEqual(a, b);
    bsert.deepStrictEqual(a, b);
    assert.deepStrictEqual(b, a);
    bsert.deepStrictEqual(b, a);

    a[1].uint8array[2] = 8;
    assert.notDeepStrictEqual(a, b);
    bsert.notDeepStrictEqual(a, b);
    assert.notDeepStrictEqual(b, a);
    bsert.notDeepStrictEqual(b, a);

    a[1].uint8array[2] = 3;
    assert.deepStrictEqual(a, b);
    bsert.deepStrictEqual(a, b);
    assert.deepStrictEqual(b, a);
    bsert.deepStrictEqual(b, a);

    a[1].float32array[2] = 8;
    assert.notDeepStrictEqual(a, b);
    bsert.notDeepStrictEqual(a, b);
    assert.notDeepStrictEqual(b, a);
    bsert.notDeepStrictEqual(b, a);

    a[1].float32array[2] = 3;
    assert.deepStrictEqual(a, b);
    bsert.deepStrictEqual(a, b);
    assert.deepStrictEqual(b, a);
    bsert.deepStrictEqual(b, a);

    const args = a[1].args;
    a[1].args = {};
    assert.notDeepStrictEqual(a, b);
    bsert.notDeepStrictEqual(a, b);
    assert.notDeepStrictEqual(b, a);
    bsert.notDeepStrictEqual(b, a);

    a[1].args = args;
    assert.deepStrictEqual(a, b);
    bsert.deepStrictEqual(a, b);
    assert.deepStrictEqual(b, a);
    bsert.deepStrictEqual(b, a);

    a[1].map.set(1, 'g');
    assert.notDeepStrictEqual(a, b);
    bsert.notDeepStrictEqual(a, b);
    assert.notDeepStrictEqual(b, a);
    bsert.notDeepStrictEqual(b, a);

    a[1].map.set(1, 'a');
    assert.deepStrictEqual(a, b);
    bsert.deepStrictEqual(a, b);
    assert.deepStrictEqual(b, a);
    bsert.deepStrictEqual(b, a);

    a[1].set.delete(1);
    assert.notDeepStrictEqual(a, b);
    bsert.notDeepStrictEqual(a, b);
    assert.notDeepStrictEqual(b, a);
    bsert.notDeepStrictEqual(b, a);

    a[1].set.add(1);
    assert.deepStrictEqual(a, b);
    bsert.deepStrictEqual(a, b);
    assert.deepStrictEqual(b, a);
    bsert.deepStrictEqual(b, a);

    a[1].array[0] = 2;
    assert.notDeepStrictEqual(a, b);
    bsert.notDeepStrictEqual(a, b);
    assert.notDeepStrictEqual(b, a);
    bsert.notDeepStrictEqual(b, a);

    a[1].array[0] = 1;
    assert.deepStrictEqual(a, b);
    bsert.deepStrictEqual(a, b);
    assert.deepStrictEqual(b, a);
    bsert.deepStrictEqual(b, a);

    a[1].object.a = 3;
    assert.notDeepStrictEqual(a, b);
    bsert.notDeepStrictEqual(a, b);
    assert.notDeepStrictEqual(b, a);
    bsert.notDeepStrictEqual(b, a);

    a[1].object.a = 1;
    assert.deepStrictEqual(a, b);
    bsert.deepStrictEqual(a, b);
    assert.deepStrictEqual(b, a);
    bsert.deepStrictEqual(b, a);
  });

  it('should do deep equal (add)', () => {
    const a = makeArr();
    const b = makeArr();

    assert.deepStrictEqual(a, b);
    bsert.deepStrictEqual(a, b);
    assert.deepStrictEqual(b, a);
    bsert.deepStrictEqual(b, a);

    a[1].number2 = 0;
    assert.notDeepStrictEqual(a, b);
    bsert.notDeepStrictEqual(a, b);
    assert.notDeepStrictEqual(b, a);
    bsert.notDeepStrictEqual(b, a);

    delete a[1].number2;
    assert.deepStrictEqual(a, b);
    bsert.deepStrictEqual(a, b);
    assert.deepStrictEqual(b, a);
    bsert.deepStrictEqual(b, a);

    a[1].string2 = 'fo';
    assert.notDeepStrictEqual(a, b);
    bsert.notDeepStrictEqual(a, b);
    assert.notDeepStrictEqual(b, a);
    bsert.notDeepStrictEqual(b, a);

    delete a[1].string2;
    assert.deepStrictEqual(a, b);
    bsert.deepStrictEqual(a, b);
    assert.deepStrictEqual(b, a);
    bsert.deepStrictEqual(b, a);

    a[1].regex2 = /^hello/;
    assert.notDeepStrictEqual(a, b);
    bsert.notDeepStrictEqual(a, b);
    assert.notDeepStrictEqual(b, a);
    bsert.notDeepStrictEqual(b, a);

    delete a[1].regex2;
    assert.deepStrictEqual(a, b);
    bsert.deepStrictEqual(a, b);
    assert.deepStrictEqual(b, a);
    bsert.deepStrictEqual(b, a);

    a[1].map.set(4, 'g');
    assert.notDeepStrictEqual(a, b);
    bsert.notDeepStrictEqual(a, b);
    assert.notDeepStrictEqual(b, a);
    bsert.notDeepStrictEqual(b, a);

    a[1].map.delete(4);
    assert.deepStrictEqual(a, b);
    bsert.deepStrictEqual(a, b);
    assert.deepStrictEqual(b, a);
    bsert.deepStrictEqual(b, a);

    a[1].set.add(17);
    assert.notDeepStrictEqual(a, b);
    bsert.notDeepStrictEqual(a, b);
    assert.notDeepStrictEqual(b, a);
    bsert.notDeepStrictEqual(b, a);

    a[1].set.delete(17);
    assert.deepStrictEqual(a, b);
    bsert.deepStrictEqual(a, b);
    assert.deepStrictEqual(b, a);
    bsert.deepStrictEqual(b, a);

    a[1].array.push(b);
    assert.notDeepStrictEqual(a, b);
    bsert.notDeepStrictEqual(a, b);
    assert.notDeepStrictEqual(b, a);
    bsert.notDeepStrictEqual(b, a);

    a[1].array.pop();
    assert.deepStrictEqual(a, b);
    bsert.deepStrictEqual(a, b);
    assert.deepStrictEqual(b, a);
    bsert.deepStrictEqual(b, a);

    a[1].object.x = 1;
    assert.notDeepStrictEqual(a, b);
    bsert.notDeepStrictEqual(a, b);
    assert.notDeepStrictEqual(b, a);
    bsert.notDeepStrictEqual(b, a);

    delete a[1].object.x;
    assert.deepStrictEqual(a, b);
    bsert.deepStrictEqual(a, b);
    assert.deepStrictEqual(b, a);
    bsert.deepStrictEqual(b, a);
  });

  it('should do deep equal (remove)', () => {
    const a = makeArr();
    const b = makeArr();

    assert.deepStrictEqual(a, b);
    bsert.deepStrictEqual(a, b);
    assert.deepStrictEqual(b, a);
    bsert.deepStrictEqual(b, a);

    delete a[1].number;
    assert.notDeepStrictEqual(a, b);
    bsert.notDeepStrictEqual(a, b);
    assert.notDeepStrictEqual(b, a);
    bsert.notDeepStrictEqual(b, a);

    a[1].number = 1;
    assert.deepStrictEqual(a, b);
    bsert.deepStrictEqual(a, b);
    assert.deepStrictEqual(b, a);
    bsert.deepStrictEqual(b, a);

    delete a[1].string;
    assert.notDeepStrictEqual(a, b);
    bsert.notDeepStrictEqual(a, b);
    assert.notDeepStrictEqual(b, a);
    bsert.notDeepStrictEqual(b, a);

    a[1].string = 'foo';
    assert.deepStrictEqual(a, b);
    bsert.deepStrictEqual(a, b);
    assert.deepStrictEqual(b, a);
    bsert.deepStrictEqual(b, a);

    delete a[1].buffer;
    assert.notDeepStrictEqual(a, b);
    bsert.notDeepStrictEqual(a, b);
    assert.notDeepStrictEqual(b, a);
    bsert.notDeepStrictEqual(b, a);

    a[1].buffer = a[2].buffer;
    assert.deepStrictEqual(a, b);
    bsert.deepStrictEqual(a, b);
    assert.deepStrictEqual(b, a);
    bsert.deepStrictEqual(b, a);

    delete a[1].time;
    assert.notDeepStrictEqual(a, b);
    bsert.notDeepStrictEqual(a, b);
    assert.notDeepStrictEqual(b, a);
    bsert.notDeepStrictEqual(b, a);

    a[1].time = a[2].time;
    assert.deepStrictEqual(a, b);
    bsert.deepStrictEqual(a, b);
    assert.deepStrictEqual(b, a);
    bsert.deepStrictEqual(b, a);

    delete a[1].regex;
    assert.notDeepStrictEqual(a, b);
    bsert.notDeepStrictEqual(a, b);
    assert.notDeepStrictEqual(b, a);
    bsert.notDeepStrictEqual(b, a);

    a[1].regex = /hello/;
    assert.deepStrictEqual(a, b);
    bsert.deepStrictEqual(a, b);
    assert.deepStrictEqual(b, a);
    bsert.deepStrictEqual(b, a);

    delete a[1].arraybuffer;
    assert.notDeepStrictEqual(a, b);
    bsert.notDeepStrictEqual(a, b);
    assert.notDeepStrictEqual(b, a);
    bsert.notDeepStrictEqual(b, a);

    a[1].arraybuffer = a[2].arraybuffer;
    assert.deepStrictEqual(a, b);
    bsert.deepStrictEqual(a, b);
    assert.deepStrictEqual(b, a);
    bsert.deepStrictEqual(b, a);

    delete a[1].uint8array;
    assert.notDeepStrictEqual(a, b);
    bsert.notDeepStrictEqual(a, b);
    assert.notDeepStrictEqual(b, a);
    bsert.notDeepStrictEqual(b, a);

    a[1].uint8array = a[2].uint8array;
    assert.deepStrictEqual(a, b);
    bsert.deepStrictEqual(a, b);
    assert.deepStrictEqual(b, a);
    bsert.deepStrictEqual(b, a);

    delete a[1].float32array;
    assert.notDeepStrictEqual(a, b);
    bsert.notDeepStrictEqual(a, b);
    assert.notDeepStrictEqual(b, a);
    bsert.notDeepStrictEqual(b, a);

    a[1].float32array = a[2].float32array;
    assert.deepStrictEqual(a, b);
    bsert.deepStrictEqual(a, b);
    assert.deepStrictEqual(b, a);
    bsert.deepStrictEqual(b, a);

    delete a[1].args;
    assert.notDeepStrictEqual(a, b);
    bsert.notDeepStrictEqual(a, b);
    assert.notDeepStrictEqual(b, a);
    bsert.notDeepStrictEqual(b, a);

    a[1].args = a[2].args;
    assert.deepStrictEqual(a, b);
    bsert.deepStrictEqual(a, b);
    assert.deepStrictEqual(b, a);
    bsert.deepStrictEqual(b, a);

    a[1].map.delete(1);
    assert.notDeepStrictEqual(a, b);
    bsert.notDeepStrictEqual(a, b);
    assert.notDeepStrictEqual(b, a);
    bsert.notDeepStrictEqual(b, a);

    a[1].map = new Map([...a[2].map]);
    assert.deepStrictEqual(a, b);
    bsert.deepStrictEqual(a, b);
    assert.deepStrictEqual(b, a);
    bsert.deepStrictEqual(b, a);

    a[1].set.delete(1);
    assert.notDeepStrictEqual(a, b);
    bsert.notDeepStrictEqual(a, b);
    assert.notDeepStrictEqual(b, a);
    bsert.notDeepStrictEqual(b, a);

    a[1].set = new Set([...a[2].set]);
    assert.deepStrictEqual(a, b);
    bsert.deepStrictEqual(a, b);
    assert.deepStrictEqual(b, a);
    bsert.deepStrictEqual(b, a);

    a[1].array.pop();
    assert.notDeepStrictEqual(a, b);
    bsert.notDeepStrictEqual(a, b);
    assert.notDeepStrictEqual(b, a);
    bsert.notDeepStrictEqual(b, a);

    a[1].array = [...a[2].array];
    assert.deepStrictEqual(a, b);
    bsert.deepStrictEqual(a, b);
    assert.deepStrictEqual(b, a);
    bsert.deepStrictEqual(b, a);

    delete a[1].object.a;
    assert.notDeepStrictEqual(a, b);
    bsert.notDeepStrictEqual(a, b);
    assert.notDeepStrictEqual(b, a);
    bsert.notDeepStrictEqual(b, a);

    a[1].object.a = 1;
    assert.deepStrictEqual(a, b);
    bsert.deepStrictEqual(a, b);
    assert.deepStrictEqual(b, a);
    bsert.deepStrictEqual(b, a);
  });

  it('should do deep equal (type)', () => {
    const a = makeArr();
    const b = makeArr();

    assert.deepStrictEqual(a, b);
    bsert.deepStrictEqual(a, b);
    assert.deepStrictEqual(b, a);
    bsert.deepStrictEqual(b, a);

    a[1].number = 'foo';
    assert.notDeepStrictEqual(a, b);
    bsert.notDeepStrictEqual(a, b);
    assert.notDeepStrictEqual(b, a);
    bsert.notDeepStrictEqual(b, a);

    a[1].number = 1;
    assert.deepStrictEqual(a, b);
    bsert.deepStrictEqual(a, b);
    assert.deepStrictEqual(b, a);
    bsert.deepStrictEqual(b, a);

    a[1].string = 1;
    assert.notDeepStrictEqual(a, b);
    bsert.notDeepStrictEqual(a, b);
    assert.notDeepStrictEqual(b, a);
    bsert.notDeepStrictEqual(b, a);

    a[1].string = 'foo';
    assert.deepStrictEqual(a, b);
    bsert.deepStrictEqual(a, b);
    assert.deepStrictEqual(b, a);
    bsert.deepStrictEqual(b, a);

    a[1].buffer = 'ha';
    assert.notDeepStrictEqual(a, b);
    bsert.notDeepStrictEqual(a, b);
    assert.notDeepStrictEqual(b, a);
    bsert.notDeepStrictEqual(b, a);

    a[1].buffer = a[2].buffer;
    assert.deepStrictEqual(a, b);
    bsert.deepStrictEqual(a, b);
    assert.deepStrictEqual(b, a);
    bsert.deepStrictEqual(b, a);

    a[1].time = 1;
    assert.notDeepStrictEqual(a, b);
    bsert.notDeepStrictEqual(a, b);
    assert.notDeepStrictEqual(b, a);
    bsert.notDeepStrictEqual(b, a);

    a[1].time = a[2].time;
    assert.deepStrictEqual(a, b);
    bsert.deepStrictEqual(a, b);
    assert.deepStrictEqual(b, a);
    bsert.deepStrictEqual(b, a);

    a[1].regex = '';
    assert.notDeepStrictEqual(a, b);
    bsert.notDeepStrictEqual(a, b);
    assert.notDeepStrictEqual(b, a);
    bsert.notDeepStrictEqual(b, a);

    a[1].regex = /hello/;
    assert.deepStrictEqual(a, b);
    bsert.deepStrictEqual(a, b);
    assert.deepStrictEqual(b, a);
    bsert.deepStrictEqual(b, a);

    a[1].arraybuffer = {};
    assert.notDeepStrictEqual(a, b);
    bsert.notDeepStrictEqual(a, b);
    assert.notDeepStrictEqual(b, a);
    bsert.notDeepStrictEqual(b, a);

    a[1].arraybuffer = a[2].arraybuffer;
    assert.deepStrictEqual(a, b);
    bsert.deepStrictEqual(a, b);
    assert.deepStrictEqual(b, a);
    bsert.deepStrictEqual(b, a);

    a[1].uint8array = /foo/;
    assert.notDeepStrictEqual(a, b);
    bsert.notDeepStrictEqual(a, b);
    assert.notDeepStrictEqual(b, a);
    bsert.notDeepStrictEqual(b, a);

    a[1].uint8array = a[2].uint8array;
    assert.deepStrictEqual(a, b);
    bsert.deepStrictEqual(a, b);
    assert.deepStrictEqual(b, a);
    bsert.deepStrictEqual(b, a);

    a[1].float32array = a;
    assert.notDeepStrictEqual(a, b);
    bsert.notDeepStrictEqual(a, b);
    assert.notDeepStrictEqual(b, a);
    bsert.notDeepStrictEqual(b, a);

    a[1].float32array = a[2].float32array;
    assert.deepStrictEqual(a, b);
    bsert.deepStrictEqual(a, b);
    assert.deepStrictEqual(b, a);
    bsert.deepStrictEqual(b, a);

    const args = a[1].args;
    a[1].args = a[1].float32array;
    assert.notDeepStrictEqual(a, b);
    bsert.notDeepStrictEqual(a, b);
    assert.notDeepStrictEqual(b, a);
    bsert.notDeepStrictEqual(b, a);

    a[1].args = args;
    assert.deepStrictEqual(a, b);
    bsert.deepStrictEqual(a, b);
    assert.deepStrictEqual(b, a);
    bsert.deepStrictEqual(b, a);

    a[1].map = args;
    assert.notDeepStrictEqual(a, b);
    bsert.notDeepStrictEqual(a, b);
    assert.notDeepStrictEqual(b, a);
    bsert.notDeepStrictEqual(b, a);

    a[1].map = a[2].map;
    assert.deepStrictEqual(a, b);
    bsert.deepStrictEqual(a, b);
    assert.deepStrictEqual(b, a);
    bsert.deepStrictEqual(b, a);

    a[1].set = a[1].map;
    assert.notDeepStrictEqual(a, b);
    bsert.notDeepStrictEqual(a, b);
    assert.notDeepStrictEqual(b, a);
    bsert.notDeepStrictEqual(b, a);

    a[1].set = a[2].set;
    assert.deepStrictEqual(a, b);
    bsert.deepStrictEqual(a, b);
    assert.deepStrictEqual(b, a);
    bsert.deepStrictEqual(b, a);

    a[1].array = a[1].set;
    assert.notDeepStrictEqual(a, b);
    bsert.notDeepStrictEqual(a, b);
    assert.notDeepStrictEqual(b, a);
    bsert.notDeepStrictEqual(b, a);

    a[1].array = a[2].array;
    assert.deepStrictEqual(a, b);
    bsert.deepStrictEqual(a, b);
    assert.deepStrictEqual(b, a);
    bsert.deepStrictEqual(b, a);

    a[1].object = a[1].array;
    assert.notDeepStrictEqual(a, b);
    bsert.notDeepStrictEqual(a, b);
    assert.notDeepStrictEqual(b, a);
    bsert.notDeepStrictEqual(b, a);

    a[1].object = a[2].object;
    assert.deepStrictEqual(a, b);
    bsert.deepStrictEqual(a, b);
    assert.deepStrictEqual(b, a);
    bsert.deepStrictEqual(b, a);
  });

  it('should test buffers', () => {
    bsert.bufferEqual(Buffer.from('010203', 'hex'),
                      Buffer.from('010203', 'hex'));
    bsert.notBufferEqual(Buffer.from('010203', 'hex'),
                         Buffer.from('01020304', 'hex'));
    bsert.notBufferEqual(Buffer.from('010203', 'hex'),
                         Buffer.from('0102', 'hex'));
    bsert.notBufferEqual(Buffer.from('010203', 'hex'),
                         Buffer.from('020203', 'hex'));

    assert.throws(() => {
      bsert.notBufferEqual(Buffer.from('010203', 'hex'),
                           Buffer.from('010203', 'hex'));
    });

    assert.throws(() => {
      bsert.bufferEqual(Buffer.from('010203', 'hex'),
                        Buffer.from('01020304', 'hex'));
    });

    assert.throws(() => {
      bsert.bufferEqual(Buffer.from('010203', 'hex'),
                        Buffer.from('0102', 'hex'));
    });

    assert.throws(() => {
      bsert.bufferEqual(Buffer.from('010203', 'hex'),
                        Buffer.from('020203', 'hex'));
    });

    bsert.bufferEqual(Buffer.from('010203', 'hex'), '010203');
    bsert.notBufferEqual(Buffer.from('010203', 'hex'), '01020304');
    bsert.notBufferEqual(Buffer.from('010203', 'hex'), '0102');
    bsert.notBufferEqual(Buffer.from('010203', 'hex'), '020203');

    assert.throws(() => {
      bsert.notBufferEqual(Buffer.from('010203', 'hex'), '010203');
    });

    assert.throws(() => {
      bsert.bufferEqual(Buffer.from('010203', 'hex'), '01020304');
    });

    assert.throws(() => {
      bsert.bufferEqual(Buffer.from('010203', 'hex'), '0102');
    });

    assert.throws(() => {
      bsert.bufferEqual(Buffer.from('010203', 'hex'), '020203');
    });

    assert.throws(() => {
      bsert.bufferEqual(Buffer.from('010203', 'hex'), '10203');
    });

    assert.throws(() => {
      bsert.notBufferEqual(Buffer.from('010203', 'hex'), '1020304');
    });

    bsert.bufferEqual(Buffer.from('abc'), 'abc', 'binary');
  });

  if (process.browser)
    return;

  it('should enforce type', () => {
    const x = 1;

    bsert.enforce(typeof x === 'number', 'x', 'number');

    assert.throws(() => {
      bsert.enforce(typeof x === 'boolean', 'x', 'boolean');
    }, new TypeError('\'x\' must be a(n) boolean.'));
  });

  it('should check range', () => {
    const x = 1;

    bsert.range(x <= 1, 'x');

    assert.throws(() => {
      bsert.range(x > 1, 'x');
    }, new RangeError('\'x\' is out of range.'));
  });
});
