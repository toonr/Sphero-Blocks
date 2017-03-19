(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function placeHoldersCount (b64) {
  var len = b64.length
  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
}

function byteLength (b64) {
  // base64 is 4/3 + up to two characters of the original data
  return b64.length * 3 / 4 - placeHoldersCount(b64)
}

function toByteArray (b64) {
  var i, j, l, tmp, placeHolders, arr
  var len = b64.length
  placeHolders = placeHoldersCount(b64)

  arr = new Arr(len * 3 / 4 - placeHolders)

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len

  var L = 0

  for (i = 0, j = 0; i < l; i += 4, j += 3) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
    arr[L++] = (tmp >> 16) & 0xFF
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[L++] = tmp & 0xFF
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var output = ''
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    output += lookup[tmp >> 2]
    output += lookup[(tmp << 4) & 0x3F]
    output += '=='
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
    output += lookup[tmp >> 10]
    output += lookup[(tmp >> 4) & 0x3F]
    output += lookup[(tmp << 2) & 0x3F]
    output += '='
  }

  parts.push(output)

  return parts.join('')
}

},{}],3:[function(require,module,exports){
arguments[4][1][0].apply(exports,arguments)
},{"dup":1}],4:[function(require,module,exports){
(function (global){
'use strict';

var buffer = require('buffer');
var Buffer = buffer.Buffer;
var SlowBuffer = buffer.SlowBuffer;
var MAX_LEN = buffer.kMaxLength || 2147483647;
exports.alloc = function alloc(size, fill, encoding) {
  if (typeof Buffer.alloc === 'function') {
    return Buffer.alloc(size, fill, encoding);
  }
  if (typeof encoding === 'number') {
    throw new TypeError('encoding must not be number');
  }
  if (typeof size !== 'number') {
    throw new TypeError('size must be a number');
  }
  if (size > MAX_LEN) {
    throw new RangeError('size is too large');
  }
  var enc = encoding;
  var _fill = fill;
  if (_fill === undefined) {
    enc = undefined;
    _fill = 0;
  }
  var buf = new Buffer(size);
  if (typeof _fill === 'string') {
    var fillBuf = new Buffer(_fill, enc);
    var flen = fillBuf.length;
    var i = -1;
    while (++i < size) {
      buf[i] = fillBuf[i % flen];
    }
  } else {
    buf.fill(_fill);
  }
  return buf;
}
exports.allocUnsafe = function allocUnsafe(size) {
  if (typeof Buffer.allocUnsafe === 'function') {
    return Buffer.allocUnsafe(size);
  }
  if (typeof size !== 'number') {
    throw new TypeError('size must be a number');
  }
  if (size > MAX_LEN) {
    throw new RangeError('size is too large');
  }
  return new Buffer(size);
}
exports.from = function from(value, encodingOrOffset, length) {
  if (typeof Buffer.from === 'function' && (!global.Uint8Array || Uint8Array.from !== Buffer.from)) {
    return Buffer.from(value, encodingOrOffset, length);
  }
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number');
  }
  if (typeof value === 'string') {
    return new Buffer(value, encodingOrOffset);
  }
  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    var offset = encodingOrOffset;
    if (arguments.length === 1) {
      return new Buffer(value);
    }
    if (typeof offset === 'undefined') {
      offset = 0;
    }
    var len = length;
    if (typeof len === 'undefined') {
      len = value.byteLength - offset;
    }
    if (offset >= value.byteLength) {
      throw new RangeError('\'offset\' is out of bounds');
    }
    if (len > value.byteLength - offset) {
      throw new RangeError('\'length\' is out of bounds');
    }
    return new Buffer(value.slice(offset, offset + len));
  }
  if (Buffer.isBuffer(value)) {
    var out = new Buffer(value.length);
    value.copy(out, 0, 0, value.length);
    return out;
  }
  if (value) {
    if (Array.isArray(value) || (typeof ArrayBuffer !== 'undefined' && value.buffer instanceof ArrayBuffer) || 'length' in value) {
      return new Buffer(value);
    }
    if (value.type === 'Buffer' && Array.isArray(value.data)) {
      return new Buffer(value.data);
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ' + 'ArrayBuffer, Array, or array-like object.');
}
exports.allocUnsafeSlow = function allocUnsafeSlow(size) {
  if (typeof Buffer.allocUnsafeSlow === 'function') {
    return Buffer.allocUnsafeSlow(size);
  }
  if (typeof size !== 'number') {
    throw new TypeError('size must be a number');
  }
  if (size >= MAX_LEN) {
    throw new RangeError('size is too large');
  }
  return new SlowBuffer(size);
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"buffer":5}],5:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('Invalid typed array length')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (value instanceof ArrayBuffer) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  return fromObject(value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj) {
    if (ArrayBuffer.isView(obj) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(0)
      }
      return fromArrayLike(obj)
    }

    if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
      return fromArrayLike(obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || string instanceof ArrayBuffer) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : new Buffer(val, encoding)
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}

},{"base64-js":2,"ieee754":8}],6:[function(require,module,exports){
(function (Buffer){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.

function isArray(arg) {
  if (Array.isArray) {
    return Array.isArray(arg);
  }
  return objectToString(arg) === '[object Array]';
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = Buffer.isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

}).call(this,{"isBuffer":require("../../is-buffer/index.js")})
},{"../../is-buffer/index.js":10}],7:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],8:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],9:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],10:[function(require,module,exports){
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}

},{}],11:[function(require,module,exports){
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],12:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":14}],13:[function(require,module,exports){
(function (process){
'use strict';

if (!process.version ||
    process.version.indexOf('v0.') === 0 ||
    process.version.indexOf('v1.') === 0 && process.version.indexOf('v1.8.') !== 0) {
  module.exports = nextTick;
} else {
  module.exports = process.nextTick;
}

function nextTick(fn, arg1, arg2, arg3) {
  if (typeof fn !== 'function') {
    throw new TypeError('"callback" argument must be a function');
  }
  var len = arguments.length;
  var args, i;
  switch (len) {
  case 0:
  case 1:
    return process.nextTick(fn);
  case 2:
    return process.nextTick(function afterTickOne() {
      fn.call(null, arg1);
    });
  case 3:
    return process.nextTick(function afterTickTwo() {
      fn.call(null, arg1, arg2);
    });
  case 4:
    return process.nextTick(function afterTickThree() {
      fn.call(null, arg1, arg2, arg3);
    });
  default:
    args = new Array(len - 1);
    i = 0;
    while (i < args.length) {
      args[i++] = arguments[i];
    }
    return process.nextTick(function afterTick() {
      fn.apply(null, args);
    });
  }
}

}).call(this,require('_process'))
},{"_process":14}],14:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],15:[function(require,module,exports){
module.exports = require("./lib/_stream_duplex.js")

},{"./lib/_stream_duplex.js":16}],16:[function(require,module,exports){
// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.

'use strict';

/*<replacement>*/

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    keys.push(key);
  }return keys;
};
/*</replacement>*/

module.exports = Duplex;

/*<replacement>*/
var processNextTick = require('process-nextick-args');
/*</replacement>*/

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

var Readable = require('./_stream_readable');
var Writable = require('./_stream_writable');

util.inherits(Duplex, Readable);

var keys = objectKeys(Writable.prototype);
for (var v = 0; v < keys.length; v++) {
  var method = keys[v];
  if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
}

function Duplex(options) {
  if (!(this instanceof Duplex)) return new Duplex(options);

  Readable.call(this, options);
  Writable.call(this, options);

  if (options && options.readable === false) this.readable = false;

  if (options && options.writable === false) this.writable = false;

  this.allowHalfOpen = true;
  if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;

  this.once('end', onend);
}

// the no-half-open enforcer
function onend() {
  // if we allow half-open state, or if the writable side ended,
  // then we're ok.
  if (this.allowHalfOpen || this._writableState.ended) return;

  // no more data can be written.
  // But allow more writes to happen in this tick.
  processNextTick(onEndNT, this);
}

function onEndNT(self) {
  self.end();
}

function forEach(xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}
},{"./_stream_readable":18,"./_stream_writable":20,"core-util-is":6,"inherits":9,"process-nextick-args":13}],17:[function(require,module,exports){
// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.

'use strict';

module.exports = PassThrough;

var Transform = require('./_stream_transform');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(PassThrough, Transform);

function PassThrough(options) {
  if (!(this instanceof PassThrough)) return new PassThrough(options);

  Transform.call(this, options);
}

PassThrough.prototype._transform = function (chunk, encoding, cb) {
  cb(null, chunk);
};
},{"./_stream_transform":19,"core-util-is":6,"inherits":9}],18:[function(require,module,exports){
(function (process){
'use strict';

module.exports = Readable;

/*<replacement>*/
var processNextTick = require('process-nextick-args');
/*</replacement>*/

/*<replacement>*/
var isArray = require('isarray');
/*</replacement>*/

/*<replacement>*/
var Duplex;
/*</replacement>*/

Readable.ReadableState = ReadableState;

/*<replacement>*/
var EE = require('events').EventEmitter;

var EElistenerCount = function (emitter, type) {
  return emitter.listeners(type).length;
};
/*</replacement>*/

/*<replacement>*/
var Stream;
(function () {
  try {
    Stream = require('st' + 'ream');
  } catch (_) {} finally {
    if (!Stream) Stream = require('events').EventEmitter;
  }
})();
/*</replacement>*/

var Buffer = require('buffer').Buffer;
/*<replacement>*/
var bufferShim = require('buffer-shims');
/*</replacement>*/

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

/*<replacement>*/
var debugUtil = require('util');
var debug = void 0;
if (debugUtil && debugUtil.debuglog) {
  debug = debugUtil.debuglog('stream');
} else {
  debug = function () {};
}
/*</replacement>*/

var BufferList = require('./internal/streams/BufferList');
var StringDecoder;

util.inherits(Readable, Stream);

function prependListener(emitter, event, fn) {
  // Sadly this is not cacheable as some libraries bundle their own
  // event emitter implementation with them.
  if (typeof emitter.prependListener === 'function') {
    return emitter.prependListener(event, fn);
  } else {
    // This is a hack to make sure that our error handler is attached before any
    // userland ones.  NEVER DO THIS. This is here only because this code needs
    // to continue to work with older versions of Node.js that do not include
    // the prependListener() method. The goal is to eventually remove this hack.
    if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (isArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
  }
}

function ReadableState(options, stream) {
  Duplex = Duplex || require('./_stream_duplex');

  options = options || {};

  // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away
  this.objectMode = !!options.objectMode;

  if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

  // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"
  var hwm = options.highWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;
  this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

  // cast to ints.
  this.highWaterMark = ~ ~this.highWaterMark;

  // A linked list is used to store data chunks instead of an array because the
  // linked list can remove elements from the beginning faster than
  // array.shift()
  this.buffer = new BufferList();
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.
  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;
  this.resumeScheduled = false;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // when piping, we only care about 'readable' events that happen
  // after read()ing all the bytes and not getting any pushback.
  this.ranOut = false;

  // the number of writers that are awaiting a drain event in .pipe()s
  this.awaitDrain = 0;

  // if true, a maybeReadMore has been scheduled
  this.readingMore = false;

  this.decoder = null;
  this.encoding = null;
  if (options.encoding) {
    if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}

function Readable(options) {
  Duplex = Duplex || require('./_stream_duplex');

  if (!(this instanceof Readable)) return new Readable(options);

  this._readableState = new ReadableState(options, this);

  // legacy
  this.readable = true;

  if (options && typeof options.read === 'function') this._read = options.read;

  Stream.call(this);
}

// Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
Readable.prototype.push = function (chunk, encoding) {
  var state = this._readableState;

  if (!state.objectMode && typeof chunk === 'string') {
    encoding = encoding || state.defaultEncoding;
    if (encoding !== state.encoding) {
      chunk = bufferShim.from(chunk, encoding);
      encoding = '';
    }
  }

  return readableAddChunk(this, state, chunk, encoding, false);
};

// Unshift should *always* be something directly out of read()
Readable.prototype.unshift = function (chunk) {
  var state = this._readableState;
  return readableAddChunk(this, state, chunk, '', true);
};

Readable.prototype.isPaused = function () {
  return this._readableState.flowing === false;
};

function readableAddChunk(stream, state, chunk, encoding, addToFront) {
  var er = chunkInvalid(state, chunk);
  if (er) {
    stream.emit('error', er);
  } else if (chunk === null) {
    state.reading = false;
    onEofChunk(stream, state);
  } else if (state.objectMode || chunk && chunk.length > 0) {
    if (state.ended && !addToFront) {
      var e = new Error('stream.push() after EOF');
      stream.emit('error', e);
    } else if (state.endEmitted && addToFront) {
      var _e = new Error('stream.unshift() after end event');
      stream.emit('error', _e);
    } else {
      var skipAdd;
      if (state.decoder && !addToFront && !encoding) {
        chunk = state.decoder.write(chunk);
        skipAdd = !state.objectMode && chunk.length === 0;
      }

      if (!addToFront) state.reading = false;

      // Don't add to the buffer if we've decoded to an empty string chunk and
      // we're not in object mode
      if (!skipAdd) {
        // if we want the data now, just emit it.
        if (state.flowing && state.length === 0 && !state.sync) {
          stream.emit('data', chunk);
          stream.read(0);
        } else {
          // update the buffer info.
          state.length += state.objectMode ? 1 : chunk.length;
          if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);

          if (state.needReadable) emitReadable(stream);
        }
      }

      maybeReadMore(stream, state);
    }
  } else if (!addToFront) {
    state.reading = false;
  }

  return needMoreData(state);
}

// if it's past the high water mark, we can push in some more.
// Also, if we have no data yet, we can stand some
// more bytes.  This is to work around cases where hwm=0,
// such as the repl.  Also, if the push() triggered a
// readable event, and the user called read(largeNumber) such that
// needReadable was set, then we ought to push more, so that another
// 'readable' event will be triggered.
function needMoreData(state) {
  return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
}

// backwards compatibility.
Readable.prototype.setEncoding = function (enc) {
  if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
  this._readableState.decoder = new StringDecoder(enc);
  this._readableState.encoding = enc;
  return this;
};

// Don't raise the hwm > 8MB
var MAX_HWM = 0x800000;
function computeNewHighWaterMark(n) {
  if (n >= MAX_HWM) {
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2 to prevent increasing hwm excessively in
    // tiny amounts
    n--;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    n++;
  }
  return n;
}

// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function howMuchToRead(n, state) {
  if (n <= 0 || state.length === 0 && state.ended) return 0;
  if (state.objectMode) return 1;
  if (n !== n) {
    // Only flow one buffer at a time
    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
  }
  // If we're asking for more than the current hwm, then raise the hwm.
  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
  if (n <= state.length) return n;
  // Don't have enough
  if (!state.ended) {
    state.needReadable = true;
    return 0;
  }
  return state.length;
}

// you can override either this method, or the async _read(n) below.
Readable.prototype.read = function (n) {
  debug('read', n);
  n = parseInt(n, 10);
  var state = this._readableState;
  var nOrig = n;

  if (n !== 0) state.emittedReadable = false;

  // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.
  if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
    debug('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state);

  // if we've ended, and we're now clear, then finish it up.
  if (n === 0 && state.ended) {
    if (state.length === 0) endReadable(this);
    return null;
  }

  // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.

  // if we need a readable event, then we need to do some reading.
  var doRead = state.needReadable;
  debug('need readable', doRead);

  // if we currently have less than the highWaterMark, then also read some
  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug('length less than watermark', doRead);
  }

  // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.
  if (state.ended || state.reading) {
    doRead = false;
    debug('reading or ended', doRead);
  } else if (doRead) {
    debug('do read');
    state.reading = true;
    state.sync = true;
    // if the length is currently zero, then we *need* a readable event.
    if (state.length === 0) state.needReadable = true;
    // call internal read method
    this._read(state.highWaterMark);
    state.sync = false;
    // If _read pushed data synchronously, then `reading` will be false,
    // and we need to re-evaluate how much data we can return to the user.
    if (!state.reading) n = howMuchToRead(nOrig, state);
  }

  var ret;
  if (n > 0) ret = fromList(n, state);else ret = null;

  if (ret === null) {
    state.needReadable = true;
    n = 0;
  } else {
    state.length -= n;
  }

  if (state.length === 0) {
    // If we have nothing in the buffer, then we want to know
    // as soon as we *do* get something into the buffer.
    if (!state.ended) state.needReadable = true;

    // If we tried to read() past the EOF, then emit end on the next tick.
    if (nOrig !== n && state.ended) endReadable(this);
  }

  if (ret !== null) this.emit('data', ret);

  return ret;
};

function chunkInvalid(state, chunk) {
  var er = null;
  if (!Buffer.isBuffer(chunk) && typeof chunk !== 'string' && chunk !== null && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  return er;
}

function onEofChunk(stream, state) {
  if (state.ended) return;
  if (state.decoder) {
    var chunk = state.decoder.end();
    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }
  state.ended = true;

  // emit 'readable' now to make sure it gets picked up.
  emitReadable(stream);
}

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream) {
  var state = stream._readableState;
  state.needReadable = false;
  if (!state.emittedReadable) {
    debug('emitReadable', state.flowing);
    state.emittedReadable = true;
    if (state.sync) processNextTick(emitReadable_, stream);else emitReadable_(stream);
  }
}

function emitReadable_(stream) {
  debug('emit readable');
  stream.emit('readable');
  flow(stream);
}

// at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.
function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    processNextTick(maybeReadMore_, stream, state);
  }
}

function maybeReadMore_(stream, state) {
  var len = state.length;
  while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
    debug('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length)
      // didn't get any data, stop spinning.
      break;else len = state.length;
  }
  state.readingMore = false;
}

// abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
Readable.prototype._read = function (n) {
  this.emit('error', new Error('_read() is not implemented'));
};

Readable.prototype.pipe = function (dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;
    case 1:
      state.pipes = [state.pipes, dest];
      break;
    default:
      state.pipes.push(dest);
      break;
  }
  state.pipesCount += 1;
  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

  var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;

  var endFn = doEnd ? onend : cleanup;
  if (state.endEmitted) processNextTick(endFn);else src.once('end', endFn);

  dest.on('unpipe', onunpipe);
  function onunpipe(readable) {
    debug('onunpipe');
    if (readable === src) {
      cleanup();
    }
  }

  function onend() {
    debug('onend');
    dest.end();
  }

  // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.
  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);

  var cleanedUp = false;
  function cleanup() {
    debug('cleanup');
    // cleanup event handlers once the pipe is broken
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', cleanup);
    src.removeListener('data', ondata);

    cleanedUp = true;

    // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.
    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
  }

  // If the user pushes more data while we're writing to dest then we'll end up
  // in ondata again. However, we only want to increase awaitDrain once because
  // dest will only emit one 'drain' event for the multiple writes.
  // => Introduce a guard on increasing awaitDrain.
  var increasedAwaitDrain = false;
  src.on('data', ondata);
  function ondata(chunk) {
    debug('ondata');
    increasedAwaitDrain = false;
    var ret = dest.write(chunk);
    if (false === ret && !increasedAwaitDrain) {
      // If the user unpiped during `dest.write()`, it is possible
      // to get stuck in a permanently paused state if that write
      // also returned false.
      // => Check whether `dest` is still a piping destination.
      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
        debug('false write response, pause', src._readableState.awaitDrain);
        src._readableState.awaitDrain++;
        increasedAwaitDrain = true;
      }
      src.pause();
    }
  }

  // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.
  function onerror(er) {
    debug('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (EElistenerCount(dest, 'error') === 0) dest.emit('error', er);
  }

  // Make sure our error handler is attached before userland ones.
  prependListener(dest, 'error', onerror);

  // Both close and finish should trigger unpipe, but only once.
  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }
  dest.once('close', onclose);
  function onfinish() {
    debug('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }
  dest.once('finish', onfinish);

  function unpipe() {
    debug('unpipe');
    src.unpipe(dest);
  }

  // tell the dest that it's being piped to
  dest.emit('pipe', src);

  // start the flow if it hasn't been started already.
  if (!state.flowing) {
    debug('pipe resume');
    src.resume();
  }

  return dest;
};

function pipeOnDrain(src) {
  return function () {
    var state = src._readableState;
    debug('pipeOnDrain', state.awaitDrain);
    if (state.awaitDrain) state.awaitDrain--;
    if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
      state.flowing = true;
      flow(src);
    }
  };
}

Readable.prototype.unpipe = function (dest) {
  var state = this._readableState;

  // if we're not piping anywhere, then do nothing.
  if (state.pipesCount === 0) return this;

  // just one destination.  most common case.
  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes) return this;

    if (!dest) dest = state.pipes;

    // got a match.
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    if (dest) dest.emit('unpipe', this);
    return this;
  }

  // slow case. multiple pipe destinations.

  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;

    for (var i = 0; i < len; i++) {
      dests[i].emit('unpipe', this);
    }return this;
  }

  // try to find the right one.
  var index = indexOf(state.pipes, dest);
  if (index === -1) return this;

  state.pipes.splice(index, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1) state.pipes = state.pipes[0];

  dest.emit('unpipe', this);

  return this;
};

// set up data events if they are asked for
// Ensure readable listeners eventually get something
Readable.prototype.on = function (ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);

  if (ev === 'data') {
    // Start flowing on next tick if stream isn't explicitly paused
    if (this._readableState.flowing !== false) this.resume();
  } else if (ev === 'readable') {
    var state = this._readableState;
    if (!state.endEmitted && !state.readableListening) {
      state.readableListening = state.needReadable = true;
      state.emittedReadable = false;
      if (!state.reading) {
        processNextTick(nReadingNextTick, this);
      } else if (state.length) {
        emitReadable(this, state);
      }
    }
  }

  return res;
};
Readable.prototype.addListener = Readable.prototype.on;

function nReadingNextTick(self) {
  debug('readable nexttick read 0');
  self.read(0);
}

// pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
Readable.prototype.resume = function () {
  var state = this._readableState;
  if (!state.flowing) {
    debug('resume');
    state.flowing = true;
    resume(this, state);
  }
  return this;
};

function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    processNextTick(resume_, stream, state);
  }
}

function resume_(stream, state) {
  if (!state.reading) {
    debug('resume read 0');
    stream.read(0);
  }

  state.resumeScheduled = false;
  state.awaitDrain = 0;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading) stream.read(0);
}

Readable.prototype.pause = function () {
  debug('call pause flowing=%j', this._readableState.flowing);
  if (false !== this._readableState.flowing) {
    debug('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }
  return this;
};

function flow(stream) {
  var state = stream._readableState;
  debug('flow', state.flowing);
  while (state.flowing && stream.read() !== null) {}
}

// wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap = function (stream) {
  var state = this._readableState;
  var paused = false;

  var self = this;
  stream.on('end', function () {
    debug('wrapped end');
    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) self.push(chunk);
    }

    self.push(null);
  });

  stream.on('data', function (chunk) {
    debug('wrapped data');
    if (state.decoder) chunk = state.decoder.write(chunk);

    // don't skip over falsy values in objectMode
    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

    var ret = self.push(chunk);
    if (!ret) {
      paused = true;
      stream.pause();
    }
  });

  // proxy all the other methods.
  // important when wrapping filters and duplexes.
  for (var i in stream) {
    if (this[i] === undefined && typeof stream[i] === 'function') {
      this[i] = function (method) {
        return function () {
          return stream[method].apply(stream, arguments);
        };
      }(i);
    }
  }

  // proxy certain important events.
  var events = ['error', 'close', 'destroy', 'pause', 'resume'];
  forEach(events, function (ev) {
    stream.on(ev, self.emit.bind(self, ev));
  });

  // when we try to consume some more bytes, simply unpause the
  // underlying stream.
  self._read = function (n) {
    debug('wrapped _read', n);
    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return self;
};

// exposed for testing purposes only.
Readable._fromList = fromList;

// Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromList(n, state) {
  // nothing buffered
  if (state.length === 0) return null;

  var ret;
  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
    // read it all, truncate the list
    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.head.data;else ret = state.buffer.concat(state.length);
    state.buffer.clear();
  } else {
    // read part of list
    ret = fromListPartial(n, state.buffer, state.decoder);
  }

  return ret;
}

// Extracts only enough buffered data to satisfy the amount requested.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromListPartial(n, list, hasStrings) {
  var ret;
  if (n < list.head.data.length) {
    // slice is the same for buffers and strings
    ret = list.head.data.slice(0, n);
    list.head.data = list.head.data.slice(n);
  } else if (n === list.head.data.length) {
    // first chunk is a perfect match
    ret = list.shift();
  } else {
    // result spans more than one buffer
    ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
  }
  return ret;
}

// Copies a specified amount of characters from the list of buffered data
// chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBufferString(n, list) {
  var p = list.head;
  var c = 1;
  var ret = p.data;
  n -= ret.length;
  while (p = p.next) {
    var str = p.data;
    var nb = n > str.length ? str.length : n;
    if (nb === str.length) ret += str;else ret += str.slice(0, n);
    n -= nb;
    if (n === 0) {
      if (nb === str.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = str.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

// Copies a specified amount of bytes from the list of buffered data chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBuffer(n, list) {
  var ret = bufferShim.allocUnsafe(n);
  var p = list.head;
  var c = 1;
  p.data.copy(ret);
  n -= p.data.length;
  while (p = p.next) {
    var buf = p.data;
    var nb = n > buf.length ? buf.length : n;
    buf.copy(ret, ret.length - n, 0, nb);
    n -= nb;
    if (n === 0) {
      if (nb === buf.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = buf.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;

  // If we get here before consuming all the bytes, then that is a
  // bug in node.  Should never happen.
  if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');

  if (!state.endEmitted) {
    state.ended = true;
    processNextTick(endReadableNT, state, stream);
  }
}

function endReadableNT(state, stream) {
  // Check that we didn't get one last unshift.
  if (!state.endEmitted && state.length === 0) {
    state.endEmitted = true;
    stream.readable = false;
    stream.emit('end');
  }
}

function forEach(xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}

function indexOf(xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }
  return -1;
}
}).call(this,require('_process'))
},{"./_stream_duplex":16,"./internal/streams/BufferList":21,"_process":14,"buffer":5,"buffer-shims":4,"core-util-is":6,"events":7,"inherits":9,"isarray":11,"process-nextick-args":13,"string_decoder/":27,"util":3}],19:[function(require,module,exports){
// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.

'use strict';

module.exports = Transform;

var Duplex = require('./_stream_duplex');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(Transform, Duplex);

function TransformState(stream) {
  this.afterTransform = function (er, data) {
    return afterTransform(stream, er, data);
  };

  this.needTransform = false;
  this.transforming = false;
  this.writecb = null;
  this.writechunk = null;
  this.writeencoding = null;
}

function afterTransform(stream, er, data) {
  var ts = stream._transformState;
  ts.transforming = false;

  var cb = ts.writecb;

  if (!cb) return stream.emit('error', new Error('no writecb in Transform class'));

  ts.writechunk = null;
  ts.writecb = null;

  if (data !== null && data !== undefined) stream.push(data);

  cb(er);

  var rs = stream._readableState;
  rs.reading = false;
  if (rs.needReadable || rs.length < rs.highWaterMark) {
    stream._read(rs.highWaterMark);
  }
}

function Transform(options) {
  if (!(this instanceof Transform)) return new Transform(options);

  Duplex.call(this, options);

  this._transformState = new TransformState(this);

  var stream = this;

  // start out asking for a readable event once data is transformed.
  this._readableState.needReadable = true;

  // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.
  this._readableState.sync = false;

  if (options) {
    if (typeof options.transform === 'function') this._transform = options.transform;

    if (typeof options.flush === 'function') this._flush = options.flush;
  }

  // When the writable side finishes, then flush out anything remaining.
  this.once('prefinish', function () {
    if (typeof this._flush === 'function') this._flush(function (er, data) {
      done(stream, er, data);
    });else done(stream);
  });
}

Transform.prototype.push = function (chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
};

// This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.
Transform.prototype._transform = function (chunk, encoding, cb) {
  throw new Error('_transform() is not implemented');
};

Transform.prototype._write = function (chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;
  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
  }
};

// Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.
Transform.prototype._read = function (n) {
  var ts = this._transformState;

  if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
    ts.transforming = true;
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};

function done(stream, er, data) {
  if (er) return stream.emit('error', er);

  if (data !== null && data !== undefined) stream.push(data);

  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided
  var ws = stream._writableState;
  var ts = stream._transformState;

  if (ws.length) throw new Error('Calling transform done when ws.length != 0');

  if (ts.transforming) throw new Error('Calling transform done when still transforming');

  return stream.push(null);
}
},{"./_stream_duplex":16,"core-util-is":6,"inherits":9}],20:[function(require,module,exports){
(function (process){
// A bit simpler than readable streams.
// Implement an async ._write(chunk, encoding, cb), and it'll handle all
// the drain event emission and buffering.

'use strict';

module.exports = Writable;

/*<replacement>*/
var processNextTick = require('process-nextick-args');
/*</replacement>*/

/*<replacement>*/
var asyncWrite = !process.browser && ['v0.10', 'v0.9.'].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : processNextTick;
/*</replacement>*/

/*<replacement>*/
var Duplex;
/*</replacement>*/

Writable.WritableState = WritableState;

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

/*<replacement>*/
var internalUtil = {
  deprecate: require('util-deprecate')
};
/*</replacement>*/

/*<replacement>*/
var Stream;
(function () {
  try {
    Stream = require('st' + 'ream');
  } catch (_) {} finally {
    if (!Stream) Stream = require('events').EventEmitter;
  }
})();
/*</replacement>*/

var Buffer = require('buffer').Buffer;
/*<replacement>*/
var bufferShim = require('buffer-shims');
/*</replacement>*/

util.inherits(Writable, Stream);

function nop() {}

function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
  this.next = null;
}

function WritableState(options, stream) {
  Duplex = Duplex || require('./_stream_duplex');

  options = options || {};

  // object stream flag to indicate whether or not this stream
  // contains buffers or objects.
  this.objectMode = !!options.objectMode;

  if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

  // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()
  var hwm = options.highWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;
  this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

  // cast to ints.
  this.highWaterMark = ~ ~this.highWaterMark;

  // drain event flag.
  this.needDrain = false;
  // at the start of calling end()
  this.ending = false;
  // when end() has been called, and returned
  this.ended = false;
  // when 'finish' is emitted
  this.finished = false;

  // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.
  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.
  this.length = 0;

  // a flag to see when we're in the middle of a write.
  this.writing = false;

  // when true all writes will be buffered until .uncork() call
  this.corked = 0;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.
  this.bufferProcessing = false;

  // the callback that's passed to _write(chunk,cb)
  this.onwrite = function (er) {
    onwrite(stream, er);
  };

  // the callback that the user supplies to write(chunk,encoding,cb)
  this.writecb = null;

  // the amount that is being written when _write is called.
  this.writelen = 0;

  this.bufferedRequest = null;
  this.lastBufferedRequest = null;

  // number of pending user-supplied write callbacks
  // this must be 0 before 'finish' can be emitted
  this.pendingcb = 0;

  // emit prefinish if the only thing we're waiting for is _write cbs
  // This is relevant for synchronous Transform streams
  this.prefinished = false;

  // True if the error was already emitted and should not be thrown again
  this.errorEmitted = false;

  // count buffered requests
  this.bufferedRequestCount = 0;

  // allocate the first CorkedRequest, there is always
  // one allocated and free to use, and we maintain at most two
  this.corkedRequestsFree = new CorkedRequest(this);
}

WritableState.prototype.getBuffer = function getBuffer() {
  var current = this.bufferedRequest;
  var out = [];
  while (current) {
    out.push(current);
    current = current.next;
  }
  return out;
};

(function () {
  try {
    Object.defineProperty(WritableState.prototype, 'buffer', {
      get: internalUtil.deprecate(function () {
        return this.getBuffer();
      }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.')
    });
  } catch (_) {}
})();

// Test _writableState for inheritance to account for Duplex streams,
// whose prototype chain only points to Readable.
var realHasInstance;
if (typeof Symbol === 'function' && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === 'function') {
  realHasInstance = Function.prototype[Symbol.hasInstance];
  Object.defineProperty(Writable, Symbol.hasInstance, {
    value: function (object) {
      if (realHasInstance.call(this, object)) return true;

      return object && object._writableState instanceof WritableState;
    }
  });
} else {
  realHasInstance = function (object) {
    return object instanceof this;
  };
}

function Writable(options) {
  Duplex = Duplex || require('./_stream_duplex');

  // Writable ctor is applied to Duplexes, too.
  // `realHasInstance` is necessary because using plain `instanceof`
  // would return false, as no `_writableState` property is attached.

  // Trying to use the custom `instanceof` for Writable here will also break the
  // Node.js LazyTransform implementation, which has a non-trivial getter for
  // `_writableState` that would lead to infinite recursion.
  if (!realHasInstance.call(Writable, this) && !(this instanceof Duplex)) {
    return new Writable(options);
  }

  this._writableState = new WritableState(options, this);

  // legacy.
  this.writable = true;

  if (options) {
    if (typeof options.write === 'function') this._write = options.write;

    if (typeof options.writev === 'function') this._writev = options.writev;
  }

  Stream.call(this);
}

// Otherwise people can pipe Writable streams, which is just wrong.
Writable.prototype.pipe = function () {
  this.emit('error', new Error('Cannot pipe, not readable'));
};

function writeAfterEnd(stream, cb) {
  var er = new Error('write after end');
  // TODO: defer error events consistently everywhere, not just the cb
  stream.emit('error', er);
  processNextTick(cb, er);
}

// If we get something that is not a buffer, string, null, or undefined,
// and we're not in objectMode, then that's an error.
// Otherwise stream chunks are all considered to be of length=1, and the
// watermarks determine how many objects to keep in the buffer, rather than
// how many bytes or characters.
function validChunk(stream, state, chunk, cb) {
  var valid = true;
  var er = false;
  // Always throw error if a null is written
  // if we are not in object mode then throw
  // if it is not a buffer, string, or undefined.
  if (chunk === null) {
    er = new TypeError('May not write null values to stream');
  } else if (!Buffer.isBuffer(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  if (er) {
    stream.emit('error', er);
    processNextTick(cb, er);
    valid = false;
  }
  return valid;
}

Writable.prototype.write = function (chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (Buffer.isBuffer(chunk)) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;

  if (typeof cb !== 'function') cb = nop;

  if (state.ended) writeAfterEnd(this, cb);else if (validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, chunk, encoding, cb);
  }

  return ret;
};

Writable.prototype.cork = function () {
  var state = this._writableState;

  state.corked++;
};

Writable.prototype.uncork = function () {
  var state = this._writableState;

  if (state.corked) {
    state.corked--;

    if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
  }
};

Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
  // node::ParseEncoding() requires lower case.
  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new TypeError('Unknown encoding: ' + encoding);
  this._writableState.defaultEncoding = encoding;
  return this;
};

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
    chunk = bufferShim.from(chunk, encoding);
  }
  return chunk;
}

// if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
function writeOrBuffer(stream, state, chunk, encoding, cb) {
  chunk = decodeChunk(state, chunk, encoding);

  if (Buffer.isBuffer(chunk)) encoding = 'buffer';
  var len = state.objectMode ? 1 : chunk.length;

  state.length += len;

  var ret = state.length < state.highWaterMark;
  // we must ensure that previous needDrain will not be reset to false.
  if (!ret) state.needDrain = true;

  if (state.writing || state.corked) {
    var last = state.lastBufferedRequest;
    state.lastBufferedRequest = new WriteReq(chunk, encoding, cb);
    if (last) {
      last.next = state.lastBufferedRequest;
    } else {
      state.bufferedRequest = state.lastBufferedRequest;
    }
    state.bufferedRequestCount += 1;
  } else {
    doWrite(stream, state, false, len, chunk, encoding, cb);
  }

  return ret;
}

function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  --state.pendingcb;
  if (sync) processNextTick(cb, er);else cb(er);

  stream._writableState.errorEmitted = true;
  stream.emit('error', er);
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;

  onwriteStateUpdate(state);

  if (er) onwriteError(stream, state, sync, er, cb);else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(state);

    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
      clearBuffer(stream, state);
    }

    if (sync) {
      /*<replacement>*/
      asyncWrite(afterWrite, stream, state, finished, cb);
      /*</replacement>*/
    } else {
        afterWrite(stream, state, finished, cb);
      }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished) onwriteDrain(stream, state);
  state.pendingcb--;
  cb();
  finishMaybe(stream, state);
}

// Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.
function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
}

// if there's something in the buffer waiting, then process it
function clearBuffer(stream, state) {
  state.bufferProcessing = true;
  var entry = state.bufferedRequest;

  if (stream._writev && entry && entry.next) {
    // Fast case, write everything using _writev()
    var l = state.bufferedRequestCount;
    var buffer = new Array(l);
    var holder = state.corkedRequestsFree;
    holder.entry = entry;

    var count = 0;
    while (entry) {
      buffer[count] = entry;
      entry = entry.next;
      count += 1;
    }

    doWrite(stream, state, true, state.length, buffer, '', holder.finish);

    // doWrite is almost always async, defer these to save a bit of time
    // as the hot path ends with doWrite
    state.pendingcb++;
    state.lastBufferedRequest = null;
    if (holder.next) {
      state.corkedRequestsFree = holder.next;
      holder.next = null;
    } else {
      state.corkedRequestsFree = new CorkedRequest(state);
    }
  } else {
    // Slow case, write chunks one-by-one
    while (entry) {
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;

      doWrite(stream, state, false, len, chunk, encoding, cb);
      entry = entry.next;
      // if we didn't call the onwrite immediately, then
      // it means that we need to wait until it does.
      // also, that means that the chunk and cb are currently
      // being processed, so move the buffer counter past them.
      if (state.writing) {
        break;
      }
    }

    if (entry === null) state.lastBufferedRequest = null;
  }

  state.bufferedRequestCount = 0;
  state.bufferedRequest = entry;
  state.bufferProcessing = false;
}

Writable.prototype._write = function (chunk, encoding, cb) {
  cb(new Error('_write() is not implemented'));
};

Writable.prototype._writev = null;

Writable.prototype.end = function (chunk, encoding, cb) {
  var state = this._writableState;

  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

  // .end() fully uncorks
  if (state.corked) {
    state.corked = 1;
    this.uncork();
  }

  // ignore unnecessary end() calls.
  if (!state.ending && !state.finished) endWritable(this, state, cb);
};

function needFinish(state) {
  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
}

function prefinish(stream, state) {
  if (!state.prefinished) {
    state.prefinished = true;
    stream.emit('prefinish');
  }
}

function finishMaybe(stream, state) {
  var need = needFinish(state);
  if (need) {
    if (state.pendingcb === 0) {
      prefinish(stream, state);
      state.finished = true;
      stream.emit('finish');
    } else {
      prefinish(stream, state);
    }
  }
  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);
  if (cb) {
    if (state.finished) processNextTick(cb);else stream.once('finish', cb);
  }
  state.ended = true;
  stream.writable = false;
}

// It seems a linked list but it is not
// there will be only 2 of these for each stream
function CorkedRequest(state) {
  var _this = this;

  this.next = null;
  this.entry = null;

  this.finish = function (err) {
    var entry = _this.entry;
    _this.entry = null;
    while (entry) {
      var cb = entry.callback;
      state.pendingcb--;
      cb(err);
      entry = entry.next;
    }
    if (state.corkedRequestsFree) {
      state.corkedRequestsFree.next = _this;
    } else {
      state.corkedRequestsFree = _this;
    }
  };
}
}).call(this,require('_process'))
},{"./_stream_duplex":16,"_process":14,"buffer":5,"buffer-shims":4,"core-util-is":6,"events":7,"inherits":9,"process-nextick-args":13,"util-deprecate":28}],21:[function(require,module,exports){
'use strict';

var Buffer = require('buffer').Buffer;
/*<replacement>*/
var bufferShim = require('buffer-shims');
/*</replacement>*/

module.exports = BufferList;

function BufferList() {
  this.head = null;
  this.tail = null;
  this.length = 0;
}

BufferList.prototype.push = function (v) {
  var entry = { data: v, next: null };
  if (this.length > 0) this.tail.next = entry;else this.head = entry;
  this.tail = entry;
  ++this.length;
};

BufferList.prototype.unshift = function (v) {
  var entry = { data: v, next: this.head };
  if (this.length === 0) this.tail = entry;
  this.head = entry;
  ++this.length;
};

BufferList.prototype.shift = function () {
  if (this.length === 0) return;
  var ret = this.head.data;
  if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
  --this.length;
  return ret;
};

BufferList.prototype.clear = function () {
  this.head = this.tail = null;
  this.length = 0;
};

BufferList.prototype.join = function (s) {
  if (this.length === 0) return '';
  var p = this.head;
  var ret = '' + p.data;
  while (p = p.next) {
    ret += s + p.data;
  }return ret;
};

BufferList.prototype.concat = function (n) {
  if (this.length === 0) return bufferShim.alloc(0);
  if (this.length === 1) return this.head.data;
  var ret = bufferShim.allocUnsafe(n >>> 0);
  var p = this.head;
  var i = 0;
  while (p) {
    p.data.copy(ret, i);
    i += p.data.length;
    p = p.next;
  }
  return ret;
};
},{"buffer":5,"buffer-shims":4}],22:[function(require,module,exports){
module.exports = require("./lib/_stream_passthrough.js")

},{"./lib/_stream_passthrough.js":17}],23:[function(require,module,exports){
(function (process){
var Stream = (function (){
  try {
    return require('st' + 'ream'); // hack to fix a circular dependency issue when used with browserify
  } catch(_){}
}());
exports = module.exports = require('./lib/_stream_readable.js');
exports.Stream = Stream || exports;
exports.Readable = exports;
exports.Writable = require('./lib/_stream_writable.js');
exports.Duplex = require('./lib/_stream_duplex.js');
exports.Transform = require('./lib/_stream_transform.js');
exports.PassThrough = require('./lib/_stream_passthrough.js');

if (!process.browser && process.env.READABLE_STREAM === 'disable' && Stream) {
  module.exports = Stream;
}

}).call(this,require('_process'))
},{"./lib/_stream_duplex.js":16,"./lib/_stream_passthrough.js":17,"./lib/_stream_readable.js":18,"./lib/_stream_transform.js":19,"./lib/_stream_writable.js":20,"_process":14}],24:[function(require,module,exports){
module.exports = require("./lib/_stream_transform.js")

},{"./lib/_stream_transform.js":19}],25:[function(require,module,exports){
module.exports = require("./lib/_stream_writable.js")

},{"./lib/_stream_writable.js":20}],26:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

module.exports = Stream;

var EE = require('events').EventEmitter;
var inherits = require('inherits');

inherits(Stream, EE);
Stream.Readable = require('readable-stream/readable.js');
Stream.Writable = require('readable-stream/writable.js');
Stream.Duplex = require('readable-stream/duplex.js');
Stream.Transform = require('readable-stream/transform.js');
Stream.PassThrough = require('readable-stream/passthrough.js');

// Backwards-compat with node 0.4.x
Stream.Stream = Stream;



// old-style streams.  Note that the pipe method (the only relevant
// part of this class) is overridden in the Readable class.

function Stream() {
  EE.call(this);
}

Stream.prototype.pipe = function(dest, options) {
  var source = this;

  function ondata(chunk) {
    if (dest.writable) {
      if (false === dest.write(chunk) && source.pause) {
        source.pause();
      }
    }
  }

  source.on('data', ondata);

  function ondrain() {
    if (source.readable && source.resume) {
      source.resume();
    }
  }

  dest.on('drain', ondrain);

  // If the 'end' option is not supplied, dest.end() will be called when
  // source gets the 'end' or 'close' events.  Only dest.end() once.
  if (!dest._isStdio && (!options || options.end !== false)) {
    source.on('end', onend);
    source.on('close', onclose);
  }

  var didOnEnd = false;
  function onend() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest.end();
  }


  function onclose() {
    if (didOnEnd) return;
    didOnEnd = true;

    if (typeof dest.destroy === 'function') dest.destroy();
  }

  // don't leave dangling pipes when there are errors.
  function onerror(er) {
    cleanup();
    if (EE.listenerCount(this, 'error') === 0) {
      throw er; // Unhandled stream error in pipe.
    }
  }

  source.on('error', onerror);
  dest.on('error', onerror);

  // remove all the event listeners that were added.
  function cleanup() {
    source.removeListener('data', ondata);
    dest.removeListener('drain', ondrain);

    source.removeListener('end', onend);
    source.removeListener('close', onclose);

    source.removeListener('error', onerror);
    dest.removeListener('error', onerror);

    source.removeListener('end', cleanup);
    source.removeListener('close', cleanup);

    dest.removeListener('close', cleanup);
  }

  source.on('end', cleanup);
  source.on('close', cleanup);

  dest.on('close', cleanup);

  dest.emit('pipe', source);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};

},{"events":7,"inherits":9,"readable-stream/duplex.js":15,"readable-stream/passthrough.js":22,"readable-stream/readable.js":23,"readable-stream/transform.js":24,"readable-stream/writable.js":25}],27:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var Buffer = require('buffer').Buffer;

var isBufferEncoding = Buffer.isEncoding
  || function(encoding) {
       switch (encoding && encoding.toLowerCase()) {
         case 'hex': case 'utf8': case 'utf-8': case 'ascii': case 'binary': case 'base64': case 'ucs2': case 'ucs-2': case 'utf16le': case 'utf-16le': case 'raw': return true;
         default: return false;
       }
     }


function assertEncoding(encoding) {
  if (encoding && !isBufferEncoding(encoding)) {
    throw new Error('Unknown encoding: ' + encoding);
  }
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters. CESU-8 is handled as part of the UTF-8 encoding.
//
// @TODO Handling all encodings inside a single object makes it very difficult
// to reason about this code, so it should be split up in the future.
// @TODO There should be a utf8-strict encoding that rejects invalid UTF-8 code
// points as used by CESU-8.
var StringDecoder = exports.StringDecoder = function(encoding) {
  this.encoding = (encoding || 'utf8').toLowerCase().replace(/[-_]/, '');
  assertEncoding(encoding);
  switch (this.encoding) {
    case 'utf8':
      // CESU-8 represents each of Surrogate Pair by 3-bytes
      this.surrogateSize = 3;
      break;
    case 'ucs2':
    case 'utf16le':
      // UTF-16 represents each of Surrogate Pair by 2-bytes
      this.surrogateSize = 2;
      this.detectIncompleteChar = utf16DetectIncompleteChar;
      break;
    case 'base64':
      // Base-64 stores 3 bytes in 4 chars, and pads the remainder.
      this.surrogateSize = 3;
      this.detectIncompleteChar = base64DetectIncompleteChar;
      break;
    default:
      this.write = passThroughWrite;
      return;
  }

  // Enough space to store all bytes of a single character. UTF-8 needs 4
  // bytes, but CESU-8 may require up to 6 (3 bytes per surrogate).
  this.charBuffer = new Buffer(6);
  // Number of bytes received for the current incomplete multi-byte character.
  this.charReceived = 0;
  // Number of bytes expected for the current incomplete multi-byte character.
  this.charLength = 0;
};


// write decodes the given buffer and returns it as JS string that is
// guaranteed to not contain any partial multi-byte characters. Any partial
// character found at the end of the buffer is buffered up, and will be
// returned when calling write again with the remaining bytes.
//
// Note: Converting a Buffer containing an orphan surrogate to a String
// currently works, but converting a String to a Buffer (via `new Buffer`, or
// Buffer#write) will replace incomplete surrogates with the unicode
// replacement character. See https://codereview.chromium.org/121173009/ .
StringDecoder.prototype.write = function(buffer) {
  var charStr = '';
  // if our last write ended with an incomplete multibyte character
  while (this.charLength) {
    // determine how many remaining bytes this buffer has to offer for this char
    var available = (buffer.length >= this.charLength - this.charReceived) ?
        this.charLength - this.charReceived :
        buffer.length;

    // add the new bytes to the char buffer
    buffer.copy(this.charBuffer, this.charReceived, 0, available);
    this.charReceived += available;

    if (this.charReceived < this.charLength) {
      // still not enough chars in this buffer? wait for more ...
      return '';
    }

    // remove bytes belonging to the current character from the buffer
    buffer = buffer.slice(available, buffer.length);

    // get the character that was split
    charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding);

    // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
    var charCode = charStr.charCodeAt(charStr.length - 1);
    if (charCode >= 0xD800 && charCode <= 0xDBFF) {
      this.charLength += this.surrogateSize;
      charStr = '';
      continue;
    }
    this.charReceived = this.charLength = 0;

    // if there are no more bytes in this buffer, just emit our char
    if (buffer.length === 0) {
      return charStr;
    }
    break;
  }

  // determine and set charLength / charReceived
  this.detectIncompleteChar(buffer);

  var end = buffer.length;
  if (this.charLength) {
    // buffer the incomplete character bytes we got
    buffer.copy(this.charBuffer, 0, buffer.length - this.charReceived, end);
    end -= this.charReceived;
  }

  charStr += buffer.toString(this.encoding, 0, end);

  var end = charStr.length - 1;
  var charCode = charStr.charCodeAt(end);
  // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
  if (charCode >= 0xD800 && charCode <= 0xDBFF) {
    var size = this.surrogateSize;
    this.charLength += size;
    this.charReceived += size;
    this.charBuffer.copy(this.charBuffer, size, 0, size);
    buffer.copy(this.charBuffer, 0, 0, size);
    return charStr.substring(0, end);
  }

  // or just emit the charStr
  return charStr;
};

// detectIncompleteChar determines if there is an incomplete UTF-8 character at
// the end of the given buffer. If so, it sets this.charLength to the byte
// length that character, and sets this.charReceived to the number of bytes
// that are available for this character.
StringDecoder.prototype.detectIncompleteChar = function(buffer) {
  // determine how many bytes we have to check at the end of this buffer
  var i = (buffer.length >= 3) ? 3 : buffer.length;

  // Figure out if one of the last i bytes of our buffer announces an
  // incomplete char.
  for (; i > 0; i--) {
    var c = buffer[buffer.length - i];

    // See http://en.wikipedia.org/wiki/UTF-8#Description

    // 110XXXXX
    if (i == 1 && c >> 5 == 0x06) {
      this.charLength = 2;
      break;
    }

    // 1110XXXX
    if (i <= 2 && c >> 4 == 0x0E) {
      this.charLength = 3;
      break;
    }

    // 11110XXX
    if (i <= 3 && c >> 3 == 0x1E) {
      this.charLength = 4;
      break;
    }
  }
  this.charReceived = i;
};

StringDecoder.prototype.end = function(buffer) {
  var res = '';
  if (buffer && buffer.length)
    res = this.write(buffer);

  if (this.charReceived) {
    var cr = this.charReceived;
    var buf = this.charBuffer;
    var enc = this.encoding;
    res += buf.slice(0, cr).toString(enc);
  }

  return res;
};

function passThroughWrite(buffer) {
  return buffer.toString(this.encoding);
}

function utf16DetectIncompleteChar(buffer) {
  this.charReceived = buffer.length % 2;
  this.charLength = this.charReceived ? 2 : 0;
}

function base64DetectIncompleteChar(buffer) {
  this.charReceived = buffer.length % 3;
  this.charLength = this.charReceived ? 3 : 0;
}

},{"buffer":5}],28:[function(require,module,exports){
(function (global){

/**
 * Module exports.
 */

module.exports = deprecate;

/**
 * Mark that a method should not be used.
 * Returns a modified function which warns once by default.
 *
 * If `localStorage.noDeprecation = true` is set, then it is a no-op.
 *
 * If `localStorage.throwDeprecation = true` is set, then deprecated functions
 * will throw an Error when invoked.
 *
 * If `localStorage.traceDeprecation = true` is set, then deprecated functions
 * will invoke `console.trace()` instead of `console.error()`.
 *
 * @param {Function} fn - the function to deprecate
 * @param {String} msg - the string to print to the console when `fn` is invoked
 * @returns {Function} a new "deprecated" version of `fn`
 * @api public
 */

function deprecate (fn, msg) {
  if (config('noDeprecation')) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (config('throwDeprecation')) {
        throw new Error(msg);
      } else if (config('traceDeprecation')) {
        console.trace(msg);
      } else {
        console.warn(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
}

/**
 * Checks `localStorage` for boolean values for the given `name`.
 *
 * @param {String} name
 * @returns {Boolean}
 * @api private
 */

function config (name) {
  // accessing global.localStorage can trigger a DOMException in sandboxed iframes
  try {
    if (!global.localStorage) return false;
  } catch (_) {
    return false;
  }
  var val = global.localStorage[name];
  if (null == val) return false;
  return String(val).toLowerCase() === 'true';
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],29:[function(require,module,exports){
arguments[4][9][0].apply(exports,arguments)
},{"dup":9}],30:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],31:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":30,"_process":14,"inherits":29}],32:[function(require,module,exports){
"use strict";

var Adaptor = require("./lib/adaptor"),
    Driver = require("./lib/driver");

module.exports = {
  adaptors: ["sphero"],
  drivers: ["sphero"],

  adaptor: function(opts) {
    return new Adaptor(opts);
  },

  driver: function(opts) {
    return new Driver(opts);
  }
};

},{"./lib/adaptor":33,"./lib/driver":35}],33:[function(require,module,exports){
/*
 * cylon sphero adaptor
 * http://cylonjs.com
 *
 * Copyright (c) 2013-2014 The Hybrid Group
 * Licensed under the Apache 2.0 license.
*/

"use strict";

var Cylon = require("cylon"),
    sphero = require("sphero");

var Commands = require("./commands");
var Events = require("./events");

var DATA_SOURCES1 = {
  motorsPWM: 0x00180000,
  imu: 0x00070000,
  accelerometer: 0x0000E000,
  gyroscope: 0x00001C00,
  motorsIMF: 0x00000060,
};

var DATA_SOURCES2 = {
  quaternion: 0xF0000000,
  odometer: 0x0C000000,
  accelOne: 0x02000000,
  velocity: 0x01800000
};

var Adaptor = module.exports = function Adaptor(opts) {
  Adaptor.__super__.constructor.apply(this, arguments);

  opts = opts || {};

  this.locatorOpts = opts.locatorOpts || {};
  this.mask1 = this.mask2 = 0x00000000;

  if (this.port == null) {
    throw new Error(
      "No port specified for Sphero adaptor '" + this.name + "'. Cannot proceed"
    );
  }

  this.connector = this.sphero = sphero(this.port);
  this.proxyMethods(Commands, this.sphero, this);
};

Cylon.Utils.subclass(Adaptor, Cylon.Adaptor);

Adaptor.prototype.commands = Commands;
Adaptor.prototype.events = Events;

/**
 * Connects to the Sphero
 *
 * @param {Function} callback to be triggered when connected
 * @return {void}
 */
Adaptor.prototype.connect = function(callback) {
  Cylon.Logger.info("Connecting to Sphero '" + this.name + "'...");

  this.defineAdaptorEvent({ event: "open", targetEvent: "connect" });

  this.sphero.connect(function(err) {
    if (err) {
      this.emit("error", err);
    } else {
      this.events.forEach(function(e) {
        this.defineAdaptorEvent(e);
      }.bind(this));

      callback();
    }
  }.bind(this));
};

/**
 * Disconnects from the Sphero
 *
 * @param {Function} callback to be triggered when disconnected
 * @return {void}
 */
Adaptor.prototype.disconnect = function(callback) {
  Cylon.Logger.info("Disconnecting from Sphero '" + this.name + "'...");

  this.sphero.disconnect(function() {
    callback();
  });
};

/**
 * Enables Sphero data streaming
 *
 * @param {Object} opts to be passed to sphero
 * @param {Function} callback to be triggered when done
 * @return {void}
 * @publish
 */
Adaptor.prototype.setDataStreaming = function(opts, callback) {
  opts = opts || {};

  var dataSources = opts.dataSources;

  if (dataSources) {
    dataSources.forEach(function(ds) {
      opts.mask1 |= DATA_SOURCES1[ds];
      opts.mask2 |= DATA_SOURCES2[ds];
    });
  }

  this.mask1 |= opts.mask1;
  this.mask2 |= opts.mask2;

  this.sphero.setDataStreaming(opts, callback);
};

},{"./commands":34,"./events":36,"cylon":40,"sphero":79}],34:[function(require,module,exports){
/*
 * cylon sphero commands
 * http://cylonjs.com
 *
 * Copyright (c) 2013 The Hybrid Group
 * Licensed under the Apache 2.0 license.
 */

"use strict";

module.exports = [
 /**
   * The Abort Macro command aborts any executing macro, and returns both it's
   * ID code and the command number currently in progress.
   *
   * An exception is a System Macro executing with the UNKILLABLE flag set.
   *
   * A returned ID code of 0x00 indicates that no macro was running, an ID code
   * of 0xFFFF as the CmdNum indicates the macro was unkillable.
   *
   * @param {Function} callback function to be triggered with response
   * @example
   * orb.abortMacro(function(err, data) {
   *   if (err) {
   *     console.log("error: ", err);
   *   } else {
   *     console.log("data:");
   *     console.log("  id:", data.id);
   *     console.log("  cmdNum:", data.cmdNum);
   *   }
   * }
   * @return {void}
   * @publish
   */
  "abortMacro",
  /**
   * The Abort orbBasic Program command aborts execution of any currently
   * running orbBasic program.
   *
   * @param {Function} callback function to be triggered with response
   * @example
   * orb.abortOrbBasicProgram(function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @publish
   */
  "abortOrbBasicProgram",
  /**
   * The add XP command increases XP by adding the supplied number of minutes
   * of drive time, and immediately commits the SSB to flash.
   *
   * If the password is not accepted, this command fails without consequence.
   *
   * @private
   * @param {Number} pw 32-bit password
   * @param {Number} qty 8-bit number of minutes of drive time to add
   * @param {Function} callback function to be triggered with response
   * @example
   * orb.addXp(pwd, 5, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @private
   */
  "addXp",
  /**
   * The Append Macro Chunk project stores the attached macro definition into
   * the temporary RAM buffer for later execution.
   *
   * It's similar to the Save Temporary Macro command, but allows building up
   * longer temporary macros.
   *
   * Any existing Macro ID can be sent through this command, and executed
   * through the Run Macro call using ID 0xFF.
   *
   * If this command is sent while a Temporary or Stream Macro is executing it
   * will be terminated so that its storage space can be overwritten. As with
   * all macros, the longest chunk that can be sent is 254 bytes.
   *
   * You must follow this with a Run Macro command (ID 0xFF) to actually get it
   * to go and it is best to prefix this command with an Abort call to make
   * certain the larger buffer is completely initialized.
   *
   * @param {Array} chunk of bytes to append for macro execution
   * @param {Function} callback function to be triggered with response
   * @example
   * orb.appendMacroChunk(, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @publish
   */
  "appendMacroChunk",
  /**
   * The Append orbBasic Fragment command appends a patch of orbBasic code to
   * existing ones in the specified storage area (0x00 for RAM, 0x01 for
   * persistent).
   *
   * Complete lines are not required. A line begins with a decimal line number
   * followed by a space and is terminated with a <LF>.
   *
   * See the orbBasic Interpreter document for complete information.
   *
   * Possible error responses would be ORBOTIX_RSP_CODE_EPARAM if an illegal
   * storage area is specified or ORBOTIX_RSP_CODE_EEXEC if the specified
   * storage area is full.
   *
   * @param {Number} area which area to append the fragment to
   * @param {String} code orbBasic code to append
   * @param {Function} callback function to be triggered with response
   * @example
   * orb.appendOrbBasicFragment(0x00, OrbBasicCode, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @publish
   */
  "appendOrbBasicFragment",
  /**
   * The Assign Time command sets a specific value to Sphero's internal 32-bit
   * relative time counter.
   *
   * @param {Number} time the new value to set
   * @param {Function} callback function to be triggered when done writing
   * @example
   * orb.assignTime(0x00ffff00, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @publish
   */
  "assignTime",
  /**
   * The Boost command executes Sphero's boost macro.
   *
   * It takes a 1-byte parameter, 0x01 to start boosting, or 0x00 to stop.
   *
   * @param {Number} boost whether or not to boost (1 - yes, 0 - no)
   * @param {Function} callback function to be triggered after writing
   * @example
   * orb.boost(1, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @publish
   */
  "boost",
  /**
   * The Buy Consumable command attempts to spend cores on consumables.
   *
   * The consumable ID is given (0 - 7), as well as the quantity requested to
   * purchase.
   *
   * If the purchase succeeds, the consumable count is increased, the cores are
   * spent, and a success response is returned with the increased quantity and
   * lower balance.
   *
   * If there aren't enough cores available to spend, or the purchase would
   * exceed the max consumable quantity of 255, Sphero responds with an EEXEC
   * error (0x08)
   *
   * @private
   * @param {Number} id what consumable to buy
   * @param {Number} qty how many consumables to buy
   * @param {Function} callback function to be called with response
   * @example
   * orb.buyConsumable(0x00, 5, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @private
   */
  "buyConsumable",
  /**
   * The Clear Counters command is a developer-only command to clear the various
   * system counters created by the L2 diagnostics.
   *
   * It is denied when the Sphero is in Normal mode.
   *
   * @private
   * @param {Function} callback function to be triggered when done writing
   * @example
   * orb.clearCounters(function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @publish
   */
  "clearCounters",
  /**
   * The Color command wraps Sphero's built-in setRgb command, allowing for
   * a greater range of possible inputs.
   *
   * @param {Number|String|Object} color what color to change Sphero to
   * @param {Function} callback function to be triggered with response
   * @example
   * orb.color("#00ff00", function(err, data) {
   *   console.log(err || "Color Changed!");
   * });
   * @example
   * orb.color(0xff0000, function(err, data) {
   *   console.log(err || "Color Changed!");
   * });
   * @example
   * orb.color({ red: 0, green: 0, blue: 255 }, function(err, data) {
   *   console.log(err || "Color Changed!");
   * });
   * @return {void}
   * @publish
   */
  "color",
  /**
   * The Commit To Flash command copies the current orbBasic RAM program to
   * persistent flash storage.
   *
   * It will fail if a program is currently executing out of flash.
   *
   * @param {Function} callback function to be triggered with response
   * @example
   * orb.commitToFlash(function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @publish
   */
  "commitToFlash",
  /**
   * The Configure Collisions command configures Sphero's collision detection
   * with the provided parameters.
   *
   * These include:
   *
   * - **meth** - which detection method to use. Supported methods are 0x01,
   *   0x02, and 0x03 (see the collision detection document for details). 0x00
   *   disables this service.
   * - **xt, yt** - 8-bit settable threshold for the X (left, right) and
   *   y (front, back) axes of Sphero. 0x00 disables the contribution of that
   *   axis.
   * - **xs, ys** - 8-bit settable speed value for X/Y axes. This setting is
   *   ranged by the speed, than added to `xt` and `yt` to generate the final
   *   threshold value.
   * - **dead** - an 8-bit post-collision dead time to prevent re-triggering.
   *   Specified in 10ms increments.
   *
   * @param {Object} opts object containing collision configuration opts
   * @param {Function} cb function to be triggered after writing
   * @example
   * var opts = {
   *   meth: 0x01,
   *   xt: 0x0F,
   *   xs: 0x0F,
   *   yt: 0x0A,
   *   ys: 0x0A,
   *   dead: 0x05
   * };
   *
   * orb.configureCollisions(opts, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @publish
   */
  "configureCollisions",
  /**
   * The Configure Locator command configures Sphero's streaming location data
   * service.
   *
   * The following options must be provided:
   *
   * - **flags** - bit 0 determines whether calibrate commands auto-correct the
   *   yaw tare value. When false, positive Y axis coincides with heading 0.
   *   Other bits are reserved.
   * - **x, y** - the current (x/y) coordinates of Sphero on the ground plane in
   *   centimeters
   * - **yawTare** - controls how the x,y-plane is aligned with Sphero's heading
   *   coordinate system. When zero, yaw = 0 corresponds to facing down the
   *   y-axis in the positive direction. Possible values are 0-359 inclusive.
   *
   * @param {Object} opts object containing locator service configuration
   * @param {Function} callback function to be triggered after writing
   * @example
   * var opts = {
   *   flags: 0x01,
   *   x: 0x0000,
   *   y: 0x0000,
   *   yawTare: 0x0
   * };
   *
   * orb.configureLocator(opts, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @publish
   */
  "configureLocator",
  /**
   * The Control UART Tx command enables or disables the CPU's UART transmit
   * line so another client can configure the Bluetooth module.
   *
   * @param {Function} callback function to be triggered after write
   * @example
   * orb.controlUartTx(function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @publish
   */
  "controlUartTx",
   /**
   * The Detect Collisions command sets up Sphero's collision detection system,
   * and automatically parses asynchronous packets to re-emit collision events
   * to 'collision' event listeners.
   *
   * @param {Function} callback (err, data) to be triggered with response
   * @example
   * orb.detectCollisions();
   *
   * orb.on("collision", function(data) {
   *   console.log("data:");
   *   console.log("  x:", data.x);
   *   console.log("  y:", data.y);
   *   console.log("  z:", data.z);
   *   console.log("  axis:", data.axis);
   *   console.log("  xMagnitud:", data.xMagnitud);
   *   console.log("  yMagnitud:", data.yMagnitud);
   *   console.log("  speed:", data.timeStamp);
   *   console.log("  timeStamp:", data.timeStamp);
   * });
   * @return {void}
   * @publish
   */
  "detectCollisions",
  /**
   * The Enable SSB Async Messages command turns on/off soul block related
   * asynchronous messages.
   *
   * These include shield collision/regrowth messages, boost use/regrowth
   * messages, XP growth, and level-up messages.
   *
   * This feature defaults to off.
   *
   * @private
   * @param {Number} flag whether or not to enable async messages
   * @param {Function} callback function to be triggered after write
   * @example
   * orb.enableSsbAsyncMsg(0x01, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @publish
   */
  "enableSsbAsyncMsg",
  /**
   * The Erase orbBasic Storage command erases any existing program in the
   * specified storage area.
   *
   * Specify 0x00 for the temporary RAM buffer, or 0x01 for the persistent
   * storage area.
   *
   * @param {Number} area which area to erase
   * @param {Function} callback function to be triggered with response
   * @example
   * orb.eraseOrbBasicStorage(0x00, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @publish
   */
  "eraseOrbBasicStorage",
  /**
   * The Execute orbBasic Program command attempts to run a program in the
   * specified storage area, beginning at the specified line number.
   *
   * This command will fail if there is already an orbBasic program running.
   *
   * @param {Number} area which area to run from
   * @param {Number} slMSB start line
   * @param {Number} slLSB start line
   * @param {Function} callback function to be triggered with response
   * @example
   * orb.executeOrbBasicProgram(0x00, 0x00, 0x00, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @publish
   */
  "executeOrbBasicProgram",
  /**
   * The Finish Calibration command ends Sphero's calibration mode, by setting
   * the new heading as current, turning off the back LED, and re-enabling
   * stabilization.
   *
   * @param {Function} callback function to be triggered with response
   * @example
   * orb.finishCalibration();
   * @return {void}
   * @publish
   */
  "finishCalibration",
  /**
   * The Get Auto Reconnect command returns the Bluetooth auto reconnect values
   * as defined above in the Set Auto Reconnect command.
   *
   * @param {Function} callback function to be triggered with reconnect data
   * @example
   * orb.getAutoReconnect(function(err, data) {
   *   if (err) {
   *     console.log("error: ", err);
   *   } else {
   *     console.log("data:");
   *     console.log("  flag:", data.flag);
   *     console.log("  time:", data.time);
   *   }
   * }
   * @return {void}
   * @publish
   */
  "getAutoReconnect",
  /**
   * Triggers the callback with a structure containing
   *
   * - Sphero's ASCII name
   * - Sphero's Bluetooth address (ASCII)
   * - Sphero's ID colors
   *
   * @param {Function} callback function to be triggered with Bluetooth info
   * @example
   * orb.getBluetoothInfo(function(err, data) {
   *   if (err) {
   *     console.log("error: ", err);
   *   } else {
   *     console.log("data:");
   *     console.log("  name:", data.name);
   *     console.log("  btAddress:", data.btAddress);
   *     console.log("  separator:", data.separator);
   *     console.log("  colors:", data.colors);
   *   }
   * }
   * @return {void}
   * @publish
   */
  "getBluetoothInfo",
  /**
   * The Get Chassis ID command returns the 16-bit chassis ID Sphero was
   * assigned at the factory.
   *
   * @param {Function} callback function to be triggered with a response
   * @example
   * orb.getChassisId(function(err, data) {
   *   if (err) {
   *     console.log("error: ", err);
   *   } else {
   *     console.log("data:");
   *     console.log("  chassisId:", data.chassisId);
   *   }
   * }
   * @return {void}
   * @publish
   */
  "getChassisId",
  /**
   * Passes the color of the sphero Rgb LED to the callback (err, data)
   *
   * @param {Function} callback function to be triggered with response
   * @example
   * orb.getColor(function(err, data) {
   *   if (err) {
   *     console.log("error: ", err);
   *   } else {
   *     console.log("data:");
   *     console.log("  color:", data.color);
   *     console.log("  red:", data.red);
   *     console.log("  green:", data.green);
   *     console.log("  blue:", data.blue);
   *   }
   * });
   * @return {void}
   * @publish
   */
  "getColor",
  /**
   * The Get Configuration Block command retrieves one of Sphero's configuration
   * blocks.
   *
   * The response is a simple one; an error code of 0x08 is returned when the
   * resources are currently unavailable to send the requested block back. The
   * actual configuration block data returns in an asynchronous message of type
   * 0x04 due to its length (if there is no error).
   *
   * ID = `0x00` requests the factory configuration block
   * ID = `0x01` requests the user configuration block, which is updated with
   * current values first
   *
   * @param {Number} id which configuration block to fetch
   * @param {Function} callback function to be triggered after writing
   * @example
   * orb.getConfigBlock(function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @publish
   */
  "getConfigBlock",
  /**
   * The Get Device Mode command gets the current device mode of Sphero.
   *
   * Possible values:
   *
   * - **0x00**: Normal mode
   * - **0x01**: User Hack mode.
   *
   * @param {Function} callback function to be called with response
   * @example
   * orb.getDeviceMode(function(err, data) {
   *   if (err) {
   *     console.log("error: ", err);
   *   } else {
   *     console.log("data:");
   *     console.log("  mode:", data.mode);
   *   }
   * }
   * @return {void}
   * @publish
   */
  "getDeviceMode",
  /**
   * The Get Macro Status command returns the ID code and command number of the
   * currently executing macro.
   *
   * If no macro is running, the 0x00 is returned for the ID code, and the
   * command number is left over from the previous macro.
   *
   * @param {Function} callback function to be triggered with response
   * @example
   * orb.getMacroStatus(function(err, data) {
   *   if (err) {
   *     console.log("error: ", err);
   *   } else {
   *     console.log("data:");
   *     console.log("  idCode:", data.idCode);
   *     console.log("  cmdNum:", data.cmdNum);
   *   }
   * }
   * @return {void}
   * @publish
   */
  "getMacroStatus",
  /**
   * The Get Permanent Option Flags command returns Sphero's permanent option
   * flags, as a bit field.
   *
   * Here's possible bit fields, and their descriptions:
   *
   * - `0`: Set to prevent Sphero from immediately going to sleep when placed in
   *   the charger and connected over Bluetooth.
   * - `1`: Set to enable Vector Drive, that is, when Sphero is stopped and
   *   a new roll command is issued it achieves the heading before moving along
   *   it.
   * - `2`: Set to disable self-leveling when Sphero is inserted into the
   *   charger.
   * - `3`: Set to force the tail LED always on.
   * - `4`: Set to enable motion timeouts (see DID 02h, CID 34h)
   * - `5`: Set to enable retail Demo Mode (when placed in the charger, ball
   *   runs a slow rainbow macro for 60 minutes and then goes to sleep).
   * - `6`: Set double tap awake sensitivity to Light
   * - `7`: Set double tap awake sensitivity to Heavy
   * - `8`: Enable gyro max async message (NOT SUPPORTED IN VERSION 1.47)
   * - `6-31`: Unassigned
   *
   * @param {Function} callback function triggered with option flags data
   * @example
   * orb.getPermOptionFlags(function(err, data) {
   *   if (err) {
   *     console.log("error: ", err);
   *   } else {
   *     console.log("data:");
   *     console.log("  sleepOnCharger:", data.sleepOnCharger);
   *     console.log("  vectorDrive:", data.vectorDrive);
   *     console.log("  selfLevelOnCharger:", data.selfLevelOnCharger);
   *     console.log("  tailLedAlwaysOn:", data.tailLedAlwaysOn);
   *     console.log("  motionTimeouts:", data.motionTimeouts);
   *     console.log("  retailDemoOn:", data.retailDemoOn);
   *     console.log("  awakeSensitivityLight:", data.awakeSensitivityLight);
   *     console.log("  awakeSensitivityHeavy:", data.awakeSensitivityHeavy);
   *     console.log("  gyroMaxAsyncMsg:", data.gyroMaxAsyncMsg);
   *   }
   * }
   * @return {void}
   * @publish
   */
  "getPermOptionFlags",
  /**
   * The Get Power State command returns Sphero's current power state, and some
   * additional parameters:
   *
   * - **RecVer**: record version code (following is for 0x01)
   * - **Power State**: high-level state of the power system
   * - **BattVoltage**: current battery voltage, scaled in 100ths of a volt
   *   (e.g. 0x02EF would be 7.51 volts)
   * - **NumCharges**: Number of battery recharges in the life of this Sphero
   * - **TimeSinceChg**: Seconds awake since last recharge
   *
   * Possible power states:
   *
   * - 0x01 - Battery Charging
   * - 0x02 - Battery OK
   * - 0x03 - Battery Low
   * - 0x04 - Battery Critical
   *
   * @param {Function} callback function to be triggered with power state data
   * @example
   * orb.getPowerState(function(err, data) {
   *   if (err) {
   *     console.log("error: ", err);
   *   } else {
   *     console.log("data:");
   *     console.log("  recVer:", data.recVer);
   *     console.log("  batteryState:", data.batteryState);
   *     console.log("  batteryVoltage:", data.batteryVoltage);
   *     console.log("  chargeCount:", data.chargeCount);
   *     console.log("  secondsSinceCharge:", data.secondsSinceCharge);
   *   }
   * }
   * @return {void}
   * @publish
   */
  "getPowerState",
  /**
   * The Get RGB LED command fetches the current "user LED color" value, stored
   * in Sphero's configuration.
   *
   * This value may or may not be what's currently displayed by Sphero's LEDs.
   *
   * @param {Function} callback function to be triggered after writing
   * @example
   * orb.getRgbLed(function(err, data) {
   *   if (err) {
   *     console.log("error: ", err);
   *   } else {
   *     console.log("data:");
   *     console.log("  color:", data.color);
   *     console.log("  red:", data.red);
   *     console.log("  green:", data.green);
   *     console.log("  blue:", data.blue);
   *   }
   * }
   * @return {void}
   * @publish
   */
  "getRgbLed",
  /**
   * The Get SSB command retrieves Sphero's Soul Block.
   *
   * The response is simple, and then the actual block of soulular data returns
   * in an asynchronous message of type 0x0D, due to it's 0x440 byte length
   *
   * @private
   * @param {Function} callback function to be called with response
   * @example
   * orb.getSsb(function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @publish
   */
  "getSsb",
  /**
   * The Get Temporary Option Flags command returns Sphero's temporary option
   * flags, as a bit field:
   *
   * - `0`: Enable Stop On Disconnect behavior
   * - `1-31`: Unassigned
   *
   * @param {Function} callback function triggered with option flags data
   * @example
   * orb.getTempOptionFlags(function(err, data) {
   *   if (err) {
   *     console.log("error: ", err);
   *   } else {
   *     console.log("data:");
   *     console.log("  stopOnDisconnect:", data.stopOnDisconnect);
   *   }
   * }
   * @return {void}
   * @publish
   */
  "getTempOptionFlags",
  /**
   * The Get Voltage Trip Points command returns the trip points Sphero uses to
   * determine Low battery and Critical battery.
   *
   * The values are expressed in 100ths of a volt, so defaults of 7V and 6.5V
   * respectively are returned as 700 and 650.
   *
   * @param {Function} callback function to be triggered with trip point data
   * @example
   * orb.getVoltageTripPoints(function(err, data) {
   *   if (err) {
   *     console.log("error: ", err);
   *   } else {
   *     console.log("data:");
   *     console.log("  vLow:", data.vLow);
   *     console.log("  vCrit:", data.vCrit);
   *   }
   * }
   * @return {void}
   * @publish
   */
  "getVoltageTripPoints",
  /**
   * The Grant Cores command adds the supplied number of cores.
   *
   * If the first bit in the flags byte is set, the command immediately commits
   * the SSB to flash. Otherwise, it does not.
   *
   * All other bits are reserved.
   *
   * If the password is not accepted, this command fails without consequence.
   *
   * @private
   * @param {Number} pw 32-bit password
   * @param {Number} qty 32-bit number of cores to add
   * @param {Number} flags 8-bit flags byte
   * @param {Function} callback function to be triggered with response
   * @example
   * orb.grantCores(pwd, 5, 0x01, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @private
   */
  "grantCores",
  /**
   * The Jump To Bootloader command requests a jump into the Bootloader to
   * prepare for a firmware download.
   *
   * All commands after this one must comply with the Bootloader Protocol
   * Specification.
   *
   * @param {Function} callback function to be triggered when done writing
   * @example
   * orb.jumpToBootLoader(function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @publish
   */
  "jumpToBootloader",
  /**
   * The Level Up Attribute command attempts to increase the level of the
   * specified attribute by spending attribute points.
   *
   * The IDs are:
   *
   * - **0x00**: speed
   * - **0x01**: boost
   * - **0x02**: brightness
   * - **0x03**: shield
   *
   *
   * If successful, the SSB is committed to flash, and a response packet
   * containing the attribute ID, new level, and remaining attribute points is
   * returned.
   *
   * If there are not enough attribute points, this command returns an EEXEC
   * error (0x08).
   *
   * If the password is not accepted, this command fails without consequence.
   *
   * @private
   * @param {Number} pw 32-bit password
   * @param {Number} id which attribute to level up
   * @param {Function} callback function to be triggered with response
   * @example
   * orb.levelUpAttr(pwd, 0x00, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @private
   */
  "levelUpAttr",
  /**
   * The Ping command verifies the Sphero is awake and receiving commands.
   *
   * @param {Function} callback triggered when Sphero has been pinged
   * @example
   * orb.ping(function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @publish
   */
  "ping",
  /**
   * The Poll Packet Times command helps users profile the transmission and
   * processing latencies in Sphero.
   *
   * For more details, see the Sphero API documentation.
   *
   * @param {Number} time a timestamp to use for profiling
   * @param {Function} callback function to be triggered when done writing
   * @example
   * orb.assignTime(0x00ffff, function(err, data) {
   *   if (err) {
   *     console.log("error: ", err);
   *   } else {
   *     console.log("data:");
   *     console.log("  t1:", data.t1);
   *     console.log("  t2:", data.t2);
   *     console.log("  t3:", data.t3);
   *   }
   * }
   * @return {void}
   * @publish
   */
  "pollPacketTimes",
  /**
   * The Random Color command sets Sphero to a randomly-generated color.
   *
   * @param {Function} callback (err, data) to be triggered with response
   * @example
   * orb.randomColor(function(err, data) {
   *   console.log(err || "Random Color!");
   * });
   * @return {void}
   * @publish
   */
  "randomColor",
  /**
   * The Reinit Macro Executive command terminates any running macro, and
   * reinitializes the macro system.
   *
   * The table of any persistent user macros is cleared.
   *
   * @param {Function} callback function to be triggered with response
   * @example
   * orb.reInitMacroExec(function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @publish
   */
  "reInitMacroExec",
  /**
   * The Read Locator command gets Sphero's current position (X,Y), component
   * velocities, and speed-over-ground (SOG).
   *
   * The position is a signed value in centimeters, the component velocities are
   * signed cm/sec, and the SOG is unsigned cm/sec.
   *
   * @param {Function} callback function to be triggered with data
   * @example
   * orb.readLocator(function(err, data) {
   *   if (err) {
   *     console.log("error: ", err);
   *   } else {
   *     console.log("data:");
   *     console.log("  xpos:", data.xpos);
   *     console.log("  ypos:", data.ypos);
   *     console.log("  xvel:", data.xvel);
   *     console.log("  yvel:", data.yvel);
   *     console.log("  sog:", data.sog);
   *   }
   * }
   * @return {void}
   * @publish
   */
  "readLocator",
  /**
   * The Refill Bank command attempts to refill either the Boost bank (0x00) or
   * the Shield bank (0x01) by attempting to deduct the respective refill cost
   * from the current number of cores.
   *
   * If it succeeds, the bank is set to the maximum obtainable for that level,
   * the cores are spent, and a success response is returned with the lower core
   * balance.
   *
   * If there aren't enough cores available to spend, Sphero responds with an
   * EEXEC error (0x08)
   *
   * @private
   * @param {Number} type what bank to refill (0 - Boost, 1 - Shield)
   * @param {Function} callback function to be called with response
   * @example
   * orb.refillBank(0x00, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @private
   */
  "refillBank",
  /**
   * The Roll command tells Sphero to roll along the provided vector.
   *
   * Both a speed and heading are required, the latter is considered relative to
   * the last calibrated direction.
   *
   * Permissible heading values are 0 to 359 inclusive.
   *
   * @param {Number} speed what speed Sphero should roll at
   * @param {Number} heading what heading Sphero should roll towards (0-359)
   * @param {Number} [state] optional state parameter
   * @param {Function} callback function to be triggered after writing
   * @example
   * orb.setbackLed(180, 0, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @publish
   */
  "roll",
  /**
   * The Perform Level 1 Diagnostics command is a developer-level command to
   * help diagnose aberrant behaviour in Sphero.
   *
   * Most process flags, system counters, and system states are decoded to
   * human-readable ASCII.
   *
   * For more details, see the Sphero API documentation.
   *
   * @param {Function} callback function to be triggered with diagnostic data
   * @example
   * orb.runL1Diags(function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @publish
   */
  "runL1Diags",
  /**
   * The Perform Level 2 Diagnostics command is a developer-level command to
   * help diagnose aberrant behaviour in Sphero.
   *
   * It's much less informative than the Level 1 command, but is in binary
   * format and easier to parse.
   *
   * For more details, see the Sphero API documentation.
   *
   * @param {Function} callback function to be triggered with diagnostic data
   * @example
   * orb.runL2Diags(function(err, data) {
   *   if (err) {
   *     console.log("error: ", err);
   *   } else {
   *     console.log("data:");
   *     console.log("  recVer:", data.recVer);
   *     console.log("  rxGood:", data.rxGood);
   *     console.log("  rxBadId:", data.rxBadId);
   *     console.log("  rxBadDlen:", data.rxBadDlen);
   *     console.log("  rxBadCID:", data.rxBadCID);
   *     console.log("  rxBadCheck:", data.rxBadCheck);
   *     console.log("  rxBufferOvr:", data.rxBufferOvr);
   *     console.log("  txMsg:", data.txMsg);
   *     console.log("  txBufferOvr:", data.txBufferOvr);
   *     console.log("  lastBootReason:", data.lastBootReason);
   *     console.log("  bootCounters:", data.bootCounters);
   *     console.log("  chargeCount:", data.chargeCount);
   *     console.log("  secondsSinceCharge:", data.secondsSinceCharge);
   *     console.log("  secondsOn:", data.secondsOn);
   *     console.log("  distancedRolled:", data.distancedRolled);
   *     console.log("  sensorFailures:", data.sensorFailures);
   *     console.log("  gyroAdjustCount:", data.gyroAdjustCount);
   *   }
   * }
   * @return {void}
   * @publish
   */
  "runL2Diags",
  /**
   * The Run Macro command attempts to execute the specified macro.
   *
   * Macro IDs are split into groups:
   *
   * 0-31 are System Macros. They are compiled into the Main Application, and
   * cannot be deleted. They are always available to run.
   *
   * 32-253 are User Macros. They are downloaded and persistently stored, and
   * can be deleted in total.
   *
   * 255 is the Temporary Macro, a special user macro as it is held in RAM for
   * execution.
   *
   * 254 is also a special user macro, called the Stream Macro that doesn't
   * require this call to begin execution.
   *
   * This command will fail if there is a currently executing macro, or the
   * specified ID code can't be found.
   *
   * @param {Number} id 8-bit Macro ID to run
   * @param {Function} callback function to be triggered with response
   * @example
   * orb.runMacro(0x01, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @publish
   */
  "runMacro",
  /** Save macro
   *
   * The Save Macro command stores the attached macro definition into the
   * persistent store for later execution. This command can be sent even if
   * other macros are executing.
   *
   * You will receive a failure response if you attempt to send an ID number in
   * the System Macro range, 255 for the Temp Macro and ID of an existing user
   * macro in the storage block.
   *
   * As with all macros, the longest definition that can be sent is 254 bytes.
   *
   * @param {Array} macro array of bytes with the data to be written
   * @param {Function} callback function to be triggered with response
   * @example
   * orb.saveMacro(0x01, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @publish
   */
  "saveMacro",
  /**
   * The Save Temporary Macro stores the attached macro definition into the
   * temporary RAM buffer for later execution.
   *
   * If this command is sent while a Temporary or Stream Macro is executing it
   * will be terminated so that its storage space can be overwritten. As with
   * all macros, the longest definition that can be sent is 254 bytes.
   *
   * @param {Array} macro array of bytes with the data to be written
   * @param {Function} callback function to be triggered with response
   * @example
   * orb.saveTempMacro(0x01, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @publish
   */
  "saveTempMacro",
  /**
   * The Self Level command controls Sphero's self-level routine.
   *
   * This routine attempts to achieve a horizontal orientation where pitch/roll
   * angles are less than the provided Angle Limit.
   *
   * After both limits are satisfied, option bits control sleep, final
   * angle(heading), and control system on/off.
   *
   * An asynchronous message is returned when the self level routine completes.
   *
   * For more detail on opts param, see the Sphero API documentation.
   *
   * opts:
   *  - angleLimit: 0 for defaul, 1 - 90 to set.
   *  - timeout: 0 for default, 1 - 255 to set.
   *  - trueTime: 0 for default, 1 - 255 to set.
   *  - options: bitmask 4bit e.g. 0xF;
   * };
   *
   * @param {Object} opts self-level routine options
   * @param {Function} callback function to be triggered after writing
   * @example
   * var opts = {
   *   angleLimit: 0,
   *   timeout: 0, ,
   *   trueTime: 0,
   *   options: 0x7
   * };
   *
   * orb.selfLevel(opts, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @publish
   */
  "selfLevel",
  /**
   * The Set Accelerometer Range command tells Sphero what accelerometer range
   * to use.
   *
   * By default, Sphero's solid-state accelerometer is set for a range of ±8Gs.
   * You may wish to change this, perhaps to resolve finer accelerations.
   *
   * This command takes an index for the supported range, as explained below:
   *
   * - `0`: ±2Gs
   * - `1`: ±4Gs
   * - `2`: ±8Gs (default)
   * - `3`: ±16Gs
   *
   * @param {Number} idx what accelerometer range to use
   * @param {Function} callback function to be triggered after writing
   * @example
   * orb.setAccelRange(0x02, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @publish
   */
  "setAccelRange",
  /**
   * The Set Auto Reconnect command tells Sphero's BT module whether or not it
   * should automatically reconnect to the previously-connected Apple mobile
   * device.
   *
   * @param {Number} flag whether or not to reconnect (0 - no, 1 - yes)
   * @param {Number} time how many seconds after start to enable auto reconnect
   * @param {Function} callback function to be triggered after write
   * @example
   * orb.setAutoReconnect(1, 20, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @publish
   */
  "setAutoReconnect",
  /**
   * The Set Back LED command allows brightness adjustment of Sphero's tail
   * light.
   *
   * This value does not persist across power cycles.
   *
   * @param {Number} brightness brightness to set to Sphero's tail light
   * @param {Function} callback function to be triggered after writing
   * @example
   * orb.setbackLed(255, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @publish
   */
  "setBackLed",
  /**
   *
   * The Set Chassis ID command assigns Sphero's chassis ID, a 16-bit value.
   *
   * This command only works if you're at the factory.
   *
   * @param {Number} chassisId new chassis ID
   * @param {Function} callback function to be triggered after writing
   * @example
   * orb.setChassisId(0xFE75, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @publish
   */
  "setChassisId",
  /**
   * The Set Config Block command accepts an exact copy of the configuration
   * block, and loads it into the RAM copy of the configuration block.
   *
   * The RAM copy is then saved to flash.
   *
   * The configuration block can be obtained by using the Get Configuration
   * Block command.
   *
   * @private
   * @param {Array} block - An array of bytes with the data to be written
   * @param {Function} callback - To be triggered when done
   * @example
   * orb.setConfigBlock(dataBlock, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @publish
   */
  "setConfigBlock",
  /**
   * The Set Data Streaming command configures Sphero's built-in support for
   * asynchronously streaming certain system and sensor data.
   *
   * This command selects the internal sampling frequency, packet size,
   * parameter mask, and (optionally) the total number of packets.
   *
   * These options are provided as an object, with the following properties:
   *
   * - **n** - divisor of the maximum sensor sampling rate
   * - **m** - number of sample frames emitted per packet
   * - **mask1** - bitwise selector of data sources to stream
   * - **pcnt** - packet count 1-255 (or 0, for unlimited streaming)
   * - **mask2** - bitwise selector of more data sources to stream (optional)
   *
   * For more explanation of these options, please see the Sphero API
   * documentation.
   *
   * @param {Object} opts object containing streaming data options
   * @param {Function} callback function to be triggered after writing
   * @example
   * var opts = {
   *   n: 400,
   *   m: 1,
   *   mask1: 0x00000000,
   *   mask2: 0x01800000,
   *   pcnt: 0
   * };
   *
   * orb.setDataStreaming(opts, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @publish
   */
  "setDataStreaming",
  /**
   * The Set Device Mode command assigns the operation mode of Sphero based on
   * the supplied mode value.
   *
   * - **0x00**: Normal mode
   * - **0x01**: User Hack mode. Enables ASCII shell commands, refer to the
   *   associated document for details.
   *
   * @param {Number} mode which mode to set Sphero to
   * @param {Function} callback function to be called after writing
   * @example
   * orb.setDeviceMode(0x00, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @publish
   */
  "setDeviceMode",
  /**
   * The Set Device Name command assigns Sphero an internal name. This value is
   * then produced as part of the Get Bluetooth Info command.
   *
   * Names are clipped at 48 characters to support UTF-8 sequences. Any extra
   * characters will be discarded.
   *
   * This field defaults to the Bluetooth advertising name of Sphero.
   *
   * @param {String} name what name to give to the Sphero
   * @param {Function} callback function to be triggered when the name is set
   * @example
   * orb.setDeviceName("rollingOrb", function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @publish
   */
  "setDeviceName",
  /**
   * The Set Heading command tells Sphero to adjust it's orientation, by
   * commanding a new reference heading (in degrees).
   *
   * If stabilization is enabled, Sphero will respond immediately to this.
   *
   * @param {Number} heading Sphero's new reference heading, in degrees (0-359)
   * @param {Function} callback function to be triggered after writing
   * @example
   * orb.setHeading(180, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @publish
   */
  "setHeading",
  /**
   * The Set Inactivity Timeout command sets the timeout delay before Sphero
   * goes to sleep automatically.
   *
   * By default, the value is 600 seconds (10 minutes), but this command can
   * alter it to any value of 60 seconds or greater.
   *
   * @param {Number} time new delay before sleeping
   * @param {Function} callback function to be triggered when done writing
   * @example
   * orb.setInactivityTimeout(120, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @publish
   */
  "setInactivityTimeout",
  /**
   * The Set Macro Parameter command allows system globals that influence
   * certain macro commands to be selectively altered from outside of the macro
   * system itself.
   *
   * The values of Val1 and Val2 depend on the parameter index.
   *
   * Possible indices:
   *
   * - **00h** Assign System Delay 1: Val1 = MSB, Val2 = LSB
   * - **01h** Assign System Delay 2: Val1 = MSB, Val2 = LSB
   * - **02h** Assign System Speed 1: Val1 = speed, Val2 = 0 (ignored)
   * - **03h** Assign System Speed 2: Val1 = speed, Val2 = 0 (ignored)
   * - **04h** Assign System Loops: Val1 = loop count, Val2 = 0 (ignored)
   *
   * For more details, please refer to the Sphero Macro document.
   *
   * @param {Number} index what parameter index to use
   * @param {Number} val1 value 1 to set
   * @param {Number} val2 value 2 to set
   * @param {Function} callback function to be triggered with response
   * @example
   * orb.setMacroParam(0x02, 0xF0, 0x00, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @publish
   */
  "setMacroParam",
  /**
   * The Set Motion Timeout command gives Sphero an ultimate timeout for the
   * last motion command to keep Sphero from rolling away in the case of
   * a crashed (or paused) application.
   *
   * This defaults to 2000ms (2 seconds) upon wakeup.
   *
   * @param {Number} time timeout length in milliseconds
   * @param {Function} callback function to be triggered when done writing
   * @example
   * orb.setMotionTimeout(0x0FFF, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @publish
   */
  "setMotionTimeout",
  /**
   * The Set Permanent Option Flags command assigns Sphero's permanent option
   * flags to the provided values, and writes them immediately to the config
   * block.
   *
   * See below for the bit definitions.
   *
   * @param {Array} flags permanent option flags
   * @param {Function} callback function to be triggered when done writing
   * @example
   * // Force tail LED always on
   * orb.setPermOptionFlags(0x00000008, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @publish
   */
  "setPermOptionFlags",
  /**
   * The Set Power Notification command enables sphero to asynchronously notify
   * the user of power state periodically (or immediately, when a change occurs)
   *
   * Timed notifications are sent every 10 seconds, until they're disabled or
   * Sphero is unpaired.
   *
   * @param {Number} flag whether or not to send notifications (0 - no, 1 - yes)
   * @param {Function} callback function to be triggered when done writing
   * @example
   * orb.setPowerNotification(1, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @publish
   */
  "setPowerNotification",
  /**
   * The Set Raw Motors command allows manual control over one or both of
   * Sphero's motor output values.
   *
   * Each motor (left and right requires a mode and a power value from 0-255.
   *
   * This command will disable stabilization is both mode's aren't "ignore", so
   * you'll need to re-enable it once you're done.
   *
   * Possible modes:
   *
   * - `0x00`: Off (motor is open circuit)
   * - `0x01`: Forward
   * - `0x02`: Reverse
   * - `0x03`: Brake (motor is shorted)
   * - `0x04`: Ignore (motor mode and power is left unchanged
   *
   * @param {Object} opts object with mode/power values (e.g. lmode, lpower)
   * @param {Function} callback function to be triggered after writing
   * @example
   * var opts = {
   *   lmode: 0x01,
   *   lpower: 180,
   *   rmode: 0x02,
   *   rpower: 180
   * }
   *
   * orb.setRawMotors(opts, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @publish
   */
  "setRawMotors",
  /**
   * The Set RGB LED command sets the colors of Sphero's RGB LED.
   *
   * An object containaing `red`, `green`, and `blue` values must be provided.
   *
   * If `opts.flag` is set to 1 (default), the color is persisted across power
   * cycles.
   *
   * @param {Object} opts object containing RGB values for Sphero's LED
   * @param {Function} callback function to be triggered after writing
   * @example
   * orb.setRgbLed({ red: 0, green: 0, blue: 255 }, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @publish
   */
  "setRgbLed",
  /**
   * The Set Rotation Rate command allows control of the rotation rate Sphero
   * uses to meet new heading commands.
   *
   * A lower value offers better control, but with a larger turning radius.
   *
   * Higher values yield quick turns, but Sphero may lose control.
   *
   * The provided value is in units of 0.784 degrees/sec.
   *
   * @param {Number} rotation new rotation rate (0-255)
   * @param {Function} callback function to be triggered after writing
   * @example
   * orb.setRotationRate(180, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @publish
   */
  "setRotationRate",
  /**
   * The Set SSB command sets Sphero's Soul Block.
   *
   * The actual payload length is 0x404 bytes, but if you use the special DLEN
   * encoding of 0xff, Sphero will know what to expect.
   *
   * You need to supply the password in order for it to work.
   *
   * @private
   * @param {Number} pwd a 32 bit (4 bytes) hexadecimal value
   * @param {Array} block array of bytes with the data to be written
   * @param {Function} callback a function to be triggered after writing
   * @example
   * orb.setSsb(pwd, block, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @private
   */
  "setSsb",
  /**
   * The Set SSB Modifier Block command allows the SSB to be patched with a new
   * modifier block - including the Boost macro.
   *
   * The changes take effect immediately.
   *
   * @param {Number} pwd a 32 bit (4 bytes) hexadecimal value
   * @param {Array} block array of bytes with the data to be written
   * @param {Function} callback a function to be triggered after writing
   * @example
   * orb.setSsbModBlock(0x0000000F, data, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @private
   */
  "setSsbModBlock",
  /**
   * The Set Stabilization command turns Sphero's internal stabilization on or
   * off, depending on the flag provided.
   *
   * @param {Number} flag stabilization setting flag (0 - off, 1 - on)
   * @param {Function} callback function to be triggered after writing
   * @example
   * orb.setStabilization(1, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @publish
   */
  "setStabilization",
  /**
   * The Set Temporary Option Flags command assigns Sphero's temporary option
   * flags to the provided values. These do not persist across power cycles.
   *
   * See below for the bit definitions.
   *
   * @param {Array} flags permanent option flags
   * @param {Function} callback function to be triggered when done writing
   * @example
   * // enable stop on disconnect behaviour
   * orb.setTempOptionFlags(0x01, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @publish
   */
  "setTempOptionFlags",
  /**
   * The Set Voltage Trip Points command assigns the voltage trip points for Low
   * and Critical battery voltages.
   *
   * Values are specified in 100ths of a volt, and there are limitations on
   * adjusting these from their defaults:
   *
   * - vLow must be in the range 675-725
   * - vCrit must be in the range 625-675
   *
   * There must be 0.25v of separation between the values.
   *
   * Shifting these values too low can result in very little warning before
   * Sphero forces itself to sleep, depending on the battery pack. Be careful.
   *
   * @param {Number} vLow new voltage trigger for Low battery
   * @param {Number} vCrit new voltage trigger for Crit battery
   * @param {Function} callback function to be triggered when done writing
   * @example
   * orb.setVoltageTripPoints(675, 650, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @publish
   */
  "setVoltageTripPoints",
  /**
   * The Sleep command puts Sphero to sleep immediately.
   *
   * @param {Number} wakeup the number of seconds for Sphero to re-awaken after.
   * 0x00 tells Sphero to sleep forever, 0xFFFF attemps to put Sphero into deep
   * sleep.
   * @param {Number} macro if non-zero, Sphero will attempt to run this macro ID
   * when it wakes up
   * @param {Number} orbBasic if non-zero, Sphero will attempt to run an
   * orbBasic program from this line number
   * @param {Function} callback function to be triggered when done writing
   * @example
   * orb.sleep(10, 0, 0, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @publish
   */
  "sleep",
  /**
   * The Start Calibration command sets up Sphero for manual heading
   * calibration.
   *
   * It does this by turning on the tail light (so you can tell where it's
   * facing) and disabling stabilization (so you can adjust the heading).
   *
   * When done, call #finishCalibration to set the new heading, and re-enable
   * stabilization.
   *
   * @param {Function} callback (err, data) to be triggered with response
   * @example
   * orb.startCalibration();
   * @return {void}
   * @publish
   */
  "startCalibration",
  /**
   * Stops sphero the optimal way by setting flag 'go' to 0
   * and speed to a very low value.
   *
   * @param {Function} callback triggered on complete
   * @example
   * sphero.stop(function(err, data) {
   *   console.log(err || "data" + data);
   * });
   * @return {void}
   * @publish
   */
  "stop",
  /**
   * The Stop On Disconnect command sends a flag to Sphero. This flag tells
   * Sphero whether or not it should automatically stop when it detects
   * that it's disconnected.
   *
   * @param {Boolean} [remove=false] whether or not to stop on disconnect
   * @param {Function} callback triggered on complete
   * @example
   * orb.stopOnDisconnect(function(err, data) {
   *   console.log(err || "data" + data);
   * });
   * @return {void}
   * @publish
   */
  "stopOnDisconnect",
  /**
   * Starts streaming of accelOne data
   *
   * It uses sphero's data streaming command. User needs to listen
   * for the `dataStreaming` or `accelOne` event to get the data.
   *
   * @param {Number} [sps=5] samples per second
   * @param {Boolean} [remove=false] forces velocity streaming to stop
   * @example
   * orb.streamAccelOne();
   *
   * orb.on("accelOne", function(data) {
   *   console.log("data:");
   *   console.log("  accelOne:", data.accelOne);
   * });
   * @return {void}
   * @publish
   */
  "streamAccelOne",
  /**
   * Starts streaming of accelerometer data
   *
   * It uses sphero's data streaming command. User needs to listen
   * for the `dataStreaming` or `accelerometer` event to get the data.
   *
   * @param {Number} [sps=5] samples per second
   * @param {Boolean} [remove=false] forces velocity streaming to stop
   * @example
   * orb.streamAccelerometer();
   *
   * orb.on("accelerometer", function(data) {
   *   console.log("data:");
   *   console.log("  xAccel:", data.xAccel);
   *   console.log("  yAccel:", data.yAccel);
   *   console.log("  zAccel:", data.zAccel);
   * });
   * @return {void}
   * @publish
   */
  "streamAccelerometer",
  /**
   * Generic Data Streaming setup, using Sphero's setDataStraming command.
   *
   * Users need to listen for the `dataStreaming` event, or a custom event, to
   * get the data.
   *
   * @private
   * @param {Object} args event, masks, fields, and sps data
   * @return {void}
   * @publish
   */
  "streamData",
  /**
   * Starts streaming of gyroscope data
   *
   * It uses sphero's data streaming command. User needs to listen
   * for the `dataStreaming` or `gyroscope` event to get the data.
   *
   * @param {Number} [sps=5] samples per second
   * @param {Boolean} [remove=false] forces velocity streaming to stop
   * @example
   * orb.streamGyroscope();
   *
   * orb.on("gyroscope", function(data) {
   *   console.log("data:");
   *   console.log("  xGyro:", data.xGyro);
   *   console.log("  yGyro:", data.yGyro);
   *   console.log("  zGyro:", data.zGyro);
   * });
   * @return {void}
   * @publish
   */
  "streamGyroscope",
  /**
   * Starts streaming of IMU angles data
   *
   * It uses sphero's data streaming command. User needs to listen
   * for the `dataStreaming` or `imuAngles` event to get the data.
   *
   * @param {Number} [sps=5] samples per second
   * @param {Boolean} [remove=false] forces velocity streaming to stop
   * @example
   * orb.streamImuAngles();
   *
   * orb.on("imuAngles", function(data) {
   *   console.log("data:");
   *   console.log("  pitchAngle:", data.pitchAngle);
   *   console.log("  rollAngle:", data.rollAngle);
   *   console.log("  yawAngle:", data.yawAngle);
   * });
   * @return {void}
   * @publish
   */
  "streamImuAngles",
  /**
   * Starts streaming of motor back EMF data
   *
   * It uses sphero's data streaming command. User needs to listen
   * for the `dataStreaming` or `motorsBackEmf` event to get the data.
   *
   * @param {Number} [sps=5] samples per second
   * @param {Boolean} [remove=false] forces velocity streaming to stop
   * @example
   * orb.streamMotorsBackEmf();
   *
   * orb.on("motorsBackEmf", function(data) {
   *   console.log("data:");
   *   console.log("  rMotorBackEmf:", data.rMotorBackEmf);
   *   console.log("  lMotorBackEmf:", data.lMotorBackEmf);
   * });
   * @return {void}
   * @publish
   */
  "streamMotorsBackEmf",
  /**
   * Starts streaming of odometer data
   *
   * It uses sphero's data streaming command. User needs to listen
   * for the `dataStreaming` or `odometer` event to get the data.
   *
   * @param {Number} [sps=5] samples per second
   * @param {Boolean} [remove=false] forces velocity streaming to stop
   * @example
   * orb.streamOdometer();
   *
   * orb.on("odometer", function(data) {
   *   console.log("data:");
   *   console.log("  xOdomoter:", data.xOdomoter);
   *   console.log("  yOdomoter:", data.yOdomoter);
   * });
   * @return {void}
   * @publish
   */
  "streamOdometer",
  /**
   * Starts streaming of velocity data
   *
   * It uses sphero's data streaming command. User needs to listen
   * for the `dataStreaming` or `velocity` event to get the velocity values.
   *
   * @param {Number} [sps=5] samples per second
   * @param {Boolean} [remove=false] forces velocity streaming to stop
   * @example
   * orb.streamVelocity();
   *
   * orb.on("velocity", function(data) {
   *   console.log("data:");
   *   console.log("  xVelocity:", data.xVelocity);
   *   console.log("  yVelocity:", data.yVelocity);
   * });
   * @return {void}
   * @publish
   */
  "streamVelocity",
  /**
   * The Submit value To Input command takes the place of the typical user
   * console in orbBasic and allows a user to answer an input request.
   *
   * If there is no pending input request when this API command is sent, the
   * supplied value is ignored without error.
   *
   * Refer to the orbBasic language document for further information.
   *
   * @param {Number} val value to respond with
   * @param {Function} callback function to be triggered with response
   * @example
   * orb.submitValuetoInput(0x0000FFFF, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @publish
   */
  "submitValueToInput",
  /**
   * The Use Consumable command attempts to use a consumable if the quantity
   * remaining is non-zero.
   *
   * On success, the return message echoes the ID of this consumable and how
   * many of them remain.
   *
   * If the associated macro is already running, or the quantity remaining is
   * zero, this returns an EEXEC error (0x08).
   *
   * @private
   * @param {Number} id what consumable to use
   * @param {Function} callback function to be called with response
   * @example
   * orb.useConsumable(0x00, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   * @private
   */
  "useConsumable",
  /**
   * The Version command returns a batch of software and hardware information
   * about Sphero.
   *
   * @param {Function} callback triggered with version information
   * @example
   * orb.version(function(err, data) {
   *   if (err) {
   *     console.log("error: ", err);
   *   } else {
   *     console.log("data:");
   *     console.log("  recv:", data.recv);
   *     console.log("  mdl:", data.mdl);
   *     console.log("  hw:", data.hw);
   *     console.log("  msaVer:", data.msaVer);
   *     console.log("  msaRev:", data.msaRev);
   *     console.log("  bl:", data.bl);
   *     console.log("  bas:", data.bas);
   *     console.log("  macro:", data.macro);
   *     console.log("  apiMaj:", data.apiMaj);
   *     console.log("  apiMin:", data.apiMin);
   *   }
   * }
   * @return {void}
   * @publish
   */
  "version"
  ];

},{}],35:[function(require,module,exports){
/*
  * cylon sphero driver
  * http://cylonjs.com
  *
  * Copyright (c) 2013-2014 The Hybrid Group
  * Licensed under the Apache 2.0 license.
*/

"use strict";

var Cylon = require("cylon");

var Commands = require("./commands");
var Events = require("./events");

var Driver = module.exports = function Driver() {
  Driver.__super__.constructor.apply(this, arguments);
  this.setupCommands(Commands);
  this.events = Events;
};

Cylon.Utils.subclass(Driver, Cylon.Driver);

Driver.prototype.commands = Commands;
/**
 * Starts the driver.
 *
 * @param {Function} callback to be triggered when started
 * @return {void}
 */
Driver.prototype.start = function(callback) {
  var events = this.events;

  events.forEach(function(e) {
    this.defineDriverEvent(e);
  }.bind(this));

  this.connection.setTempOptionFlags(0x01);

  callback();
};

/**
 * Stops the driver.
 *
 * @param {Function} callback to be triggered when halted
 * @return {void}
 */
Driver.prototype.halt = function(callback) {
  this.connection.disconnect(function() {
    callback();
  });
};

},{"./commands":34,"./events":36,"cylon":40}],36:[function(require,module,exports){
/*
 * cylon sphero commands
 * http://cylonjs.com
 *
 * Copyright (c) 2013 The Hybrid Group
 * Licensed under the Apache 2.0 license.
 */

"use strict";

module.exports = [
  /**
   * Emitted when the connection to the Sphero is closed
   *
   * @event disconnect
   */
  "connect",

  /**
   * Emitted when the connection to the Sphero is closed
   *
   * @event disconnect
   */
  "disconnect",

  /**
   * Emitted when Sphero encounters an error
   *
   * @event error
   */
  "error",

  /**
   * Emitted when Sphero sends a message through the serial port
   *
   * @event message
   */
  "response",

  /**
   * Emitted when Sphero sends a notification through the serial port
   *
   * @event notification
   * @value packet
   */
  "async",

  /**
   * Emitted when Sphero sends a notification through the serial port that
   * contains data
   *
   * @event data
   * @value data
   */
  "data",

  /**
   * Emitted when Sphero detects a collision
   *
   * @event collision
   */
  "collision",
  /**
   * Emitted when Sphero receives a version response
   *
   * @event collision
   */
  "version",
  /**
   * Emitted when Sphero receives getBluetoothInfo response
   *
   * @event collision
   */
  "bluetoothInfo",
  /**
   * Emitted when Sphero receives autoRecoonect response
   *
   * @event collision
   */
  "autoReconnectInfo",
  /**
   * Emitted when Sphero receives power state response
   *
   * @event collision
   */
  "powerStateInfo",
  /**
   * Emitted when Sphero receives voltage trip points response
   *
   * @event collision
   */
  "voltageTripPoints",
  /**
   * Emitted when Sphero receives level2diags response
   *
   * @event collision
   */
  "level2Diagnostics",
  /**
   * Emitted when Sphero receives packetTimes
   *
   * @event collision
   */
  "packetTimes",
  /**
   * Emitted when Sphero receives chassisId response
   *
   * @event collision
   */
  "chassisId",
  /**
   * Emitted when Sphero receives read locator response
   *
   * @event collision
   */
  "readLocator",
  /**
   * Emitted when Sphero receives read rgb color response
   *
   * @event collision
   */
  "rgbLedColor",
  /**
   * Emitted when Sphero receives perm option flags response
   *
   * @event collision
   */
  "permanentOptionFlags",
  /**
   * Emitted when Sphero receives temp option flags response
   *
   * @event collision
   */
  "temporalOptionFlags",
  /**
   * Emitted when Sphero receives device mode response
   *
   * @event collision
   */
  "deviceMode",
  /**
   * Emitted when Sphero receives abort macro response
   *
   * @event collision
   */
  "abortMacro",
  /**
   * Emitted when Sphero receives macro status response
   *
   * @event collision
   */
  "macroStatus",
  /**
   * Emitted when Sphero receives battery status response
   *
   * @event collision
   */
  "battery",
  /**
   * Emitted when Sphero receives level 1 diasgs async msg
   *
   * @event collision
   */
  "level1Diagnostic",
  /**
   * Emitted when Sphero receives data streaming async msg
   *
   * @event collision
   */
  "dataStreaming",
  /**
   * Emitted when Sphero receives config block async msg
   *
   * @event collision
   */
  "configBlock",
  /**
   * Emitted when Sphero receives pre sleep warning async msg
   *
   * @event collision
   */
  "preSleepWarning",
  /**
   * Emitted when Sphero receives macro markers async msg
   *
   * @event collision
   */
  "macroMarkers",
  /**
   * Emitted when Sphero receives orb basic print msg
   *
   * @event collision
   */
  "obPrint",
  /**
   * Emitted when Sphero receives orb basic ascii error msg
   *
   * @event collision
   */
  "obAsciiError",
  /**
   * Emitted when Sphero receives orb basic error msg
   *
   * @event collision
   */
  "obBinaryError",
  /**
   * Emitted when Sphero receives self level async msg
   *
   * @event collision
   */
  "selfLevel",
  /**
   * Emitted when Sphero receives gyro axis exceeded async msg
   *
   * @event collision
   */
  "gyroAxisExceeded"
];

},{}],37:[function(require,module,exports){
(function (process,__filename){

/**
 * Module dependencies.
 */

var fs = require('fs')
  , path = require('path')
  , join = path.join
  , dirname = path.dirname
  , exists = fs.existsSync || path.existsSync
  , defaults = {
        arrow: process.env.NODE_BINDINGS_ARROW || ' → '
      , compiled: process.env.NODE_BINDINGS_COMPILED_DIR || 'compiled'
      , platform: process.platform
      , arch: process.arch
      , version: process.versions.node
      , bindings: 'bindings.node'
      , try: [
          // node-gyp's linked version in the "build" dir
          [ 'module_root', 'build', 'bindings' ]
          // node-waf and gyp_addon (a.k.a node-gyp)
        , [ 'module_root', 'build', 'Debug', 'bindings' ]
        , [ 'module_root', 'build', 'Release', 'bindings' ]
          // Debug files, for development (legacy behavior, remove for node v0.9)
        , [ 'module_root', 'out', 'Debug', 'bindings' ]
        , [ 'module_root', 'Debug', 'bindings' ]
          // Release files, but manually compiled (legacy behavior, remove for node v0.9)
        , [ 'module_root', 'out', 'Release', 'bindings' ]
        , [ 'module_root', 'Release', 'bindings' ]
          // Legacy from node-waf, node <= 0.4.x
        , [ 'module_root', 'build', 'default', 'bindings' ]
          // Production "Release" buildtype binary (meh...)
        , [ 'module_root', 'compiled', 'version', 'platform', 'arch', 'bindings' ]
        ]
    }

/**
 * The main `bindings()` function loads the compiled bindings for a given module.
 * It uses V8's Error API to determine the parent filename that this function is
 * being invoked from, which is then used to find the root directory.
 */

function bindings (opts) {

  // Argument surgery
  if (typeof opts == 'string') {
    opts = { bindings: opts }
  } else if (!opts) {
    opts = {}
  }
  opts.__proto__ = defaults

  // Get the module root
  if (!opts.module_root) {
    opts.module_root = exports.getRoot(exports.getFileName())
  }

  // Ensure the given bindings name ends with .node
  if (path.extname(opts.bindings) != '.node') {
    opts.bindings += '.node'
  }

  var tries = []
    , i = 0
    , l = opts.try.length
    , n
    , b
    , err

  for (; i<l; i++) {
    n = join.apply(null, opts.try[i].map(function (p) {
      return opts[p] || p
    }))
    tries.push(n)
    try {
      b = opts.path ? require.resolve(n) : require(n)
      if (!opts.path) {
        b.path = n
      }
      return b
    } catch (e) {
      if (!/not find/i.test(e.message)) {
        throw e
      }
    }
  }

  err = new Error('Could not locate the bindings file. Tried:\n'
    + tries.map(function (a) { return opts.arrow + a }).join('\n'))
  err.tries = tries
  throw err
}
module.exports = exports = bindings


/**
 * Gets the filename of the JavaScript file that invokes this function.
 * Used to help find the root directory of a module.
 * Optionally accepts an filename argument to skip when searching for the invoking filename
 */

exports.getFileName = function getFileName (calling_file) {
  var origPST = Error.prepareStackTrace
    , origSTL = Error.stackTraceLimit
    , dummy = {}
    , fileName

  Error.stackTraceLimit = 10

  Error.prepareStackTrace = function (e, st) {
    for (var i=0, l=st.length; i<l; i++) {
      fileName = st[i].getFileName()
      if (fileName !== __filename) {
        if (calling_file) {
            if (fileName !== calling_file) {
              return
            }
        } else {
          return
        }
      }
    }
  }

  // run the 'prepareStackTrace' function above
  Error.captureStackTrace(dummy)
  dummy.stack

  // cleanup
  Error.prepareStackTrace = origPST
  Error.stackTraceLimit = origSTL

  return fileName
}

/**
 * Gets the root directory of a module, given an arbitrary filename
 * somewhere in the module tree. The "root directory" is the directory
 * containing the `package.json` file.
 *
 *   In:  /home/nate/node-native-module/lib/index.js
 *   Out: /home/nate/node-native-module
 */

exports.getRoot = function getRoot (file) {
  var dir = dirname(file)
    , prev
  while (true) {
    if (dir === '.') {
      // Avoids an infinite loop in rare cases, like the REPL
      dir = process.cwd()
    }
    if (exists(join(dir, 'package.json')) || exists(join(dir, 'node_modules'))) {
      // Found the 'package.json' file or 'node_modules' dir; we're done
      return dir
    }
    if (prev === dir) {
      // Got to the top
      throw new Error('Could not find module root given file: "' + file
                    + '". Do you have a `package.json` file? ')
    }
    // Try the parent dir next
    prev = dir
    dir = join(dir, '..')
  }
}

}).call(this,require('_process'),"/..\\..\\..\\..\\..\\AppData\\Roaming\\npm\\node_modules\\cylon-sphero\\node_modules\\bindings\\bindings.js")
},{"_process":14,"fs":1,"path":12}],38:[function(require,module,exports){
(function (process,global){
/* @preserve
 * The MIT License (MIT)
 * 
 * Copyright (c) 2013-2017 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
/**
 * bluebird build version 3.5.0
 * Features enabled: core, race, call_get, generators, map, nodeify, promisify, props, reduce, settle, some, using, timers, filter, any, each
*/
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Promise=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof _dereq_=="function"&&_dereq_;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof _dereq_=="function"&&_dereq_;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise) {
var SomePromiseArray = Promise._SomePromiseArray;
function any(promises) {
    var ret = new SomePromiseArray(promises);
    var promise = ret.promise();
    ret.setHowMany(1);
    ret.setUnwrap();
    ret.init();
    return promise;
}

Promise.any = function (promises) {
    return any(promises);
};

Promise.prototype.any = function () {
    return any(this);
};

};

},{}],2:[function(_dereq_,module,exports){
"use strict";
var firstLineError;
try {throw new Error(); } catch (e) {firstLineError = e;}
var schedule = _dereq_("./schedule");
var Queue = _dereq_("./queue");
var util = _dereq_("./util");

function Async() {
    this._customScheduler = false;
    this._isTickUsed = false;
    this._lateQueue = new Queue(16);
    this._normalQueue = new Queue(16);
    this._haveDrainedQueues = false;
    this._trampolineEnabled = true;
    var self = this;
    this.drainQueues = function () {
        self._drainQueues();
    };
    this._schedule = schedule;
}

Async.prototype.setScheduler = function(fn) {
    var prev = this._schedule;
    this._schedule = fn;
    this._customScheduler = true;
    return prev;
};

Async.prototype.hasCustomScheduler = function() {
    return this._customScheduler;
};

Async.prototype.enableTrampoline = function() {
    this._trampolineEnabled = true;
};

Async.prototype.disableTrampolineIfNecessary = function() {
    if (util.hasDevTools) {
        this._trampolineEnabled = false;
    }
};

Async.prototype.haveItemsQueued = function () {
    return this._isTickUsed || this._haveDrainedQueues;
};


Async.prototype.fatalError = function(e, isNode) {
    if (isNode) {
        process.stderr.write("Fatal " + (e instanceof Error ? e.stack : e) +
            "\n");
        process.exit(2);
    } else {
        this.throwLater(e);
    }
};

Async.prototype.throwLater = function(fn, arg) {
    if (arguments.length === 1) {
        arg = fn;
        fn = function () { throw arg; };
    }
    if (typeof setTimeout !== "undefined") {
        setTimeout(function() {
            fn(arg);
        }, 0);
    } else try {
        this._schedule(function() {
            fn(arg);
        });
    } catch (e) {
        throw new Error("No async scheduler available\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
    }
};

function AsyncInvokeLater(fn, receiver, arg) {
    this._lateQueue.push(fn, receiver, arg);
    this._queueTick();
}

function AsyncInvoke(fn, receiver, arg) {
    this._normalQueue.push(fn, receiver, arg);
    this._queueTick();
}

function AsyncSettlePromises(promise) {
    this._normalQueue._pushOne(promise);
    this._queueTick();
}

if (!util.hasDevTools) {
    Async.prototype.invokeLater = AsyncInvokeLater;
    Async.prototype.invoke = AsyncInvoke;
    Async.prototype.settlePromises = AsyncSettlePromises;
} else {
    Async.prototype.invokeLater = function (fn, receiver, arg) {
        if (this._trampolineEnabled) {
            AsyncInvokeLater.call(this, fn, receiver, arg);
        } else {
            this._schedule(function() {
                setTimeout(function() {
                    fn.call(receiver, arg);
                }, 100);
            });
        }
    };

    Async.prototype.invoke = function (fn, receiver, arg) {
        if (this._trampolineEnabled) {
            AsyncInvoke.call(this, fn, receiver, arg);
        } else {
            this._schedule(function() {
                fn.call(receiver, arg);
            });
        }
    };

    Async.prototype.settlePromises = function(promise) {
        if (this._trampolineEnabled) {
            AsyncSettlePromises.call(this, promise);
        } else {
            this._schedule(function() {
                promise._settlePromises();
            });
        }
    };
}

Async.prototype._drainQueue = function(queue) {
    while (queue.length() > 0) {
        var fn = queue.shift();
        if (typeof fn !== "function") {
            fn._settlePromises();
            continue;
        }
        var receiver = queue.shift();
        var arg = queue.shift();
        fn.call(receiver, arg);
    }
};

Async.prototype._drainQueues = function () {
    this._drainQueue(this._normalQueue);
    this._reset();
    this._haveDrainedQueues = true;
    this._drainQueue(this._lateQueue);
};

Async.prototype._queueTick = function () {
    if (!this._isTickUsed) {
        this._isTickUsed = true;
        this._schedule(this.drainQueues);
    }
};

Async.prototype._reset = function () {
    this._isTickUsed = false;
};

module.exports = Async;
module.exports.firstLineError = firstLineError;

},{"./queue":26,"./schedule":29,"./util":36}],3:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise, INTERNAL, tryConvertToPromise, debug) {
var calledBind = false;
var rejectThis = function(_, e) {
    this._reject(e);
};

var targetRejected = function(e, context) {
    context.promiseRejectionQueued = true;
    context.bindingPromise._then(rejectThis, rejectThis, null, this, e);
};

var bindingResolved = function(thisArg, context) {
    if (((this._bitField & 50397184) === 0)) {
        this._resolveCallback(context.target);
    }
};

var bindingRejected = function(e, context) {
    if (!context.promiseRejectionQueued) this._reject(e);
};

Promise.prototype.bind = function (thisArg) {
    if (!calledBind) {
        calledBind = true;
        Promise.prototype._propagateFrom = debug.propagateFromFunction();
        Promise.prototype._boundValue = debug.boundValueFunction();
    }
    var maybePromise = tryConvertToPromise(thisArg);
    var ret = new Promise(INTERNAL);
    ret._propagateFrom(this, 1);
    var target = this._target();
    ret._setBoundTo(maybePromise);
    if (maybePromise instanceof Promise) {
        var context = {
            promiseRejectionQueued: false,
            promise: ret,
            target: target,
            bindingPromise: maybePromise
        };
        target._then(INTERNAL, targetRejected, undefined, ret, context);
        maybePromise._then(
            bindingResolved, bindingRejected, undefined, ret, context);
        ret._setOnCancel(maybePromise);
    } else {
        ret._resolveCallback(target);
    }
    return ret;
};

Promise.prototype._setBoundTo = function (obj) {
    if (obj !== undefined) {
        this._bitField = this._bitField | 2097152;
        this._boundTo = obj;
    } else {
        this._bitField = this._bitField & (~2097152);
    }
};

Promise.prototype._isBound = function () {
    return (this._bitField & 2097152) === 2097152;
};

Promise.bind = function (thisArg, value) {
    return Promise.resolve(value).bind(thisArg);
};
};

},{}],4:[function(_dereq_,module,exports){
"use strict";
var old;
if (typeof Promise !== "undefined") old = Promise;
function noConflict() {
    try { if (Promise === bluebird) Promise = old; }
    catch (e) {}
    return bluebird;
}
var bluebird = _dereq_("./promise")();
bluebird.noConflict = noConflict;
module.exports = bluebird;

},{"./promise":22}],5:[function(_dereq_,module,exports){
"use strict";
var cr = Object.create;
if (cr) {
    var callerCache = cr(null);
    var getterCache = cr(null);
    callerCache[" size"] = getterCache[" size"] = 0;
}

module.exports = function(Promise) {
var util = _dereq_("./util");
var canEvaluate = util.canEvaluate;
var isIdentifier = util.isIdentifier;

var getMethodCaller;
var getGetter;
if (!true) {
var makeMethodCaller = function (methodName) {
    return new Function("ensureMethod", "                                    \n\
        return function(obj) {                                               \n\
            'use strict'                                                     \n\
            var len = this.length;                                           \n\
            ensureMethod(obj, 'methodName');                                 \n\
            switch(len) {                                                    \n\
                case 1: return obj.methodName(this[0]);                      \n\
                case 2: return obj.methodName(this[0], this[1]);             \n\
                case 3: return obj.methodName(this[0], this[1], this[2]);    \n\
                case 0: return obj.methodName();                             \n\
                default:                                                     \n\
                    return obj.methodName.apply(obj, this);                  \n\
            }                                                                \n\
        };                                                                   \n\
        ".replace(/methodName/g, methodName))(ensureMethod);
};

var makeGetter = function (propertyName) {
    return new Function("obj", "                                             \n\
        'use strict';                                                        \n\
        return obj.propertyName;                                             \n\
        ".replace("propertyName", propertyName));
};

var getCompiled = function(name, compiler, cache) {
    var ret = cache[name];
    if (typeof ret !== "function") {
        if (!isIdentifier(name)) {
            return null;
        }
        ret = compiler(name);
        cache[name] = ret;
        cache[" size"]++;
        if (cache[" size"] > 512) {
            var keys = Object.keys(cache);
            for (var i = 0; i < 256; ++i) delete cache[keys[i]];
            cache[" size"] = keys.length - 256;
        }
    }
    return ret;
};

getMethodCaller = function(name) {
    return getCompiled(name, makeMethodCaller, callerCache);
};

getGetter = function(name) {
    return getCompiled(name, makeGetter, getterCache);
};
}

function ensureMethod(obj, methodName) {
    var fn;
    if (obj != null) fn = obj[methodName];
    if (typeof fn !== "function") {
        var message = "Object " + util.classString(obj) + " has no method '" +
            util.toString(methodName) + "'";
        throw new Promise.TypeError(message);
    }
    return fn;
}

function caller(obj) {
    var methodName = this.pop();
    var fn = ensureMethod(obj, methodName);
    return fn.apply(obj, this);
}
Promise.prototype.call = function (methodName) {
    var args = [].slice.call(arguments, 1);;
    if (!true) {
        if (canEvaluate) {
            var maybeCaller = getMethodCaller(methodName);
            if (maybeCaller !== null) {
                return this._then(
                    maybeCaller, undefined, undefined, args, undefined);
            }
        }
    }
    args.push(methodName);
    return this._then(caller, undefined, undefined, args, undefined);
};

function namedGetter(obj) {
    return obj[this];
}
function indexedGetter(obj) {
    var index = +this;
    if (index < 0) index = Math.max(0, index + obj.length);
    return obj[index];
}
Promise.prototype.get = function (propertyName) {
    var isIndex = (typeof propertyName === "number");
    var getter;
    if (!isIndex) {
        if (canEvaluate) {
            var maybeGetter = getGetter(propertyName);
            getter = maybeGetter !== null ? maybeGetter : namedGetter;
        } else {
            getter = namedGetter;
        }
    } else {
        getter = indexedGetter;
    }
    return this._then(getter, undefined, undefined, propertyName, undefined);
};
};

},{"./util":36}],6:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise, PromiseArray, apiRejection, debug) {
var util = _dereq_("./util");
var tryCatch = util.tryCatch;
var errorObj = util.errorObj;
var async = Promise._async;

Promise.prototype["break"] = Promise.prototype.cancel = function() {
    if (!debug.cancellation()) return this._warn("cancellation is disabled");

    var promise = this;
    var child = promise;
    while (promise._isCancellable()) {
        if (!promise._cancelBy(child)) {
            if (child._isFollowing()) {
                child._followee().cancel();
            } else {
                child._cancelBranched();
            }
            break;
        }

        var parent = promise._cancellationParent;
        if (parent == null || !parent._isCancellable()) {
            if (promise._isFollowing()) {
                promise._followee().cancel();
            } else {
                promise._cancelBranched();
            }
            break;
        } else {
            if (promise._isFollowing()) promise._followee().cancel();
            promise._setWillBeCancelled();
            child = promise;
            promise = parent;
        }
    }
};

Promise.prototype._branchHasCancelled = function() {
    this._branchesRemainingToCancel--;
};

Promise.prototype._enoughBranchesHaveCancelled = function() {
    return this._branchesRemainingToCancel === undefined ||
           this._branchesRemainingToCancel <= 0;
};

Promise.prototype._cancelBy = function(canceller) {
    if (canceller === this) {
        this._branchesRemainingToCancel = 0;
        this._invokeOnCancel();
        return true;
    } else {
        this._branchHasCancelled();
        if (this._enoughBranchesHaveCancelled()) {
            this._invokeOnCancel();
            return true;
        }
    }
    return false;
};

Promise.prototype._cancelBranched = function() {
    if (this._enoughBranchesHaveCancelled()) {
        this._cancel();
    }
};

Promise.prototype._cancel = function() {
    if (!this._isCancellable()) return;
    this._setCancelled();
    async.invoke(this._cancelPromises, this, undefined);
};

Promise.prototype._cancelPromises = function() {
    if (this._length() > 0) this._settlePromises();
};

Promise.prototype._unsetOnCancel = function() {
    this._onCancelField = undefined;
};

Promise.prototype._isCancellable = function() {
    return this.isPending() && !this._isCancelled();
};

Promise.prototype.isCancellable = function() {
    return this.isPending() && !this.isCancelled();
};

Promise.prototype._doInvokeOnCancel = function(onCancelCallback, internalOnly) {
    if (util.isArray(onCancelCallback)) {
        for (var i = 0; i < onCancelCallback.length; ++i) {
            this._doInvokeOnCancel(onCancelCallback[i], internalOnly);
        }
    } else if (onCancelCallback !== undefined) {
        if (typeof onCancelCallback === "function") {
            if (!internalOnly) {
                var e = tryCatch(onCancelCallback).call(this._boundValue());
                if (e === errorObj) {
                    this._attachExtraTrace(e.e);
                    async.throwLater(e.e);
                }
            }
        } else {
            onCancelCallback._resultCancelled(this);
        }
    }
};

Promise.prototype._invokeOnCancel = function() {
    var onCancelCallback = this._onCancel();
    this._unsetOnCancel();
    async.invoke(this._doInvokeOnCancel, this, onCancelCallback);
};

Promise.prototype._invokeInternalOnCancel = function() {
    if (this._isCancellable()) {
        this._doInvokeOnCancel(this._onCancel(), true);
        this._unsetOnCancel();
    }
};

Promise.prototype._resultCancelled = function() {
    this.cancel();
};

};

},{"./util":36}],7:[function(_dereq_,module,exports){
"use strict";
module.exports = function(NEXT_FILTER) {
var util = _dereq_("./util");
var getKeys = _dereq_("./es5").keys;
var tryCatch = util.tryCatch;
var errorObj = util.errorObj;

function catchFilter(instances, cb, promise) {
    return function(e) {
        var boundTo = promise._boundValue();
        predicateLoop: for (var i = 0; i < instances.length; ++i) {
            var item = instances[i];

            if (item === Error ||
                (item != null && item.prototype instanceof Error)) {
                if (e instanceof item) {
                    return tryCatch(cb).call(boundTo, e);
                }
            } else if (typeof item === "function") {
                var matchesPredicate = tryCatch(item).call(boundTo, e);
                if (matchesPredicate === errorObj) {
                    return matchesPredicate;
                } else if (matchesPredicate) {
                    return tryCatch(cb).call(boundTo, e);
                }
            } else if (util.isObject(e)) {
                var keys = getKeys(item);
                for (var j = 0; j < keys.length; ++j) {
                    var key = keys[j];
                    if (item[key] != e[key]) {
                        continue predicateLoop;
                    }
                }
                return tryCatch(cb).call(boundTo, e);
            }
        }
        return NEXT_FILTER;
    };
}

return catchFilter;
};

},{"./es5":13,"./util":36}],8:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise) {
var longStackTraces = false;
var contextStack = [];

Promise.prototype._promiseCreated = function() {};
Promise.prototype._pushContext = function() {};
Promise.prototype._popContext = function() {return null;};
Promise._peekContext = Promise.prototype._peekContext = function() {};

function Context() {
    this._trace = new Context.CapturedTrace(peekContext());
}
Context.prototype._pushContext = function () {
    if (this._trace !== undefined) {
        this._trace._promiseCreated = null;
        contextStack.push(this._trace);
    }
};

Context.prototype._popContext = function () {
    if (this._trace !== undefined) {
        var trace = contextStack.pop();
        var ret = trace._promiseCreated;
        trace._promiseCreated = null;
        return ret;
    }
    return null;
};

function createContext() {
    if (longStackTraces) return new Context();
}

function peekContext() {
    var lastIndex = contextStack.length - 1;
    if (lastIndex >= 0) {
        return contextStack[lastIndex];
    }
    return undefined;
}
Context.CapturedTrace = null;
Context.create = createContext;
Context.deactivateLongStackTraces = function() {};
Context.activateLongStackTraces = function() {
    var Promise_pushContext = Promise.prototype._pushContext;
    var Promise_popContext = Promise.prototype._popContext;
    var Promise_PeekContext = Promise._peekContext;
    var Promise_peekContext = Promise.prototype._peekContext;
    var Promise_promiseCreated = Promise.prototype._promiseCreated;
    Context.deactivateLongStackTraces = function() {
        Promise.prototype._pushContext = Promise_pushContext;
        Promise.prototype._popContext = Promise_popContext;
        Promise._peekContext = Promise_PeekContext;
        Promise.prototype._peekContext = Promise_peekContext;
        Promise.prototype._promiseCreated = Promise_promiseCreated;
        longStackTraces = false;
    };
    longStackTraces = true;
    Promise.prototype._pushContext = Context.prototype._pushContext;
    Promise.prototype._popContext = Context.prototype._popContext;
    Promise._peekContext = Promise.prototype._peekContext = peekContext;
    Promise.prototype._promiseCreated = function() {
        var ctx = this._peekContext();
        if (ctx && ctx._promiseCreated == null) ctx._promiseCreated = this;
    };
};
return Context;
};

},{}],9:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise, Context) {
var getDomain = Promise._getDomain;
var async = Promise._async;
var Warning = _dereq_("./errors").Warning;
var util = _dereq_("./util");
var canAttachTrace = util.canAttachTrace;
var unhandledRejectionHandled;
var possiblyUnhandledRejection;
var bluebirdFramePattern =
    /[\\\/]bluebird[\\\/]js[\\\/](release|debug|instrumented)/;
var nodeFramePattern = /\((?:timers\.js):\d+:\d+\)/;
var parseLinePattern = /[\/<\(](.+?):(\d+):(\d+)\)?\s*$/;
var stackFramePattern = null;
var formatStack = null;
var indentStackFrames = false;
var printWarning;
var debugging = !!(util.env("BLUEBIRD_DEBUG") != 0 &&
                        (true ||
                         util.env("BLUEBIRD_DEBUG") ||
                         util.env("NODE_ENV") === "development"));

var warnings = !!(util.env("BLUEBIRD_WARNINGS") != 0 &&
    (debugging || util.env("BLUEBIRD_WARNINGS")));

var longStackTraces = !!(util.env("BLUEBIRD_LONG_STACK_TRACES") != 0 &&
    (debugging || util.env("BLUEBIRD_LONG_STACK_TRACES")));

var wForgottenReturn = util.env("BLUEBIRD_W_FORGOTTEN_RETURN") != 0 &&
    (warnings || !!util.env("BLUEBIRD_W_FORGOTTEN_RETURN"));

Promise.prototype.suppressUnhandledRejections = function() {
    var target = this._target();
    target._bitField = ((target._bitField & (~1048576)) |
                      524288);
};

Promise.prototype._ensurePossibleRejectionHandled = function () {
    if ((this._bitField & 524288) !== 0) return;
    this._setRejectionIsUnhandled();
    async.invokeLater(this._notifyUnhandledRejection, this, undefined);
};

Promise.prototype._notifyUnhandledRejectionIsHandled = function () {
    fireRejectionEvent("rejectionHandled",
                                  unhandledRejectionHandled, undefined, this);
};

Promise.prototype._setReturnedNonUndefined = function() {
    this._bitField = this._bitField | 268435456;
};

Promise.prototype._returnedNonUndefined = function() {
    return (this._bitField & 268435456) !== 0;
};

Promise.prototype._notifyUnhandledRejection = function () {
    if (this._isRejectionUnhandled()) {
        var reason = this._settledValue();
        this._setUnhandledRejectionIsNotified();
        fireRejectionEvent("unhandledRejection",
                                      possiblyUnhandledRejection, reason, this);
    }
};

Promise.prototype._setUnhandledRejectionIsNotified = function () {
    this._bitField = this._bitField | 262144;
};

Promise.prototype._unsetUnhandledRejectionIsNotified = function () {
    this._bitField = this._bitField & (~262144);
};

Promise.prototype._isUnhandledRejectionNotified = function () {
    return (this._bitField & 262144) > 0;
};

Promise.prototype._setRejectionIsUnhandled = function () {
    this._bitField = this._bitField | 1048576;
};

Promise.prototype._unsetRejectionIsUnhandled = function () {
    this._bitField = this._bitField & (~1048576);
    if (this._isUnhandledRejectionNotified()) {
        this._unsetUnhandledRejectionIsNotified();
        this._notifyUnhandledRejectionIsHandled();
    }
};

Promise.prototype._isRejectionUnhandled = function () {
    return (this._bitField & 1048576) > 0;
};

Promise.prototype._warn = function(message, shouldUseOwnTrace, promise) {
    return warn(message, shouldUseOwnTrace, promise || this);
};

Promise.onPossiblyUnhandledRejection = function (fn) {
    var domain = getDomain();
    possiblyUnhandledRejection =
        typeof fn === "function" ? (domain === null ?
                                            fn : util.domainBind(domain, fn))
                                 : undefined;
};

Promise.onUnhandledRejectionHandled = function (fn) {
    var domain = getDomain();
    unhandledRejectionHandled =
        typeof fn === "function" ? (domain === null ?
                                            fn : util.domainBind(domain, fn))
                                 : undefined;
};

var disableLongStackTraces = function() {};
Promise.longStackTraces = function () {
    if (async.haveItemsQueued() && !config.longStackTraces) {
        throw new Error("cannot enable long stack traces after promises have been created\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
    }
    if (!config.longStackTraces && longStackTracesIsSupported()) {
        var Promise_captureStackTrace = Promise.prototype._captureStackTrace;
        var Promise_attachExtraTrace = Promise.prototype._attachExtraTrace;
        config.longStackTraces = true;
        disableLongStackTraces = function() {
            if (async.haveItemsQueued() && !config.longStackTraces) {
                throw new Error("cannot enable long stack traces after promises have been created\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
            }
            Promise.prototype._captureStackTrace = Promise_captureStackTrace;
            Promise.prototype._attachExtraTrace = Promise_attachExtraTrace;
            Context.deactivateLongStackTraces();
            async.enableTrampoline();
            config.longStackTraces = false;
        };
        Promise.prototype._captureStackTrace = longStackTracesCaptureStackTrace;
        Promise.prototype._attachExtraTrace = longStackTracesAttachExtraTrace;
        Context.activateLongStackTraces();
        async.disableTrampolineIfNecessary();
    }
};

Promise.hasLongStackTraces = function () {
    return config.longStackTraces && longStackTracesIsSupported();
};

var fireDomEvent = (function() {
    try {
        if (typeof CustomEvent === "function") {
            var event = new CustomEvent("CustomEvent");
            util.global.dispatchEvent(event);
            return function(name, event) {
                var domEvent = new CustomEvent(name.toLowerCase(), {
                    detail: event,
                    cancelable: true
                });
                return !util.global.dispatchEvent(domEvent);
            };
        } else if (typeof Event === "function") {
            var event = new Event("CustomEvent");
            util.global.dispatchEvent(event);
            return function(name, event) {
                var domEvent = new Event(name.toLowerCase(), {
                    cancelable: true
                });
                domEvent.detail = event;
                return !util.global.dispatchEvent(domEvent);
            };
        } else {
            var event = document.createEvent("CustomEvent");
            event.initCustomEvent("testingtheevent", false, true, {});
            util.global.dispatchEvent(event);
            return function(name, event) {
                var domEvent = document.createEvent("CustomEvent");
                domEvent.initCustomEvent(name.toLowerCase(), false, true,
                    event);
                return !util.global.dispatchEvent(domEvent);
            };
        }
    } catch (e) {}
    return function() {
        return false;
    };
})();

var fireGlobalEvent = (function() {
    if (util.isNode) {
        return function() {
            return process.emit.apply(process, arguments);
        };
    } else {
        if (!util.global) {
            return function() {
                return false;
            };
        }
        return function(name) {
            var methodName = "on" + name.toLowerCase();
            var method = util.global[methodName];
            if (!method) return false;
            method.apply(util.global, [].slice.call(arguments, 1));
            return true;
        };
    }
})();

function generatePromiseLifecycleEventObject(name, promise) {
    return {promise: promise};
}

var eventToObjectGenerator = {
    promiseCreated: generatePromiseLifecycleEventObject,
    promiseFulfilled: generatePromiseLifecycleEventObject,
    promiseRejected: generatePromiseLifecycleEventObject,
    promiseResolved: generatePromiseLifecycleEventObject,
    promiseCancelled: generatePromiseLifecycleEventObject,
    promiseChained: function(name, promise, child) {
        return {promise: promise, child: child};
    },
    warning: function(name, warning) {
        return {warning: warning};
    },
    unhandledRejection: function (name, reason, promise) {
        return {reason: reason, promise: promise};
    },
    rejectionHandled: generatePromiseLifecycleEventObject
};

var activeFireEvent = function (name) {
    var globalEventFired = false;
    try {
        globalEventFired = fireGlobalEvent.apply(null, arguments);
    } catch (e) {
        async.throwLater(e);
        globalEventFired = true;
    }

    var domEventFired = false;
    try {
        domEventFired = fireDomEvent(name,
                    eventToObjectGenerator[name].apply(null, arguments));
    } catch (e) {
        async.throwLater(e);
        domEventFired = true;
    }

    return domEventFired || globalEventFired;
};

Promise.config = function(opts) {
    opts = Object(opts);
    if ("longStackTraces" in opts) {
        if (opts.longStackTraces) {
            Promise.longStackTraces();
        } else if (!opts.longStackTraces && Promise.hasLongStackTraces()) {
            disableLongStackTraces();
        }
    }
    if ("warnings" in opts) {
        var warningsOption = opts.warnings;
        config.warnings = !!warningsOption;
        wForgottenReturn = config.warnings;

        if (util.isObject(warningsOption)) {
            if ("wForgottenReturn" in warningsOption) {
                wForgottenReturn = !!warningsOption.wForgottenReturn;
            }
        }
    }
    if ("cancellation" in opts && opts.cancellation && !config.cancellation) {
        if (async.haveItemsQueued()) {
            throw new Error(
                "cannot enable cancellation after promises are in use");
        }
        Promise.prototype._clearCancellationData =
            cancellationClearCancellationData;
        Promise.prototype._propagateFrom = cancellationPropagateFrom;
        Promise.prototype._onCancel = cancellationOnCancel;
        Promise.prototype._setOnCancel = cancellationSetOnCancel;
        Promise.prototype._attachCancellationCallback =
            cancellationAttachCancellationCallback;
        Promise.prototype._execute = cancellationExecute;
        propagateFromFunction = cancellationPropagateFrom;
        config.cancellation = true;
    }
    if ("monitoring" in opts) {
        if (opts.monitoring && !config.monitoring) {
            config.monitoring = true;
            Promise.prototype._fireEvent = activeFireEvent;
        } else if (!opts.monitoring && config.monitoring) {
            config.monitoring = false;
            Promise.prototype._fireEvent = defaultFireEvent;
        }
    }
    return Promise;
};

function defaultFireEvent() { return false; }

Promise.prototype._fireEvent = defaultFireEvent;
Promise.prototype._execute = function(executor, resolve, reject) {
    try {
        executor(resolve, reject);
    } catch (e) {
        return e;
    }
};
Promise.prototype._onCancel = function () {};
Promise.prototype._setOnCancel = function (handler) { ; };
Promise.prototype._attachCancellationCallback = function(onCancel) {
    ;
};
Promise.prototype._captureStackTrace = function () {};
Promise.prototype._attachExtraTrace = function () {};
Promise.prototype._clearCancellationData = function() {};
Promise.prototype._propagateFrom = function (parent, flags) {
    ;
    ;
};

function cancellationExecute(executor, resolve, reject) {
    var promise = this;
    try {
        executor(resolve, reject, function(onCancel) {
            if (typeof onCancel !== "function") {
                throw new TypeError("onCancel must be a function, got: " +
                                    util.toString(onCancel));
            }
            promise._attachCancellationCallback(onCancel);
        });
    } catch (e) {
        return e;
    }
}

function cancellationAttachCancellationCallback(onCancel) {
    if (!this._isCancellable()) return this;

    var previousOnCancel = this._onCancel();
    if (previousOnCancel !== undefined) {
        if (util.isArray(previousOnCancel)) {
            previousOnCancel.push(onCancel);
        } else {
            this._setOnCancel([previousOnCancel, onCancel]);
        }
    } else {
        this._setOnCancel(onCancel);
    }
}

function cancellationOnCancel() {
    return this._onCancelField;
}

function cancellationSetOnCancel(onCancel) {
    this._onCancelField = onCancel;
}

function cancellationClearCancellationData() {
    this._cancellationParent = undefined;
    this._onCancelField = undefined;
}

function cancellationPropagateFrom(parent, flags) {
    if ((flags & 1) !== 0) {
        this._cancellationParent = parent;
        var branchesRemainingToCancel = parent._branchesRemainingToCancel;
        if (branchesRemainingToCancel === undefined) {
            branchesRemainingToCancel = 0;
        }
        parent._branchesRemainingToCancel = branchesRemainingToCancel + 1;
    }
    if ((flags & 2) !== 0 && parent._isBound()) {
        this._setBoundTo(parent._boundTo);
    }
}

function bindingPropagateFrom(parent, flags) {
    if ((flags & 2) !== 0 && parent._isBound()) {
        this._setBoundTo(parent._boundTo);
    }
}
var propagateFromFunction = bindingPropagateFrom;

function boundValueFunction() {
    var ret = this._boundTo;
    if (ret !== undefined) {
        if (ret instanceof Promise) {
            if (ret.isFulfilled()) {
                return ret.value();
            } else {
                return undefined;
            }
        }
    }
    return ret;
}

function longStackTracesCaptureStackTrace() {
    this._trace = new CapturedTrace(this._peekContext());
}

function longStackTracesAttachExtraTrace(error, ignoreSelf) {
    if (canAttachTrace(error)) {
        var trace = this._trace;
        if (trace !== undefined) {
            if (ignoreSelf) trace = trace._parent;
        }
        if (trace !== undefined) {
            trace.attachExtraTrace(error);
        } else if (!error.__stackCleaned__) {
            var parsed = parseStackAndMessage(error);
            util.notEnumerableProp(error, "stack",
                parsed.message + "\n" + parsed.stack.join("\n"));
            util.notEnumerableProp(error, "__stackCleaned__", true);
        }
    }
}

function checkForgottenReturns(returnValue, promiseCreated, name, promise,
                               parent) {
    if (returnValue === undefined && promiseCreated !== null &&
        wForgottenReturn) {
        if (parent !== undefined && parent._returnedNonUndefined()) return;
        if ((promise._bitField & 65535) === 0) return;

        if (name) name = name + " ";
        var handlerLine = "";
        var creatorLine = "";
        if (promiseCreated._trace) {
            var traceLines = promiseCreated._trace.stack.split("\n");
            var stack = cleanStack(traceLines);
            for (var i = stack.length - 1; i >= 0; --i) {
                var line = stack[i];
                if (!nodeFramePattern.test(line)) {
                    var lineMatches = line.match(parseLinePattern);
                    if (lineMatches) {
                        handlerLine  = "at " + lineMatches[1] +
                            ":" + lineMatches[2] + ":" + lineMatches[3] + " ";
                    }
                    break;
                }
            }

            if (stack.length > 0) {
                var firstUserLine = stack[0];
                for (var i = 0; i < traceLines.length; ++i) {

                    if (traceLines[i] === firstUserLine) {
                        if (i > 0) {
                            creatorLine = "\n" + traceLines[i - 1];
                        }
                        break;
                    }
                }

            }
        }
        var msg = "a promise was created in a " + name +
            "handler " + handlerLine + "but was not returned from it, " +
            "see http://goo.gl/rRqMUw" +
            creatorLine;
        promise._warn(msg, true, promiseCreated);
    }
}

function deprecated(name, replacement) {
    var message = name +
        " is deprecated and will be removed in a future version.";
    if (replacement) message += " Use " + replacement + " instead.";
    return warn(message);
}

function warn(message, shouldUseOwnTrace, promise) {
    if (!config.warnings) return;
    var warning = new Warning(message);
    var ctx;
    if (shouldUseOwnTrace) {
        promise._attachExtraTrace(warning);
    } else if (config.longStackTraces && (ctx = Promise._peekContext())) {
        ctx.attachExtraTrace(warning);
    } else {
        var parsed = parseStackAndMessage(warning);
        warning.stack = parsed.message + "\n" + parsed.stack.join("\n");
    }

    if (!activeFireEvent("warning", warning)) {
        formatAndLogError(warning, "", true);
    }
}

function reconstructStack(message, stacks) {
    for (var i = 0; i < stacks.length - 1; ++i) {
        stacks[i].push("From previous event:");
        stacks[i] = stacks[i].join("\n");
    }
    if (i < stacks.length) {
        stacks[i] = stacks[i].join("\n");
    }
    return message + "\n" + stacks.join("\n");
}

function removeDuplicateOrEmptyJumps(stacks) {
    for (var i = 0; i < stacks.length; ++i) {
        if (stacks[i].length === 0 ||
            ((i + 1 < stacks.length) && stacks[i][0] === stacks[i+1][0])) {
            stacks.splice(i, 1);
            i--;
        }
    }
}

function removeCommonRoots(stacks) {
    var current = stacks[0];
    for (var i = 1; i < stacks.length; ++i) {
        var prev = stacks[i];
        var currentLastIndex = current.length - 1;
        var currentLastLine = current[currentLastIndex];
        var commonRootMeetPoint = -1;

        for (var j = prev.length - 1; j >= 0; --j) {
            if (prev[j] === currentLastLine) {
                commonRootMeetPoint = j;
                break;
            }
        }

        for (var j = commonRootMeetPoint; j >= 0; --j) {
            var line = prev[j];
            if (current[currentLastIndex] === line) {
                current.pop();
                currentLastIndex--;
            } else {
                break;
            }
        }
        current = prev;
    }
}

function cleanStack(stack) {
    var ret = [];
    for (var i = 0; i < stack.length; ++i) {
        var line = stack[i];
        var isTraceLine = "    (No stack trace)" === line ||
            stackFramePattern.test(line);
        var isInternalFrame = isTraceLine && shouldIgnore(line);
        if (isTraceLine && !isInternalFrame) {
            if (indentStackFrames && line.charAt(0) !== " ") {
                line = "    " + line;
            }
            ret.push(line);
        }
    }
    return ret;
}

function stackFramesAsArray(error) {
    var stack = error.stack.replace(/\s+$/g, "").split("\n");
    for (var i = 0; i < stack.length; ++i) {
        var line = stack[i];
        if ("    (No stack trace)" === line || stackFramePattern.test(line)) {
            break;
        }
    }
    if (i > 0 && error.name != "SyntaxError") {
        stack = stack.slice(i);
    }
    return stack;
}

function parseStackAndMessage(error) {
    var stack = error.stack;
    var message = error.toString();
    stack = typeof stack === "string" && stack.length > 0
                ? stackFramesAsArray(error) : ["    (No stack trace)"];
    return {
        message: message,
        stack: error.name == "SyntaxError" ? stack : cleanStack(stack)
    };
}

function formatAndLogError(error, title, isSoft) {
    if (typeof console !== "undefined") {
        var message;
        if (util.isObject(error)) {
            var stack = error.stack;
            message = title + formatStack(stack, error);
        } else {
            message = title + String(error);
        }
        if (typeof printWarning === "function") {
            printWarning(message, isSoft);
        } else if (typeof console.log === "function" ||
            typeof console.log === "object") {
            console.log(message);
        }
    }
}

function fireRejectionEvent(name, localHandler, reason, promise) {
    var localEventFired = false;
    try {
        if (typeof localHandler === "function") {
            localEventFired = true;
            if (name === "rejectionHandled") {
                localHandler(promise);
            } else {
                localHandler(reason, promise);
            }
        }
    } catch (e) {
        async.throwLater(e);
    }

    if (name === "unhandledRejection") {
        if (!activeFireEvent(name, reason, promise) && !localEventFired) {
            formatAndLogError(reason, "Unhandled rejection ");
        }
    } else {
        activeFireEvent(name, promise);
    }
}

function formatNonError(obj) {
    var str;
    if (typeof obj === "function") {
        str = "[function " +
            (obj.name || "anonymous") +
            "]";
    } else {
        str = obj && typeof obj.toString === "function"
            ? obj.toString() : util.toString(obj);
        var ruselessToString = /\[object [a-zA-Z0-9$_]+\]/;
        if (ruselessToString.test(str)) {
            try {
                var newStr = JSON.stringify(obj);
                str = newStr;
            }
            catch(e) {

            }
        }
        if (str.length === 0) {
            str = "(empty array)";
        }
    }
    return ("(<" + snip(str) + ">, no stack trace)");
}

function snip(str) {
    var maxChars = 41;
    if (str.length < maxChars) {
        return str;
    }
    return str.substr(0, maxChars - 3) + "...";
}

function longStackTracesIsSupported() {
    return typeof captureStackTrace === "function";
}

var shouldIgnore = function() { return false; };
var parseLineInfoRegex = /[\/<\(]([^:\/]+):(\d+):(?:\d+)\)?\s*$/;
function parseLineInfo(line) {
    var matches = line.match(parseLineInfoRegex);
    if (matches) {
        return {
            fileName: matches[1],
            line: parseInt(matches[2], 10)
        };
    }
}

function setBounds(firstLineError, lastLineError) {
    if (!longStackTracesIsSupported()) return;
    var firstStackLines = firstLineError.stack.split("\n");
    var lastStackLines = lastLineError.stack.split("\n");
    var firstIndex = -1;
    var lastIndex = -1;
    var firstFileName;
    var lastFileName;
    for (var i = 0; i < firstStackLines.length; ++i) {
        var result = parseLineInfo(firstStackLines[i]);
        if (result) {
            firstFileName = result.fileName;
            firstIndex = result.line;
            break;
        }
    }
    for (var i = 0; i < lastStackLines.length; ++i) {
        var result = parseLineInfo(lastStackLines[i]);
        if (result) {
            lastFileName = result.fileName;
            lastIndex = result.line;
            break;
        }
    }
    if (firstIndex < 0 || lastIndex < 0 || !firstFileName || !lastFileName ||
        firstFileName !== lastFileName || firstIndex >= lastIndex) {
        return;
    }

    shouldIgnore = function(line) {
        if (bluebirdFramePattern.test(line)) return true;
        var info = parseLineInfo(line);
        if (info) {
            if (info.fileName === firstFileName &&
                (firstIndex <= info.line && info.line <= lastIndex)) {
                return true;
            }
        }
        return false;
    };
}

function CapturedTrace(parent) {
    this._parent = parent;
    this._promisesCreated = 0;
    var length = this._length = 1 + (parent === undefined ? 0 : parent._length);
    captureStackTrace(this, CapturedTrace);
    if (length > 32) this.uncycle();
}
util.inherits(CapturedTrace, Error);
Context.CapturedTrace = CapturedTrace;

CapturedTrace.prototype.uncycle = function() {
    var length = this._length;
    if (length < 2) return;
    var nodes = [];
    var stackToIndex = {};

    for (var i = 0, node = this; node !== undefined; ++i) {
        nodes.push(node);
        node = node._parent;
    }
    length = this._length = i;
    for (var i = length - 1; i >= 0; --i) {
        var stack = nodes[i].stack;
        if (stackToIndex[stack] === undefined) {
            stackToIndex[stack] = i;
        }
    }
    for (var i = 0; i < length; ++i) {
        var currentStack = nodes[i].stack;
        var index = stackToIndex[currentStack];
        if (index !== undefined && index !== i) {
            if (index > 0) {
                nodes[index - 1]._parent = undefined;
                nodes[index - 1]._length = 1;
            }
            nodes[i]._parent = undefined;
            nodes[i]._length = 1;
            var cycleEdgeNode = i > 0 ? nodes[i - 1] : this;

            if (index < length - 1) {
                cycleEdgeNode._parent = nodes[index + 1];
                cycleEdgeNode._parent.uncycle();
                cycleEdgeNode._length =
                    cycleEdgeNode._parent._length + 1;
            } else {
                cycleEdgeNode._parent = undefined;
                cycleEdgeNode._length = 1;
            }
            var currentChildLength = cycleEdgeNode._length + 1;
            for (var j = i - 2; j >= 0; --j) {
                nodes[j]._length = currentChildLength;
                currentChildLength++;
            }
            return;
        }
    }
};

CapturedTrace.prototype.attachExtraTrace = function(error) {
    if (error.__stackCleaned__) return;
    this.uncycle();
    var parsed = parseStackAndMessage(error);
    var message = parsed.message;
    var stacks = [parsed.stack];

    var trace = this;
    while (trace !== undefined) {
        stacks.push(cleanStack(trace.stack.split("\n")));
        trace = trace._parent;
    }
    removeCommonRoots(stacks);
    removeDuplicateOrEmptyJumps(stacks);
    util.notEnumerableProp(error, "stack", reconstructStack(message, stacks));
    util.notEnumerableProp(error, "__stackCleaned__", true);
};

var captureStackTrace = (function stackDetection() {
    var v8stackFramePattern = /^\s*at\s*/;
    var v8stackFormatter = function(stack, error) {
        if (typeof stack === "string") return stack;

        if (error.name !== undefined &&
            error.message !== undefined) {
            return error.toString();
        }
        return formatNonError(error);
    };

    if (typeof Error.stackTraceLimit === "number" &&
        typeof Error.captureStackTrace === "function") {
        Error.stackTraceLimit += 6;
        stackFramePattern = v8stackFramePattern;
        formatStack = v8stackFormatter;
        var captureStackTrace = Error.captureStackTrace;

        shouldIgnore = function(line) {
            return bluebirdFramePattern.test(line);
        };
        return function(receiver, ignoreUntil) {
            Error.stackTraceLimit += 6;
            captureStackTrace(receiver, ignoreUntil);
            Error.stackTraceLimit -= 6;
        };
    }
    var err = new Error();

    if (typeof err.stack === "string" &&
        err.stack.split("\n")[0].indexOf("stackDetection@") >= 0) {
        stackFramePattern = /@/;
        formatStack = v8stackFormatter;
        indentStackFrames = true;
        return function captureStackTrace(o) {
            o.stack = new Error().stack;
        };
    }

    var hasStackAfterThrow;
    try { throw new Error(); }
    catch(e) {
        hasStackAfterThrow = ("stack" in e);
    }
    if (!("stack" in err) && hasStackAfterThrow &&
        typeof Error.stackTraceLimit === "number") {
        stackFramePattern = v8stackFramePattern;
        formatStack = v8stackFormatter;
        return function captureStackTrace(o) {
            Error.stackTraceLimit += 6;
            try { throw new Error(); }
            catch(e) { o.stack = e.stack; }
            Error.stackTraceLimit -= 6;
        };
    }

    formatStack = function(stack, error) {
        if (typeof stack === "string") return stack;

        if ((typeof error === "object" ||
            typeof error === "function") &&
            error.name !== undefined &&
            error.message !== undefined) {
            return error.toString();
        }
        return formatNonError(error);
    };

    return null;

})([]);

if (typeof console !== "undefined" && typeof console.warn !== "undefined") {
    printWarning = function (message) {
        console.warn(message);
    };
    if (util.isNode && process.stderr.isTTY) {
        printWarning = function(message, isSoft) {
            var color = isSoft ? "\u001b[33m" : "\u001b[31m";
            console.warn(color + message + "\u001b[0m\n");
        };
    } else if (!util.isNode && typeof (new Error().stack) === "string") {
        printWarning = function(message, isSoft) {
            console.warn("%c" + message,
                        isSoft ? "color: darkorange" : "color: red");
        };
    }
}

var config = {
    warnings: warnings,
    longStackTraces: false,
    cancellation: false,
    monitoring: false
};

if (longStackTraces) Promise.longStackTraces();

return {
    longStackTraces: function() {
        return config.longStackTraces;
    },
    warnings: function() {
        return config.warnings;
    },
    cancellation: function() {
        return config.cancellation;
    },
    monitoring: function() {
        return config.monitoring;
    },
    propagateFromFunction: function() {
        return propagateFromFunction;
    },
    boundValueFunction: function() {
        return boundValueFunction;
    },
    checkForgottenReturns: checkForgottenReturns,
    setBounds: setBounds,
    warn: warn,
    deprecated: deprecated,
    CapturedTrace: CapturedTrace,
    fireDomEvent: fireDomEvent,
    fireGlobalEvent: fireGlobalEvent
};
};

},{"./errors":12,"./util":36}],10:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise) {
function returner() {
    return this.value;
}
function thrower() {
    throw this.reason;
}

Promise.prototype["return"] =
Promise.prototype.thenReturn = function (value) {
    if (value instanceof Promise) value.suppressUnhandledRejections();
    return this._then(
        returner, undefined, undefined, {value: value}, undefined);
};

Promise.prototype["throw"] =
Promise.prototype.thenThrow = function (reason) {
    return this._then(
        thrower, undefined, undefined, {reason: reason}, undefined);
};

Promise.prototype.catchThrow = function (reason) {
    if (arguments.length <= 1) {
        return this._then(
            undefined, thrower, undefined, {reason: reason}, undefined);
    } else {
        var _reason = arguments[1];
        var handler = function() {throw _reason;};
        return this.caught(reason, handler);
    }
};

Promise.prototype.catchReturn = function (value) {
    if (arguments.length <= 1) {
        if (value instanceof Promise) value.suppressUnhandledRejections();
        return this._then(
            undefined, returner, undefined, {value: value}, undefined);
    } else {
        var _value = arguments[1];
        if (_value instanceof Promise) _value.suppressUnhandledRejections();
        var handler = function() {return _value;};
        return this.caught(value, handler);
    }
};
};

},{}],11:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise, INTERNAL) {
var PromiseReduce = Promise.reduce;
var PromiseAll = Promise.all;

function promiseAllThis() {
    return PromiseAll(this);
}

function PromiseMapSeries(promises, fn) {
    return PromiseReduce(promises, fn, INTERNAL, INTERNAL);
}

Promise.prototype.each = function (fn) {
    return PromiseReduce(this, fn, INTERNAL, 0)
              ._then(promiseAllThis, undefined, undefined, this, undefined);
};

Promise.prototype.mapSeries = function (fn) {
    return PromiseReduce(this, fn, INTERNAL, INTERNAL);
};

Promise.each = function (promises, fn) {
    return PromiseReduce(promises, fn, INTERNAL, 0)
              ._then(promiseAllThis, undefined, undefined, promises, undefined);
};

Promise.mapSeries = PromiseMapSeries;
};


},{}],12:[function(_dereq_,module,exports){
"use strict";
var es5 = _dereq_("./es5");
var Objectfreeze = es5.freeze;
var util = _dereq_("./util");
var inherits = util.inherits;
var notEnumerableProp = util.notEnumerableProp;

function subError(nameProperty, defaultMessage) {
    function SubError(message) {
        if (!(this instanceof SubError)) return new SubError(message);
        notEnumerableProp(this, "message",
            typeof message === "string" ? message : defaultMessage);
        notEnumerableProp(this, "name", nameProperty);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        } else {
            Error.call(this);
        }
    }
    inherits(SubError, Error);
    return SubError;
}

var _TypeError, _RangeError;
var Warning = subError("Warning", "warning");
var CancellationError = subError("CancellationError", "cancellation error");
var TimeoutError = subError("TimeoutError", "timeout error");
var AggregateError = subError("AggregateError", "aggregate error");
try {
    _TypeError = TypeError;
    _RangeError = RangeError;
} catch(e) {
    _TypeError = subError("TypeError", "type error");
    _RangeError = subError("RangeError", "range error");
}

var methods = ("join pop push shift unshift slice filter forEach some " +
    "every map indexOf lastIndexOf reduce reduceRight sort reverse").split(" ");

for (var i = 0; i < methods.length; ++i) {
    if (typeof Array.prototype[methods[i]] === "function") {
        AggregateError.prototype[methods[i]] = Array.prototype[methods[i]];
    }
}

es5.defineProperty(AggregateError.prototype, "length", {
    value: 0,
    configurable: false,
    writable: true,
    enumerable: true
});
AggregateError.prototype["isOperational"] = true;
var level = 0;
AggregateError.prototype.toString = function() {
    var indent = Array(level * 4 + 1).join(" ");
    var ret = "\n" + indent + "AggregateError of:" + "\n";
    level++;
    indent = Array(level * 4 + 1).join(" ");
    for (var i = 0; i < this.length; ++i) {
        var str = this[i] === this ? "[Circular AggregateError]" : this[i] + "";
        var lines = str.split("\n");
        for (var j = 0; j < lines.length; ++j) {
            lines[j] = indent + lines[j];
        }
        str = lines.join("\n");
        ret += str + "\n";
    }
    level--;
    return ret;
};

function OperationalError(message) {
    if (!(this instanceof OperationalError))
        return new OperationalError(message);
    notEnumerableProp(this, "name", "OperationalError");
    notEnumerableProp(this, "message", message);
    this.cause = message;
    this["isOperational"] = true;

    if (message instanceof Error) {
        notEnumerableProp(this, "message", message.message);
        notEnumerableProp(this, "stack", message.stack);
    } else if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
    }

}
inherits(OperationalError, Error);

var errorTypes = Error["__BluebirdErrorTypes__"];
if (!errorTypes) {
    errorTypes = Objectfreeze({
        CancellationError: CancellationError,
        TimeoutError: TimeoutError,
        OperationalError: OperationalError,
        RejectionError: OperationalError,
        AggregateError: AggregateError
    });
    es5.defineProperty(Error, "__BluebirdErrorTypes__", {
        value: errorTypes,
        writable: false,
        enumerable: false,
        configurable: false
    });
}

module.exports = {
    Error: Error,
    TypeError: _TypeError,
    RangeError: _RangeError,
    CancellationError: errorTypes.CancellationError,
    OperationalError: errorTypes.OperationalError,
    TimeoutError: errorTypes.TimeoutError,
    AggregateError: errorTypes.AggregateError,
    Warning: Warning
};

},{"./es5":13,"./util":36}],13:[function(_dereq_,module,exports){
var isES5 = (function(){
    "use strict";
    return this === undefined;
})();

if (isES5) {
    module.exports = {
        freeze: Object.freeze,
        defineProperty: Object.defineProperty,
        getDescriptor: Object.getOwnPropertyDescriptor,
        keys: Object.keys,
        names: Object.getOwnPropertyNames,
        getPrototypeOf: Object.getPrototypeOf,
        isArray: Array.isArray,
        isES5: isES5,
        propertyIsWritable: function(obj, prop) {
            var descriptor = Object.getOwnPropertyDescriptor(obj, prop);
            return !!(!descriptor || descriptor.writable || descriptor.set);
        }
    };
} else {
    var has = {}.hasOwnProperty;
    var str = {}.toString;
    var proto = {}.constructor.prototype;

    var ObjectKeys = function (o) {
        var ret = [];
        for (var key in o) {
            if (has.call(o, key)) {
                ret.push(key);
            }
        }
        return ret;
    };

    var ObjectGetDescriptor = function(o, key) {
        return {value: o[key]};
    };

    var ObjectDefineProperty = function (o, key, desc) {
        o[key] = desc.value;
        return o;
    };

    var ObjectFreeze = function (obj) {
        return obj;
    };

    var ObjectGetPrototypeOf = function (obj) {
        try {
            return Object(obj).constructor.prototype;
        }
        catch (e) {
            return proto;
        }
    };

    var ArrayIsArray = function (obj) {
        try {
            return str.call(obj) === "[object Array]";
        }
        catch(e) {
            return false;
        }
    };

    module.exports = {
        isArray: ArrayIsArray,
        keys: ObjectKeys,
        names: ObjectKeys,
        defineProperty: ObjectDefineProperty,
        getDescriptor: ObjectGetDescriptor,
        freeze: ObjectFreeze,
        getPrototypeOf: ObjectGetPrototypeOf,
        isES5: isES5,
        propertyIsWritable: function() {
            return true;
        }
    };
}

},{}],14:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise, INTERNAL) {
var PromiseMap = Promise.map;

Promise.prototype.filter = function (fn, options) {
    return PromiseMap(this, fn, options, INTERNAL);
};

Promise.filter = function (promises, fn, options) {
    return PromiseMap(promises, fn, options, INTERNAL);
};
};

},{}],15:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise, tryConvertToPromise, NEXT_FILTER) {
var util = _dereq_("./util");
var CancellationError = Promise.CancellationError;
var errorObj = util.errorObj;
var catchFilter = _dereq_("./catch_filter")(NEXT_FILTER);

function PassThroughHandlerContext(promise, type, handler) {
    this.promise = promise;
    this.type = type;
    this.handler = handler;
    this.called = false;
    this.cancelPromise = null;
}

PassThroughHandlerContext.prototype.isFinallyHandler = function() {
    return this.type === 0;
};

function FinallyHandlerCancelReaction(finallyHandler) {
    this.finallyHandler = finallyHandler;
}

FinallyHandlerCancelReaction.prototype._resultCancelled = function() {
    checkCancel(this.finallyHandler);
};

function checkCancel(ctx, reason) {
    if (ctx.cancelPromise != null) {
        if (arguments.length > 1) {
            ctx.cancelPromise._reject(reason);
        } else {
            ctx.cancelPromise._cancel();
        }
        ctx.cancelPromise = null;
        return true;
    }
    return false;
}

function succeed() {
    return finallyHandler.call(this, this.promise._target()._settledValue());
}
function fail(reason) {
    if (checkCancel(this, reason)) return;
    errorObj.e = reason;
    return errorObj;
}
function finallyHandler(reasonOrValue) {
    var promise = this.promise;
    var handler = this.handler;

    if (!this.called) {
        this.called = true;
        var ret = this.isFinallyHandler()
            ? handler.call(promise._boundValue())
            : handler.call(promise._boundValue(), reasonOrValue);
        if (ret === NEXT_FILTER) {
            return ret;
        } else if (ret !== undefined) {
            promise._setReturnedNonUndefined();
            var maybePromise = tryConvertToPromise(ret, promise);
            if (maybePromise instanceof Promise) {
                if (this.cancelPromise != null) {
                    if (maybePromise._isCancelled()) {
                        var reason =
                            new CancellationError("late cancellation observer");
                        promise._attachExtraTrace(reason);
                        errorObj.e = reason;
                        return errorObj;
                    } else if (maybePromise.isPending()) {
                        maybePromise._attachCancellationCallback(
                            new FinallyHandlerCancelReaction(this));
                    }
                }
                return maybePromise._then(
                    succeed, fail, undefined, this, undefined);
            }
        }
    }

    if (promise.isRejected()) {
        checkCancel(this);
        errorObj.e = reasonOrValue;
        return errorObj;
    } else {
        checkCancel(this);
        return reasonOrValue;
    }
}

Promise.prototype._passThrough = function(handler, type, success, fail) {
    if (typeof handler !== "function") return this.then();
    return this._then(success,
                      fail,
                      undefined,
                      new PassThroughHandlerContext(this, type, handler),
                      undefined);
};

Promise.prototype.lastly =
Promise.prototype["finally"] = function (handler) {
    return this._passThrough(handler,
                             0,
                             finallyHandler,
                             finallyHandler);
};


Promise.prototype.tap = function (handler) {
    return this._passThrough(handler, 1, finallyHandler);
};

Promise.prototype.tapCatch = function (handlerOrPredicate) {
    var len = arguments.length;
    if(len === 1) {
        return this._passThrough(handlerOrPredicate,
                                 1,
                                 undefined,
                                 finallyHandler);
    } else {
         var catchInstances = new Array(len - 1),
            j = 0, i;
        for (i = 0; i < len - 1; ++i) {
            var item = arguments[i];
            if (util.isObject(item)) {
                catchInstances[j++] = item;
            } else {
                return Promise.reject(new TypeError(
                    "tapCatch statement predicate: "
                    + "expecting an object but got " + util.classString(item)
                ));
            }
        }
        catchInstances.length = j;
        var handler = arguments[i];
        return this._passThrough(catchFilter(catchInstances, handler, this),
                                 1,
                                 undefined,
                                 finallyHandler);
    }

};

return PassThroughHandlerContext;
};

},{"./catch_filter":7,"./util":36}],16:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise,
                          apiRejection,
                          INTERNAL,
                          tryConvertToPromise,
                          Proxyable,
                          debug) {
var errors = _dereq_("./errors");
var TypeError = errors.TypeError;
var util = _dereq_("./util");
var errorObj = util.errorObj;
var tryCatch = util.tryCatch;
var yieldHandlers = [];

function promiseFromYieldHandler(value, yieldHandlers, traceParent) {
    for (var i = 0; i < yieldHandlers.length; ++i) {
        traceParent._pushContext();
        var result = tryCatch(yieldHandlers[i])(value);
        traceParent._popContext();
        if (result === errorObj) {
            traceParent._pushContext();
            var ret = Promise.reject(errorObj.e);
            traceParent._popContext();
            return ret;
        }
        var maybePromise = tryConvertToPromise(result, traceParent);
        if (maybePromise instanceof Promise) return maybePromise;
    }
    return null;
}

function PromiseSpawn(generatorFunction, receiver, yieldHandler, stack) {
    if (debug.cancellation()) {
        var internal = new Promise(INTERNAL);
        var _finallyPromise = this._finallyPromise = new Promise(INTERNAL);
        this._promise = internal.lastly(function() {
            return _finallyPromise;
        });
        internal._captureStackTrace();
        internal._setOnCancel(this);
    } else {
        var promise = this._promise = new Promise(INTERNAL);
        promise._captureStackTrace();
    }
    this._stack = stack;
    this._generatorFunction = generatorFunction;
    this._receiver = receiver;
    this._generator = undefined;
    this._yieldHandlers = typeof yieldHandler === "function"
        ? [yieldHandler].concat(yieldHandlers)
        : yieldHandlers;
    this._yieldedPromise = null;
    this._cancellationPhase = false;
}
util.inherits(PromiseSpawn, Proxyable);

PromiseSpawn.prototype._isResolved = function() {
    return this._promise === null;
};

PromiseSpawn.prototype._cleanup = function() {
    this._promise = this._generator = null;
    if (debug.cancellation() && this._finallyPromise !== null) {
        this._finallyPromise._fulfill();
        this._finallyPromise = null;
    }
};

PromiseSpawn.prototype._promiseCancelled = function() {
    if (this._isResolved()) return;
    var implementsReturn = typeof this._generator["return"] !== "undefined";

    var result;
    if (!implementsReturn) {
        var reason = new Promise.CancellationError(
            "generator .return() sentinel");
        Promise.coroutine.returnSentinel = reason;
        this._promise._attachExtraTrace(reason);
        this._promise._pushContext();
        result = tryCatch(this._generator["throw"]).call(this._generator,
                                                         reason);
        this._promise._popContext();
    } else {
        this._promise._pushContext();
        result = tryCatch(this._generator["return"]).call(this._generator,
                                                          undefined);
        this._promise._popContext();
    }
    this._cancellationPhase = true;
    this._yieldedPromise = null;
    this._continue(result);
};

PromiseSpawn.prototype._promiseFulfilled = function(value) {
    this._yieldedPromise = null;
    this._promise._pushContext();
    var result = tryCatch(this._generator.next).call(this._generator, value);
    this._promise._popContext();
    this._continue(result);
};

PromiseSpawn.prototype._promiseRejected = function(reason) {
    this._yieldedPromise = null;
    this._promise._attachExtraTrace(reason);
    this._promise._pushContext();
    var result = tryCatch(this._generator["throw"])
        .call(this._generator, reason);
    this._promise._popContext();
    this._continue(result);
};

PromiseSpawn.prototype._resultCancelled = function() {
    if (this._yieldedPromise instanceof Promise) {
        var promise = this._yieldedPromise;
        this._yieldedPromise = null;
        promise.cancel();
    }
};

PromiseSpawn.prototype.promise = function () {
    return this._promise;
};

PromiseSpawn.prototype._run = function () {
    this._generator = this._generatorFunction.call(this._receiver);
    this._receiver =
        this._generatorFunction = undefined;
    this._promiseFulfilled(undefined);
};

PromiseSpawn.prototype._continue = function (result) {
    var promise = this._promise;
    if (result === errorObj) {
        this._cleanup();
        if (this._cancellationPhase) {
            return promise.cancel();
        } else {
            return promise._rejectCallback(result.e, false);
        }
    }

    var value = result.value;
    if (result.done === true) {
        this._cleanup();
        if (this._cancellationPhase) {
            return promise.cancel();
        } else {
            return promise._resolveCallback(value);
        }
    } else {
        var maybePromise = tryConvertToPromise(value, this._promise);
        if (!(maybePromise instanceof Promise)) {
            maybePromise =
                promiseFromYieldHandler(maybePromise,
                                        this._yieldHandlers,
                                        this._promise);
            if (maybePromise === null) {
                this._promiseRejected(
                    new TypeError(
                        "A value %s was yielded that could not be treated as a promise\u000a\u000a    See http://goo.gl/MqrFmX\u000a\u000a".replace("%s", String(value)) +
                        "From coroutine:\u000a" +
                        this._stack.split("\n").slice(1, -7).join("\n")
                    )
                );
                return;
            }
        }
        maybePromise = maybePromise._target();
        var bitField = maybePromise._bitField;
        ;
        if (((bitField & 50397184) === 0)) {
            this._yieldedPromise = maybePromise;
            maybePromise._proxy(this, null);
        } else if (((bitField & 33554432) !== 0)) {
            Promise._async.invoke(
                this._promiseFulfilled, this, maybePromise._value()
            );
        } else if (((bitField & 16777216) !== 0)) {
            Promise._async.invoke(
                this._promiseRejected, this, maybePromise._reason()
            );
        } else {
            this._promiseCancelled();
        }
    }
};

Promise.coroutine = function (generatorFunction, options) {
    if (typeof generatorFunction !== "function") {
        throw new TypeError("generatorFunction must be a function\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
    }
    var yieldHandler = Object(options).yieldHandler;
    var PromiseSpawn$ = PromiseSpawn;
    var stack = new Error().stack;
    return function () {
        var generator = generatorFunction.apply(this, arguments);
        var spawn = new PromiseSpawn$(undefined, undefined, yieldHandler,
                                      stack);
        var ret = spawn.promise();
        spawn._generator = generator;
        spawn._promiseFulfilled(undefined);
        return ret;
    };
};

Promise.coroutine.addYieldHandler = function(fn) {
    if (typeof fn !== "function") {
        throw new TypeError("expecting a function but got " + util.classString(fn));
    }
    yieldHandlers.push(fn);
};

Promise.spawn = function (generatorFunction) {
    debug.deprecated("Promise.spawn()", "Promise.coroutine()");
    if (typeof generatorFunction !== "function") {
        return apiRejection("generatorFunction must be a function\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
    }
    var spawn = new PromiseSpawn(generatorFunction, this);
    var ret = spawn.promise();
    spawn._run(Promise.spawn);
    return ret;
};
};

},{"./errors":12,"./util":36}],17:[function(_dereq_,module,exports){
"use strict";
module.exports =
function(Promise, PromiseArray, tryConvertToPromise, INTERNAL, async,
         getDomain) {
var util = _dereq_("./util");
var canEvaluate = util.canEvaluate;
var tryCatch = util.tryCatch;
var errorObj = util.errorObj;
var reject;

if (!true) {
if (canEvaluate) {
    var thenCallback = function(i) {
        return new Function("value", "holder", "                             \n\
            'use strict';                                                    \n\
            holder.pIndex = value;                                           \n\
            holder.checkFulfillment(this);                                   \n\
            ".replace(/Index/g, i));
    };

    var promiseSetter = function(i) {
        return new Function("promise", "holder", "                           \n\
            'use strict';                                                    \n\
            holder.pIndex = promise;                                         \n\
            ".replace(/Index/g, i));
    };

    var generateHolderClass = function(total) {
        var props = new Array(total);
        for (var i = 0; i < props.length; ++i) {
            props[i] = "this.p" + (i+1);
        }
        var assignment = props.join(" = ") + " = null;";
        var cancellationCode= "var promise;\n" + props.map(function(prop) {
            return "                                                         \n\
                promise = " + prop + ";                                      \n\
                if (promise instanceof Promise) {                            \n\
                    promise.cancel();                                        \n\
                }                                                            \n\
            ";
        }).join("\n");
        var passedArguments = props.join(", ");
        var name = "Holder$" + total;


        var code = "return function(tryCatch, errorObj, Promise, async) {    \n\
            'use strict';                                                    \n\
            function [TheName](fn) {                                         \n\
                [TheProperties]                                              \n\
                this.fn = fn;                                                \n\
                this.asyncNeeded = true;                                     \n\
                this.now = 0;                                                \n\
            }                                                                \n\
                                                                             \n\
            [TheName].prototype._callFunction = function(promise) {          \n\
                promise._pushContext();                                      \n\
                var ret = tryCatch(this.fn)([ThePassedArguments]);           \n\
                promise._popContext();                                       \n\
                if (ret === errorObj) {                                      \n\
                    promise._rejectCallback(ret.e, false);                   \n\
                } else {                                                     \n\
                    promise._resolveCallback(ret);                           \n\
                }                                                            \n\
            };                                                               \n\
                                                                             \n\
            [TheName].prototype.checkFulfillment = function(promise) {       \n\
                var now = ++this.now;                                        \n\
                if (now === [TheTotal]) {                                    \n\
                    if (this.asyncNeeded) {                                  \n\
                        async.invoke(this._callFunction, this, promise);     \n\
                    } else {                                                 \n\
                        this._callFunction(promise);                         \n\
                    }                                                        \n\
                                                                             \n\
                }                                                            \n\
            };                                                               \n\
                                                                             \n\
            [TheName].prototype._resultCancelled = function() {              \n\
                [CancellationCode]                                           \n\
            };                                                               \n\
                                                                             \n\
            return [TheName];                                                \n\
        }(tryCatch, errorObj, Promise, async);                               \n\
        ";

        code = code.replace(/\[TheName\]/g, name)
            .replace(/\[TheTotal\]/g, total)
            .replace(/\[ThePassedArguments\]/g, passedArguments)
            .replace(/\[TheProperties\]/g, assignment)
            .replace(/\[CancellationCode\]/g, cancellationCode);

        return new Function("tryCatch", "errorObj", "Promise", "async", code)
                           (tryCatch, errorObj, Promise, async);
    };

    var holderClasses = [];
    var thenCallbacks = [];
    var promiseSetters = [];

    for (var i = 0; i < 8; ++i) {
        holderClasses.push(generateHolderClass(i + 1));
        thenCallbacks.push(thenCallback(i + 1));
        promiseSetters.push(promiseSetter(i + 1));
    }

    reject = function (reason) {
        this._reject(reason);
    };
}}

Promise.join = function () {
    var last = arguments.length - 1;
    var fn;
    if (last > 0 && typeof arguments[last] === "function") {
        fn = arguments[last];
        if (!true) {
            if (last <= 8 && canEvaluate) {
                var ret = new Promise(INTERNAL);
                ret._captureStackTrace();
                var HolderClass = holderClasses[last - 1];
                var holder = new HolderClass(fn);
                var callbacks = thenCallbacks;

                for (var i = 0; i < last; ++i) {
                    var maybePromise = tryConvertToPromise(arguments[i], ret);
                    if (maybePromise instanceof Promise) {
                        maybePromise = maybePromise._target();
                        var bitField = maybePromise._bitField;
                        ;
                        if (((bitField & 50397184) === 0)) {
                            maybePromise._then(callbacks[i], reject,
                                               undefined, ret, holder);
                            promiseSetters[i](maybePromise, holder);
                            holder.asyncNeeded = false;
                        } else if (((bitField & 33554432) !== 0)) {
                            callbacks[i].call(ret,
                                              maybePromise._value(), holder);
                        } else if (((bitField & 16777216) !== 0)) {
                            ret._reject(maybePromise._reason());
                        } else {
                            ret._cancel();
                        }
                    } else {
                        callbacks[i].call(ret, maybePromise, holder);
                    }
                }

                if (!ret._isFateSealed()) {
                    if (holder.asyncNeeded) {
                        var domain = getDomain();
                        if (domain !== null) {
                            holder.fn = util.domainBind(domain, holder.fn);
                        }
                    }
                    ret._setAsyncGuaranteed();
                    ret._setOnCancel(holder);
                }
                return ret;
            }
        }
    }
    var args = [].slice.call(arguments);;
    if (fn) args.pop();
    var ret = new PromiseArray(args).promise();
    return fn !== undefined ? ret.spread(fn) : ret;
};

};

},{"./util":36}],18:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise,
                          PromiseArray,
                          apiRejection,
                          tryConvertToPromise,
                          INTERNAL,
                          debug) {
var getDomain = Promise._getDomain;
var util = _dereq_("./util");
var tryCatch = util.tryCatch;
var errorObj = util.errorObj;
var async = Promise._async;

function MappingPromiseArray(promises, fn, limit, _filter) {
    this.constructor$(promises);
    this._promise._captureStackTrace();
    var domain = getDomain();
    this._callback = domain === null ? fn : util.domainBind(domain, fn);
    this._preservedValues = _filter === INTERNAL
        ? new Array(this.length())
        : null;
    this._limit = limit;
    this._inFlight = 0;
    this._queue = [];
    async.invoke(this._asyncInit, this, undefined);
}
util.inherits(MappingPromiseArray, PromiseArray);

MappingPromiseArray.prototype._asyncInit = function() {
    this._init$(undefined, -2);
};

MappingPromiseArray.prototype._init = function () {};

MappingPromiseArray.prototype._promiseFulfilled = function (value, index) {
    var values = this._values;
    var length = this.length();
    var preservedValues = this._preservedValues;
    var limit = this._limit;

    if (index < 0) {
        index = (index * -1) - 1;
        values[index] = value;
        if (limit >= 1) {
            this._inFlight--;
            this._drainQueue();
            if (this._isResolved()) return true;
        }
    } else {
        if (limit >= 1 && this._inFlight >= limit) {
            values[index] = value;
            this._queue.push(index);
            return false;
        }
        if (preservedValues !== null) preservedValues[index] = value;

        var promise = this._promise;
        var callback = this._callback;
        var receiver = promise._boundValue();
        promise._pushContext();
        var ret = tryCatch(callback).call(receiver, value, index, length);
        var promiseCreated = promise._popContext();
        debug.checkForgottenReturns(
            ret,
            promiseCreated,
            preservedValues !== null ? "Promise.filter" : "Promise.map",
            promise
        );
        if (ret === errorObj) {
            this._reject(ret.e);
            return true;
        }

        var maybePromise = tryConvertToPromise(ret, this._promise);
        if (maybePromise instanceof Promise) {
            maybePromise = maybePromise._target();
            var bitField = maybePromise._bitField;
            ;
            if (((bitField & 50397184) === 0)) {
                if (limit >= 1) this._inFlight++;
                values[index] = maybePromise;
                maybePromise._proxy(this, (index + 1) * -1);
                return false;
            } else if (((bitField & 33554432) !== 0)) {
                ret = maybePromise._value();
            } else if (((bitField & 16777216) !== 0)) {
                this._reject(maybePromise._reason());
                return true;
            } else {
                this._cancel();
                return true;
            }
        }
        values[index] = ret;
    }
    var totalResolved = ++this._totalResolved;
    if (totalResolved >= length) {
        if (preservedValues !== null) {
            this._filter(values, preservedValues);
        } else {
            this._resolve(values);
        }
        return true;
    }
    return false;
};

MappingPromiseArray.prototype._drainQueue = function () {
    var queue = this._queue;
    var limit = this._limit;
    var values = this._values;
    while (queue.length > 0 && this._inFlight < limit) {
        if (this._isResolved()) return;
        var index = queue.pop();
        this._promiseFulfilled(values[index], index);
    }
};

MappingPromiseArray.prototype._filter = function (booleans, values) {
    var len = values.length;
    var ret = new Array(len);
    var j = 0;
    for (var i = 0; i < len; ++i) {
        if (booleans[i]) ret[j++] = values[i];
    }
    ret.length = j;
    this._resolve(ret);
};

MappingPromiseArray.prototype.preservedValues = function () {
    return this._preservedValues;
};

function map(promises, fn, options, _filter) {
    if (typeof fn !== "function") {
        return apiRejection("expecting a function but got " + util.classString(fn));
    }

    var limit = 0;
    if (options !== undefined) {
        if (typeof options === "object" && options !== null) {
            if (typeof options.concurrency !== "number") {
                return Promise.reject(
                    new TypeError("'concurrency' must be a number but it is " +
                                    util.classString(options.concurrency)));
            }
            limit = options.concurrency;
        } else {
            return Promise.reject(new TypeError(
                            "options argument must be an object but it is " +
                             util.classString(options)));
        }
    }
    limit = typeof limit === "number" &&
        isFinite(limit) && limit >= 1 ? limit : 0;
    return new MappingPromiseArray(promises, fn, limit, _filter).promise();
}

Promise.prototype.map = function (fn, options) {
    return map(this, fn, options, null);
};

Promise.map = function (promises, fn, options, _filter) {
    return map(promises, fn, options, _filter);
};


};

},{"./util":36}],19:[function(_dereq_,module,exports){
"use strict";
module.exports =
function(Promise, INTERNAL, tryConvertToPromise, apiRejection, debug) {
var util = _dereq_("./util");
var tryCatch = util.tryCatch;

Promise.method = function (fn) {
    if (typeof fn !== "function") {
        throw new Promise.TypeError("expecting a function but got " + util.classString(fn));
    }
    return function () {
        var ret = new Promise(INTERNAL);
        ret._captureStackTrace();
        ret._pushContext();
        var value = tryCatch(fn).apply(this, arguments);
        var promiseCreated = ret._popContext();
        debug.checkForgottenReturns(
            value, promiseCreated, "Promise.method", ret);
        ret._resolveFromSyncValue(value);
        return ret;
    };
};

Promise.attempt = Promise["try"] = function (fn) {
    if (typeof fn !== "function") {
        return apiRejection("expecting a function but got " + util.classString(fn));
    }
    var ret = new Promise(INTERNAL);
    ret._captureStackTrace();
    ret._pushContext();
    var value;
    if (arguments.length > 1) {
        debug.deprecated("calling Promise.try with more than 1 argument");
        var arg = arguments[1];
        var ctx = arguments[2];
        value = util.isArray(arg) ? tryCatch(fn).apply(ctx, arg)
                                  : tryCatch(fn).call(ctx, arg);
    } else {
        value = tryCatch(fn)();
    }
    var promiseCreated = ret._popContext();
    debug.checkForgottenReturns(
        value, promiseCreated, "Promise.try", ret);
    ret._resolveFromSyncValue(value);
    return ret;
};

Promise.prototype._resolveFromSyncValue = function (value) {
    if (value === util.errorObj) {
        this._rejectCallback(value.e, false);
    } else {
        this._resolveCallback(value, true);
    }
};
};

},{"./util":36}],20:[function(_dereq_,module,exports){
"use strict";
var util = _dereq_("./util");
var maybeWrapAsError = util.maybeWrapAsError;
var errors = _dereq_("./errors");
var OperationalError = errors.OperationalError;
var es5 = _dereq_("./es5");

function isUntypedError(obj) {
    return obj instanceof Error &&
        es5.getPrototypeOf(obj) === Error.prototype;
}

var rErrorKey = /^(?:name|message|stack|cause)$/;
function wrapAsOperationalError(obj) {
    var ret;
    if (isUntypedError(obj)) {
        ret = new OperationalError(obj);
        ret.name = obj.name;
        ret.message = obj.message;
        ret.stack = obj.stack;
        var keys = es5.keys(obj);
        for (var i = 0; i < keys.length; ++i) {
            var key = keys[i];
            if (!rErrorKey.test(key)) {
                ret[key] = obj[key];
            }
        }
        return ret;
    }
    util.markAsOriginatingFromRejection(obj);
    return obj;
}

function nodebackForPromise(promise, multiArgs) {
    return function(err, value) {
        if (promise === null) return;
        if (err) {
            var wrapped = wrapAsOperationalError(maybeWrapAsError(err));
            promise._attachExtraTrace(wrapped);
            promise._reject(wrapped);
        } else if (!multiArgs) {
            promise._fulfill(value);
        } else {
            var args = [].slice.call(arguments, 1);;
            promise._fulfill(args);
        }
        promise = null;
    };
}

module.exports = nodebackForPromise;

},{"./errors":12,"./es5":13,"./util":36}],21:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise) {
var util = _dereq_("./util");
var async = Promise._async;
var tryCatch = util.tryCatch;
var errorObj = util.errorObj;

function spreadAdapter(val, nodeback) {
    var promise = this;
    if (!util.isArray(val)) return successAdapter.call(promise, val, nodeback);
    var ret =
        tryCatch(nodeback).apply(promise._boundValue(), [null].concat(val));
    if (ret === errorObj) {
        async.throwLater(ret.e);
    }
}

function successAdapter(val, nodeback) {
    var promise = this;
    var receiver = promise._boundValue();
    var ret = val === undefined
        ? tryCatch(nodeback).call(receiver, null)
        : tryCatch(nodeback).call(receiver, null, val);
    if (ret === errorObj) {
        async.throwLater(ret.e);
    }
}
function errorAdapter(reason, nodeback) {
    var promise = this;
    if (!reason) {
        var newReason = new Error(reason + "");
        newReason.cause = reason;
        reason = newReason;
    }
    var ret = tryCatch(nodeback).call(promise._boundValue(), reason);
    if (ret === errorObj) {
        async.throwLater(ret.e);
    }
}

Promise.prototype.asCallback = Promise.prototype.nodeify = function (nodeback,
                                                                     options) {
    if (typeof nodeback == "function") {
        var adapter = successAdapter;
        if (options !== undefined && Object(options).spread) {
            adapter = spreadAdapter;
        }
        this._then(
            adapter,
            errorAdapter,
            undefined,
            this,
            nodeback
        );
    }
    return this;
};
};

},{"./util":36}],22:[function(_dereq_,module,exports){
"use strict";
module.exports = function() {
var makeSelfResolutionError = function () {
    return new TypeError("circular promise resolution chain\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
};
var reflectHandler = function() {
    return new Promise.PromiseInspection(this._target());
};
var apiRejection = function(msg) {
    return Promise.reject(new TypeError(msg));
};
function Proxyable() {}
var UNDEFINED_BINDING = {};
var util = _dereq_("./util");

var getDomain;
if (util.isNode) {
    getDomain = function() {
        var ret = process.domain;
        if (ret === undefined) ret = null;
        return ret;
    };
} else {
    getDomain = function() {
        return null;
    };
}
util.notEnumerableProp(Promise, "_getDomain", getDomain);

var es5 = _dereq_("./es5");
var Async = _dereq_("./async");
var async = new Async();
es5.defineProperty(Promise, "_async", {value: async});
var errors = _dereq_("./errors");
var TypeError = Promise.TypeError = errors.TypeError;
Promise.RangeError = errors.RangeError;
var CancellationError = Promise.CancellationError = errors.CancellationError;
Promise.TimeoutError = errors.TimeoutError;
Promise.OperationalError = errors.OperationalError;
Promise.RejectionError = errors.OperationalError;
Promise.AggregateError = errors.AggregateError;
var INTERNAL = function(){};
var APPLY = {};
var NEXT_FILTER = {};
var tryConvertToPromise = _dereq_("./thenables")(Promise, INTERNAL);
var PromiseArray =
    _dereq_("./promise_array")(Promise, INTERNAL,
                               tryConvertToPromise, apiRejection, Proxyable);
var Context = _dereq_("./context")(Promise);
 /*jshint unused:false*/
var createContext = Context.create;
var debug = _dereq_("./debuggability")(Promise, Context);
var CapturedTrace = debug.CapturedTrace;
var PassThroughHandlerContext =
    _dereq_("./finally")(Promise, tryConvertToPromise, NEXT_FILTER);
var catchFilter = _dereq_("./catch_filter")(NEXT_FILTER);
var nodebackForPromise = _dereq_("./nodeback");
var errorObj = util.errorObj;
var tryCatch = util.tryCatch;
function check(self, executor) {
    if (self == null || self.constructor !== Promise) {
        throw new TypeError("the promise constructor cannot be invoked directly\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
    }
    if (typeof executor !== "function") {
        throw new TypeError("expecting a function but got " + util.classString(executor));
    }

}

function Promise(executor) {
    if (executor !== INTERNAL) {
        check(this, executor);
    }
    this._bitField = 0;
    this._fulfillmentHandler0 = undefined;
    this._rejectionHandler0 = undefined;
    this._promise0 = undefined;
    this._receiver0 = undefined;
    this._resolveFromExecutor(executor);
    this._promiseCreated();
    this._fireEvent("promiseCreated", this);
}

Promise.prototype.toString = function () {
    return "[object Promise]";
};

Promise.prototype.caught = Promise.prototype["catch"] = function (fn) {
    var len = arguments.length;
    if (len > 1) {
        var catchInstances = new Array(len - 1),
            j = 0, i;
        for (i = 0; i < len - 1; ++i) {
            var item = arguments[i];
            if (util.isObject(item)) {
                catchInstances[j++] = item;
            } else {
                return apiRejection("Catch statement predicate: " +
                    "expecting an object but got " + util.classString(item));
            }
        }
        catchInstances.length = j;
        fn = arguments[i];
        return this.then(undefined, catchFilter(catchInstances, fn, this));
    }
    return this.then(undefined, fn);
};

Promise.prototype.reflect = function () {
    return this._then(reflectHandler,
        reflectHandler, undefined, this, undefined);
};

Promise.prototype.then = function (didFulfill, didReject) {
    if (debug.warnings() && arguments.length > 0 &&
        typeof didFulfill !== "function" &&
        typeof didReject !== "function") {
        var msg = ".then() only accepts functions but was passed: " +
                util.classString(didFulfill);
        if (arguments.length > 1) {
            msg += ", " + util.classString(didReject);
        }
        this._warn(msg);
    }
    return this._then(didFulfill, didReject, undefined, undefined, undefined);
};

Promise.prototype.done = function (didFulfill, didReject) {
    var promise =
        this._then(didFulfill, didReject, undefined, undefined, undefined);
    promise._setIsFinal();
};

Promise.prototype.spread = function (fn) {
    if (typeof fn !== "function") {
        return apiRejection("expecting a function but got " + util.classString(fn));
    }
    return this.all()._then(fn, undefined, undefined, APPLY, undefined);
};

Promise.prototype.toJSON = function () {
    var ret = {
        isFulfilled: false,
        isRejected: false,
        fulfillmentValue: undefined,
        rejectionReason: undefined
    };
    if (this.isFulfilled()) {
        ret.fulfillmentValue = this.value();
        ret.isFulfilled = true;
    } else if (this.isRejected()) {
        ret.rejectionReason = this.reason();
        ret.isRejected = true;
    }
    return ret;
};

Promise.prototype.all = function () {
    if (arguments.length > 0) {
        this._warn(".all() was passed arguments but it does not take any");
    }
    return new PromiseArray(this).promise();
};

Promise.prototype.error = function (fn) {
    return this.caught(util.originatesFromRejection, fn);
};

Promise.getNewLibraryCopy = module.exports;

Promise.is = function (val) {
    return val instanceof Promise;
};

Promise.fromNode = Promise.fromCallback = function(fn) {
    var ret = new Promise(INTERNAL);
    ret._captureStackTrace();
    var multiArgs = arguments.length > 1 ? !!Object(arguments[1]).multiArgs
                                         : false;
    var result = tryCatch(fn)(nodebackForPromise(ret, multiArgs));
    if (result === errorObj) {
        ret._rejectCallback(result.e, true);
    }
    if (!ret._isFateSealed()) ret._setAsyncGuaranteed();
    return ret;
};

Promise.all = function (promises) {
    return new PromiseArray(promises).promise();
};

Promise.cast = function (obj) {
    var ret = tryConvertToPromise(obj);
    if (!(ret instanceof Promise)) {
        ret = new Promise(INTERNAL);
        ret._captureStackTrace();
        ret._setFulfilled();
        ret._rejectionHandler0 = obj;
    }
    return ret;
};

Promise.resolve = Promise.fulfilled = Promise.cast;

Promise.reject = Promise.rejected = function (reason) {
    var ret = new Promise(INTERNAL);
    ret._captureStackTrace();
    ret._rejectCallback(reason, true);
    return ret;
};

Promise.setScheduler = function(fn) {
    if (typeof fn !== "function") {
        throw new TypeError("expecting a function but got " + util.classString(fn));
    }
    return async.setScheduler(fn);
};

Promise.prototype._then = function (
    didFulfill,
    didReject,
    _,    receiver,
    internalData
) {
    var haveInternalData = internalData !== undefined;
    var promise = haveInternalData ? internalData : new Promise(INTERNAL);
    var target = this._target();
    var bitField = target._bitField;

    if (!haveInternalData) {
        promise._propagateFrom(this, 3);
        promise._captureStackTrace();
        if (receiver === undefined &&
            ((this._bitField & 2097152) !== 0)) {
            if (!((bitField & 50397184) === 0)) {
                receiver = this._boundValue();
            } else {
                receiver = target === this ? undefined : this._boundTo;
            }
        }
        this._fireEvent("promiseChained", this, promise);
    }

    var domain = getDomain();
    if (!((bitField & 50397184) === 0)) {
        var handler, value, settler = target._settlePromiseCtx;
        if (((bitField & 33554432) !== 0)) {
            value = target._rejectionHandler0;
            handler = didFulfill;
        } else if (((bitField & 16777216) !== 0)) {
            value = target._fulfillmentHandler0;
            handler = didReject;
            target._unsetRejectionIsUnhandled();
        } else {
            settler = target._settlePromiseLateCancellationObserver;
            value = new CancellationError("late cancellation observer");
            target._attachExtraTrace(value);
            handler = didReject;
        }

        async.invoke(settler, target, {
            handler: domain === null ? handler
                : (typeof handler === "function" &&
                    util.domainBind(domain, handler)),
            promise: promise,
            receiver: receiver,
            value: value
        });
    } else {
        target._addCallbacks(didFulfill, didReject, promise, receiver, domain);
    }

    return promise;
};

Promise.prototype._length = function () {
    return this._bitField & 65535;
};

Promise.prototype._isFateSealed = function () {
    return (this._bitField & 117506048) !== 0;
};

Promise.prototype._isFollowing = function () {
    return (this._bitField & 67108864) === 67108864;
};

Promise.prototype._setLength = function (len) {
    this._bitField = (this._bitField & -65536) |
        (len & 65535);
};

Promise.prototype._setFulfilled = function () {
    this._bitField = this._bitField | 33554432;
    this._fireEvent("promiseFulfilled", this);
};

Promise.prototype._setRejected = function () {
    this._bitField = this._bitField | 16777216;
    this._fireEvent("promiseRejected", this);
};

Promise.prototype._setFollowing = function () {
    this._bitField = this._bitField | 67108864;
    this._fireEvent("promiseResolved", this);
};

Promise.prototype._setIsFinal = function () {
    this._bitField = this._bitField | 4194304;
};

Promise.prototype._isFinal = function () {
    return (this._bitField & 4194304) > 0;
};

Promise.prototype._unsetCancelled = function() {
    this._bitField = this._bitField & (~65536);
};

Promise.prototype._setCancelled = function() {
    this._bitField = this._bitField | 65536;
    this._fireEvent("promiseCancelled", this);
};

Promise.prototype._setWillBeCancelled = function() {
    this._bitField = this._bitField | 8388608;
};

Promise.prototype._setAsyncGuaranteed = function() {
    if (async.hasCustomScheduler()) return;
    this._bitField = this._bitField | 134217728;
};

Promise.prototype._receiverAt = function (index) {
    var ret = index === 0 ? this._receiver0 : this[
            index * 4 - 4 + 3];
    if (ret === UNDEFINED_BINDING) {
        return undefined;
    } else if (ret === undefined && this._isBound()) {
        return this._boundValue();
    }
    return ret;
};

Promise.prototype._promiseAt = function (index) {
    return this[
            index * 4 - 4 + 2];
};

Promise.prototype._fulfillmentHandlerAt = function (index) {
    return this[
            index * 4 - 4 + 0];
};

Promise.prototype._rejectionHandlerAt = function (index) {
    return this[
            index * 4 - 4 + 1];
};

Promise.prototype._boundValue = function() {};

Promise.prototype._migrateCallback0 = function (follower) {
    var bitField = follower._bitField;
    var fulfill = follower._fulfillmentHandler0;
    var reject = follower._rejectionHandler0;
    var promise = follower._promise0;
    var receiver = follower._receiverAt(0);
    if (receiver === undefined) receiver = UNDEFINED_BINDING;
    this._addCallbacks(fulfill, reject, promise, receiver, null);
};

Promise.prototype._migrateCallbackAt = function (follower, index) {
    var fulfill = follower._fulfillmentHandlerAt(index);
    var reject = follower._rejectionHandlerAt(index);
    var promise = follower._promiseAt(index);
    var receiver = follower._receiverAt(index);
    if (receiver === undefined) receiver = UNDEFINED_BINDING;
    this._addCallbacks(fulfill, reject, promise, receiver, null);
};

Promise.prototype._addCallbacks = function (
    fulfill,
    reject,
    promise,
    receiver,
    domain
) {
    var index = this._length();

    if (index >= 65535 - 4) {
        index = 0;
        this._setLength(0);
    }

    if (index === 0) {
        this._promise0 = promise;
        this._receiver0 = receiver;
        if (typeof fulfill === "function") {
            this._fulfillmentHandler0 =
                domain === null ? fulfill : util.domainBind(domain, fulfill);
        }
        if (typeof reject === "function") {
            this._rejectionHandler0 =
                domain === null ? reject : util.domainBind(domain, reject);
        }
    } else {
        var base = index * 4 - 4;
        this[base + 2] = promise;
        this[base + 3] = receiver;
        if (typeof fulfill === "function") {
            this[base + 0] =
                domain === null ? fulfill : util.domainBind(domain, fulfill);
        }
        if (typeof reject === "function") {
            this[base + 1] =
                domain === null ? reject : util.domainBind(domain, reject);
        }
    }
    this._setLength(index + 1);
    return index;
};

Promise.prototype._proxy = function (proxyable, arg) {
    this._addCallbacks(undefined, undefined, arg, proxyable, null);
};

Promise.prototype._resolveCallback = function(value, shouldBind) {
    if (((this._bitField & 117506048) !== 0)) return;
    if (value === this)
        return this._rejectCallback(makeSelfResolutionError(), false);
    var maybePromise = tryConvertToPromise(value, this);
    if (!(maybePromise instanceof Promise)) return this._fulfill(value);

    if (shouldBind) this._propagateFrom(maybePromise, 2);

    var promise = maybePromise._target();

    if (promise === this) {
        this._reject(makeSelfResolutionError());
        return;
    }

    var bitField = promise._bitField;
    if (((bitField & 50397184) === 0)) {
        var len = this._length();
        if (len > 0) promise._migrateCallback0(this);
        for (var i = 1; i < len; ++i) {
            promise._migrateCallbackAt(this, i);
        }
        this._setFollowing();
        this._setLength(0);
        this._setFollowee(promise);
    } else if (((bitField & 33554432) !== 0)) {
        this._fulfill(promise._value());
    } else if (((bitField & 16777216) !== 0)) {
        this._reject(promise._reason());
    } else {
        var reason = new CancellationError("late cancellation observer");
        promise._attachExtraTrace(reason);
        this._reject(reason);
    }
};

Promise.prototype._rejectCallback =
function(reason, synchronous, ignoreNonErrorWarnings) {
    var trace = util.ensureErrorObject(reason);
    var hasStack = trace === reason;
    if (!hasStack && !ignoreNonErrorWarnings && debug.warnings()) {
        var message = "a promise was rejected with a non-error: " +
            util.classString(reason);
        this._warn(message, true);
    }
    this._attachExtraTrace(trace, synchronous ? hasStack : false);
    this._reject(reason);
};

Promise.prototype._resolveFromExecutor = function (executor) {
    if (executor === INTERNAL) return;
    var promise = this;
    this._captureStackTrace();
    this._pushContext();
    var synchronous = true;
    var r = this._execute(executor, function(value) {
        promise._resolveCallback(value);
    }, function (reason) {
        promise._rejectCallback(reason, synchronous);
    });
    synchronous = false;
    this._popContext();

    if (r !== undefined) {
        promise._rejectCallback(r, true);
    }
};

Promise.prototype._settlePromiseFromHandler = function (
    handler, receiver, value, promise
) {
    var bitField = promise._bitField;
    if (((bitField & 65536) !== 0)) return;
    promise._pushContext();
    var x;
    if (receiver === APPLY) {
        if (!value || typeof value.length !== "number") {
            x = errorObj;
            x.e = new TypeError("cannot .spread() a non-array: " +
                                    util.classString(value));
        } else {
            x = tryCatch(handler).apply(this._boundValue(), value);
        }
    } else {
        x = tryCatch(handler).call(receiver, value);
    }
    var promiseCreated = promise._popContext();
    bitField = promise._bitField;
    if (((bitField & 65536) !== 0)) return;

    if (x === NEXT_FILTER) {
        promise._reject(value);
    } else if (x === errorObj) {
        promise._rejectCallback(x.e, false);
    } else {
        debug.checkForgottenReturns(x, promiseCreated, "",  promise, this);
        promise._resolveCallback(x);
    }
};

Promise.prototype._target = function() {
    var ret = this;
    while (ret._isFollowing()) ret = ret._followee();
    return ret;
};

Promise.prototype._followee = function() {
    return this._rejectionHandler0;
};

Promise.prototype._setFollowee = function(promise) {
    this._rejectionHandler0 = promise;
};

Promise.prototype._settlePromise = function(promise, handler, receiver, value) {
    var isPromise = promise instanceof Promise;
    var bitField = this._bitField;
    var asyncGuaranteed = ((bitField & 134217728) !== 0);
    if (((bitField & 65536) !== 0)) {
        if (isPromise) promise._invokeInternalOnCancel();

        if (receiver instanceof PassThroughHandlerContext &&
            receiver.isFinallyHandler()) {
            receiver.cancelPromise = promise;
            if (tryCatch(handler).call(receiver, value) === errorObj) {
                promise._reject(errorObj.e);
            }
        } else if (handler === reflectHandler) {
            promise._fulfill(reflectHandler.call(receiver));
        } else if (receiver instanceof Proxyable) {
            receiver._promiseCancelled(promise);
        } else if (isPromise || promise instanceof PromiseArray) {
            promise._cancel();
        } else {
            receiver.cancel();
        }
    } else if (typeof handler === "function") {
        if (!isPromise) {
            handler.call(receiver, value, promise);
        } else {
            if (asyncGuaranteed) promise._setAsyncGuaranteed();
            this._settlePromiseFromHandler(handler, receiver, value, promise);
        }
    } else if (receiver instanceof Proxyable) {
        if (!receiver._isResolved()) {
            if (((bitField & 33554432) !== 0)) {
                receiver._promiseFulfilled(value, promise);
            } else {
                receiver._promiseRejected(value, promise);
            }
        }
    } else if (isPromise) {
        if (asyncGuaranteed) promise._setAsyncGuaranteed();
        if (((bitField & 33554432) !== 0)) {
            promise._fulfill(value);
        } else {
            promise._reject(value);
        }
    }
};

Promise.prototype._settlePromiseLateCancellationObserver = function(ctx) {
    var handler = ctx.handler;
    var promise = ctx.promise;
    var receiver = ctx.receiver;
    var value = ctx.value;
    if (typeof handler === "function") {
        if (!(promise instanceof Promise)) {
            handler.call(receiver, value, promise);
        } else {
            this._settlePromiseFromHandler(handler, receiver, value, promise);
        }
    } else if (promise instanceof Promise) {
        promise._reject(value);
    }
};

Promise.prototype._settlePromiseCtx = function(ctx) {
    this._settlePromise(ctx.promise, ctx.handler, ctx.receiver, ctx.value);
};

Promise.prototype._settlePromise0 = function(handler, value, bitField) {
    var promise = this._promise0;
    var receiver = this._receiverAt(0);
    this._promise0 = undefined;
    this._receiver0 = undefined;
    this._settlePromise(promise, handler, receiver, value);
};

Promise.prototype._clearCallbackDataAtIndex = function(index) {
    var base = index * 4 - 4;
    this[base + 2] =
    this[base + 3] =
    this[base + 0] =
    this[base + 1] = undefined;
};

Promise.prototype._fulfill = function (value) {
    var bitField = this._bitField;
    if (((bitField & 117506048) >>> 16)) return;
    if (value === this) {
        var err = makeSelfResolutionError();
        this._attachExtraTrace(err);
        return this._reject(err);
    }
    this._setFulfilled();
    this._rejectionHandler0 = value;

    if ((bitField & 65535) > 0) {
        if (((bitField & 134217728) !== 0)) {
            this._settlePromises();
        } else {
            async.settlePromises(this);
        }
    }
};

Promise.prototype._reject = function (reason) {
    var bitField = this._bitField;
    if (((bitField & 117506048) >>> 16)) return;
    this._setRejected();
    this._fulfillmentHandler0 = reason;

    if (this._isFinal()) {
        return async.fatalError(reason, util.isNode);
    }

    if ((bitField & 65535) > 0) {
        async.settlePromises(this);
    } else {
        this._ensurePossibleRejectionHandled();
    }
};

Promise.prototype._fulfillPromises = function (len, value) {
    for (var i = 1; i < len; i++) {
        var handler = this._fulfillmentHandlerAt(i);
        var promise = this._promiseAt(i);
        var receiver = this._receiverAt(i);
        this._clearCallbackDataAtIndex(i);
        this._settlePromise(promise, handler, receiver, value);
    }
};

Promise.prototype._rejectPromises = function (len, reason) {
    for (var i = 1; i < len; i++) {
        var handler = this._rejectionHandlerAt(i);
        var promise = this._promiseAt(i);
        var receiver = this._receiverAt(i);
        this._clearCallbackDataAtIndex(i);
        this._settlePromise(promise, handler, receiver, reason);
    }
};

Promise.prototype._settlePromises = function () {
    var bitField = this._bitField;
    var len = (bitField & 65535);

    if (len > 0) {
        if (((bitField & 16842752) !== 0)) {
            var reason = this._fulfillmentHandler0;
            this._settlePromise0(this._rejectionHandler0, reason, bitField);
            this._rejectPromises(len, reason);
        } else {
            var value = this._rejectionHandler0;
            this._settlePromise0(this._fulfillmentHandler0, value, bitField);
            this._fulfillPromises(len, value);
        }
        this._setLength(0);
    }
    this._clearCancellationData();
};

Promise.prototype._settledValue = function() {
    var bitField = this._bitField;
    if (((bitField & 33554432) !== 0)) {
        return this._rejectionHandler0;
    } else if (((bitField & 16777216) !== 0)) {
        return this._fulfillmentHandler0;
    }
};

function deferResolve(v) {this.promise._resolveCallback(v);}
function deferReject(v) {this.promise._rejectCallback(v, false);}

Promise.defer = Promise.pending = function() {
    debug.deprecated("Promise.defer", "new Promise");
    var promise = new Promise(INTERNAL);
    return {
        promise: promise,
        resolve: deferResolve,
        reject: deferReject
    };
};

util.notEnumerableProp(Promise,
                       "_makeSelfResolutionError",
                       makeSelfResolutionError);

_dereq_("./method")(Promise, INTERNAL, tryConvertToPromise, apiRejection,
    debug);
_dereq_("./bind")(Promise, INTERNAL, tryConvertToPromise, debug);
_dereq_("./cancel")(Promise, PromiseArray, apiRejection, debug);
_dereq_("./direct_resolve")(Promise);
_dereq_("./synchronous_inspection")(Promise);
_dereq_("./join")(
    Promise, PromiseArray, tryConvertToPromise, INTERNAL, async, getDomain);
Promise.Promise = Promise;
Promise.version = "3.5.0";
_dereq_('./map.js')(Promise, PromiseArray, apiRejection, tryConvertToPromise, INTERNAL, debug);
_dereq_('./call_get.js')(Promise);
_dereq_('./using.js')(Promise, apiRejection, tryConvertToPromise, createContext, INTERNAL, debug);
_dereq_('./timers.js')(Promise, INTERNAL, debug);
_dereq_('./generators.js')(Promise, apiRejection, INTERNAL, tryConvertToPromise, Proxyable, debug);
_dereq_('./nodeify.js')(Promise);
_dereq_('./promisify.js')(Promise, INTERNAL);
_dereq_('./props.js')(Promise, PromiseArray, tryConvertToPromise, apiRejection);
_dereq_('./race.js')(Promise, INTERNAL, tryConvertToPromise, apiRejection);
_dereq_('./reduce.js')(Promise, PromiseArray, apiRejection, tryConvertToPromise, INTERNAL, debug);
_dereq_('./settle.js')(Promise, PromiseArray, debug);
_dereq_('./some.js')(Promise, PromiseArray, apiRejection);
_dereq_('./filter.js')(Promise, INTERNAL);
_dereq_('./each.js')(Promise, INTERNAL);
_dereq_('./any.js')(Promise);
                                                         
    util.toFastProperties(Promise);                                          
    util.toFastProperties(Promise.prototype);                                
    function fillTypes(value) {                                              
        var p = new Promise(INTERNAL);                                       
        p._fulfillmentHandler0 = value;                                      
        p._rejectionHandler0 = value;                                        
        p._promise0 = value;                                                 
        p._receiver0 = value;                                                
    }                                                                        
    // Complete slack tracking, opt out of field-type tracking and           
    // stabilize map                                                         
    fillTypes({a: 1});                                                       
    fillTypes({b: 2});                                                       
    fillTypes({c: 3});                                                       
    fillTypes(1);                                                            
    fillTypes(function(){});                                                 
    fillTypes(undefined);                                                    
    fillTypes(false);                                                        
    fillTypes(new Promise(INTERNAL));                                        
    debug.setBounds(Async.firstLineError, util.lastLineError);               
    return Promise;                                                          

};

},{"./any.js":1,"./async":2,"./bind":3,"./call_get.js":5,"./cancel":6,"./catch_filter":7,"./context":8,"./debuggability":9,"./direct_resolve":10,"./each.js":11,"./errors":12,"./es5":13,"./filter.js":14,"./finally":15,"./generators.js":16,"./join":17,"./map.js":18,"./method":19,"./nodeback":20,"./nodeify.js":21,"./promise_array":23,"./promisify.js":24,"./props.js":25,"./race.js":27,"./reduce.js":28,"./settle.js":30,"./some.js":31,"./synchronous_inspection":32,"./thenables":33,"./timers.js":34,"./using.js":35,"./util":36}],23:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise, INTERNAL, tryConvertToPromise,
    apiRejection, Proxyable) {
var util = _dereq_("./util");
var isArray = util.isArray;

function toResolutionValue(val) {
    switch(val) {
    case -2: return [];
    case -3: return {};
    case -6: return new Map();
    }
}

function PromiseArray(values) {
    var promise = this._promise = new Promise(INTERNAL);
    if (values instanceof Promise) {
        promise._propagateFrom(values, 3);
    }
    promise._setOnCancel(this);
    this._values = values;
    this._length = 0;
    this._totalResolved = 0;
    this._init(undefined, -2);
}
util.inherits(PromiseArray, Proxyable);

PromiseArray.prototype.length = function () {
    return this._length;
};

PromiseArray.prototype.promise = function () {
    return this._promise;
};

PromiseArray.prototype._init = function init(_, resolveValueIfEmpty) {
    var values = tryConvertToPromise(this._values, this._promise);
    if (values instanceof Promise) {
        values = values._target();
        var bitField = values._bitField;
        ;
        this._values = values;

        if (((bitField & 50397184) === 0)) {
            this._promise._setAsyncGuaranteed();
            return values._then(
                init,
                this._reject,
                undefined,
                this,
                resolveValueIfEmpty
           );
        } else if (((bitField & 33554432) !== 0)) {
            values = values._value();
        } else if (((bitField & 16777216) !== 0)) {
            return this._reject(values._reason());
        } else {
            return this._cancel();
        }
    }
    values = util.asArray(values);
    if (values === null) {
        var err = apiRejection(
            "expecting an array or an iterable object but got " + util.classString(values)).reason();
        this._promise._rejectCallback(err, false);
        return;
    }

    if (values.length === 0) {
        if (resolveValueIfEmpty === -5) {
            this._resolveEmptyArray();
        }
        else {
            this._resolve(toResolutionValue(resolveValueIfEmpty));
        }
        return;
    }
    this._iterate(values);
};

PromiseArray.prototype._iterate = function(values) {
    var len = this.getActualLength(values.length);
    this._length = len;
    this._values = this.shouldCopyValues() ? new Array(len) : this._values;
    var result = this._promise;
    var isResolved = false;
    var bitField = null;
    for (var i = 0; i < len; ++i) {
        var maybePromise = tryConvertToPromise(values[i], result);

        if (maybePromise instanceof Promise) {
            maybePromise = maybePromise._target();
            bitField = maybePromise._bitField;
        } else {
            bitField = null;
        }

        if (isResolved) {
            if (bitField !== null) {
                maybePromise.suppressUnhandledRejections();
            }
        } else if (bitField !== null) {
            if (((bitField & 50397184) === 0)) {
                maybePromise._proxy(this, i);
                this._values[i] = maybePromise;
            } else if (((bitField & 33554432) !== 0)) {
                isResolved = this._promiseFulfilled(maybePromise._value(), i);
            } else if (((bitField & 16777216) !== 0)) {
                isResolved = this._promiseRejected(maybePromise._reason(), i);
            } else {
                isResolved = this._promiseCancelled(i);
            }
        } else {
            isResolved = this._promiseFulfilled(maybePromise, i);
        }
    }
    if (!isResolved) result._setAsyncGuaranteed();
};

PromiseArray.prototype._isResolved = function () {
    return this._values === null;
};

PromiseArray.prototype._resolve = function (value) {
    this._values = null;
    this._promise._fulfill(value);
};

PromiseArray.prototype._cancel = function() {
    if (this._isResolved() || !this._promise._isCancellable()) return;
    this._values = null;
    this._promise._cancel();
};

PromiseArray.prototype._reject = function (reason) {
    this._values = null;
    this._promise._rejectCallback(reason, false);
};

PromiseArray.prototype._promiseFulfilled = function (value, index) {
    this._values[index] = value;
    var totalResolved = ++this._totalResolved;
    if (totalResolved >= this._length) {
        this._resolve(this._values);
        return true;
    }
    return false;
};

PromiseArray.prototype._promiseCancelled = function() {
    this._cancel();
    return true;
};

PromiseArray.prototype._promiseRejected = function (reason) {
    this._totalResolved++;
    this._reject(reason);
    return true;
};

PromiseArray.prototype._resultCancelled = function() {
    if (this._isResolved()) return;
    var values = this._values;
    this._cancel();
    if (values instanceof Promise) {
        values.cancel();
    } else {
        for (var i = 0; i < values.length; ++i) {
            if (values[i] instanceof Promise) {
                values[i].cancel();
            }
        }
    }
};

PromiseArray.prototype.shouldCopyValues = function () {
    return true;
};

PromiseArray.prototype.getActualLength = function (len) {
    return len;
};

return PromiseArray;
};

},{"./util":36}],24:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise, INTERNAL) {
var THIS = {};
var util = _dereq_("./util");
var nodebackForPromise = _dereq_("./nodeback");
var withAppended = util.withAppended;
var maybeWrapAsError = util.maybeWrapAsError;
var canEvaluate = util.canEvaluate;
var TypeError = _dereq_("./errors").TypeError;
var defaultSuffix = "Async";
var defaultPromisified = {__isPromisified__: true};
var noCopyProps = [
    "arity",    "length",
    "name",
    "arguments",
    "caller",
    "callee",
    "prototype",
    "__isPromisified__"
];
var noCopyPropsPattern = new RegExp("^(?:" + noCopyProps.join("|") + ")$");

var defaultFilter = function(name) {
    return util.isIdentifier(name) &&
        name.charAt(0) !== "_" &&
        name !== "constructor";
};

function propsFilter(key) {
    return !noCopyPropsPattern.test(key);
}

function isPromisified(fn) {
    try {
        return fn.__isPromisified__ === true;
    }
    catch (e) {
        return false;
    }
}

function hasPromisified(obj, key, suffix) {
    var val = util.getDataPropertyOrDefault(obj, key + suffix,
                                            defaultPromisified);
    return val ? isPromisified(val) : false;
}
function checkValid(ret, suffix, suffixRegexp) {
    for (var i = 0; i < ret.length; i += 2) {
        var key = ret[i];
        if (suffixRegexp.test(key)) {
            var keyWithoutAsyncSuffix = key.replace(suffixRegexp, "");
            for (var j = 0; j < ret.length; j += 2) {
                if (ret[j] === keyWithoutAsyncSuffix) {
                    throw new TypeError("Cannot promisify an API that has normal methods with '%s'-suffix\u000a\u000a    See http://goo.gl/MqrFmX\u000a"
                        .replace("%s", suffix));
                }
            }
        }
    }
}

function promisifiableMethods(obj, suffix, suffixRegexp, filter) {
    var keys = util.inheritedDataKeys(obj);
    var ret = [];
    for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        var value = obj[key];
        var passesDefaultFilter = filter === defaultFilter
            ? true : defaultFilter(key, value, obj);
        if (typeof value === "function" &&
            !isPromisified(value) &&
            !hasPromisified(obj, key, suffix) &&
            filter(key, value, obj, passesDefaultFilter)) {
            ret.push(key, value);
        }
    }
    checkValid(ret, suffix, suffixRegexp);
    return ret;
}

var escapeIdentRegex = function(str) {
    return str.replace(/([$])/, "\\$");
};

var makeNodePromisifiedEval;
if (!true) {
var switchCaseArgumentOrder = function(likelyArgumentCount) {
    var ret = [likelyArgumentCount];
    var min = Math.max(0, likelyArgumentCount - 1 - 3);
    for(var i = likelyArgumentCount - 1; i >= min; --i) {
        ret.push(i);
    }
    for(var i = likelyArgumentCount + 1; i <= 3; ++i) {
        ret.push(i);
    }
    return ret;
};

var argumentSequence = function(argumentCount) {
    return util.filledRange(argumentCount, "_arg", "");
};

var parameterDeclaration = function(parameterCount) {
    return util.filledRange(
        Math.max(parameterCount, 3), "_arg", "");
};

var parameterCount = function(fn) {
    if (typeof fn.length === "number") {
        return Math.max(Math.min(fn.length, 1023 + 1), 0);
    }
    return 0;
};

makeNodePromisifiedEval =
function(callback, receiver, originalName, fn, _, multiArgs) {
    var newParameterCount = Math.max(0, parameterCount(fn) - 1);
    var argumentOrder = switchCaseArgumentOrder(newParameterCount);
    var shouldProxyThis = typeof callback === "string" || receiver === THIS;

    function generateCallForArgumentCount(count) {
        var args = argumentSequence(count).join(", ");
        var comma = count > 0 ? ", " : "";
        var ret;
        if (shouldProxyThis) {
            ret = "ret = callback.call(this, {{args}}, nodeback); break;\n";
        } else {
            ret = receiver === undefined
                ? "ret = callback({{args}}, nodeback); break;\n"
                : "ret = callback.call(receiver, {{args}}, nodeback); break;\n";
        }
        return ret.replace("{{args}}", args).replace(", ", comma);
    }

    function generateArgumentSwitchCase() {
        var ret = "";
        for (var i = 0; i < argumentOrder.length; ++i) {
            ret += "case " + argumentOrder[i] +":" +
                generateCallForArgumentCount(argumentOrder[i]);
        }

        ret += "                                                             \n\
        default:                                                             \n\
            var args = new Array(len + 1);                                   \n\
            var i = 0;                                                       \n\
            for (var i = 0; i < len; ++i) {                                  \n\
               args[i] = arguments[i];                                       \n\
            }                                                                \n\
            args[i] = nodeback;                                              \n\
            [CodeForCall]                                                    \n\
            break;                                                           \n\
        ".replace("[CodeForCall]", (shouldProxyThis
                                ? "ret = callback.apply(this, args);\n"
                                : "ret = callback.apply(receiver, args);\n"));
        return ret;
    }

    var getFunctionCode = typeof callback === "string"
                                ? ("this != null ? this['"+callback+"'] : fn")
                                : "fn";
    var body = "'use strict';                                                \n\
        var ret = function (Parameters) {                                    \n\
            'use strict';                                                    \n\
            var len = arguments.length;                                      \n\
            var promise = new Promise(INTERNAL);                             \n\
            promise._captureStackTrace();                                    \n\
            var nodeback = nodebackForPromise(promise, " + multiArgs + ");   \n\
            var ret;                                                         \n\
            var callback = tryCatch([GetFunctionCode]);                      \n\
            switch(len) {                                                    \n\
                [CodeForSwitchCase]                                          \n\
            }                                                                \n\
            if (ret === errorObj) {                                          \n\
                promise._rejectCallback(maybeWrapAsError(ret.e), true, true);\n\
            }                                                                \n\
            if (!promise._isFateSealed()) promise._setAsyncGuaranteed();     \n\
            return promise;                                                  \n\
        };                                                                   \n\
        notEnumerableProp(ret, '__isPromisified__', true);                   \n\
        return ret;                                                          \n\
    ".replace("[CodeForSwitchCase]", generateArgumentSwitchCase())
        .replace("[GetFunctionCode]", getFunctionCode);
    body = body.replace("Parameters", parameterDeclaration(newParameterCount));
    return new Function("Promise",
                        "fn",
                        "receiver",
                        "withAppended",
                        "maybeWrapAsError",
                        "nodebackForPromise",
                        "tryCatch",
                        "errorObj",
                        "notEnumerableProp",
                        "INTERNAL",
                        body)(
                    Promise,
                    fn,
                    receiver,
                    withAppended,
                    maybeWrapAsError,
                    nodebackForPromise,
                    util.tryCatch,
                    util.errorObj,
                    util.notEnumerableProp,
                    INTERNAL);
};
}

function makeNodePromisifiedClosure(callback, receiver, _, fn, __, multiArgs) {
    var defaultThis = (function() {return this;})();
    var method = callback;
    if (typeof method === "string") {
        callback = fn;
    }
    function promisified() {
        var _receiver = receiver;
        if (receiver === THIS) _receiver = this;
        var promise = new Promise(INTERNAL);
        promise._captureStackTrace();
        var cb = typeof method === "string" && this !== defaultThis
            ? this[method] : callback;
        var fn = nodebackForPromise(promise, multiArgs);
        try {
            cb.apply(_receiver, withAppended(arguments, fn));
        } catch(e) {
            promise._rejectCallback(maybeWrapAsError(e), true, true);
        }
        if (!promise._isFateSealed()) promise._setAsyncGuaranteed();
        return promise;
    }
    util.notEnumerableProp(promisified, "__isPromisified__", true);
    return promisified;
}

var makeNodePromisified = canEvaluate
    ? makeNodePromisifiedEval
    : makeNodePromisifiedClosure;

function promisifyAll(obj, suffix, filter, promisifier, multiArgs) {
    var suffixRegexp = new RegExp(escapeIdentRegex(suffix) + "$");
    var methods =
        promisifiableMethods(obj, suffix, suffixRegexp, filter);

    for (var i = 0, len = methods.length; i < len; i+= 2) {
        var key = methods[i];
        var fn = methods[i+1];
        var promisifiedKey = key + suffix;
        if (promisifier === makeNodePromisified) {
            obj[promisifiedKey] =
                makeNodePromisified(key, THIS, key, fn, suffix, multiArgs);
        } else {
            var promisified = promisifier(fn, function() {
                return makeNodePromisified(key, THIS, key,
                                           fn, suffix, multiArgs);
            });
            util.notEnumerableProp(promisified, "__isPromisified__", true);
            obj[promisifiedKey] = promisified;
        }
    }
    util.toFastProperties(obj);
    return obj;
}

function promisify(callback, receiver, multiArgs) {
    return makeNodePromisified(callback, receiver, undefined,
                                callback, null, multiArgs);
}

Promise.promisify = function (fn, options) {
    if (typeof fn !== "function") {
        throw new TypeError("expecting a function but got " + util.classString(fn));
    }
    if (isPromisified(fn)) {
        return fn;
    }
    options = Object(options);
    var receiver = options.context === undefined ? THIS : options.context;
    var multiArgs = !!options.multiArgs;
    var ret = promisify(fn, receiver, multiArgs);
    util.copyDescriptors(fn, ret, propsFilter);
    return ret;
};

Promise.promisifyAll = function (target, options) {
    if (typeof target !== "function" && typeof target !== "object") {
        throw new TypeError("the target of promisifyAll must be an object or a function\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
    }
    options = Object(options);
    var multiArgs = !!options.multiArgs;
    var suffix = options.suffix;
    if (typeof suffix !== "string") suffix = defaultSuffix;
    var filter = options.filter;
    if (typeof filter !== "function") filter = defaultFilter;
    var promisifier = options.promisifier;
    if (typeof promisifier !== "function") promisifier = makeNodePromisified;

    if (!util.isIdentifier(suffix)) {
        throw new RangeError("suffix must be a valid identifier\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
    }

    var keys = util.inheritedDataKeys(target);
    for (var i = 0; i < keys.length; ++i) {
        var value = target[keys[i]];
        if (keys[i] !== "constructor" &&
            util.isClass(value)) {
            promisifyAll(value.prototype, suffix, filter, promisifier,
                multiArgs);
            promisifyAll(value, suffix, filter, promisifier, multiArgs);
        }
    }

    return promisifyAll(target, suffix, filter, promisifier, multiArgs);
};
};


},{"./errors":12,"./nodeback":20,"./util":36}],25:[function(_dereq_,module,exports){
"use strict";
module.exports = function(
    Promise, PromiseArray, tryConvertToPromise, apiRejection) {
var util = _dereq_("./util");
var isObject = util.isObject;
var es5 = _dereq_("./es5");
var Es6Map;
if (typeof Map === "function") Es6Map = Map;

var mapToEntries = (function() {
    var index = 0;
    var size = 0;

    function extractEntry(value, key) {
        this[index] = value;
        this[index + size] = key;
        index++;
    }

    return function mapToEntries(map) {
        size = map.size;
        index = 0;
        var ret = new Array(map.size * 2);
        map.forEach(extractEntry, ret);
        return ret;
    };
})();

var entriesToMap = function(entries) {
    var ret = new Es6Map();
    var length = entries.length / 2 | 0;
    for (var i = 0; i < length; ++i) {
        var key = entries[length + i];
        var value = entries[i];
        ret.set(key, value);
    }
    return ret;
};

function PropertiesPromiseArray(obj) {
    var isMap = false;
    var entries;
    if (Es6Map !== undefined && obj instanceof Es6Map) {
        entries = mapToEntries(obj);
        isMap = true;
    } else {
        var keys = es5.keys(obj);
        var len = keys.length;
        entries = new Array(len * 2);
        for (var i = 0; i < len; ++i) {
            var key = keys[i];
            entries[i] = obj[key];
            entries[i + len] = key;
        }
    }
    this.constructor$(entries);
    this._isMap = isMap;
    this._init$(undefined, isMap ? -6 : -3);
}
util.inherits(PropertiesPromiseArray, PromiseArray);

PropertiesPromiseArray.prototype._init = function () {};

PropertiesPromiseArray.prototype._promiseFulfilled = function (value, index) {
    this._values[index] = value;
    var totalResolved = ++this._totalResolved;
    if (totalResolved >= this._length) {
        var val;
        if (this._isMap) {
            val = entriesToMap(this._values);
        } else {
            val = {};
            var keyOffset = this.length();
            for (var i = 0, len = this.length(); i < len; ++i) {
                val[this._values[i + keyOffset]] = this._values[i];
            }
        }
        this._resolve(val);
        return true;
    }
    return false;
};

PropertiesPromiseArray.prototype.shouldCopyValues = function () {
    return false;
};

PropertiesPromiseArray.prototype.getActualLength = function (len) {
    return len >> 1;
};

function props(promises) {
    var ret;
    var castValue = tryConvertToPromise(promises);

    if (!isObject(castValue)) {
        return apiRejection("cannot await properties of a non-object\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
    } else if (castValue instanceof Promise) {
        ret = castValue._then(
            Promise.props, undefined, undefined, undefined, undefined);
    } else {
        ret = new PropertiesPromiseArray(castValue).promise();
    }

    if (castValue instanceof Promise) {
        ret._propagateFrom(castValue, 2);
    }
    return ret;
}

Promise.prototype.props = function () {
    return props(this);
};

Promise.props = function (promises) {
    return props(promises);
};
};

},{"./es5":13,"./util":36}],26:[function(_dereq_,module,exports){
"use strict";
function arrayMove(src, srcIndex, dst, dstIndex, len) {
    for (var j = 0; j < len; ++j) {
        dst[j + dstIndex] = src[j + srcIndex];
        src[j + srcIndex] = void 0;
    }
}

function Queue(capacity) {
    this._capacity = capacity;
    this._length = 0;
    this._front = 0;
}

Queue.prototype._willBeOverCapacity = function (size) {
    return this._capacity < size;
};

Queue.prototype._pushOne = function (arg) {
    var length = this.length();
    this._checkCapacity(length + 1);
    var i = (this._front + length) & (this._capacity - 1);
    this[i] = arg;
    this._length = length + 1;
};

Queue.prototype.push = function (fn, receiver, arg) {
    var length = this.length() + 3;
    if (this._willBeOverCapacity(length)) {
        this._pushOne(fn);
        this._pushOne(receiver);
        this._pushOne(arg);
        return;
    }
    var j = this._front + length - 3;
    this._checkCapacity(length);
    var wrapMask = this._capacity - 1;
    this[(j + 0) & wrapMask] = fn;
    this[(j + 1) & wrapMask] = receiver;
    this[(j + 2) & wrapMask] = arg;
    this._length = length;
};

Queue.prototype.shift = function () {
    var front = this._front,
        ret = this[front];

    this[front] = undefined;
    this._front = (front + 1) & (this._capacity - 1);
    this._length--;
    return ret;
};

Queue.prototype.length = function () {
    return this._length;
};

Queue.prototype._checkCapacity = function (size) {
    if (this._capacity < size) {
        this._resizeTo(this._capacity << 1);
    }
};

Queue.prototype._resizeTo = function (capacity) {
    var oldCapacity = this._capacity;
    this._capacity = capacity;
    var front = this._front;
    var length = this._length;
    var moveItemsCount = (front + length) & (oldCapacity - 1);
    arrayMove(this, 0, this, oldCapacity, moveItemsCount);
};

module.exports = Queue;

},{}],27:[function(_dereq_,module,exports){
"use strict";
module.exports = function(
    Promise, INTERNAL, tryConvertToPromise, apiRejection) {
var util = _dereq_("./util");

var raceLater = function (promise) {
    return promise.then(function(array) {
        return race(array, promise);
    });
};

function race(promises, parent) {
    var maybePromise = tryConvertToPromise(promises);

    if (maybePromise instanceof Promise) {
        return raceLater(maybePromise);
    } else {
        promises = util.asArray(promises);
        if (promises === null)
            return apiRejection("expecting an array or an iterable object but got " + util.classString(promises));
    }

    var ret = new Promise(INTERNAL);
    if (parent !== undefined) {
        ret._propagateFrom(parent, 3);
    }
    var fulfill = ret._fulfill;
    var reject = ret._reject;
    for (var i = 0, len = promises.length; i < len; ++i) {
        var val = promises[i];

        if (val === undefined && !(i in promises)) {
            continue;
        }

        Promise.cast(val)._then(fulfill, reject, undefined, ret, null);
    }
    return ret;
}

Promise.race = function (promises) {
    return race(promises, undefined);
};

Promise.prototype.race = function () {
    return race(this, undefined);
};

};

},{"./util":36}],28:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise,
                          PromiseArray,
                          apiRejection,
                          tryConvertToPromise,
                          INTERNAL,
                          debug) {
var getDomain = Promise._getDomain;
var util = _dereq_("./util");
var tryCatch = util.tryCatch;

function ReductionPromiseArray(promises, fn, initialValue, _each) {
    this.constructor$(promises);
    var domain = getDomain();
    this._fn = domain === null ? fn : util.domainBind(domain, fn);
    if (initialValue !== undefined) {
        initialValue = Promise.resolve(initialValue);
        initialValue._attachCancellationCallback(this);
    }
    this._initialValue = initialValue;
    this._currentCancellable = null;
    if(_each === INTERNAL) {
        this._eachValues = Array(this._length);
    } else if (_each === 0) {
        this._eachValues = null;
    } else {
        this._eachValues = undefined;
    }
    this._promise._captureStackTrace();
    this._init$(undefined, -5);
}
util.inherits(ReductionPromiseArray, PromiseArray);

ReductionPromiseArray.prototype._gotAccum = function(accum) {
    if (this._eachValues !== undefined && 
        this._eachValues !== null && 
        accum !== INTERNAL) {
        this._eachValues.push(accum);
    }
};

ReductionPromiseArray.prototype._eachComplete = function(value) {
    if (this._eachValues !== null) {
        this._eachValues.push(value);
    }
    return this._eachValues;
};

ReductionPromiseArray.prototype._init = function() {};

ReductionPromiseArray.prototype._resolveEmptyArray = function() {
    this._resolve(this._eachValues !== undefined ? this._eachValues
                                                 : this._initialValue);
};

ReductionPromiseArray.prototype.shouldCopyValues = function () {
    return false;
};

ReductionPromiseArray.prototype._resolve = function(value) {
    this._promise._resolveCallback(value);
    this._values = null;
};

ReductionPromiseArray.prototype._resultCancelled = function(sender) {
    if (sender === this._initialValue) return this._cancel();
    if (this._isResolved()) return;
    this._resultCancelled$();
    if (this._currentCancellable instanceof Promise) {
        this._currentCancellable.cancel();
    }
    if (this._initialValue instanceof Promise) {
        this._initialValue.cancel();
    }
};

ReductionPromiseArray.prototype._iterate = function (values) {
    this._values = values;
    var value;
    var i;
    var length = values.length;
    if (this._initialValue !== undefined) {
        value = this._initialValue;
        i = 0;
    } else {
        value = Promise.resolve(values[0]);
        i = 1;
    }

    this._currentCancellable = value;

    if (!value.isRejected()) {
        for (; i < length; ++i) {
            var ctx = {
                accum: null,
                value: values[i],
                index: i,
                length: length,
                array: this
            };
            value = value._then(gotAccum, undefined, undefined, ctx, undefined);
        }
    }

    if (this._eachValues !== undefined) {
        value = value
            ._then(this._eachComplete, undefined, undefined, this, undefined);
    }
    value._then(completed, completed, undefined, value, this);
};

Promise.prototype.reduce = function (fn, initialValue) {
    return reduce(this, fn, initialValue, null);
};

Promise.reduce = function (promises, fn, initialValue, _each) {
    return reduce(promises, fn, initialValue, _each);
};

function completed(valueOrReason, array) {
    if (this.isFulfilled()) {
        array._resolve(valueOrReason);
    } else {
        array._reject(valueOrReason);
    }
}

function reduce(promises, fn, initialValue, _each) {
    if (typeof fn !== "function") {
        return apiRejection("expecting a function but got " + util.classString(fn));
    }
    var array = new ReductionPromiseArray(promises, fn, initialValue, _each);
    return array.promise();
}

function gotAccum(accum) {
    this.accum = accum;
    this.array._gotAccum(accum);
    var value = tryConvertToPromise(this.value, this.array._promise);
    if (value instanceof Promise) {
        this.array._currentCancellable = value;
        return value._then(gotValue, undefined, undefined, this, undefined);
    } else {
        return gotValue.call(this, value);
    }
}

function gotValue(value) {
    var array = this.array;
    var promise = array._promise;
    var fn = tryCatch(array._fn);
    promise._pushContext();
    var ret;
    if (array._eachValues !== undefined) {
        ret = fn.call(promise._boundValue(), value, this.index, this.length);
    } else {
        ret = fn.call(promise._boundValue(),
                              this.accum, value, this.index, this.length);
    }
    if (ret instanceof Promise) {
        array._currentCancellable = ret;
    }
    var promiseCreated = promise._popContext();
    debug.checkForgottenReturns(
        ret,
        promiseCreated,
        array._eachValues !== undefined ? "Promise.each" : "Promise.reduce",
        promise
    );
    return ret;
}
};

},{"./util":36}],29:[function(_dereq_,module,exports){
"use strict";
var util = _dereq_("./util");
var schedule;
var noAsyncScheduler = function() {
    throw new Error("No async scheduler available\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
};
var NativePromise = util.getNativePromise();
if (util.isNode && typeof MutationObserver === "undefined") {
    var GlobalSetImmediate = global.setImmediate;
    var ProcessNextTick = process.nextTick;
    schedule = util.isRecentNode
                ? function(fn) { GlobalSetImmediate.call(global, fn); }
                : function(fn) { ProcessNextTick.call(process, fn); };
} else if (typeof NativePromise === "function" &&
           typeof NativePromise.resolve === "function") {
    var nativePromise = NativePromise.resolve();
    schedule = function(fn) {
        nativePromise.then(fn);
    };
} else if ((typeof MutationObserver !== "undefined") &&
          !(typeof window !== "undefined" &&
            window.navigator &&
            (window.navigator.standalone || window.cordova))) {
    schedule = (function() {
        var div = document.createElement("div");
        var opts = {attributes: true};
        var toggleScheduled = false;
        var div2 = document.createElement("div");
        var o2 = new MutationObserver(function() {
            div.classList.toggle("foo");
            toggleScheduled = false;
        });
        o2.observe(div2, opts);

        var scheduleToggle = function() {
            if (toggleScheduled) return;
            toggleScheduled = true;
            div2.classList.toggle("foo");
        };

        return function schedule(fn) {
            var o = new MutationObserver(function() {
                o.disconnect();
                fn();
            });
            o.observe(div, opts);
            scheduleToggle();
        };
    })();
} else if (typeof setImmediate !== "undefined") {
    schedule = function (fn) {
        setImmediate(fn);
    };
} else if (typeof setTimeout !== "undefined") {
    schedule = function (fn) {
        setTimeout(fn, 0);
    };
} else {
    schedule = noAsyncScheduler;
}
module.exports = schedule;

},{"./util":36}],30:[function(_dereq_,module,exports){
"use strict";
module.exports =
    function(Promise, PromiseArray, debug) {
var PromiseInspection = Promise.PromiseInspection;
var util = _dereq_("./util");

function SettledPromiseArray(values) {
    this.constructor$(values);
}
util.inherits(SettledPromiseArray, PromiseArray);

SettledPromiseArray.prototype._promiseResolved = function (index, inspection) {
    this._values[index] = inspection;
    var totalResolved = ++this._totalResolved;
    if (totalResolved >= this._length) {
        this._resolve(this._values);
        return true;
    }
    return false;
};

SettledPromiseArray.prototype._promiseFulfilled = function (value, index) {
    var ret = new PromiseInspection();
    ret._bitField = 33554432;
    ret._settledValueField = value;
    return this._promiseResolved(index, ret);
};
SettledPromiseArray.prototype._promiseRejected = function (reason, index) {
    var ret = new PromiseInspection();
    ret._bitField = 16777216;
    ret._settledValueField = reason;
    return this._promiseResolved(index, ret);
};

Promise.settle = function (promises) {
    debug.deprecated(".settle()", ".reflect()");
    return new SettledPromiseArray(promises).promise();
};

Promise.prototype.settle = function () {
    return Promise.settle(this);
};
};

},{"./util":36}],31:[function(_dereq_,module,exports){
"use strict";
module.exports =
function(Promise, PromiseArray, apiRejection) {
var util = _dereq_("./util");
var RangeError = _dereq_("./errors").RangeError;
var AggregateError = _dereq_("./errors").AggregateError;
var isArray = util.isArray;
var CANCELLATION = {};


function SomePromiseArray(values) {
    this.constructor$(values);
    this._howMany = 0;
    this._unwrap = false;
    this._initialized = false;
}
util.inherits(SomePromiseArray, PromiseArray);

SomePromiseArray.prototype._init = function () {
    if (!this._initialized) {
        return;
    }
    if (this._howMany === 0) {
        this._resolve([]);
        return;
    }
    this._init$(undefined, -5);
    var isArrayResolved = isArray(this._values);
    if (!this._isResolved() &&
        isArrayResolved &&
        this._howMany > this._canPossiblyFulfill()) {
        this._reject(this._getRangeError(this.length()));
    }
};

SomePromiseArray.prototype.init = function () {
    this._initialized = true;
    this._init();
};

SomePromiseArray.prototype.setUnwrap = function () {
    this._unwrap = true;
};

SomePromiseArray.prototype.howMany = function () {
    return this._howMany;
};

SomePromiseArray.prototype.setHowMany = function (count) {
    this._howMany = count;
};

SomePromiseArray.prototype._promiseFulfilled = function (value) {
    this._addFulfilled(value);
    if (this._fulfilled() === this.howMany()) {
        this._values.length = this.howMany();
        if (this.howMany() === 1 && this._unwrap) {
            this._resolve(this._values[0]);
        } else {
            this._resolve(this._values);
        }
        return true;
    }
    return false;

};
SomePromiseArray.prototype._promiseRejected = function (reason) {
    this._addRejected(reason);
    return this._checkOutcome();
};

SomePromiseArray.prototype._promiseCancelled = function () {
    if (this._values instanceof Promise || this._values == null) {
        return this._cancel();
    }
    this._addRejected(CANCELLATION);
    return this._checkOutcome();
};

SomePromiseArray.prototype._checkOutcome = function() {
    if (this.howMany() > this._canPossiblyFulfill()) {
        var e = new AggregateError();
        for (var i = this.length(); i < this._values.length; ++i) {
            if (this._values[i] !== CANCELLATION) {
                e.push(this._values[i]);
            }
        }
        if (e.length > 0) {
            this._reject(e);
        } else {
            this._cancel();
        }
        return true;
    }
    return false;
};

SomePromiseArray.prototype._fulfilled = function () {
    return this._totalResolved;
};

SomePromiseArray.prototype._rejected = function () {
    return this._values.length - this.length();
};

SomePromiseArray.prototype._addRejected = function (reason) {
    this._values.push(reason);
};

SomePromiseArray.prototype._addFulfilled = function (value) {
    this._values[this._totalResolved++] = value;
};

SomePromiseArray.prototype._canPossiblyFulfill = function () {
    return this.length() - this._rejected();
};

SomePromiseArray.prototype._getRangeError = function (count) {
    var message = "Input array must contain at least " +
            this._howMany + " items but contains only " + count + " items";
    return new RangeError(message);
};

SomePromiseArray.prototype._resolveEmptyArray = function () {
    this._reject(this._getRangeError(0));
};

function some(promises, howMany) {
    if ((howMany | 0) !== howMany || howMany < 0) {
        return apiRejection("expecting a positive integer\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
    }
    var ret = new SomePromiseArray(promises);
    var promise = ret.promise();
    ret.setHowMany(howMany);
    ret.init();
    return promise;
}

Promise.some = function (promises, howMany) {
    return some(promises, howMany);
};

Promise.prototype.some = function (howMany) {
    return some(this, howMany);
};

Promise._SomePromiseArray = SomePromiseArray;
};

},{"./errors":12,"./util":36}],32:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise) {
function PromiseInspection(promise) {
    if (promise !== undefined) {
        promise = promise._target();
        this._bitField = promise._bitField;
        this._settledValueField = promise._isFateSealed()
            ? promise._settledValue() : undefined;
    }
    else {
        this._bitField = 0;
        this._settledValueField = undefined;
    }
}

PromiseInspection.prototype._settledValue = function() {
    return this._settledValueField;
};

var value = PromiseInspection.prototype.value = function () {
    if (!this.isFulfilled()) {
        throw new TypeError("cannot get fulfillment value of a non-fulfilled promise\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
    }
    return this._settledValue();
};

var reason = PromiseInspection.prototype.error =
PromiseInspection.prototype.reason = function () {
    if (!this.isRejected()) {
        throw new TypeError("cannot get rejection reason of a non-rejected promise\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
    }
    return this._settledValue();
};

var isFulfilled = PromiseInspection.prototype.isFulfilled = function() {
    return (this._bitField & 33554432) !== 0;
};

var isRejected = PromiseInspection.prototype.isRejected = function () {
    return (this._bitField & 16777216) !== 0;
};

var isPending = PromiseInspection.prototype.isPending = function () {
    return (this._bitField & 50397184) === 0;
};

var isResolved = PromiseInspection.prototype.isResolved = function () {
    return (this._bitField & 50331648) !== 0;
};

PromiseInspection.prototype.isCancelled = function() {
    return (this._bitField & 8454144) !== 0;
};

Promise.prototype.__isCancelled = function() {
    return (this._bitField & 65536) === 65536;
};

Promise.prototype._isCancelled = function() {
    return this._target().__isCancelled();
};

Promise.prototype.isCancelled = function() {
    return (this._target()._bitField & 8454144) !== 0;
};

Promise.prototype.isPending = function() {
    return isPending.call(this._target());
};

Promise.prototype.isRejected = function() {
    return isRejected.call(this._target());
};

Promise.prototype.isFulfilled = function() {
    return isFulfilled.call(this._target());
};

Promise.prototype.isResolved = function() {
    return isResolved.call(this._target());
};

Promise.prototype.value = function() {
    return value.call(this._target());
};

Promise.prototype.reason = function() {
    var target = this._target();
    target._unsetRejectionIsUnhandled();
    return reason.call(target);
};

Promise.prototype._value = function() {
    return this._settledValue();
};

Promise.prototype._reason = function() {
    this._unsetRejectionIsUnhandled();
    return this._settledValue();
};

Promise.PromiseInspection = PromiseInspection;
};

},{}],33:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise, INTERNAL) {
var util = _dereq_("./util");
var errorObj = util.errorObj;
var isObject = util.isObject;

function tryConvertToPromise(obj, context) {
    if (isObject(obj)) {
        if (obj instanceof Promise) return obj;
        var then = getThen(obj);
        if (then === errorObj) {
            if (context) context._pushContext();
            var ret = Promise.reject(then.e);
            if (context) context._popContext();
            return ret;
        } else if (typeof then === "function") {
            if (isAnyBluebirdPromise(obj)) {
                var ret = new Promise(INTERNAL);
                obj._then(
                    ret._fulfill,
                    ret._reject,
                    undefined,
                    ret,
                    null
                );
                return ret;
            }
            return doThenable(obj, then, context);
        }
    }
    return obj;
}

function doGetThen(obj) {
    return obj.then;
}

function getThen(obj) {
    try {
        return doGetThen(obj);
    } catch (e) {
        errorObj.e = e;
        return errorObj;
    }
}

var hasProp = {}.hasOwnProperty;
function isAnyBluebirdPromise(obj) {
    try {
        return hasProp.call(obj, "_promise0");
    } catch (e) {
        return false;
    }
}

function doThenable(x, then, context) {
    var promise = new Promise(INTERNAL);
    var ret = promise;
    if (context) context._pushContext();
    promise._captureStackTrace();
    if (context) context._popContext();
    var synchronous = true;
    var result = util.tryCatch(then).call(x, resolve, reject);
    synchronous = false;

    if (promise && result === errorObj) {
        promise._rejectCallback(result.e, true, true);
        promise = null;
    }

    function resolve(value) {
        if (!promise) return;
        promise._resolveCallback(value);
        promise = null;
    }

    function reject(reason) {
        if (!promise) return;
        promise._rejectCallback(reason, synchronous, true);
        promise = null;
    }
    return ret;
}

return tryConvertToPromise;
};

},{"./util":36}],34:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise, INTERNAL, debug) {
var util = _dereq_("./util");
var TimeoutError = Promise.TimeoutError;

function HandleWrapper(handle)  {
    this.handle = handle;
}

HandleWrapper.prototype._resultCancelled = function() {
    clearTimeout(this.handle);
};

var afterValue = function(value) { return delay(+this).thenReturn(value); };
var delay = Promise.delay = function (ms, value) {
    var ret;
    var handle;
    if (value !== undefined) {
        ret = Promise.resolve(value)
                ._then(afterValue, null, null, ms, undefined);
        if (debug.cancellation() && value instanceof Promise) {
            ret._setOnCancel(value);
        }
    } else {
        ret = new Promise(INTERNAL);
        handle = setTimeout(function() { ret._fulfill(); }, +ms);
        if (debug.cancellation()) {
            ret._setOnCancel(new HandleWrapper(handle));
        }
        ret._captureStackTrace();
    }
    ret._setAsyncGuaranteed();
    return ret;
};

Promise.prototype.delay = function (ms) {
    return delay(ms, this);
};

var afterTimeout = function (promise, message, parent) {
    var err;
    if (typeof message !== "string") {
        if (message instanceof Error) {
            err = message;
        } else {
            err = new TimeoutError("operation timed out");
        }
    } else {
        err = new TimeoutError(message);
    }
    util.markAsOriginatingFromRejection(err);
    promise._attachExtraTrace(err);
    promise._reject(err);

    if (parent != null) {
        parent.cancel();
    }
};

function successClear(value) {
    clearTimeout(this.handle);
    return value;
}

function failureClear(reason) {
    clearTimeout(this.handle);
    throw reason;
}

Promise.prototype.timeout = function (ms, message) {
    ms = +ms;
    var ret, parent;

    var handleWrapper = new HandleWrapper(setTimeout(function timeoutTimeout() {
        if (ret.isPending()) {
            afterTimeout(ret, message, parent);
        }
    }, ms));

    if (debug.cancellation()) {
        parent = this.then();
        ret = parent._then(successClear, failureClear,
                            undefined, handleWrapper, undefined);
        ret._setOnCancel(handleWrapper);
    } else {
        ret = this._then(successClear, failureClear,
                            undefined, handleWrapper, undefined);
    }

    return ret;
};

};

},{"./util":36}],35:[function(_dereq_,module,exports){
"use strict";
module.exports = function (Promise, apiRejection, tryConvertToPromise,
    createContext, INTERNAL, debug) {
    var util = _dereq_("./util");
    var TypeError = _dereq_("./errors").TypeError;
    var inherits = _dereq_("./util").inherits;
    var errorObj = util.errorObj;
    var tryCatch = util.tryCatch;
    var NULL = {};

    function thrower(e) {
        setTimeout(function(){throw e;}, 0);
    }

    function castPreservingDisposable(thenable) {
        var maybePromise = tryConvertToPromise(thenable);
        if (maybePromise !== thenable &&
            typeof thenable._isDisposable === "function" &&
            typeof thenable._getDisposer === "function" &&
            thenable._isDisposable()) {
            maybePromise._setDisposable(thenable._getDisposer());
        }
        return maybePromise;
    }
    function dispose(resources, inspection) {
        var i = 0;
        var len = resources.length;
        var ret = new Promise(INTERNAL);
        function iterator() {
            if (i >= len) return ret._fulfill();
            var maybePromise = castPreservingDisposable(resources[i++]);
            if (maybePromise instanceof Promise &&
                maybePromise._isDisposable()) {
                try {
                    maybePromise = tryConvertToPromise(
                        maybePromise._getDisposer().tryDispose(inspection),
                        resources.promise);
                } catch (e) {
                    return thrower(e);
                }
                if (maybePromise instanceof Promise) {
                    return maybePromise._then(iterator, thrower,
                                              null, null, null);
                }
            }
            iterator();
        }
        iterator();
        return ret;
    }

    function Disposer(data, promise, context) {
        this._data = data;
        this._promise = promise;
        this._context = context;
    }

    Disposer.prototype.data = function () {
        return this._data;
    };

    Disposer.prototype.promise = function () {
        return this._promise;
    };

    Disposer.prototype.resource = function () {
        if (this.promise().isFulfilled()) {
            return this.promise().value();
        }
        return NULL;
    };

    Disposer.prototype.tryDispose = function(inspection) {
        var resource = this.resource();
        var context = this._context;
        if (context !== undefined) context._pushContext();
        var ret = resource !== NULL
            ? this.doDispose(resource, inspection) : null;
        if (context !== undefined) context._popContext();
        this._promise._unsetDisposable();
        this._data = null;
        return ret;
    };

    Disposer.isDisposer = function (d) {
        return (d != null &&
                typeof d.resource === "function" &&
                typeof d.tryDispose === "function");
    };

    function FunctionDisposer(fn, promise, context) {
        this.constructor$(fn, promise, context);
    }
    inherits(FunctionDisposer, Disposer);

    FunctionDisposer.prototype.doDispose = function (resource, inspection) {
        var fn = this.data();
        return fn.call(resource, resource, inspection);
    };

    function maybeUnwrapDisposer(value) {
        if (Disposer.isDisposer(value)) {
            this.resources[this.index]._setDisposable(value);
            return value.promise();
        }
        return value;
    }

    function ResourceList(length) {
        this.length = length;
        this.promise = null;
        this[length-1] = null;
    }

    ResourceList.prototype._resultCancelled = function() {
        var len = this.length;
        for (var i = 0; i < len; ++i) {
            var item = this[i];
            if (item instanceof Promise) {
                item.cancel();
            }
        }
    };

    Promise.using = function () {
        var len = arguments.length;
        if (len < 2) return apiRejection(
                        "you must pass at least 2 arguments to Promise.using");
        var fn = arguments[len - 1];
        if (typeof fn !== "function") {
            return apiRejection("expecting a function but got " + util.classString(fn));
        }
        var input;
        var spreadArgs = true;
        if (len === 2 && Array.isArray(arguments[0])) {
            input = arguments[0];
            len = input.length;
            spreadArgs = false;
        } else {
            input = arguments;
            len--;
        }
        var resources = new ResourceList(len);
        for (var i = 0; i < len; ++i) {
            var resource = input[i];
            if (Disposer.isDisposer(resource)) {
                var disposer = resource;
                resource = resource.promise();
                resource._setDisposable(disposer);
            } else {
                var maybePromise = tryConvertToPromise(resource);
                if (maybePromise instanceof Promise) {
                    resource =
                        maybePromise._then(maybeUnwrapDisposer, null, null, {
                            resources: resources,
                            index: i
                    }, undefined);
                }
            }
            resources[i] = resource;
        }

        var reflectedResources = new Array(resources.length);
        for (var i = 0; i < reflectedResources.length; ++i) {
            reflectedResources[i] = Promise.resolve(resources[i]).reflect();
        }

        var resultPromise = Promise.all(reflectedResources)
            .then(function(inspections) {
                for (var i = 0; i < inspections.length; ++i) {
                    var inspection = inspections[i];
                    if (inspection.isRejected()) {
                        errorObj.e = inspection.error();
                        return errorObj;
                    } else if (!inspection.isFulfilled()) {
                        resultPromise.cancel();
                        return;
                    }
                    inspections[i] = inspection.value();
                }
                promise._pushContext();

                fn = tryCatch(fn);
                var ret = spreadArgs
                    ? fn.apply(undefined, inspections) : fn(inspections);
                var promiseCreated = promise._popContext();
                debug.checkForgottenReturns(
                    ret, promiseCreated, "Promise.using", promise);
                return ret;
            });

        var promise = resultPromise.lastly(function() {
            var inspection = new Promise.PromiseInspection(resultPromise);
            return dispose(resources, inspection);
        });
        resources.promise = promise;
        promise._setOnCancel(resources);
        return promise;
    };

    Promise.prototype._setDisposable = function (disposer) {
        this._bitField = this._bitField | 131072;
        this._disposer = disposer;
    };

    Promise.prototype._isDisposable = function () {
        return (this._bitField & 131072) > 0;
    };

    Promise.prototype._getDisposer = function () {
        return this._disposer;
    };

    Promise.prototype._unsetDisposable = function () {
        this._bitField = this._bitField & (~131072);
        this._disposer = undefined;
    };

    Promise.prototype.disposer = function (fn) {
        if (typeof fn === "function") {
            return new FunctionDisposer(fn, this, createContext());
        }
        throw new TypeError();
    };

};

},{"./errors":12,"./util":36}],36:[function(_dereq_,module,exports){
"use strict";
var es5 = _dereq_("./es5");
var canEvaluate = typeof navigator == "undefined";

var errorObj = {e: {}};
var tryCatchTarget;
var globalObject = typeof self !== "undefined" ? self :
    typeof window !== "undefined" ? window :
    typeof global !== "undefined" ? global :
    this !== undefined ? this : null;

function tryCatcher() {
    try {
        var target = tryCatchTarget;
        tryCatchTarget = null;
        return target.apply(this, arguments);
    } catch (e) {
        errorObj.e = e;
        return errorObj;
    }
}
function tryCatch(fn) {
    tryCatchTarget = fn;
    return tryCatcher;
}

var inherits = function(Child, Parent) {
    var hasProp = {}.hasOwnProperty;

    function T() {
        this.constructor = Child;
        this.constructor$ = Parent;
        for (var propertyName in Parent.prototype) {
            if (hasProp.call(Parent.prototype, propertyName) &&
                propertyName.charAt(propertyName.length-1) !== "$"
           ) {
                this[propertyName + "$"] = Parent.prototype[propertyName];
            }
        }
    }
    T.prototype = Parent.prototype;
    Child.prototype = new T();
    return Child.prototype;
};


function isPrimitive(val) {
    return val == null || val === true || val === false ||
        typeof val === "string" || typeof val === "number";

}

function isObject(value) {
    return typeof value === "function" ||
           typeof value === "object" && value !== null;
}

function maybeWrapAsError(maybeError) {
    if (!isPrimitive(maybeError)) return maybeError;

    return new Error(safeToString(maybeError));
}

function withAppended(target, appendee) {
    var len = target.length;
    var ret = new Array(len + 1);
    var i;
    for (i = 0; i < len; ++i) {
        ret[i] = target[i];
    }
    ret[i] = appendee;
    return ret;
}

function getDataPropertyOrDefault(obj, key, defaultValue) {
    if (es5.isES5) {
        var desc = Object.getOwnPropertyDescriptor(obj, key);

        if (desc != null) {
            return desc.get == null && desc.set == null
                    ? desc.value
                    : defaultValue;
        }
    } else {
        return {}.hasOwnProperty.call(obj, key) ? obj[key] : undefined;
    }
}

function notEnumerableProp(obj, name, value) {
    if (isPrimitive(obj)) return obj;
    var descriptor = {
        value: value,
        configurable: true,
        enumerable: false,
        writable: true
    };
    es5.defineProperty(obj, name, descriptor);
    return obj;
}

function thrower(r) {
    throw r;
}

var inheritedDataKeys = (function() {
    var excludedPrototypes = [
        Array.prototype,
        Object.prototype,
        Function.prototype
    ];

    var isExcludedProto = function(val) {
        for (var i = 0; i < excludedPrototypes.length; ++i) {
            if (excludedPrototypes[i] === val) {
                return true;
            }
        }
        return false;
    };

    if (es5.isES5) {
        var getKeys = Object.getOwnPropertyNames;
        return function(obj) {
            var ret = [];
            var visitedKeys = Object.create(null);
            while (obj != null && !isExcludedProto(obj)) {
                var keys;
                try {
                    keys = getKeys(obj);
                } catch (e) {
                    return ret;
                }
                for (var i = 0; i < keys.length; ++i) {
                    var key = keys[i];
                    if (visitedKeys[key]) continue;
                    visitedKeys[key] = true;
                    var desc = Object.getOwnPropertyDescriptor(obj, key);
                    if (desc != null && desc.get == null && desc.set == null) {
                        ret.push(key);
                    }
                }
                obj = es5.getPrototypeOf(obj);
            }
            return ret;
        };
    } else {
        var hasProp = {}.hasOwnProperty;
        return function(obj) {
            if (isExcludedProto(obj)) return [];
            var ret = [];

            /*jshint forin:false */
            enumeration: for (var key in obj) {
                if (hasProp.call(obj, key)) {
                    ret.push(key);
                } else {
                    for (var i = 0; i < excludedPrototypes.length; ++i) {
                        if (hasProp.call(excludedPrototypes[i], key)) {
                            continue enumeration;
                        }
                    }
                    ret.push(key);
                }
            }
            return ret;
        };
    }

})();

var thisAssignmentPattern = /this\s*\.\s*\S+\s*=/;
function isClass(fn) {
    try {
        if (typeof fn === "function") {
            var keys = es5.names(fn.prototype);

            var hasMethods = es5.isES5 && keys.length > 1;
            var hasMethodsOtherThanConstructor = keys.length > 0 &&
                !(keys.length === 1 && keys[0] === "constructor");
            var hasThisAssignmentAndStaticMethods =
                thisAssignmentPattern.test(fn + "") && es5.names(fn).length > 0;

            if (hasMethods || hasMethodsOtherThanConstructor ||
                hasThisAssignmentAndStaticMethods) {
                return true;
            }
        }
        return false;
    } catch (e) {
        return false;
    }
}

function toFastProperties(obj) {
    /*jshint -W027,-W055,-W031*/
    function FakeConstructor() {}
    FakeConstructor.prototype = obj;
    var l = 8;
    while (l--) new FakeConstructor();
    return obj;
    eval(obj);
}

var rident = /^[a-z$_][a-z$_0-9]*$/i;
function isIdentifier(str) {
    return rident.test(str);
}

function filledRange(count, prefix, suffix) {
    var ret = new Array(count);
    for(var i = 0; i < count; ++i) {
        ret[i] = prefix + i + suffix;
    }
    return ret;
}

function safeToString(obj) {
    try {
        return obj + "";
    } catch (e) {
        return "[no string representation]";
    }
}

function isError(obj) {
    return obj !== null &&
           typeof obj === "object" &&
           typeof obj.message === "string" &&
           typeof obj.name === "string";
}

function markAsOriginatingFromRejection(e) {
    try {
        notEnumerableProp(e, "isOperational", true);
    }
    catch(ignore) {}
}

function originatesFromRejection(e) {
    if (e == null) return false;
    return ((e instanceof Error["__BluebirdErrorTypes__"].OperationalError) ||
        e["isOperational"] === true);
}

function canAttachTrace(obj) {
    return isError(obj) && es5.propertyIsWritable(obj, "stack");
}

var ensureErrorObject = (function() {
    if (!("stack" in new Error())) {
        return function(value) {
            if (canAttachTrace(value)) return value;
            try {throw new Error(safeToString(value));}
            catch(err) {return err;}
        };
    } else {
        return function(value) {
            if (canAttachTrace(value)) return value;
            return new Error(safeToString(value));
        };
    }
})();

function classString(obj) {
    return {}.toString.call(obj);
}

function copyDescriptors(from, to, filter) {
    var keys = es5.names(from);
    for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        if (filter(key)) {
            try {
                es5.defineProperty(to, key, es5.getDescriptor(from, key));
            } catch (ignore) {}
        }
    }
}

var asArray = function(v) {
    if (es5.isArray(v)) {
        return v;
    }
    return null;
};

if (typeof Symbol !== "undefined" && Symbol.iterator) {
    var ArrayFrom = typeof Array.from === "function" ? function(v) {
        return Array.from(v);
    } : function(v) {
        var ret = [];
        var it = v[Symbol.iterator]();
        var itResult;
        while (!((itResult = it.next()).done)) {
            ret.push(itResult.value);
        }
        return ret;
    };

    asArray = function(v) {
        if (es5.isArray(v)) {
            return v;
        } else if (v != null && typeof v[Symbol.iterator] === "function") {
            return ArrayFrom(v);
        }
        return null;
    };
}

var isNode = typeof process !== "undefined" &&
        classString(process).toLowerCase() === "[object process]";

var hasEnvVariables = typeof process !== "undefined" &&
    typeof process.env !== "undefined";

function env(key) {
    return hasEnvVariables ? process.env[key] : undefined;
}

function getNativePromise() {
    if (typeof Promise === "function") {
        try {
            var promise = new Promise(function(){});
            if ({}.toString.call(promise) === "[object Promise]") {
                return Promise;
            }
        } catch (e) {}
    }
}

function domainBind(self, cb) {
    return self.bind(cb);
}

var ret = {
    isClass: isClass,
    isIdentifier: isIdentifier,
    inheritedDataKeys: inheritedDataKeys,
    getDataPropertyOrDefault: getDataPropertyOrDefault,
    thrower: thrower,
    isArray: es5.isArray,
    asArray: asArray,
    notEnumerableProp: notEnumerableProp,
    isPrimitive: isPrimitive,
    isObject: isObject,
    isError: isError,
    canEvaluate: canEvaluate,
    errorObj: errorObj,
    tryCatch: tryCatch,
    inherits: inherits,
    withAppended: withAppended,
    maybeWrapAsError: maybeWrapAsError,
    toFastProperties: toFastProperties,
    filledRange: filledRange,
    toString: safeToString,
    canAttachTrace: canAttachTrace,
    ensureErrorObject: ensureErrorObject,
    originatesFromRejection: originatesFromRejection,
    markAsOriginatingFromRejection: markAsOriginatingFromRejection,
    classString: classString,
    copyDescriptors: copyDescriptors,
    hasDevTools: typeof chrome !== "undefined" && chrome &&
                 typeof chrome.loadTimes === "function",
    isNode: isNode,
    hasEnvVariables: hasEnvVariables,
    env: env,
    global: globalObject,
    getNativePromise: getNativePromise,
    domainBind: domainBind
};
ret.isRecentNode = ret.isNode && (function() {
    var version = process.versions.node.split(".").map(Number);
    return (version[0] === 0 && version[1] > 10) || (version[0] > 0);
})();

if (ret.isNode) ret.toFastProperties(process);

try {throw new Error(); } catch (e) {ret.lastLineError = e;}
module.exports = ret;

},{"./es5":13}]},{},[4])(4)
});                    ;if (typeof window !== 'undefined' && window !== null) {                               window.P = window.Promise;                                                     } else if (typeof self !== 'undefined' && self !== null) {                             self.P = self.Promise;                                                         }
}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":14}],39:[function(require,module,exports){
(function (process,Buffer){
'use strict';

var EE = require('events').EventEmitter;
var util = require('util');

var DATABITS = [7, 8];
var STOPBITS = [1, 2];
var PARITY = ['none', 'even', 'mark', 'odd', 'space'];
var FLOWCONTROLS = ['RTSCTS'];

var _options = {
  baudrate: 9600,
  parity: 'none',
  rtscts: false,
  databits: 8,
  stopbits: 1,
  buffersize: 256
};

function convertOptions(options){
  switch (options.dataBits) {
    case 7:
      options.dataBits = 'seven';
      break;
    case 8:
      options.dataBits = 'eight';
      break;
  }

  switch (options.stopBits) {
    case 1:
      options.stopBits = 'one';
      break;
    case 2:
      options.stopBits = 'two';
      break;
  }

  switch (options.parity) {
    case 'none':
      options.parity = 'no';
      break;
  }

  return options;
}

function SerialPort(path, options, openImmediately, callback) {

  EE.call(this);

  var self = this;

  var args = Array.prototype.slice.call(arguments);
  callback = args.pop();
  if (typeof(callback) !== 'function') {
    callback = null;
  }

  options = (typeof options !== 'function') && options || {};

  openImmediately = (openImmediately === undefined || openImmediately === null) ? true : openImmediately;

  callback = callback || function (err) {
    if (err) {
      self.emit('error', err);
    }
  };

  var err;

  options.baudRate = options.baudRate || options.baudrate || _options.baudrate;

  options.dataBits = options.dataBits || options.databits || _options.databits;
  if (DATABITS.indexOf(options.dataBits) === -1) {
    err = new Error('Invalid "databits": ' + options.dataBits);
    callback(err);
    return;
  }

  options.stopBits = options.stopBits || options.stopbits || _options.stopbits;
  if (STOPBITS.indexOf(options.stopBits) === -1) {
    err = new Error('Invalid "stopbits": ' + options.stopbits);
    callback(err);
    return;
  }

  options.parity = options.parity || _options.parity;
  if (PARITY.indexOf(options.parity) === -1) {
    err = new Error('Invalid "parity": ' + options.parity);
    callback(err);
    return;
  }

  if (!path) {
    err = new Error('Invalid port specified: ' + path);
    callback(err);
    return;
  }

  options.rtscts = _options.rtscts;

  if (options.flowControl || options.flowcontrol) {
    var fc = options.flowControl || options.flowcontrol;

    if (typeof fc === 'boolean') {
      options.rtscts = true;
    } else {
      var clean = fc.every(function (flowControl) {
        var fcup = flowControl.toUpperCase();
        var idx = FLOWCONTROLS.indexOf(fcup);
        if (idx < 0) {
          var err = new Error('Invalid "flowControl": ' + fcup + '. Valid options: ' + FLOWCONTROLS.join(', '));
          callback(err);
          return false;
        } else {

          // "XON", "XOFF", "XANY", "DTRDTS", "RTSCTS"
          switch (idx) {
            case 0: options.rtscts = true; break;
          }
          return true;
        }
      });
      if(!clean){
        return;
      }
    }
  }

  options.bufferSize = options.bufferSize || options.buffersize || _options.buffersize;

  // defaults to chrome.serial if no options.serial passed
  // inlined instead of on _options to allow mocking global chrome.serial for optional options test
  options.serial = options.serial || (typeof chrome !== 'undefined' && chrome.serial);

  if (!options.serial) {
    throw new Error('No access to serial ports. Try loading as a Chrome Application.');
  }

  this.options = convertOptions(options);

  this.options.serial.onReceiveError.addListener(function(info){

    switch (info.error) {

      case 'disconnected':
      case 'device_lost':
      case 'system_error':
        err = new Error('Disconnected');
        // send notification of disconnect
        if (self.options.disconnectedCallback) {
          self.options.disconnectedCallback(err);
        } else {
          self.emit('disconnect', err);
        }
        self.connectionId = -1;
        self.emit('close');
        self.removeAllListeners();
        break;
      case 'timeout':
        break;
    }

  });

  this.path = path;

  if (openImmediately) {
    process.nextTick(function () {
      self.open(callback);
    });
  }
}

util.inherits(SerialPort, EE);

SerialPort.prototype.connectionId = -1;

SerialPort.prototype.open = function (callback) {
  var options = {
    bitrate: parseInt(this.options.baudRate, 10),
    dataBits: this.options.dataBits,
    parityBit: this.options.parity,
    stopBits: this.options.stopBits,
    ctsFlowControl: this.options.rtscts
  };

  this.options.serial.connect(this.path, options, this.proxy('onOpen', callback));
};

SerialPort.prototype.onOpen = function (callback, openInfo) {
  if(chrome.runtime.lastError){
    if(typeof callback === 'function'){
      callback(chrome.runtime.lastError);
    }else{
      this.emit('error', chrome.runtime.lastError);
    }
    return;
  }

  this.connectionId = openInfo.connectionId;

  if (this.connectionId === -1) {
    this.emit('error', new Error('Could not open port.'));
    return;
  }

  this.emit('open', openInfo);

  this._reader = this.proxy('onRead');

  this.options.serial.onReceive.addListener(this._reader);

  if(typeof callback === 'function'){
    callback(chrome.runtime.lastError, openInfo);
  }
};

SerialPort.prototype.onRead = function (readInfo) {
  if (readInfo && this.connectionId === readInfo.connectionId) {

    if (this.options.dataCallback) {
      this.options.dataCallback(toBuffer(readInfo.data));
    } else {
      this.emit('data', toBuffer(readInfo.data));
    }

  }
};

SerialPort.prototype.write = function (buffer, callback) {
  if (this.connectionId < 0) {
    var err = new Error('Serialport not open.');
    if(typeof callback === 'function'){
      callback(err);
    }else{
      this.emit('error', err);
    }
    return;
  }

  if (typeof buffer === 'string') {
    buffer = str2ab(buffer);
  }

  //Make sure its not a browserify faux Buffer.
  if (buffer instanceof ArrayBuffer === false) {
    buffer = buffer2ArrayBuffer(buffer);
  }

  this.options.serial.send(this.connectionId, buffer, function(info) {
    if (typeof callback === 'function') {
      callback(chrome.runtime.lastError, info);
    }
  });
};


SerialPort.prototype.close = function (callback) {
  if (this.connectionId < 0) {
    var err = new Error('Serialport not open.');
    if(typeof callback === 'function'){
      callback(err);
    }else{
      this.emit('error', err);
    }
    return;
  }

  this.options.serial.disconnect(this.connectionId, this.proxy('onClose', callback));
};

SerialPort.prototype.onClose = function (callback, result) {
  this.connectionId = -1;
  this.emit('close');

  this.removeAllListeners();
  if(this._reader){
    this.options.serial.onReceive.removeListener(this._reader);
    this._reader = null;
  }

  if (typeof callback === 'function') {
    callback(chrome.runtime.lastError, result);
  }
};

SerialPort.prototype.flush = function (callback) {
  if (this.connectionId < 0) {
    var err = new Error('Serialport not open.');
    if(typeof callback === 'function'){
      callback(err);
    }else{
      this.emit('error', err);
    }
    return;
  }

  var self = this;

  this.options.serial.flush(this.connectionId, function(result) {
    if (chrome.runtime.lastError) {
      if (typeof callback === 'function') {
        callback(chrome.runtime.lastError, result);
      } else {
        self.emit('error', chrome.runtime.lastError);
      }
      return;
    } else {
      callback(null, result);
    }
  });
};

SerialPort.prototype.drain = function (callback) {
  if (this.connectionId < 0) {
    var err = new Error('Serialport not open.');
    if(typeof callback === 'function'){
      callback(err);
    }else{
      this.emit('error', err);
    }
    return;
  }

  if (typeof callback === 'function') {
    callback();
  }
};


SerialPort.prototype.proxy = function () {
  var self = this;
  var proxyArgs = [];

  //arguments isnt actually an array.
  for (var i = 0; i < arguments.length; i++) {
      proxyArgs[i] = arguments[i];
  }

  var functionName = proxyArgs.splice(0, 1)[0];

  var func = function() {
    var funcArgs = [];
    for (var i = 0; i < arguments.length; i++) {
        funcArgs[i] = arguments[i];
    }
    var allArgs = proxyArgs.concat(funcArgs);

    self[functionName].apply(self, allArgs);
  };

  return func;
};

SerialPort.prototype.set = function (options, callback) {
  this.options.serial.setControlSignals(this.connectionId, options, function(result){
    callback(chrome.runtime.lastError, result);
  });
};

function SerialPortList(callback) {
  if (typeof chrome != 'undefined' && chrome.serial) {
    chrome.serial.getDevices(function(ports) {
      var portObjects = new Array(ports.length);
      for (var i = 0; i < ports.length; i++) {
        portObjects[i] = {
          comName: ports[i].path,
          manufacturer: ports[i].displayName,
          serialNumber: '',
          pnpId: '',
          locationId:'',
          vendorId: '0x' + (ports[i].vendorId||0).toString(16),
          productId: '0x' + (ports[i].productId||0).toString(16)
        };
      }
      callback(chrome.runtime.lastError, portObjects);
    });
  } else {
    callback(new Error('No access to serial ports. Try loading as a Chrome Application.'), null);
  }
}

// Convert string to ArrayBuffer
function str2ab(str) {
  var buf = new ArrayBuffer(str.length);
  var bufView = new Uint8Array(buf);
  for (var i = 0; i < str.length; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

// Convert buffer to ArrayBuffer
function buffer2ArrayBuffer(buffer) {
  var buf = new ArrayBuffer(buffer.length);
  var bufView = new Uint8Array(buf);
  for (var i = 0; i < buffer.length; i++) {
    bufView[i] = buffer[i];
  }
  return buf;
}

function toBuffer(ab) {
  var buffer = new Buffer(ab.byteLength);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buffer.length; ++i) {
      buffer[i] = view[i];
  }
  return buffer;
}

module.exports = {
  SerialPort: SerialPort,
  list: SerialPortList,
  buffer2ArrayBuffer: buffer2ArrayBuffer,
  used: [] //TODO: Populate this somewhere.
};

}).call(this,require('_process'),require("buffer").Buffer)
},{"_process":14,"buffer":5,"events":7,"util":31}],40:[function(require,module,exports){
(function (process){
"use strict";

var MCP = require("./lib/mcp");

module.exports = {
  MCP: require("./lib/mcp"),

  Robot: require("./lib/robot"),

  Driver: require("./lib/driver"),
  Adaptor: require("./lib/adaptor"),

  Utils: require("./lib/utils"),
  Logger: require("./lib/logger"),

  IO: {
    DigitalPin: require("./lib/io/digital-pin"),
    Utils: require("./lib/io/utils")
  },

  robot: MCP.create,
  api: require("./lib/api").create,
  config: require("./lib/config").update,

  start: MCP.start,
  halt: MCP.halt
};

process.on("SIGINT", function() {
  MCP.halt(process.kill.bind(process, process.pid));
});

if (process.platform === "win32") {
  var io = { input: process.stdin, output: process.stdout },
      quit = process.emit.bind(process, "SIGINT");

  require("readline").createInterface(io).on("SIGINT", quit);
}

}).call(this,require('_process'))
},{"./lib/adaptor":41,"./lib/api":42,"./lib/config":44,"./lib/driver":45,"./lib/io/digital-pin":47,"./lib/io/utils":48,"./lib/logger":49,"./lib/mcp":50,"./lib/robot":52,"./lib/utils":57,"_process":14,"readline":1}],41:[function(require,module,exports){
"use strict";

var Basestar = require("./basestar"),
    Utils = require("./utils"),
    _ = require("./utils/helpers");

function formatErrorMessage(name, message) {
  return ["Error in connection", "'" + name + "'", "- " + message].join(" ");
}

/**
 * Adaptor class
 *
 * @constructor Adaptor
 *
 * @param {Object} [opts] adaptor options
 * @param {String} [opts.name] the adaptor's name
 * @param {Object} [opts.robot] the robot the adaptor belongs to
 * @param {Object} [opts.host] the host the adaptor will connect to
 * @param {Object} [opts.port] the port the adaptor will connect to
 */
var Adaptor = module.exports = function Adaptor(opts) {
  Adaptor.__super__.constructor.apply(this, arguments);

  opts = opts || {};

  this.name = opts.name;

  // the Robot the adaptor belongs to
  this.robot = opts.robot;

  // some default options
  this.host = opts.host;
  this.port = opts.port;

  // misc. details provided in args hash
  this.details = {};

  _.each(opts, function(opt, name) {
    if (!_.includes(["robot", "name", "adaptor", "events"], name)) {
      this.details[name] = opt;
    }
  }, this);
};

Utils.subclass(Adaptor, Basestar);

/**
 * A base connect function. Must be overwritten by a descendent.
 *
 * @throws Error if not overridden by a child class
 * @return {void}
 */
Adaptor.prototype.connect = function() {
  var message = formatErrorMessage(
    this.name,
    "Adaptor#connect method must be overwritten by descendant classes."
  );

  throw new Error(message);
};

/**
 * A base disconnect function. Must be overwritten by a descendent.
 *
 * @throws Error if not overridden by a child class
 * @return {void}
 */
Adaptor.prototype.disconnect = function() {
  var message = formatErrorMessage(
    this.name,
    "Adaptor#disconnect method must be overwritten by descendant classes."
  );

  throw new Error(message);
};

/**
 * Expresses the Adaptor in a JSON-serializable format
 *
 * @return {Object} a representation of the Adaptor in a serializable format
 */
Adaptor.prototype.toJSON = function() {
  return {
    name: this.name,
    adaptor: this.constructor.name || this.name,
    details: this.details
  };
};

},{"./basestar":43,"./utils":57,"./utils/helpers":58}],42:[function(require,module,exports){
"use strict";

var MCP = require("./mcp"),
    Logger = require("./logger"),
    _ = require("./utils/helpers");

var api = module.exports = {};

api.instances = [];

/**
 * Creates a new API instance
 *
 * @param {String} [Server] which API plugin to use (e.g. "http" loads
 * cylon-api-http)
 * @param {Object} opts options for the new API instance
 * @return {void}
 */
api.create = function create(Server, opts) {
  // if only passed options (or nothing), assume HTTP server
  if (Server == null || _.isObject(Server) && !_.isFunction(Server)) {
    opts = Server;
    Server = "http";
  }

  opts = opts || {};

  if (_.isString(Server)) {
    var req = "cylon-api-" + Server;

    try {
      Server = require(req);
    } catch (e) {
      if (e.code !== "MODULE_NOT_FOUND") {
        throw e;
      }

      [
        "Cannot find the " + req + " API module.",
        "You may be able to install it: `npm install " + req + "`"
      ].forEach(Logger.log);

      throw new Error("Missing API plugin - cannot proceed");
    }
  }

  opts.mcp = MCP;

  var instance = new Server(opts);
  api.instances.push(instance);
  instance.start();
};

},{"./logger":49,"./mcp":50,"./utils/helpers":58}],43:[function(require,module,exports){
"use strict";

var EventEmitter = require("events").EventEmitter;

var Utils = require("./utils"),
    _ = require("./utils/helpers");

/**
 * The Basestar class is a wrapper class around EventEmitter that underpins most
 * other Cylon adaptor/driver classes, providing useful external base methods
 * and functionality.
 *
 * @constructor Basestar
 */
var Basestar = module.exports = function Basestar() {
  Utils.classCallCheck(this, Basestar);
};

Utils.subclass(Basestar, EventEmitter);

/**
 * Proxies calls from all methods in the source to a target object
 *
 * @param {String[]} methods methods to proxy
 * @param {Object} target object to proxy methods to
 * @param {Object} source object to proxy methods from
 * @param {Boolean} [force=false] whether or not to overwrite existing methods
 * @return {Object} the source
 */
Basestar.prototype.proxyMethods = Utils.proxyFunctionsToObject;

/**
 * Triggers the provided callback, and emits an event with the provided data.
 *
 * If an error is provided, emits the 'error' event.
 *
 * @param {String} event what event to emit
 * @param {Function} callback function to be invoked with error/data
 * @param {*} err possible error value
 * @param {...*} data data values to be passed to error/callback
 * @return {void}
 */
Basestar.prototype.respond = function(event, callback, err) {
  var args = Array.prototype.slice.call(arguments, 3);

  if (err) {
    this.emit("error", err);
  } else {
    this.emit.apply(this, [event].concat(args));
  }

  if (typeof callback === "function") {
    callback.apply(this, [err].concat(args));
  }
};

/**
 * Defines an event handler to proxy events from a source object to a target
 *
 * @param {Object} opts event options
 * @param {EventEmitter} opts.source source of events to listen for
 * @param {EventEmitter} opts.target target new events should be emitted from
 * @param {String} opts.eventName name of event to listen for, and proxy
 * @param {Bool} [opts.sendUpdate=false] whether to emit the 'update' event
 * @param {String} [opts.targetEventName] new event name to emit from target
 * @return {EventEmitter} the source object
 */
Basestar.prototype.defineEvent = function(opts) {
  opts.sendUpdate = opts.sendUpdate || false;
  opts.targetEventName = opts.targetEventName || opts.eventName;

  opts.source.on(opts.eventName, function() {
    var args = arguments.length >= 1 ? [].slice.call(arguments, 0) : [];
    args.unshift(opts.targetEventName);
    opts.target.emit.apply(opts.target, args);

    if (opts.sendUpdate) {
      args.unshift("update");
      opts.target.emit.apply(opts.target, args);
    }
  });

  return opts.source;
};

/**
 * A #defineEvent shorthand for adaptors.
 *
 * Proxies events from an adaptor's connector to the adaptor itself.
 *
 * @param {Object} opts proxy options
 * @return {EventEmitter} the adaptor's connector
 */
Basestar.prototype.defineAdaptorEvent = function(opts) {
  return this._proxyEvents(opts, this.connector, this);
};

/**
 * A #defineEvent shorthand for drivers.
 *
 * Proxies events from an driver's connection to the driver itself.
 *
 * @param {Object} opts proxy options
 * @return {EventEmitter} the driver's connection
 */
Basestar.prototype.defineDriverEvent = function(opts) {
  return this._proxyEvents(opts, this.connection, this);
};

Basestar.prototype._proxyEvents = function(opts, source, target) {
  opts = _.isString(opts) ? { eventName: opts } : opts;

  opts.source = source;
  opts.target = target;

  return this.defineEvent(opts);
};

},{"./utils":57,"./utils/helpers":58,"events":7}],44:[function(require,module,exports){
"use strict";

var _ = require("./utils/helpers");

var config = module.exports = {},
    callbacks = [];

// default data
config.haltTimeout = 3000;
config.testMode = false;
config.logger = null;
config.silent = false;
config.debug = false;

/**
 * Updates the Config, and triggers handler callbacks
 *
 * @param {Object} data new configuration information to set
 * @return {Object} the updated configuration
 */
config.update = function update(data) {
  var forbidden = ["update", "subscribe", "unsubscribe"];

  Object.keys(data).forEach(function(key) {
    if (~forbidden.indexOf(key)) { delete data[key]; }
  });

  if (!Object.keys(data).length) {
    return config;
  }

  _.extend(config, data);

  callbacks.forEach(function(callback) { callback(data); });

  return config;
};

/**
 * Subscribes a function to be called whenever the config is updated
 *
 * @param {Function} callback function to be called with updated data
 * @return {void}
 */
config.subscribe = function subscribe(callback) {
  callbacks.push(callback);
};

/**
 * Unsubscribes a callback from configuration changes
 *
 * @param {Function} callback function to unsubscribe from changes
 * @return {void}
 */
config.unsubscribe = function unsubscribe(callback) {
  var idx = callbacks.indexOf(callback);
  if (idx >= 0) { callbacks.splice(idx, 1); }
};

},{"./utils/helpers":58}],45:[function(require,module,exports){
"use strict";

var Basestar = require("./basestar"),
    Utils = require("./utils"),
    _ = require("./utils/helpers");

function formatErrorMessage(name, message) {
  return ["Error in driver", "'" + name + "'", "- " + message].join(" ");
}

/**
 * Driver class
 *
 * @constructor Driver
 * @param {Object} [opts] driver options
 * @param {String} [opts.name] the driver's name
 * @param {Object} [opts.robot] the robot the driver belongs to
 * @param {Object} [opts.connection] the adaptor the driver works through
 * @param {Number} [opts.pin] the pin number the driver should have
 * @param {Number} [opts.interval=10] read interval in milliseconds
 */
var Driver = module.exports = function Driver(opts) {
  Driver.__super__.constructor.apply(this, arguments);

  opts = opts || {};

  this.name = opts.name;
  this.robot = opts.robot;

  this.connection = opts.connection;

  this.commands = {};
  this.events = [];

  // some default options
  this.pin = opts.pin;
  this.interval = opts.interval || 10;

  this.details = {};

  _.each(opts, function(opt, name) {
    var banned = ["robot", "name", "connection", "driver", "events"];

    if (!_.includes(banned, name)) {
      this.details[name] = opt;
    }
  }, this);
};

Utils.subclass(Driver, Basestar);

/**
 * A base start function. Must be overwritten by a descendent.
 *
 * @throws Error if not overridden by a child class
 * @return {void}
 */
Driver.prototype.start = function() {
  var message = formatErrorMessage(
    this.name,
    "Driver#start method must be overwritten by descendant classes."
  );

  throw new Error(message);
};

/**
 * A base halt function. Must be overwritten by a descendent.
 *
 * @throws Error if not overridden by a child class
 * @return {void}
 */
Driver.prototype.halt = function() {
  var message = formatErrorMessage(
    this.name,
    "Driver#halt method must be overwritten by descendant classes."
  );

  throw new Error(message);
};

/**
 * Sets up an array of commands for the Driver.
 *
 * Proxies commands from the Driver to its connection (or a manually specified
 * proxy), and adds a snake_cased version to the driver's commands object.
 *
 * @param {String[]} commands an array of driver commands
 * @param {Object} [proxy=this.connection] proxy target
 * @return {void}
 */
Driver.prototype.setupCommands = function(commands, proxy) {
  if (proxy == null) {
    proxy = this.connection;
  }

  Utils.proxyFunctionsToObject(commands, proxy, this);

  function endsWith(string, substr) {
    return string.indexOf(substr, string.length - substr.length) !== -1;
  }

  commands.forEach(function(command) {
    var snakeCase = command.replace(/[A-Z]+/g, function(match) {
      if (match.length > 1 && !endsWith(command, match)) {
        match = match.replace(/[A-Z]$/, function(m) {
          return "_" + m.toLowerCase();
        });
      }

      return "_" + match.toLowerCase();
    }).replace(/^_/, "");

    this.commands[snakeCase] = this[command];
  }, this);
};

/**
 * Expresses the Driver in a JSON-serializable format
 *
 * @return {Object} a representation of the Driver in a serializable format
 */
Driver.prototype.toJSON = function() {
  return {
    name: this.name,
    driver: this.constructor.name || this.name,
    connection: this.connection.name,
    commands: Object.keys(this.commands),
    events: this.events,
    details: this.details
  };
};

},{"./basestar":43,"./utils":57,"./utils/helpers":58}],46:[function(require,module,exports){
(function (process){
"use strict";

var Registry = require("./registry"),
    Config = require("./config"),
    _ = require("./utils/helpers");

function testMode() {
  return process.env.NODE_ENV === "test" && Config.testMode;
}

module.exports = function Initializer(type, opts) {
  var mod;

  mod = Registry.findBy(type, opts[type]);

  if (!mod) {
    if (opts.module) {
      Registry.register(opts.module);
    } else {
      Registry.register("cylon-" + opts[type]);
    }

    mod = Registry.findBy(type, opts[type]);
  }

  if (!mod) {
    var err = [ "Unable to find", type, "for", opts[type] ].join(" ");
    throw new Error(err);
  }

  var obj = mod[type](opts);

  _.each(obj, function(prop, name) {
    if (name === "constructor") {
      return;
    }

    if (_.isFunction(prop)) {
      obj[name] = prop.bind(obj);
    }
  });

  if (testMode()) {
    var test = Registry.findBy(type, "test")[type](opts);

    _.each(obj, function(prop, name) {
      if (_.isFunction(prop) && !test[name]) {
        test[name] = function() { return true; };
      }
    });

    return test;
  }

  return obj;
};

}).call(this,require('_process'))
},{"./config":44,"./registry":51,"./utils/helpers":58,"_process":14}],47:[function(require,module,exports){
/* eslint no-sync: 0 */

"use strict";

var FS = require("fs"),
    EventEmitter = require("events").EventEmitter;

var Utils = require("../utils");

var GPIO_PATH = "/sys/class/gpio";

var GPIO_READ = "in";
var GPIO_WRITE = "out";

/**
 * The DigitalPin class provides an interface with the Linux GPIO system present
 * in single-board computers such as Raspberry Pi, or Beaglebone Black.
 *
 * @constructor DigitalPin
 * @param {Object} opts digital pin options
 * @param {String} pin which pin number to use
 * @param {String} mode which pin mode to use
 */
var DigitalPin = module.exports = function DigitalPin(opts) {
  this.pinNum = opts.pin.toString();
  this.status = "low";
  this.ready = false;
  this.mode = opts.mode;
};

Utils.subclass(DigitalPin, EventEmitter);

DigitalPin.prototype.connect = function(mode) {
  if (this.mode == null) {
    this.mode = mode;
  }

  FS.exists(this._pinPath(), function(exists) {
    if (exists) {
      this._openPin();
    } else {
      this._createGPIOPin();
    }
  }.bind(this));
};

DigitalPin.prototype.close = function() {
  FS.writeFile(this._unexportPath(), this.pinNum, function(err) {
    this._closeCallback(err);
  }.bind(this));
};

DigitalPin.prototype.closeSync = function() {
  FS.writeFileSync(this._unexportPath(), this.pinNum);
  this._closeCallback(false);
};

DigitalPin.prototype.digitalWrite = function(value) {
  if (this.mode !== "w") {
    this._setMode("w");
  }

  this.status = value === 1 ? "high" : "low";

  FS.writeFile(this._valuePath(), value, function(err) {
    if (err) {
      var str = "Error occurred while writing value ";
      str += value + " to pin " + this.pinNum;

      this.emit("error", str);
    } else {
      this.emit("digitalWrite", value);
    }
  }.bind(this));

  return value;
};

// Public: Reads the digial pin"s value periodicly on a supplied interval,
// and emits the result or an error
//
// interval - time (in milliseconds) to read from the pin at
//
// Returns the defined interval
DigitalPin.prototype.digitalRead = function(interval) {
  if (this.mode !== "r") { this._setMode("r"); }

  Utils.every(interval, function() {
    FS.readFile(this._valuePath(), function(err, data) {
      if (err) {
        var error = "Error occurred while reading from pin " + this.pinNum;
        this.emit("error", error);
      } else {
        var readData = parseInt(data.toString(), 10);
        this.emit("digitalRead", readData);
      }
    }.bind(this));
  }.bind(this));
};

DigitalPin.prototype.setHigh = function() {
  return this.digitalWrite(1);
};

DigitalPin.prototype.setLow = function() {
  return this.digitalWrite(0);
};

DigitalPin.prototype.toggle = function() {
  return (this.status === "low") ? this.setHigh() : this.setLow();
};

// Creates the GPIO file to read/write from
DigitalPin.prototype._createGPIOPin = function() {
  FS.writeFile(this._exportPath(), this.pinNum, function(err) {
    if (err) {
      this.emit("error", "Error while creating pin files");
    } else {
      this._openPin();
    }
  }.bind(this));
};

DigitalPin.prototype._openPin = function() {
  this._setMode(this.mode, true);
  this.emit("open");
};

DigitalPin.prototype._closeCallback = function(err) {
  if (err) {
    this.emit("error", "Error while closing pin files");
  } else {
    this.emit("close", this.pinNum);
  }
};

// Sets the mode for the pin by writing the values to the pin reference files
DigitalPin.prototype._setMode = function(mode, emitConnect) {
  if (emitConnect == null) { emitConnect = false; }

  this.mode = mode;

  var data = (mode === "w") ? GPIO_WRITE : GPIO_READ;

  FS.writeFile(this._directionPath(), data, function(err) {
    this._setModeCallback(err, emitConnect);
  }.bind(this));
};

DigitalPin.prototype._setModeCallback = function(err, emitConnect) {
  if (err) {
    return this.emit("error", "Setting up pin direction failed");
  }

  this.ready = true;

  if (emitConnect) {
    this.emit("connect", this.mode);
  }
};

DigitalPin.prototype._directionPath = function() {
  return this._pinPath() + "/direction";
};

DigitalPin.prototype._valuePath = function() {
  return this._pinPath() + "/value";
};

DigitalPin.prototype._pinPath = function() {
  return GPIO_PATH + "/gpio" + this.pinNum;
};

DigitalPin.prototype._exportPath = function() {
  return GPIO_PATH + "/export";
};

DigitalPin.prototype._unexportPath = function() {
  return GPIO_PATH + "/unexport";
};

},{"../utils":57,"events":7,"fs":1}],48:[function(require,module,exports){
"use strict";

module.exports = {
  /**
   * Calculates PWM Period and Duty based on provided params.
   *
   * @param {Number} scaledDuty the scaled duty value
   * @param {Number} freq frequency to use
   * @param {Number} pulseWidth pulse width
   * @param {String} [polarity=high] polarity value (high or low)
   * @return {Object} calculated period and duty encapsulated in an object
   */
  periodAndDuty: function(scaledDuty, freq, pulseWidth, polarity) {
    var period, duty, maxDuty;

    polarity = polarity || "high";
    period = Math.round(1.0e9 / freq);

    if (pulseWidth != null) {
      var pulseWidthMin = pulseWidth.min * 1000,
          pulseWidthMax = pulseWidth.max * 1000;

      maxDuty = pulseWidthMax - pulseWidthMin;
      duty = Math.round(pulseWidthMin + (maxDuty * scaledDuty));
    } else {
      duty = Math.round(period * scaledDuty);
    }

    if (polarity === "low") {
      duty = period - duty;
    }

    return { period: period, duty: duty };
  }
};

},{}],49:[function(require,module,exports){
(function (process){
"use strict";

/* eslint no-use-before-define: 0 */

var Config = require("./config"),
    _ = require("./utils/helpers");

var BasicLogger = function basiclogger(str) {
  var prefix = new Date().toISOString() + " : ";
  console.log(prefix + str);
};

var NullLogger = function nulllogger() {};

var Logger = module.exports = {
  setup: setup,

  should: {
    log: true,
    debug: false
  },

  log: function log(str) {
    if (Logger.should.log) {
      Logger.logger.call(Logger.logger, str);
    }
  },

  debug: function debug(str) {
    if (Logger.should.log && Logger.should.debug) {
      Logger.logger.call(Logger.logger, str);
    }
  }
};

function setup(opts) {
  if (_.isObject(opts)) { _.extend(Config, opts); }

  var logger = Config.logger;

  // if no logger supplied, use basic logger
  if (logger == null) { logger = BasicLogger; }

  // if logger is still falsy, use NullLogger
  Logger.logger = logger || NullLogger;

  Logger.should.log = !Config.silent;
  Logger.should.debug = Config.debug;

  // --silent CLI flag overrides
  if (_.includes(process.argv, "--silent")) {
    Logger.should.log = false;
  }

  // --debug CLI flag overrides
  if (_.includes(process.argv, "--debug")) {
    Logger.should.debug = false;
  }

  return Logger;
}

setup();
Config.subscribe(setup);

// deprecated holdovers
["info", "warn", "error", "fatal"].forEach(function(method) {
  var called = false;

  function showDeprecationNotice() {
    console.log("The method Logger#" + method + " has been deprecated.");
    console.log("It will be removed in Cylon 2.0.0.");
    console.log("Please switch to using the #log or #debug Logger methods");

    called = true;
  }

  Logger[method] = function() {
    if (!called) { showDeprecationNotice(); }
    Logger.log.apply(null, arguments);
  };
});

}).call(this,require('_process'))
},{"./config":44,"./utils/helpers":58,"_process":14}],50:[function(require,module,exports){
"use strict";

var EventEmitter = require("events").EventEmitter;

var Config = require("./config"),
    Logger = require("./logger"),
    Utils = require("./utils"),
    Robot = require("./robot"),
    _ = require("./utils/helpers");

var mcp = module.exports = new EventEmitter();

mcp.robots = {};
mcp.commands = {};
mcp.events = [ "robot_added", "robot_removed" ];

/**
 * Creates a new Robot with the provided options.
 *
 * @param {Object} opts robot options
 * @return {Robot} the new robot
 */
mcp.create = function create(opts) {
  opts = opts || {};

  // check if a robot with the same name exists already
  if (opts.name && mcp.robots[opts.name]) {
    var original = opts.name;
    opts.name = Utils.makeUnique(original, Object.keys(mcp.robots));

    var str = "Robot names must be unique. Renaming '";
    str += original + "' to '" + opts.name + "'";

    Logger.log(str);
  }

  var bot = new Robot(opts);
  mcp.robots[bot.name] = bot;
  mcp.emit("robot_added", bot.name);

  return bot;
};

mcp.start = function start(callback) {
  var fns = _.pluck(mcp.robots, "start");

  _.parallel(fns, function() {
    var mode = Utils.fetch(Config, "workMode", "async");
    if (mode === "sync") { _.invoke(mcp.robots, "startWork"); }
    callback();
  });
};

/**
 * Halts all MCP robots.
 *
 * @param {Function} callback function to call when done halting robots
 * @return {void}
 */
mcp.halt = function halt(callback) {
  callback = callback || function() {};

  var timeout = setTimeout(callback, Config.haltTimeout || 3000);

  _.parallel(_.pluck(mcp.robots, "halt"), function() {
    clearTimeout(timeout);
    callback();
  });
};

/**
 * Serializes MCP robots, commands, and events into a JSON-serializable Object.
 *
 * @return {Object} a serializable representation of the MCP
 */
mcp.toJSON = function() {
  return {
    robots: _.invoke(mcp.robots, "toJSON"),
    commands: Object.keys(mcp.commands),
    events: mcp.events
  };
};

},{"./config":44,"./logger":49,"./robot":52,"./utils":57,"./utils/helpers":58,"events":7}],51:[function(require,module,exports){
(function (process){
"use strict";

var Logger = require("./logger"),
    _ = require("./utils/helpers");

// Explicitly these modules here, so Browserify can grab them later
require("./test/loopback");
require("./test/test-adaptor");
require("./test/test-driver");
require("./test/ping");

var missingModuleError = function(module) {
  var str = "Cannot find the '" + module + "' module.\n";
  str += "This problem might be fixed by installing it with ";
  str += "'npm install " + module + "' and trying again.";

  console.log(str);

  process.emit("SIGINT");
};

var Registry = module.exports = {
  data: {},

  register: function(module) {
    if (this.data[module]) {
      return this.data[module].module;
    }

    var pkg;

    try {
      pkg = require(module);
    } catch (e) {
      if (e.code === "MODULE_NOT_FOUND") {
        missingModuleError(module);
      }

      throw e;
    }

    this.data[module] = {
      module: pkg,
      adaptors: pkg.adaptors || [],
      drivers: pkg.drivers || [],
      dependencies: pkg.dependencies || []
    };

    this.logRegistration(module, this.data[module]);

    this.data[module].dependencies.forEach(function(dep) {
      Registry.register(dep);
    });

    return this.data[module].module;
  },

  findBy: function(prop, name) {
    // pluralize, if necessary
    if (prop.slice(-1) !== "s") {
      prop += "s";
    }

    return this.search(prop, name);
  },

  findByModule: function(module) {
    if (!this.data[module]) {
      return null;
    }

    return this.data[module].module;
  },

  logRegistration: function(name) {
    var module = this.data[name];

    Logger.debug("Registering module " + name);

    ["adaptors", "drivers", "dependencies"].forEach(function(field) {
      if (module[field].length) {
        Logger.debug("  " + field + ":");
        module[field].forEach(function(item) {
          Logger.debug("    - " + item);
        });
      }
    });
  },

  search: function(entry, value) {
    for (var name in this.data) {
      if (this.data.hasOwnProperty(name)) {
        var repo = this.data[name];

        if (repo[entry] && _.includes(repo[entry], value)) {
          return repo.module;
        }
      }
    }

    return false;
  }
};

// Default drivers/adaptors:
["loopback", "ping", "test-adaptor", "test-driver"].forEach(function(module) {
  Registry.register("./test/" + module);
});

}).call(this,require('_process'))
},{"./logger":49,"./test/loopback":53,"./test/ping":54,"./test/test-adaptor":55,"./test/test-driver":56,"./utils/helpers":58,"_process":14}],52:[function(require,module,exports){
(function (process){
"use strict";

var initializer = require("./initializer"),
    Logger = require("./logger"),
    Utils = require("./utils"),
    Config = require("./config"),
    _ = require("./utils/helpers");

var validator = require("./validator");

var EventEmitter = require("events").EventEmitter;

// used when creating default robot names
var ROBOT_ID = 1;

/**
 * Creates a new Robot instance based on provided options
 *
 * @constructor
 * @param {Object} opts object with Robot options
 * @param {String} [name] the name the robot should have
 * @param {Object} [connections] object containing connection info for the Robot
 * @param {Object} [devices] object containing device information for the Robot
 * @param {Function} [work] a function the Robot will run when started
 * @returns {Robot} new Robot instance
 */
var Robot = module.exports = function Robot(opts) {
  Utils.classCallCheck(this, Robot);

  opts = opts || {};

  validator.validate(opts);

  // auto-bind prototype methods
  for (var prop in Object.getPrototypeOf(this)) {
    if (this[prop] && prop !== "constructor") {
      this[prop] = this[prop].bind(this);
    }
  }

  this.initRobot(opts);

  _.each(opts, function(opt, name) {
    if (this[name] !== undefined) {
      return;
    }

    if (_.isFunction(opt)) {
      this[name] = opt.bind(this);

      if (opts.commands == null) {
        this.commands[name] = opt.bind(this);
      }
    } else {
      this[name] = opt;
    }
  }, this);

  if (opts.commands) {
    var cmds;

    if (_.isFunction(opts.commands)) {
      cmds = opts.commands.call(this);
    } else {
      cmds = opts.commands;
    }

    if (_.isObject(cmds)) {
      this.commands = cmds;
    } else {
      var err = "#commands must be an object ";
      err += "or a function that returns an object";
      throw new Error(err);
    }
  }

  var mode = Utils.fetch(Config, "mode", "manual");

  if (mode === "auto") {
    // run on the next tick, to allow for "work" event handlers to be set up
    setTimeout(this.start, 0);
  }
};

Utils.subclass(Robot, EventEmitter);

/**
 * Condenses information on a Robot to a JSON-serializable format
 *
 * @return {Object} serializable information on the Robot
 */
Robot.prototype.toJSON = function() {
  return {
    name: this.name,
    connections: _.invoke(this.connections, "toJSON"),
    devices: _.invoke(this.devices, "toJSON"),
    commands: Object.keys(this.commands),
    events: _.isArray(this.events) ? this.events : []
  };
};

/**
 * Adds a new Connection to the Robot with the provided name and details.
 *
 * @param {String} name string name for the Connection to use
 * @param {Object} conn options for the Connection initializer
 * @return {Object} the robot
 */
Robot.prototype.connection = function(name, conn) {
  conn.robot = this;
  conn.name = name;

  if (this.connections[conn.name]) {
    var original = conn.name,
        str;

    conn.name = Utils.makeUnique(original, Object.keys(this.connections));

    str = "Connection names must be unique.";
    str += "Renaming '" + original + "' to '" + conn.name + "'";
    this.log(str);
  }

  this.connections[conn.name] = initializer("adaptor", conn);

  return this;
};

/**
 * Initializes all values for a new Robot.
 *
 * @param {Object} opts object passed to Robot constructor
 * @return {void}
 */
Robot.prototype.initRobot = function(opts) {
  this.name = opts.name || "Robot " + ROBOT_ID++;
  this.running = false;

  this.connections = {};
  this.devices = {};

  this.work = opts.work || opts.play;

  this.commands = {};

  if (!this.work) {
    this.work = function() { this.log("No work yet."); };
  }

  _.each(opts.connections, function(conn, key) {
    var name = _.isString(key) ? key : conn.name;

    if (conn.devices) {
      opts.devices = opts.devices || {};

      _.each(conn.devices, function(device, d) {
        device.connection = name;
        opts.devices[d] = device;
      });

      delete conn.devices;
    }

    this.connection(name, _.extend({}, conn));
  }, this);

  _.each(opts.devices, function(device, key) {
    var name = _.isString(key) ? key : device.name;
    this.device(name, _.extend({}, device));
  }, this);
};

/**
 * Adds a new Device to the Robot with the provided name and details.
 *
 * @param {String} name string name for the Device to use
 * @param {Object} device options for the Device initializer
 * @return {Object} the robot
 */
Robot.prototype.device = function(name, device) {
  var str;

  device.robot = this;
  device.name = name;

  if (this.devices[device.name]) {
    var original = device.name;
    device.name = Utils.makeUnique(original, Object.keys(this.devices));

    str = "Device names must be unique.";
    str += "Renaming '" + original + "' to '" + device.name + "'";
    this.log(str);
  }

  if (_.isString(device.connection)) {
    if (this.connections[device.connection] == null) {
      str = "No connection found with the name " + device.connection + ".\n";
      this.log(str);
      process.emit("SIGINT");
    }

    device.connection = this.connections[device.connection];
  } else {
    for (var c in this.connections) {
      device.connection = this.connections[c];
      break;
    }
  }

  this.devices[device.name] = initializer("driver", device);

  return this;
};

/**
 * Starts the Robot's connections, then devices, then work.
 *
 * @param {Function} callback function to be triggered when the Robot has
 * started working
 * @return {Object} the Robot
 */
Robot.prototype.start = function(callback) {
  if (this.running) {
    return this;
  }

  var mode = Utils.fetch(Config, "workMode", "async");

  var start = function() {
    if (mode === "async") {
      this.startWork();
    }
  }.bind(this);

  _.series([
    this.startConnections,
    this.startDevices,
    start
  ], function(err, results) {
    if (err) {
      this.log("An error occured while trying to start the robot:");
      this.log(err);

      this.halt(function() {
        if (_.isFunction(this.error)) {
          this.error.call(this, err);
        }

        if (this.listeners("error").length) {
          this.emit("error", err);
        }
      }.bind(this));
    }

    if (_.isFunction(callback)) {
      callback(err, results);
    }
  }.bind(this));

  return this;
};

/**
 * Starts the Robot's work function
 *
 * @return {void}
 */
Robot.prototype.startWork = function() {
  this.log("Working.");

  this.emit("ready", this);
  this.work.call(this, this);
  this.running = true;
};

/**
 * Starts the Robot's connections
 *
 * @param {Function} callback function to be triggered after the connections are
 * started
 * @return {void}
 */
Robot.prototype.startConnections = function(callback) {
  this.log("Starting connections.");

  var starters = _.map(this.connections, function(conn) {
    return function(cb) {
      return this.startConnection(conn, cb);
    }.bind(this);
  }, this);

  return _.parallel(starters, callback);
};

/**
 * Starts a single connection on Robot
 *
 * @param {Object} connection to start
 * @param {Function} callback function to be triggered after the connection is
 * started
 * @return {void}
 */
Robot.prototype.startConnection = function(connection, callback) {
  if (connection.connected === true) {
    return callback.call(connection);
  }

  var str = "Starting connection '" + connection.name + "'";

  if (connection.host) {
    str += " on host " + connection.host;
  } else if (connection.port) {
    str += " on port " + connection.port;
  }

  this.log(str + ".");
  connection.connect.call(connection, callback);
  connection.connected = true;
  return true;
};

/**
 * Starts the Robot's devices
 *
 * @param {Function} callback function to be triggered after the devices are
 * started
 * @return {void}
 */
Robot.prototype.startDevices = function(callback) {
  var log = this.log;

  log("Starting devices.");

  var starters = _.map(this.devices, function(device) {
    return function(cb) {
      return this.startDevice(device, cb);
    }.bind(this);
  }, this);

  return _.parallel(starters, callback);
};

/**
 * Starts a single device on Robot
 *
 * @param {Object} device to start
 * @param {Function} callback function to be triggered after the device is
 * started
 * @return {void}
 */
Robot.prototype.startDevice = function(device, callback) {
  if (device.started === true) {
    return callback.call(device);
  }

  var log = this.log;
  var str = "Starting device '" + device.name + "'";

  if (device.pin) {
    str += " on pin " + device.pin;
  }

  log(str + ".");
  this[device.name] = device;
  device.start.call(device, callback);
  device.started = true;

  return device.started;
};

/**
 * Halts the Robot, attempting to gracefully stop devices and connections.
 *
 * @param {Function} callback to be triggered when the Robot has stopped
 * @return {void}
 */
Robot.prototype.halt = function(callback) {
  callback = callback || function() {};

  if (!this.running) {
    return callback();
  }

  // ensures callback(err) won't prevent others from halting
  function wrap(fn) {
    return function(cb) { fn.call(null, cb.bind(null, null)); };
  }

  var devices = _.pluck(this.devices, "halt").map(wrap),
      connections = _.pluck(this.connections, "disconnect").map(wrap);

  try {
    _.parallel(devices, function() {
      _.parallel(connections, callback);
    });
  } catch (e) {
    var msg = "An error occured while attempting to safely halt the robot";
    this.log(msg);
    this.log(e.message);
  }

  this.running = false;
};

/**
 * Generates a String representation of a Robot
 *
 * @return {String} representation of a Robot
 */
Robot.prototype.toString = function() {
  return "[Robot name='" + this.name + "']";
};

Robot.prototype.log = function(str) {
  Logger.log("[" + this.name + "] - " + str);
};

}).call(this,require('_process'))
},{"./config":44,"./initializer":46,"./logger":49,"./utils":57,"./utils/helpers":58,"./validator":60,"_process":14,"events":7}],53:[function(require,module,exports){
"use strict";

var Adaptor = require("../adaptor"),
    Utils = require("../utils");

var Loopback = module.exports = function Loopback() {
  Loopback.__super__.constructor.apply(this, arguments);
};

Utils.subclass(Loopback, Adaptor);

Loopback.prototype.connect = function(callback) {
  callback();
};

Loopback.prototype.disconnect = function(callback) {
  callback();
};

Loopback.adaptors = ["loopback"];
Loopback.adaptor = function(opts) { return new Loopback(opts); };

},{"../adaptor":41,"../utils":57}],54:[function(require,module,exports){
"use strict";

var Driver = require("../driver"),
    Utils = require("../utils");

var Ping = module.exports = function Ping() {
  Ping.__super__.constructor.apply(this, arguments);

  this.commands = {
    ping: this.ping
  };

  this.events = ["ping"];
};

Utils.subclass(Ping, Driver);

Ping.prototype.ping = function() {
  this.emit("ping", "ping");
  return "pong";
};

Ping.prototype.start = function(callback) {
  callback();
};

Ping.prototype.halt = function(callback) {
  callback();
};

Ping.drivers = ["ping"];
Ping.driver = function(opts) { return new Ping(opts); };

},{"../driver":45,"../utils":57}],55:[function(require,module,exports){
"use strict";

var Adaptor = require("../adaptor"),
    Utils = require("../utils");

var TestAdaptor = module.exports = function TestAdaptor() {
  TestAdaptor.__super__.constructor.apply(this, arguments);
};

Utils.subclass(TestAdaptor, Adaptor);

TestAdaptor.adaptors = ["test"];
TestAdaptor.adaptor = function(opts) { return new TestAdaptor(opts); };

},{"../adaptor":41,"../utils":57}],56:[function(require,module,exports){
"use strict";

var Driver = require("../driver"),
    Utils = require("../utils");

var TestDriver = module.exports = function TestDriver() {
  TestDriver.__super__.constructor.apply(this, arguments);
};

Utils.subclass(TestDriver, Driver);

TestDriver.drivers = ["test"];
TestDriver.driver = function(opts) { return new TestDriver(opts); };

},{"../driver":45,"../utils":57}],57:[function(require,module,exports){
(function (global){
"use strict";

var _ = require("./utils/helpers");

var monkeyPatches = require("./utils/monkey-patches");

var Utils = module.exports = {
  /**
   * A wrapper around setInterval to provide a more english-like syntax
   * (e.g. "every 5 seconds, do this thing")
   *
   * @param {Number} interval delay between action invocations
   * @param {Function} action function to trigger every time interval elapses
   * @example every((5).seconds(), function() {});
   * @return {intervalID} setInterval ID to pass to clearInterval()
   */
  every: function every(interval, action) {
    return setInterval(action, interval);
  },

  /**
   * A wrapper around setInterval to provide a more english-like syntax
   * (e.g. "after 5 seconds, do this thing")
   *
   * @param {Number} delay how long to wait
   * @param {Function} action action to perform after delay
   * @example after((5).seconds(), function() {});
   * @return {timeoutId} setTimeout ID to pass to clearTimeout()
   */
  after: function after(delay, action) {
    return setTimeout(action, delay);
  },

  /**
   * A wrapper around setInterval, with a delay of 0ms
   *
   * @param {Function} action function to invoke constantly
   * @example constantly(function() {});
   * @return {intervalID} setInterval ID to pass to clearInterval()
   */
  constantly: function constantly(action) {
    return every(0, action);
  },

  /**
   * A wrapper around clearInterval
   *
   * @param {intervalID} intervalID ID of every/after/constantly
   * @example finish(blinking);
   * @return {void}
   */
  finish: function finish(intervalID) {
    clearInterval(intervalID);
  },

  /**
   * Sleeps the program for a period of time.
   *
   * Use of this is not advised, as your program can't do anything else while
   * it's running.
   *
   * @param {Number} ms number of milliseconds to sleep
   * @return {void}
   */
  sleep: function sleep(ms) {
    var start = Date.now(),
        i = 0;

    while (Date.now() < start + ms) {
      i = i.toString();
    }
  },

  /**
   * Utility for providing class inheritance.
   *
   * Based on CoffeeScript's implementation of inheritance.
   *
   * Parent class methods/properites are available on Child.__super__.
   *
   * @param {Function} child the descendent class
   * @param {Function} parent the parent class
   * @return {Function} the child class
   */
  subclass: function subclass(child, parent) {
    var Ctor = function() {
      this.constructor = child;
    };

    for (var key in parent) {
      if (parent.hasOwnProperty(key)) {
        child[key] = parent[key];
      }
    }

    Ctor.prototype = parent.prototype;
    child.prototype = new Ctor();
    child.__super__ = parent.prototype;
    return child;
  },

  proxyFunctions: function proxyFunctions(source, target) {
    _.each(source, function(prop, key) {
      if (_.isFunction(prop) && !target[key]) {
        target[key] = prop.bind(source);
      }
    });
  },

  /**
   * Proxies calls from all methods in the source to a target object
   *
   * @param {String[]} methods methods to proxy
   * @param {Object} target object to proxy methods to
   * @param {Object} [base=this] object to proxy methods from
   * @param {Boolean} [force=false] whether to overwrite existing methods
   * @return {Object} the base
   */
  proxyFunctionsToObject: function(methods, target, base, force) {
    if (base == null) {
      base = this;
    }

    force = force || false;

    methods.forEach(function(method) {
      if (_.isFunction(base[method]) && !force) {
        return;
      }

      base[method] = function() {
        return target[method].apply(target, arguments);
      };
    });

    return base;
  },

  classCallCheck: function(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  },

  /**
   * Approximation of Ruby's Hash#fetch method for object property lookup
   *
   * @param {Object} obj object to do lookup on
   * @param {String} property property name to attempt to access
   * @param {*} fallback a fallback value if property can't be found. if
   * a function, will be invoked with the string property name.
   * @throws Error if fallback needed but not provided, or fallback fn doesn't
   * return anything
   * @example
   *    fetch({ property: "hello world" }, "property"); //=> "hello world"
   * @example
   *    fetch({}, "notaproperty", "default value"); //=> "default value"
   * @example
   *    var notFound = function(prop) { return prop + " not found!" };
   *    fetch({}, "notaproperty", notFound); //=> "notaproperty not found!"
   * @example
   *    var badFallback = function(prop) { prop + " not found!" };
   *    fetch({}, "notaproperty", badFallback);
   *    // Error: no return value from provided callback function
   * @example
   *    fetch(object, "notaproperty");
   *    // Error: key not found: "notaproperty"
   * @return {*} fetched property, fallback, or fallback function return value
   */
  fetch: function(obj, property, fallback) {
    if (obj.hasOwnProperty(property)) {
      return obj[property];
    }

    if (fallback === void 0) {
      throw new Error("key not found: \"" + property + "\"");
    }

    if (_.isFunction(fallback)) {
      var value = fallback(property);

      if (value === void 0) {
        throw new Error("no return value from provided fallback function");
      }

      return value;
    }

    return fallback;
  },

  /**
   * Given a name, and an array of existing names, returns a unique new name
   *
   * @param {String} name the name that's colliding with existing names
   * @param {String[]} arr array of existing names
   * @example
   *   makeUnique("hello", ["hello", "hello-1", "hello-2"]); //=> "hello3"
   * @return {String} the new name
   */
  makeUnique: function(name, arr) {
    var newName;

    if (!~arr.indexOf(name)) {
      return name;
    }

    for (var n = 1; ; n++) {
      newName = name + "-" + n;
      if (!~arr.indexOf(newName)) {
        return newName;
      }
    }
  },

  /**
   * Adds every/after/constantly to the global namespace, and installs
   * monkey-patches.
   *
   * @return {Object} utils object
   */
  bootstrap: function bootstrap() {
    global.every = this.every;
    global.after = this.after;
    global.constantly = this.constantly;

    monkeyPatches.install();

    return this;
  }
};

Utils.bootstrap();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./utils/helpers":58,"./utils/monkey-patches":59}],58:[function(require,module,exports){
"use strict";

/* eslint no-use-before-define: 0 */

var __slice = Array.prototype.slice;

var H = module.exports = {};

function identity(value) {
  return value;
}

function extend(base, source) {
  var isArray = Array.isArray(source);

  if (base == null) {
    base = isArray ? [] : {};
  }

  if (isArray) {
    source.forEach(function(e, i) {
      if (typeof base[i] === "undefined") {
        base[i] = e;
      } else if (typeof e === "object") {
        base[i] = extend(base[i], e);
      } else if (!~base.indexOf(e)) {
        base.push(e);
      }
    });
  } else {
    var key;

    for (key in source) {
      if (typeof source[key] !== "object" || !source[key]) {
        base[key] = source[key];
      } else if (base[key]) {
        extend(base[key], source[key]);
      } else {
        base[key] = source[key];
      }
    }
  }

  return base;
}

extend(H, {
  identity: identity,
  extend: extend
});

function kind(thing) {
  return Object.prototype.toString.call(thing).slice(8, -1);
}

function isA(type) {
  return function(thing) {
    return kind(thing) === type;
  };
}

extend(H, {
  isObject: isA("Object"),
  isObjectLoose: function(thing) { return typeof thing === "object"; },
  isFunction: isA("Function"),
  isArray: isA("Array"),
  isString: isA("String"),
  isNumber: isA("Number"),
  isArguments: isA("Arguments"),
  isUndefined: isA("Undefined")
});

function iterate(thing, fn, thisVal) {
  if (H.isArray(thing)) {
    thing.forEach(fn, thisVal);
    return;
  }

  if (H.isObject(thing)) {
    for (var key in thing) {
      var value = thing[key];
      fn.call(thisVal, value, key);
    }
  }
}

function pluck(collection, key) {
  var keys = [];

  iterate(collection, function(object) {
    if (H.isObject(object)) {
      if (H.isFunction(object[key])) {
        keys.push(object[key].bind(object));
      } else {
        keys.push(object[key]);
      }
    }
  });

  return keys;
}

function map(collection, fn, thisVal) {
  var vals = [];

  if (fn == null) {
    fn = identity;
  }

  iterate(collection, function(object, index) {
    vals.push(fn.call(thisVal, object, index));
  });

  return vals;
}

function invoke(collection, fn) {
  var args = __slice.call(arguments, 2),
      vals = [];

  iterate(collection, function(object) {
    if (H.isFunction(fn)) {
      vals.push(fn.apply(object, args));
      return;
    }

    vals.push(object[fn].apply(object, arguments));
  });

  return vals;
}

function reduce(collection, iteratee, accumulator, thisVal) {
  var isArray = H.isArray(collection);

  if (!isArray && !H.isObjectLoose(collection)) {
    return null;
  }

  if (iteratee == null) {
    iteratee = identity;
  }

  if (accumulator == null) {
    if (isArray) {
      accumulator = collection.shift();
    } else {
      for (var key in collection) {
        accumulator = collection[key];
        delete collection[key];
        break;
      }
    }
  }

  iterate(collection, function(object, name) {
    accumulator = iteratee.call(thisVal, accumulator, object, name);
  });

  return accumulator;
}

extend(H, {
  pluck: pluck,
  each: iterate,
  map: map,
  invoke: invoke,
  reduce: reduce
});

function arity(fn, n) {
  return function() {
    var args = __slice.call(arguments, 0, n);
    return fn.apply(null, args);
  };
}

function partial(fn) {
  var args = __slice.call(arguments, 1);

  return function() {
    return fn.apply(null, args.concat(__slice.call(arguments)));
  };
}

function partialRight(fn) {
  var args = __slice.call(arguments, 1);

  return function() {
    return fn.apply(null, __slice.call(arguments).concat(args));
  };
}

extend(H, {
  arity: arity,
  partial: partial,
  partialRight: partialRight
});

function includes(arr, value) {
  return !!~arr.indexOf(value);
}

extend(H, {
  includes: includes
});

function parallel(functions, done) {
  var total = functions.length,
      completed = 0,
      results = [],
      error;

  if (typeof done !== "function") { done = function() {}; }

  function callback(err, result) {
    if (error) {
      return;
    }

    if (err || error) {
      error = err;
      done(err);
      return;
    }

    completed++;
    results.push(result);

    if (completed === total) {
      done(null, results);
    }
  }

  if (!functions.length) { done(); }

  functions.forEach(function(fn) { fn(callback); });
}

extend(H, {
  parallel: parallel
});

function series(functions, done) {
  var results = [],
      error;

  if (typeof done !== "function") { done = function() {}; }

  function callback(err, result) {
    if (err || error) {
      error = err;
      return done(err);
    }

    results.push(result);

    if (!functions.length) {
      return done(null, results);
    }

    next();
  }

  function next() {
    functions.shift()(callback);
  }

  if (!functions.length) { done(null, results); }
  next();
}

extend(H, {
  series: series
});

},{}],59:[function(require,module,exports){
/* eslint no-extend-native: 0 key-spacing: 0 */

"use strict";

var max = Math.max,
    min = Math.min;

var originals = {
  seconds:   Number.prototype.seconds,
  second:    Number.prototype.second,
  fromScale: Number.prototype.fromScale,
  toScale:   Number.prototype.toScale
};

module.exports.uninstall = function() {
  for (var opt in originals) {
    if (originals[opt] == null) {
      Number.prototype[opt] = originals[opt];
    } else {
      delete Number.prototype[opt];
    }
  }
};

module.exports.install = function() {
  /**
   * Multiplies a number by 60000 to convert minutes
   * to milliseconds
   *
   * @example
   * (2).minutes(); //=> 120000
   * @return {Number} time in milliseconds
   */
  Number.prototype.minutes = function() {
    return this * 60000;
  };

  /**
   * Alias for Number.prototype.minutes
   *
   * @see Number.prototype.minute
   * @example
   * (1).minute(); //=>60000
   * @return {Number} time in milliseconds
   */
  Number.prototype.minute = Number.prototype.minutes;

  /**
   * Multiplies a number by 1000 to convert seconds
   * to milliseconds
   *
   * @example
   * (2).seconds(); //=> 2000
   * @return {Number} time in milliseconds
   */
  Number.prototype.seconds = function() {
    return this * 1000;
  };

  /**
   * Alias for Number.prototype.seconds
   *
   * @see Number.prototype.seconds
   * @example
   * (1).second(); //=> 1000
   * @return {Number} time in milliseconds
   */
  Number.prototype.second = Number.prototype.seconds;

  /**
   * Passthru to get time in milliseconds
   *
   * @example
   * (200).milliseconds(); //=> 200
   * @return {Number} time in milliseconds
   */
  Number.prototype.milliseconds = function() {
    return this;
  };

  /**
   * Alias for Number.prototype.milliseconds
   *
   * @see Number.prototype.milliseconds
   * @example
   * (100).ms(); //=> 100
   * @return {Number} time in milliseconds
   */
  Number.prototype.ms = Number.prototype.milliseconds;

  /**
   * Converts microseconds to milliseconds.
   * Note that timing of events in terms of microseconds
   * is not very accurate in JS.
   *
   * @example
   * (2000).microseconds(); //=> 2
   * @return {Number} time in milliseconds
   */
  Number.prototype.microseconds = function() {
    return this / 1000;
  };

  /**
   * Converts a number from a current scale to a 0 - 1 scale.
   *
   * @param {Number} start low point of scale to convert from
   * @param {Number} end high point of scale to convert from
   * @example
   * (5).fromScale(0, 10) //=> 0.5
   * @return {Number} the scaled value
   */
  Number.prototype.fromScale = function(start, end) {
    var val = (this - min(start, end)) / (max(start, end) - min(start, end));

    if (val > 1) {
      return 1;
    }

    if (val < 0) {
      return 0;
    }

    return val;
  };

  /**
   * Converts a number from a 0 - 1 scale to the specified scale.
   *
   * @param {Number} start low point of scale to convert to
   * @param {Number} end high point of scale to convert to
   * @example
   * (0.5).toScale(0, 10) //=> 5
   * @return {Number} the scaled value
   */
  Number.prototype.toScale = function(start, end) {
    var i = this * (max(start, end) - min(start, end)) + min(start, end);

    if (i < start) {
      return start;
    }

    if (i > end) {
      return end;
    }

    return i;
  };
};

},{}],60:[function(require,module,exports){
"use strict";

// validates an Object containing Robot parameters

var Logger = require("./logger"),
    _ = require("./utils/helpers");

function hasProp(object, prop) {
  return object.hasOwnProperty(prop);
}

function die() {
  var RobotDSLError = new Error("Unable to start robot due to a syntax error");
  RobotDSLError.name = "RobotDSLError";
  throw RobotDSLError;
}

function warn(messages) {
  messages = [].concat(messages);
  messages.map(function(msg) { Logger.log(msg); });
}

function fatal(messages) {
  messages = [].concat(messages);
  messages.map(function(msg) { Logger.log(msg); });
  die();
}

var checks = {};

checks.singleObjectSyntax = function(opts, key) {
  var single = hasProp(opts, key),
      plural = hasProp(opts, key + "s");

  if (single && !plural) {
    fatal([
      "The single-object '" + key + "' syntax for robots is not valid.",
      "Instead, use the multiple-value '" + key + "s' key syntax.",
      "Details: http://cylonjs.com/documentation/guides/working-with-robots/"
    ]);
  }
};

checks.singleObjectSyntax = function(opts) {
  ["connection", "device"].map(function(key) {
    var single = hasProp(opts, key),
        plural = hasProp(opts, key + "s");

    if (single && !plural) {
      fatal([
        "The single-object '" + key + "' syntax for robots is not valid.",
        "Instead, use the multiple-value '" + key + "s' key syntax.",
        "Details: http://cylonjs.com/documentation/guides/working-with-robots/"
      ]);
    }
  });
};

checks.deviceWithoutDriver = function(opts) {
  if (opts.devices) {
    _.each(opts.devices, function(device, name) {
      if (!device.driver || device.driver === "") {
        fatal("No driver supplied for device " + name);
      }
    });
  }
};

checks.devicesWithoutConnection = function(opts) {
  var connections = opts.connections,
      devices = opts.devices;

  if (devices && connections && Object.keys(connections).length > 1) {
    var first = Object.keys(connections)[0];

    _.each(devices, function(device, name) {
      if (!device.connection || device.connection === "") {
        warn([
          "No explicit connection provided for device " + name,
          "Will default to using connection " + first
        ]);
      }
    });
  }
};

checks.noConnections = function(opts) {
  var connections = Object.keys(opts.connections || {}).length,
      devices = Object.keys(opts.devices || {}).length;

  if (devices && !connections) {
    fatal(["No connections provided for devices"]);
  }
};

module.exports.validate = function validate(opts) {
  opts = opts || {};

  _.each(checks, function(check) {
    check(opts);
  });
};

},{"./logger":49,"./utils/helpers":58}],61:[function(require,module,exports){
'use strict';

var keys = require('object-keys');
var foreach = require('foreach');
var hasSymbols = typeof Symbol === 'function' && typeof Symbol() === 'symbol';

var toStr = Object.prototype.toString;

var isFunction = function (fn) {
	return typeof fn === 'function' && toStr.call(fn) === '[object Function]';
};

var arePropertyDescriptorsSupported = function () {
	var obj = {};
	try {
		Object.defineProperty(obj, 'x', { enumerable: false, value: obj });
        /* eslint-disable no-unused-vars, no-restricted-syntax */
        for (var _ in obj) { return false; }
        /* eslint-enable no-unused-vars, no-restricted-syntax */
		return obj.x === obj;
	} catch (e) { /* this is IE 8. */
		return false;
	}
};
var supportsDescriptors = Object.defineProperty && arePropertyDescriptorsSupported();

var defineProperty = function (object, name, value, predicate) {
	if (name in object && (!isFunction(predicate) || !predicate())) {
		return;
	}
	if (supportsDescriptors) {
		Object.defineProperty(object, name, {
			configurable: true,
			enumerable: false,
			value: value,
			writable: true
		});
	} else {
		object[name] = value;
	}
};

var defineProperties = function (object, map) {
	var predicates = arguments.length > 2 ? arguments[2] : {};
	var props = keys(map);
	if (hasSymbols) {
		props = props.concat(Object.getOwnPropertySymbols(map));
	}
	foreach(props, function (name) {
		defineProperty(object, name, map[name], predicates[name]);
	});
};

defineProperties.supportsDescriptors = !!supportsDescriptors;

module.exports = defineProperties;

},{"foreach":62,"object-keys":65}],62:[function(require,module,exports){

var hasOwn = Object.prototype.hasOwnProperty;
var toString = Object.prototype.toString;

module.exports = function forEach (obj, fn, ctx) {
    if (toString.call(fn) !== '[object Function]') {
        throw new TypeError('iterator must be a function');
    }
    var l = obj.length;
    if (l === +l) {
        for (var i = 0; i < l; i++) {
            fn.call(ctx, obj[i], i, obj);
        }
    } else {
        for (var k in obj) {
            if (hasOwn.call(obj, k)) {
                fn.call(ctx, obj[k], k, obj);
            }
        }
    }
};


},{}],63:[function(require,module,exports){
var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
var slice = Array.prototype.slice;
var toStr = Object.prototype.toString;
var funcType = '[object Function]';

module.exports = function bind(that) {
    var target = this;
    if (typeof target !== 'function' || toStr.call(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target);
    }
    var args = slice.call(arguments, 1);

    var bound;
    var binder = function () {
        if (this instanceof bound) {
            var result = target.apply(
                this,
                args.concat(slice.call(arguments))
            );
            if (Object(result) === result) {
                return result;
            }
            return this;
        } else {
            return target.apply(
                that,
                args.concat(slice.call(arguments))
            );
        }
    };

    var boundLength = Math.max(0, target.length - args.length);
    var boundArgs = [];
    for (var i = 0; i < boundLength; i++) {
        boundArgs.push('$' + i);
    }

    bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this,arguments); }')(binder);

    if (target.prototype) {
        var Empty = function Empty() {};
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
    }

    return bound;
};

},{}],64:[function(require,module,exports){
var implementation = require('./implementation');

module.exports = Function.prototype.bind || implementation;

},{"./implementation":63}],65:[function(require,module,exports){
'use strict';

// modified from https://github.com/es-shims/es5-shim
var has = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;
var slice = Array.prototype.slice;
var isArgs = require('./isArguments');
var isEnumerable = Object.prototype.propertyIsEnumerable;
var hasDontEnumBug = !isEnumerable.call({ toString: null }, 'toString');
var hasProtoEnumBug = isEnumerable.call(function () {}, 'prototype');
var dontEnums = [
	'toString',
	'toLocaleString',
	'valueOf',
	'hasOwnProperty',
	'isPrototypeOf',
	'propertyIsEnumerable',
	'constructor'
];
var equalsConstructorPrototype = function (o) {
	var ctor = o.constructor;
	return ctor && ctor.prototype === o;
};
var excludedKeys = {
	$console: true,
	$external: true,
	$frame: true,
	$frameElement: true,
	$frames: true,
	$innerHeight: true,
	$innerWidth: true,
	$outerHeight: true,
	$outerWidth: true,
	$pageXOffset: true,
	$pageYOffset: true,
	$parent: true,
	$scrollLeft: true,
	$scrollTop: true,
	$scrollX: true,
	$scrollY: true,
	$self: true,
	$webkitIndexedDB: true,
	$webkitStorageInfo: true,
	$window: true
};
var hasAutomationEqualityBug = (function () {
	/* global window */
	if (typeof window === 'undefined') { return false; }
	for (var k in window) {
		try {
			if (!excludedKeys['$' + k] && has.call(window, k) && window[k] !== null && typeof window[k] === 'object') {
				try {
					equalsConstructorPrototype(window[k]);
				} catch (e) {
					return true;
				}
			}
		} catch (e) {
			return true;
		}
	}
	return false;
}());
var equalsConstructorPrototypeIfNotBuggy = function (o) {
	/* global window */
	if (typeof window === 'undefined' || !hasAutomationEqualityBug) {
		return equalsConstructorPrototype(o);
	}
	try {
		return equalsConstructorPrototype(o);
	} catch (e) {
		return false;
	}
};

var keysShim = function keys(object) {
	var isObject = object !== null && typeof object === 'object';
	var isFunction = toStr.call(object) === '[object Function]';
	var isArguments = isArgs(object);
	var isString = isObject && toStr.call(object) === '[object String]';
	var theKeys = [];

	if (!isObject && !isFunction && !isArguments) {
		throw new TypeError('Object.keys called on a non-object');
	}

	var skipProto = hasProtoEnumBug && isFunction;
	if (isString && object.length > 0 && !has.call(object, 0)) {
		for (var i = 0; i < object.length; ++i) {
			theKeys.push(String(i));
		}
	}

	if (isArguments && object.length > 0) {
		for (var j = 0; j < object.length; ++j) {
			theKeys.push(String(j));
		}
	} else {
		for (var name in object) {
			if (!(skipProto && name === 'prototype') && has.call(object, name)) {
				theKeys.push(String(name));
			}
		}
	}

	if (hasDontEnumBug) {
		var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);

		for (var k = 0; k < dontEnums.length; ++k) {
			if (!(skipConstructor && dontEnums[k] === 'constructor') && has.call(object, dontEnums[k])) {
				theKeys.push(dontEnums[k]);
			}
		}
	}
	return theKeys;
};

keysShim.shim = function shimObjectKeys() {
	if (Object.keys) {
		var keysWorksWithArguments = (function () {
			// Safari 5.0 bug
			return (Object.keys(arguments) || '').length === 2;
		}(1, 2));
		if (!keysWorksWithArguments) {
			var originalKeys = Object.keys;
			Object.keys = function keys(object) {
				if (isArgs(object)) {
					return originalKeys(slice.call(object));
				} else {
					return originalKeys(object);
				}
			};
		}
	} else {
		Object.keys = keysShim;
	}
	return Object.keys || keysShim;
};

module.exports = keysShim;

},{"./isArguments":66}],66:[function(require,module,exports){
'use strict';

var toStr = Object.prototype.toString;

module.exports = function isArguments(value) {
	var str = toStr.call(value);
	var isArgs = str === '[object Arguments]';
	if (!isArgs) {
		isArgs = str !== '[object Array]' &&
			value !== null &&
			typeof value === 'object' &&
			typeof value.length === 'number' &&
			value.length >= 0 &&
			toStr.call(value.callee) === '[object Function]';
	}
	return isArgs;
};

},{}],67:[function(require,module,exports){
'use strict';

var keys = require('object-keys');

module.exports = function hasSymbols() {
	if (typeof Symbol !== 'function' || typeof Object.getOwnPropertySymbols !== 'function') { return false; }
	if (typeof Symbol.iterator === 'symbol') { return true; }

	var obj = {};
	var sym = Symbol('test');
	var symObj = Object(sym);
	if (typeof sym === 'string') { return false; }

	if (Object.prototype.toString.call(sym) !== '[object Symbol]') { return false; }
	if (Object.prototype.toString.call(symObj) !== '[object Symbol]') { return false; }

	// temp disabled per https://github.com/ljharb/object.assign/issues/17
	// if (sym instanceof Symbol) { return false; }
	// temp disabled per https://github.com/WebReflection/get-own-property-symbols/issues/4
	// if (!(symObj instanceof Symbol)) { return false; }

	var symVal = 42;
	obj[sym] = symVal;
	for (sym in obj) { return false; }
	if (keys(obj).length !== 0) { return false; }
	if (typeof Object.keys === 'function' && Object.keys(obj).length !== 0) { return false; }

	if (typeof Object.getOwnPropertyNames === 'function' && Object.getOwnPropertyNames(obj).length !== 0) { return false; }

	var syms = Object.getOwnPropertySymbols(obj);
	if (syms.length !== 1 || syms[0] !== sym) { return false; }

	if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) { return false; }

	if (typeof Object.getOwnPropertyDescriptor === 'function') {
		var descriptor = Object.getOwnPropertyDescriptor(obj, sym);
		if (descriptor.value !== symVal || descriptor.enumerable !== true) { return false; }
	}

	return true;
};

},{"object-keys":65}],68:[function(require,module,exports){
'use strict';

// modified from https://github.com/es-shims/es6-shim
var keys = require('object-keys');
var bind = require('function-bind');
var canBeObject = function (obj) {
	return typeof obj !== 'undefined' && obj !== null;
};
var hasSymbols = require('./hasSymbols')();
var toObject = Object;
var push = bind.call(Function.call, Array.prototype.push);
var propIsEnumerable = bind.call(Function.call, Object.prototype.propertyIsEnumerable);
var originalGetSymbols = hasSymbols ? Object.getOwnPropertySymbols : null;

module.exports = function assign(target, source1) {
	if (!canBeObject(target)) { throw new TypeError('target must be an object'); }
	var objTarget = toObject(target);
	var s, source, i, props, syms, value, key;
	for (s = 1; s < arguments.length; ++s) {
		source = toObject(arguments[s]);
		props = keys(source);
		var getSymbols = hasSymbols && (Object.getOwnPropertySymbols || originalGetSymbols);
		if (getSymbols) {
			syms = getSymbols(source);
			for (i = 0; i < syms.length; ++i) {
				key = syms[i];
				if (propIsEnumerable(source, key)) {
					push(props, key);
				}
			}
		}
		for (i = 0; i < props.length; ++i) {
			key = props[i];
			value = source[key];
			if (propIsEnumerable(source, key)) {
				objTarget[key] = value;
			}
		}
	}
	return objTarget;
};

},{"./hasSymbols":67,"function-bind":64,"object-keys":65}],69:[function(require,module,exports){
'use strict';

var defineProperties = require('define-properties');

var implementation = require('./implementation');
var getPolyfill = require('./polyfill');
var shim = require('./shim');

var polyfill = getPolyfill();

defineProperties(polyfill, {
	implementation: implementation,
	getPolyfill: getPolyfill,
	shim: shim
});

module.exports = polyfill;

},{"./implementation":68,"./polyfill":70,"./shim":71,"define-properties":61}],70:[function(require,module,exports){
'use strict';

var implementation = require('./implementation');

var lacksProperEnumerationOrder = function () {
	if (!Object.assign) {
		return false;
	}
	// v8, specifically in node 4.x, has a bug with incorrect property enumeration order
	// note: this does not detect the bug unless there's 20 characters
	var str = 'abcdefghijklmnopqrst';
	var letters = str.split('');
	var map = {};
	for (var i = 0; i < letters.length; ++i) {
		map[letters[i]] = letters[i];
	}
	var obj = Object.assign({}, map);
	var actual = '';
	for (var k in obj) {
		actual += k;
	}
	return str !== actual;
};

var assignHasPendingExceptions = function () {
	if (!Object.assign || !Object.preventExtensions) {
		return false;
	}
	// Firefox 37 still has "pending exception" logic in its Object.assign implementation,
	// which is 72% slower than our shim, and Firefox 40's native implementation.
	var thrower = Object.preventExtensions({ 1: 2 });
	try {
		Object.assign(thrower, 'xy');
	} catch (e) {
		return thrower[1] === 'y';
	}
	return false;
};

module.exports = function getPolyfill() {
	if (!Object.assign) {
		return implementation;
	}
	if (lacksProperEnumerationOrder()) {
		return implementation;
	}
	if (assignHasPendingExceptions()) {
		return implementation;
	}
	return Object.assign;
};

},{"./implementation":68}],71:[function(require,module,exports){
'use strict';

var define = require('define-properties');
var getPolyfill = require('./polyfill');

module.exports = function shimAssign() {
	var polyfill = getPolyfill();
	define(
		Object,
		{ assign: polyfill },
		{ assign: function () { return Object.assign !== polyfill; } }
	);
	return polyfill;
};

},{"./polyfill":70,"define-properties":61}],72:[function(require,module,exports){
(function (process){
'use strict';

var bindings = require('bindings')('serialport.node');
var listUnix = require('./list-unix');

var linux = process.platform !== 'win32' && process.platform !== 'darwin';

function listLinux(callback) {
  callback = callback || function(err) {
    if (err) { this.emit('error', err) }
  }.bind(this);
  return listUnix(callback);
};

var platformOptions = {};
if (process.platform !== 'win32') {
  platformOptions = {
    vmin: 1,
    vtime: 0
  };
}

module.exports = {
  close: bindings.close,
  drain: bindings.drain,
  flush: bindings.flush,
  list: linux ? listLinux : bindings.list,
  open: bindings.open,
  SerialportPoller: bindings.SerialportPoller,
  set: bindings.set,
  update: bindings.update,
  write: bindings.write,
  platformOptions: platformOptions
};

}).call(this,require('_process'))
},{"./list-unix":73,"_process":14,"bindings":37}],73:[function(require,module,exports){
'use strict';
var Promise = require('bluebird');
var childProcess = Promise.promisifyAll(require('child_process'));
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');

function udevParser(output) {
  var udevInfo = output.split('\n').reduce(function(info, line) {
    if (!line || line.trim() === '') {
      return info;
    }
    var parts = line.split('=').map(function(part) {
      return part.trim();
    });

    info[parts[0].toLowerCase()] = parts[1];

    return info;
  }, {});

  var pnpId;
  if (udevInfo.devlinks) {
    udevInfo.devlinks.split(' ').forEach(function(path) {
      if (path.indexOf('/by-id/') === -1) { return }
      pnpId = path.substring(path.lastIndexOf('/') + 1);
    });
  }

  var vendorId = udevInfo.id_vendor_id;
  if (vendorId && vendorId.substring(0, 2) !== '0x') {
    vendorId = '0x' + vendorId;
  }

  var productId = udevInfo.id_model_id;
  if (productId && productId.substring(0, 2) !== '0x') {
    productId = '0x' + productId;
  }

  return {
    comName: udevInfo.devname,
    manufacturer: udevInfo.id_vendor,
    serialNumber: udevInfo.id_serial,
    pnpId: pnpId,
    vendorId: vendorId,
    productId: productId
  };
}

function checkPathAndDevice(path) {
  // get only serial port names
  if (!(/(tty(S|ACM|USB|AMA|MFD)|rfcomm)/).test(path)) {
    return false;
  }
  return fs.statAsync(path).then(function(stats) {
    return stats.isCharacterDevice();
  });
}

function lookupPort(file) {
  var udevadm = 'udevadm info --query=property -p $(udevadm info -q path -n ' + file + ')';
  return childProcess.execAsync(udevadm).then(udevParser);
}

function listUnix(callback) {
  var dirName = '/dev';
  fs.readdirAsync(dirName)
    .catch(function(err) {
      // if this directory is not found we just pretend everything is OK
      // TODO Depreciated this check?
      if (err.errno === 34) {
        return [];
      }
      throw err;
    })
    .map(function(file) { return path.join(dirName, file) })
    .filter(checkPathAndDevice)
    .map(lookupPort)
    .asCallback(callback);
}

module.exports = listUnix;

},{"bluebird":38,"child_process":1,"fs":1,"path":12}],74:[function(require,module,exports){
(function (Buffer){
'use strict';

// Copyright 2011 Chris Williams <chris@iterativedesigns.com>

module.exports = {
  raw: function (emitter, buffer) {
    emitter.emit('data', buffer);
  },

  // encoding: ascii utf8 utf16le ucs2 base64 binary hex
  // More: http://nodejs.org/api/buffer.html#buffer_buffer
  readline: function (delimiter, encoding) {
    if (typeof delimiter === 'undefined' || delimiter === null) { delimiter = '\r' }
    if (typeof encoding === 'undefined' || encoding === null) { encoding = 'utf8' }
    // Delimiter buffer saved in closure
    var data = '';
    return function (emitter, buffer) {
      // Collect data
      data += buffer.toString(encoding);
      // Split collected data by delimiter
      var parts = data.split(delimiter);
      data = parts.pop();
      parts.forEach(function (part) {
        emitter.emit('data', part);
      });
    };
  },

  // Emit a data event every `length` bytes
  byteLength: function(length) {
    var data = new Buffer(0);
    return function(emitter, buffer) {
      data = Buffer.concat([data, buffer]);
      while (data.length >= length) {
        var out = data.slice(0, length);
        data = data.slice(length);
        emitter.emit('data', out);
      }
    };
  },

  // Emit a data event each time a byte sequence (delimiter is an array of byte) is found
  // Sample usage : byteDelimiter([10, 13])
  byteDelimiter: function (delimiter) {
    if (Object.prototype.toString.call(delimiter) !== '[object Array]') {
      delimiter = [ delimiter ];
    }
    var buf = [];
    var nextDelimIndex = 0;
    return function (emitter, buffer) {
      for (var i = 0; i < buffer.length; i++) {
        buf[buf.length] = buffer[i];
        if (buf[buf.length - 1] === delimiter[nextDelimIndex]) {
          nextDelimIndex++;
        }
        if (nextDelimIndex === delimiter.length) {
          emitter.emit('data', buf);
          buf = [];
          nextDelimIndex = 0;
        }
      }
    };
  }
};

}).call(this,require("buffer").Buffer)
},{"buffer":5}],75:[function(require,module,exports){
(function (process,Buffer){
'use strict';

// Copyright 2011 Chris Williams <chris@iterativedesigns.com>

// Require serialport binding from pre-compiled binaries using
// node-pre-gyp, if something fails or package not available fallback
// to regular build from source.

// 3rd Party Dependencies
var debug = require('debug')('serialport');

// shims
var assign = require('object.assign').getPolyfill();

// Internal Dependencies
var SerialPortBinding = require('./bindings');
var parsers = require('./parsers');

// Built-ins Dependencies
var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var stream = require('stream');
var util = require('util');

// Setup the factory
var factory = new EventEmitter();
factory.parsers = parsers;
factory.list = SerialPortBinding.list;

//  VALIDATION ARRAYS
var DATABITS = [5, 6, 7, 8];
var STOPBITS = [1, 1.5, 2];
var PARITY = ['none', 'even', 'mark', 'odd', 'space'];
var FLOWCONTROLS = ['xon', 'xoff', 'xany', 'rtscts'];
var SET_OPTIONS = ['brk', 'cts', 'dtr', 'dts', 'rts'];

// Stuff from ReadStream, refactored for our usage:
var kPoolSize = 40 * 1024;
var kMinPoolSpace = 128;

var defaultSettings = {
  baudRate: 9600,
  parity: 'none',
  xon: false,
  xoff: false,
  xany: false,
  rtscts: false,
  hupcl: true,
  dataBits: 8,
  stopBits: 1,
  bufferSize: 64 * 1024,
  parser: parsers.raw,
  platformOptions: SerialPortBinding.platformOptions
};

var defaultSetFlags = {
  brk: false,
  cts: false,
  dtr: true,
  dts: false,
  rts: true
};

// deprecate the lowercase version of these options next major release
var LOWERCASE_OPTIONS = [
  'baudRate',
  'dataBits',
  'stopBits',
  'bufferSize',
  'platformOptions',
  'flowControl'
];

function correctOptions(options) {
  LOWERCASE_OPTIONS.forEach(function(name) {
    var lowerName = name.toLowerCase();
    if (options.hasOwnProperty(lowerName)) {
      var value = options[lowerName];
      delete options[lowerName];
      options[name] = value;
    }
  });
  return options;
}

function SerialPort(path, options, openImmediately, callback) {
  var args = Array.prototype.slice.call(arguments);
  callback = args.pop();
  if (typeof callback !== 'function') {
    callback = null;
  }

  options = (typeof options !== 'function') && options || {};

  if (openImmediately === undefined || openImmediately === null) {
    openImmediately = true;
  }

  stream.Stream.call(this);
  callback = callback || function (err) {
    if (err) {
      if (this._events.error) {
        this.emit('error', err);
      } else {
        factory.emit('error', err);
      }
    }
  }.bind(this);

  if (!path) {
    return callback(new Error('Invalid port specified: ' + path));
  }
  this.path = path;

  var correctedOptions = correctOptions(options);
  var settings = assign({}, defaultSettings, correctedOptions);

  if (DATABITS.indexOf(settings.dataBits) === -1) {
    return callback(new Error('Invalid "databits": ' + settings.dataBits));
  }

  if (STOPBITS.indexOf(settings.stopBits) === -1) {
    return callback(new Error('Invalid "stopbits": ' + settings.stopbits));
  }

  if (PARITY.indexOf(settings.parity) === -1) {
    return callback(new Error('Invalid "parity": ' + settings.parity));
  }

  var fc = settings.flowControl;
  if (fc === true) {
    // Why!?
    settings.rtscts = true;
  } else if (Array.isArray(fc)) {
    for (var i = fc.length - 1; i >= 0; i--) {
      var fcSetting = fc[i].toLowerCase();
      if (FLOWCONTROLS.indexOf(fcSetting) > -1) {
        settings[fcSetting] = true;
      } else {
        return callback(new Error('Invalid flowControl option: ' + fcSetting));
      }
    }
  }

  // TODO remove this option
  settings.dataCallback = options.dataCallback || function (data) {
    settings.parser(this, data);
  }.bind(this);

  // TODO remove this option
  settings.disconnectedCallback = options.disconnectedCallback || function (err) {
    if (this.closing) {
      return;
    }
    if (!err) {
      err = new Error('Disconnected');
    }
    this.emit('disconnect', err);
  }.bind(this);

  this.fd = null;
  this.paused = true;
  this.opening = false;
  this.closing = false;

  if (process.platform !== 'win32') {
    this.bufferSize = settings.bufferSize;
    this.readable = true;
    this.reading = false;
  }

  this.options = settings;

  if (openImmediately) {
    process.nextTick(function () {
      this.open(callback);
    }.bind(this));
  }
}

factory.SerialPort = SerialPort;
util.inherits(SerialPort, stream.Stream);

SerialPort.prototype._error = function(error, callback) {
  if (callback) {
    callback(error);
  } else {
    this.emit('error', error);
  }
};

SerialPort.prototype.open = function (callback) {
  if (this.isOpen()) {
    return this._error(new Error('Port is already open'), callback);
  }

  if (this.opening) {
    return this._error(new Error('Port is opening'), callback);
  }

  this.paused = true;
  this.readable = true;
  this.reading = false;
  this.opening = true;

  var self = this;
  SerialPortBinding.open(this.path, this.options, function (err, fd) {
    if (err) {
      debug('SerialPortBinding.open had an error', err);
      return self._error(err, callback);
    }
    self.fd = fd;
    self.paused = false;
    self.opening = false;

    if (process.platform !== 'win32') {
      self.serialPoller = new SerialPortBinding.SerialportPoller(self.fd, function (err) {
        if (!err) {
          self._read();
        } else {
          self.disconnected(err);
        }
      });
      self.serialPoller.start();
    }

    self.emit('open');
    if (callback) { callback() }
  });
};

// underlying code is written to update all options, but for now
// only baud is respected as I don't want to duplicate all the option
// verification code above
SerialPort.prototype.update = function (options, callback) {
  if (!this.isOpen()) {
    debug('update attempted, but port is not open');
    return this._error(new Error('Port is not open'), callback);
  }

  var correctedOptions = correctOptions(options);
  var settings = assign({}, defaultSettings, correctedOptions);
  this.options.baudRate = settings.baudRate;

  SerialPortBinding.update(this.fd, this.options, function (err) {
    if (err) {
      return this._error(err, callback);
    }
    this.emit('open');
    if (callback) { callback() }
  }.bind(this));
};

SerialPort.prototype.isOpen = function() {
  return this.fd !== null && !this.closing;
};

SerialPort.prototype.write = function (buffer, callback) {
  if (!this.isOpen()) {
    debug('write attempted, but port is not open');
    return this._error(new Error('Port is not open'), callback);
  }

  if (!Buffer.isBuffer(buffer)) {
    buffer = new Buffer(buffer);
  }
  debug('write data: ' + JSON.stringify(buffer));

  var self = this;
  SerialPortBinding.write(this.fd, buffer, function (err, results) {
    if (callback) {
      callback(err, results);
    } else {
      if (err) {
        self.emit('error', err);
      }
    }
  });
};

if (process.platform !== 'win32') {
  SerialPort.prototype._read = function () {
    var self = this;
    if (!self.readable || self.paused || self.reading || this.closing) {
      return;
    }

    self.reading = true;

    if (!self.pool || self.pool.length - self.pool.used < kMinPoolSpace) {
      // discard the old pool. Can't add to the free list because
      // users might have references to slices on it.
      self.pool = new Buffer(kPoolSize);
      self.pool.used = 0;
    }

    // Grab another reference to the pool in the case that while we're in the
    // thread pool another read() finishes up the pool, and allocates a new
    // one.
    var toRead = Math.min(self.pool.length - self.pool.used, ~~self.bufferSize);
    var start = self.pool.used;

    function afterRead(err, bytesRead, readPool, bytesRequested) {
      self.reading = false;
      if (err) {
        if (err.code && err.code === 'EAGAIN') {
          if (!self.closing && self.isOpen()) {
            self.serialPoller.start();
          }
        // handle edge case were mac/unix doesn't clearly know the error.
        } else if (err.code && (err.code === 'EBADF' || err.code === 'ENXIO' || (err.errno === -1 || err.code === 'UNKNOWN'))) {
          self.disconnected(err);
        } else {
          self.fd = null;
          self.readable = false;
          self.emit('error', err);
        }
      } else {
        // Since we will often not read the number of bytes requested,
        // let's mark the ones we didn't need as available again.
        self.pool.used -= bytesRequested - bytesRead;

        if (bytesRead === 0) {
          if (self.isOpen()) {
            self.serialPoller.start();
          }
        } else {
          var b = self.pool.slice(start, start + bytesRead);

          // do not emit events if the stream is paused
          if (self.paused) {
            self.buffer = Buffer.concat([self.buffer, b]);
            return;
          }
          self._emitData(b);

          // do not emit events anymore after we declared the stream unreadable
          if (!self.readable) {
            return;
          }
          self._read();
        }
      }
    }

    fs.read(self.fd, self.pool, self.pool.used, toRead, null, function (err, bytesRead) {
      var readPool = self.pool;
      var bytesRequested = toRead;
      afterRead(err, bytesRead, readPool, bytesRequested);
    });

    self.pool.used += toRead;
  };

  SerialPort.prototype._emitData = function (data) {
    this.options.dataCallback(data);
  };

  SerialPort.prototype.pause = function () {
    var self = this;
    self.paused = true;
  };

  SerialPort.prototype.resume = function () {
    var self = this;
    self.paused = false;

    if (self.buffer) {
      var buffer = self.buffer;
      self.buffer = null;
      self._emitData(buffer);
    }

    // No longer open?
    if (!this.isOpen()) {
      return;
    }

    self._read();
  };
} // if !'win32'

SerialPort.prototype.disconnected = function (err) {
  var self = this;
  var fd = self.fd;

  // send notification of disconnect
  if (self.options.disconnectedCallback) {
    self.options.disconnectedCallback(err);
  } else {
    self.emit('disconnect', err);
  }
  self.paused = true;
  self.closing = true;

  self.emit('close');

  // clean up all other items
  fd = self.fd;

  try {
    SerialPortBinding.close(fd, function (err) {
      if (err) {
        debug('Disconnect completed with error: ' + JSON.stringify(err));
      } else {
        debug('Disconnect completed.');
      }
    });
  } catch (e) {
    debug('Disconnect completed with an exception: ' + JSON.stringify(e));
  }

  // TODO THIS IS CRAZY TOWN
  self.removeAllListeners();

  self.closing = false;
  self.fd = null;

  if (process.platform !== 'win32') {
    self.readable = false;
    self.serialPoller.close();
  }
};

SerialPort.prototype.close = function (callback) {
  var self = this;
  var fd = self.fd;

  if (self.closing) {
    debug('close attempted, but port is already closing');
    return this._error(new Error('Port is not open'), callback);
  }

  if (!this.isOpen()) {
    debug('close attempted, but port is not open');
    return this._error(new Error('Port is not open'), callback);
  }

  self.closing = true;

  // Stop polling before closing the port.
  if (process.platform !== 'win32') {
    self.readable = false;
    self.serialPoller.close();
  }

  try {
    SerialPortBinding.close(fd, function (err) {
      self.closing = false;
      if (err) {
        debug('SerialPortBinding.close had an error', err);
        return self._error(err, callback);
      }

      self.fd = null;
      self.emit('close');
      if (callback) { callback() }
      self.removeAllListeners();
    });
  } catch (err) {
    this.closing = false;
    debug('SerialPortBinding.close had an throwing error', err);
    return this._error(err, callback);
  }
};

SerialPort.prototype.flush = function (callback) {
  var self = this;
  var fd = self.fd;

  if (!this.isOpen()) {
    debug('flush attempted, but port is not open');
    return this._error(new Error('Port is not open'), callback);
  }

  SerialPortBinding.flush(fd, function (err, result) {
    if (callback) {
      callback(err, result);
    } else if (err) {
      self.emit('error', err);
    }
  });
};

SerialPort.prototype.set = function (options, callback) {
  if (!this.isOpen()) {
    debug('set attempted, but port is not open');
    return this._error(new Error('Port is not open'), callback);
  }

  options = options || {};
  if (!callback && typeof options === 'function') {
    callback = options;
    options = {};
  }

  var settings = {};
  for (var i = SET_OPTIONS.length - 1; i >= 0; i--) {
    var flag = SET_OPTIONS[i];
    if (options[flag] !== undefined) {
      settings[flag] = options[flag];
    } else {
      settings[flag] = defaultSetFlags[flag];
    }
  }

  SerialPortBinding.set(this.fd, settings, function (err, result) {
    if (err) {
      debug('SerialPortBinding.set had an error', err);
      return this._error(err, callback);
    }
    if (callback) { callback(null, result) }
  }.bind(this));
};

SerialPort.prototype.drain = function (callback) {
  var self = this;
  var fd = this.fd;

  if (!this.isOpen()) {
    debug('drain attempted, but port is not open');
    return this._error(new Error('Port is not open'), callback);
  }

  SerialPortBinding.drain(fd, function (err, result) {
    if (callback) {
      callback(err, result);
    } else if (err) {
      self.emit('error', err);
    }
  });
};

module.exports = factory;

}).call(this,require('_process'),require("buffer").Buffer)
},{"./bindings":72,"./parsers":74,"_process":14,"buffer":5,"debug":76,"events":7,"fs":1,"object.assign":69,"stream":26,"util":31}],76:[function(require,module,exports){

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // is webkit? http://stackoverflow.com/a/16459606/376773
  return ('WebkitAppearance' in document.documentElement.style) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (window.console && (console.firebug || (console.exception && console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  return JSON.stringify(v);
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs() {
  var args = arguments;
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return args;

  var c = 'color: ' + this.color;
  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
  return args;
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}
  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage(){
  try {
    return window.localStorage;
  } catch (e) {}
}

},{"./debug":77}],77:[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = debug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lowercased letter, i.e. "n".
 */

exports.formatters = {};

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function selectColor() {
  return exports.colors[prevColor++ % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function debug(namespace) {

  // define the `disabled` version
  function disabled() {
  }
  disabled.enabled = false;

  // define the `enabled` version
  function enabled() {

    var self = enabled;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // add the `color` if not set
    if (null == self.useColors) self.useColors = exports.useColors();
    if (null == self.color && self.useColors) self.color = selectColor();

    var args = Array.prototype.slice.call(arguments);

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %o
      args = ['%o'].concat(args);
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    if ('function' === typeof exports.formatArgs) {
      args = exports.formatArgs.apply(self, args);
    }
    var logFn = enabled.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }
  enabled.enabled = true;

  var fn = exports.enabled(namespace) ? enabled : disabled;

  fn.namespace = namespace;

  return fn;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  var split = (namespaces || '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":78}],78:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options){
  options = options || {};
  if ('string' == typeof val) return parse(val);
  return options.long
    ? long(val)
    : short(val);
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = '' + str;
  if (str.length > 10000) return;
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
  if (!match) return;
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function short(ms) {
  if (ms >= d) return Math.round(ms / d) + 'd';
  if (ms >= h) return Math.round(ms / h) + 'h';
  if (ms >= m) return Math.round(ms / m) + 'm';
  if (ms >= s) return Math.round(ms / s) + 's';
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function long(ms) {
  return plural(ms, d, 'day')
    || plural(ms, h, 'hour')
    || plural(ms, m, 'minute')
    || plural(ms, s, 'second')
    || ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) return;
  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
  return Math.ceil(ms / n) + ' ' + name + 's';
}

},{}],79:[function(require,module,exports){
"use strict";

var Sphero = require("./lib/sphero");

/**
 * Creates a new Sphero instance with the provided options.
 *
 * @param {String} address port/UUID/address of the connected Sphero
 * @param {Object} [opts] options for sphero setup
 * @param {Object} [opts.adaptor] if provided, a custom adaptor used for Sphero
 * communication
 * @param {Number} [opts.sop2=0xFD] SOP2 value to be passed to commands
 * @param {Number} [opts.timeout=500] delay before a command is considered dead
 * @example var orb = sphero("/dev/rfcomm0"); // linux
 * @example var orb = sphero("COM4"); // windows
 * @example
 * var orb = sphero("/dev/tty.Sphero-OGB-AMP-SPP", { timeout: 300 }); // OS X
 * @returns {Sphero} a new instance of Sphero
 */
module.exports = function sphero(address, opts) {
  return new Sphero(address, opts);
};

},{"./lib/sphero":91}],80:[function(require,module,exports){
"use strict";

var util = require("util"),
    EventEmitter = require("events").EventEmitter;

var serialport,
    isChrome = typeof chrome !== "undefined";

// thanks to https://github.com/jgautier/firmata/blob/master/lib/firmata.js
try {
  if (isChrome) {
    serialport = require("browser-serialport");
  } else {
    serialport = require("serialport");
  }
} catch (error) {
  serialport = null;
}

if (serialport == null) {
  var err = [
    "It looks like serialport didn't compile properly.",
    "This is a common problem, and it's fix is documented here:",
    "https://github.com/voodootikigod/node-serialport#to-install"
  ].join(" ");

  console.error(err);
  throw new Error("Missing serialport dependency");
}

/**
 * An adaptor to communicate with a serial port
 *
 * @constructor
 * @param {String} conn the serialport string to connect to
 */
var Adaptor = module.exports = function Adaptor(conn) {
  this.conn = conn;
  this.serialport = null;
};

util.inherits(Adaptor, EventEmitter);

/**
 * Opens a connection to the serial port.
 * Triggers the provided callback when ready.
 *
 * @param {Function} callback (err)
 * @return {void}
 */
Adaptor.prototype.open = function open(callback) {
  var self = this,
      port = this.serialport = new serialport.SerialPort(this.conn, {});

  function emit(name) {
    return self.emit.bind(self, name);
  }

  port.on("open", function(error) {
    if (error) {
      callback(error);
      return;
    }

    self.emit("open");

    port.on("error", emit("error"));
    port.on("close", emit("close"));
    port.on("data", emit("data"));

    callback();
  });
};

/**
 * Writes data to the serialport.
 * Triggers the provided callback when done.
 *
 * @param {Any} data info to be written to the serialport. turned into a buffer.
 * @param {Function} [callback] triggered when write is complete
 * @return {void}
 */
Adaptor.prototype.write = function write(data, callback) {
  this.serialport.write(data, callback);
};

/**
 * Adds a listener to the serialport's "data" event.
 * The provided callback will be triggered whenever the serialport reads data
 *
 * @param {Function} callback function to be invoked when data is read
 * @return {void}
 */
Adaptor.prototype.onRead = function onRead(callback) {
  this.on("data", callback);
};

/**
 * Disconnects from the serialport
 * The provided callback will be triggered after disconnecting
 *
 * @param {Function} callback function to be invoked when disconnected
 * @return {void}
 */
Adaptor.prototype.close = function close(callback) {
  this.serialport.close(callback);
};

},{"browser-serialport":39,"events":7,"serialport":75,"util":31}],81:[function(require,module,exports){
/* eslint key-spacing: 0 */
"use strict";

module.exports = {
  aliceblue            : 0xf0f8ff,
  antiquewhite         : 0xfaebd7,
  aqua                 : 0x00ffff,
  aquamarine           : 0x7fffd4,
  azure                : 0xf0ffff,
  beige                : 0xf5f5dc,
  bisque               : 0xffe4c4,
  black                : 0x000000,
  blanchedalmond       : 0xffebcd,
  blue                 : 0x0000ff,
  blueviolet           : 0x8a2be2,
  brown                : 0xa52a2a,
  burlywood            : 0xdeb887,
  cadetblue            : 0x5f9ea0,
  chartreuse           : 0x7fff00,
  chocolate            : 0xd2691e,
  coral                : 0xff7f50,
  cornflowerblue       : 0x6495ed,
  cornsilk             : 0xfff8dc,
  crimson              : 0xdc143c,
  cyan                 : 0x00ffff,
  darkblue             : 0x00008b,
  darkcyan             : 0x008b8b,
  darkgoldenrod        : 0xb8860b,
  darkgray             : 0xa9a9a9,
  darkgreen            : 0x006400,
  darkkhaki            : 0xbdb76b,
  darkmagenta          : 0x8b008b,
  darkolivegreen       : 0x556b2f,
  darkorange           : 0xff8c00,
  darkorchid           : 0x9932cc,
  darkred              : 0x8b0000,
  darksalmon           : 0xe9967a,
  darkseagreen         : 0x8fbc8f,
  darkslateblue        : 0x483d8b,
  darkslategray        : 0x2f4f4f,
  darkturquoise        : 0x00ced1,
  darkviolet           : 0x9400d3,
  deeppink             : 0xff1493,
  deepskyblue          : 0x00bfff,
  dimgray              : 0x696969,
  dodgerblue           : 0x1e90ff,
  firebrick            : 0xb22222,
  floralwhite          : 0xfffaf0,
  forestgreen          : 0x228b22,
  fuchsia              : 0xff00ff,
  gainsboro            : 0xdcdcdc,
  ghostwhite           : 0xf8f8ff,
  gold                 : 0xffd700,
  goldenrod            : 0xdaa520,
  gray                 : 0x808080,
  green                : 0x008000,
  greenyellow          : 0xadff2f,
  honeydew             : 0xf0fff0,
  hotpink              : 0xff69b4,
  indianred            : 0xcd5c5c,
  indigo               : 0x4b0082,
  ivory                : 0xfffff0,
  khaki                : 0xf0e68c,
  lavender             : 0xe6e6fa,
  lavenderblush        : 0xfff0f5,
  lawngreen            : 0x7cfc00,
  lemonchiffon         : 0xfffacd,
  lightblue            : 0xadd8e6,
  lightcoral           : 0xf08080,
  lightcyan            : 0xe0ffff,
  lightgoldenrodyellow : 0xfafad2,
  lightgreen           : 0x90ee90,
  lightgrey            : 0xd3d3d3,
  lightpink            : 0xffb6c1,
  lightsalmon          : 0xffa07a,
  lightseagreen        : 0x20b2aa,
  lightskyblue         : 0x87cefa,
  lightslategray       : 0x778899,
  lightsteelblue       : 0xb0c4de,
  lightyellow          : 0xffffe0,
  lime                 : 0x00ff00,
  limegreen            : 0x32cd32,
  linen                : 0xfaf0e6,
  magenta              : 0xff00ff,
  maroon               : 0x800000,
  mediumaquamarine     : 0x66cdaa,
  mediumblue           : 0x0000cd,
  mediumorchid         : 0xba55d3,
  mediumpurple         : 0x9370db,
  mediumseagreen       : 0x3cb371,
  mediumslateblue      : 0x7b68ee,
  mediumspringgreen    : 0x00fa9a,
  mediumturquoise      : 0x48d1cc,
  mediumvioletred      : 0xc71585,
  midnightblue         : 0x191970,
  mintcream            : 0xf5fffa,
  mistyrose            : 0xffe4e1,
  moccasin             : 0xffe4b5,
  navajowhite          : 0xffdead,
  navy                 : 0x000080,
  oldlace              : 0xfdf5e6,
  olive                : 0x808000,
  olivedrab            : 0x6b8e23,
  orange               : 0xffa500,
  orangered            : 0xff4500,
  orchid               : 0xda70d6,
  palegoldenrod        : 0xeee8aa,
  palegreen            : 0x98fb98,
  paleturquoise        : 0xafeeee,
  palevioletred        : 0xdb7093,
  papayawhip           : 0xffefd5,
  peachpuff            : 0xffdab9,
  peru                 : 0xcd853f,
  pink                 : 0xffc0cb,
  plum                 : 0xdda0dd,
  powderblue           : 0xb0e0e6,
  purple               : 0x800080,
  rebeccapurple        : 0x663399,
  red                  : 0xff0000,
  rosybrown            : 0xbc8f8f,
  royalblue            : 0x4169e1,
  saddlebrown          : 0x8b4513,
  salmon               : 0xfa8072,
  sandybrown           : 0xf4a460,
  seagreen             : 0x2e8b57,
  seashell             : 0xfff5ee,
  sienna               : 0xa0522d,
  silver               : 0xc0c0c0,
  skyblue              : 0x87ceeb,
  slateblue            : 0x6a5acd,
  slategray            : 0x708090,
  snow                 : 0xfffafa,
  springgreen          : 0x00ff7f,
  steelblue            : 0x4682b4,
  tan                  : 0xd2b48c,
  teal                 : 0x008080,
  thistle              : 0xd8bfd8,
  tomato               : 0xff6347,
  turquoise            : 0x40e0d0,
  violet               : 0xee82ee,
  wheat                : 0xf5deb3,
  white                : 0xffffff,
  whitesmoke           : 0xf5f5f5,
  yellow               : 0xffff00,
  yellowgreen          : 0x9acd32
};

},{}],82:[function(require,module,exports){
/* eslint key-spacing: 0 */
"use strict";

module.exports = {
  ping             : 0x01,
  version          : 0x02,
  controlUARTTx    : 0x03,
  setDeviceName    : 0x10,
  getBtInfo        : 0x11,
  setAutoReconnect : 0x12,
  getAutoReconnect : 0x13,
  getPwrState      : 0x20,
  setPwrNotify     : 0x21,
  sleep            : 0x22,
  getPowerTrips    : 0x23,
  setPowerTrips    : 0x24,
  setInactiveTimer : 0x25,
  goToBl           : 0x30,
  runL1Diags       : 0x40,
  runL2Diags       : 0x41,
  clearCounters    : 0x42,
  assignTime       : 0x50,
  pollTimes        : 0x51
};

},{}],83:[function(require,module,exports){
/* eslint key-spacing: 0 */
"use strict";

module.exports = {
  setHeading            : 0x01,
  setStabilization      : 0x02,
  setRotationRate       : 0x03,
  setCreationDate       : 0x04,
  getBallRegWebsite     : 0x05,
  reEnableDemo          : 0x06,
  getChassisId          : 0x07,
  setChassisId          : 0x08,
  selfLevel             : 0x09,
  setVdl                : 0x0A,
  setDataStreaming      : 0x11,
  setCollisionDetection : 0x12,
  locator               : 0x13,
  setAccelerometer      : 0x14,
  readLocator           : 0x15,
  setRgbLed             : 0x20,
  setBackLed            : 0x21,
  getRgbLed             : 0x22,
  roll                  : 0x30,
  boost                 : 0x31,
  move                  : 0x32,
  setRawMotors          : 0x33,
  setMotionTimeout      : 0x34,
  setOptionsFlag        : 0x35,
  getOptionsFlag        : 0x36,
  setTempOptionFlags    : 0x37,
  getTempOptionFlags    : 0x38,
  getConfigBlock        : 0x40,
  setSsbParams          : 0x41,
  setDeviceMode         : 0x42,
  setConfigBlock        : 0x43,
  getDeviceMode         : 0x44,
  getSsb                : 0x46,
  setSsb                : 0x47,
  ssbRefill             : 0x48,
  ssbBuy                : 0x49,
  ssbUseConsumeable     : 0x4A,
  ssbGrantCores         : 0x4B,
  ssbAddXp              : 0x4C,
  ssbLevelUpAttr        : 0x4D,
  getPwSeed             : 0x4E,
  ssbEnableAsync        : 0x4F,
  runMacro              : 0x50,
  saveTempMacro         : 0x51,
  saveMacro             : 0x52,
  initMacroExecutive    : 0x54,
  abortMacro            : 0x55,
  macroStatus           : 0x56,
  setMacroParam         : 0x57,
  appendTempMacroChunk  : 0x58,
  eraseOBStorage        : 0x60,
  appendOBFragment      : 0x61,
  execOBProgram         : 0x62,
  abortOBProgram        : 0x63,
  answerInput           : 0x64,
  commitToFlash         : 0x65,
  commitToFlashAlias    : 0x70
};

},{}],84:[function(require,module,exports){
"use strict";

var utils = require("../utils"),
    commands = require("../commands/core");

module.exports = function core(device) {
  // Core Virtual Device Address = 0x00
  var command = device.command.bind(device, 0x00);

  /**
   * The Ping command verifies the Sphero is awake and receiving commands.
   *
   * @param {Function} callback triggered when Sphero has been pinged
   * @example
   * orb.ping(function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.ping = function(callback) {
    command(commands.ping, null, callback);
  };

  /**
   * The Version command returns a batch of software and hardware information
   * about Sphero.
   *
   * @param {Function} callback triggered with version information
   * @example
   * orb.version(function(err, data) {
   *   if (err) {
   *     console.log("error: ", err);
   *   } else {
   *     console.log("data:");
   *     console.log("  recv:", data.recv);
   *     console.log("  mdl:", data.mdl);
   *     console.log("  hw:", data.hw);
   *     console.log("  msaVer:", data.msaVer);
   *     console.log("  msaRev:", data.msaRev);
   *     console.log("  bl:", data.bl);
   *     console.log("  bas:", data.bas);
   *     console.log("  macro:", data.macro);
   *     console.log("  apiMaj:", data.apiMaj);
   *     console.log("  apiMin:", data.apiMin);
   *   }
   * }
   * @return {void}
   */
  device.version = function(callback) {
    command(commands.version, null, callback);
  };

  /**
   * The Control UART Tx command enables or disables the CPU's UART transmit
   * line so another client can configure the Bluetooth module.
   *
   * @param {Function} callback function to be triggered after write
   * @example
   * orb.controlUartTx(function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.controlUartTx = function(callback) {
    command(commands.controlUARTTx, null, callback);
  };

  /**
   * The Set Device Name command assigns Sphero an internal name. This value is
   * then produced as part of the Get Bluetooth Info command.
   *
   * Names are clipped at 48 characters to support UTF-8 sequences. Any extra
   * characters will be discarded.
   *
   * This field defaults to the Bluetooth advertising name of Sphero.
   *
   * @param {String} name what name to give to the Sphero
   * @param {Function} callback function to be triggered when the name is set
   * @example
   * orb.setDeviceName("rollingOrb", function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.setDeviceName = function(name, callback) {
    var data = [];

    for (var i = 0; i < name.length; ++i) {
      data[i] = name.charCodeAt(i);
    }

    command(commands.setDeviceName, data, callback);
  };

  /**
   * Triggers the callback with a structure containing
   *
   * - Sphero's ASCII name
   * - Sphero's Bluetooth address (ASCII)
   * - Sphero's ID colors
   *
   * @param {Function} callback function to be triggered with Bluetooth info
   * @example
   * orb.getBluetoothInfo(function(err, data) {
   *   if (err) {
   *     console.log("error: ", err);
   *   } else {
   *     console.log("data:");
   *     console.log("  name:", data.name);
   *     console.log("  btAddress:", data.btAddress);
   *     console.log("  separator:", data.separator);
   *     console.log("  colors:", data.colors);
   *   }
   * }
   * @return {void}
   */
  device.getBluetoothInfo = function(callback) {
    command(commands.getBtInfo, null, callback);
  };

  /**
   * The Set Auto Reconnect command tells Sphero's BT module whether or not it
   * should automatically reconnect to the previously-connected Apple mobile
   * device.
   *
   * @param {Number} flag whether or not to reconnect (0 - no, 1 - yes)
   * @param {Number} time how many seconds after start to enable auto reconnect
   * @param {Function} callback function to be triggered after write
   * @example
   * orb.setAutoReconnect(1, 20, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.setAutoReconnect = function(flag, time, callback) {
    command(commands.setAutoReconnect, [flag, time], callback);
  };

  /**
   * The Get Auto Reconnect command returns the Bluetooth auto reconnect values
   * as defined above in the Set Auto Reconnect command.
   *
   * @param {Function} callback function to be triggered with reconnect data
   * @example
   * orb.getAutoReconnect(function(err, data) {
   *   if (err) {
   *     console.log("error: ", err);
   *   } else {
   *     console.log("data:");
   *     console.log("  flag:", data.flag);
   *     console.log("  time:", data.time);
   *   }
   * }
   * @return {void}
   */
  device.getAutoReconnect = function(callback) {
    command(commands.getAutoReconnect, null, callback);
  };

  /**
   * The Get Power State command returns Sphero's current power state, and some
   * additional parameters:
   *
   * - **RecVer**: record version code (following is for 0x01)
   * - **Power State**: high-level state of the power system
   * - **BattVoltage**: current battery voltage, scaled in 100ths of a volt
   *   (e.g. 0x02EF would be 7.51 volts)
   * - **NumCharges**: Number of battery recharges in the life of this Sphero
   * - **TimeSinceChg**: Seconds awake since last recharge
   *
   * Possible power states:
   *
   * - 0x01 - Battery Charging
   * - 0x02 - Battery OK
   * - 0x03 - Battery Low
   * - 0x04 - Battery Critical
   *
   * @param {Function} callback function to be triggered with power state data
   * @example
   * orb.getPowerState(function(err, data) {
   *   if (err) {
   *     console.log("error: ", err);
   *   } else {
   *     console.log("data:");
   *     console.log("  recVer:", data.recVer);
   *     console.log("  batteryState:", data.batteryState);
   *     console.log("  batteryVoltage:", data.batteryVoltage);
   *     console.log("  chargeCount:", data.chargeCount);
   *     console.log("  secondsSinceCharge:", data.secondsSinceCharge);
   *   }
   * }
   * @return {void}
   */
  device.getPowerState = function(callback) {
    command(commands.getPwrState, null, callback);
  };

  /**
   * The Set Power Notification command enables sphero to asynchronously notify
   * the user of power state periodically (or immediately, when a change occurs)
   *
   * Timed notifications are sent every 10 seconds, until they're disabled or
   * Sphero is unpaired.
   *
   * @param {Number} flag whether or not to send notifications (0 - no, 1 - yes)
   * @param {Function} callback function to be triggered when done writing
   * @example
   * orb.setPowerNotification(1, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.setPowerNotification = function(flag, callback) {
    command(commands.setPwrNotify, [flag], callback);
  };

  /**
   * The Sleep command puts Sphero to sleep immediately.
   *
   * @param {Number} wakeup the number of seconds for Sphero to re-awaken after.
   * 0x00 tells Sphero to sleep forever, 0xFFFF attemps to put Sphero into deep
   * sleep.
   * @param {Number} macro if non-zero, Sphero will attempt to run this macro ID
   * when it wakes up
   * @param {Number} orbBasic if non-zero, Sphero will attempt to run an
   * orbBasic program from this line number
   * @param {Function} callback function to be triggered when done writing
   * @example
   * orb.sleep(10, 0, 0, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.sleep = function(wakeup, macro, orbBasic, callback) {
    wakeup = utils.intToHexArray(wakeup, 2);
    orbBasic = utils.intToHexArray(orbBasic, 2);

    var data = [].concat(wakeup, macro, orbBasic);

    command(commands.sleep, data, callback);
  };

  /**
   * The Get Voltage Trip Points command returns the trip points Sphero uses to
   * determine Low battery and Critical battery.
   *
   * The values are expressed in 100ths of a volt, so defaults of 7V and 6.5V
   * respectively are returned as 700 and 650.
   *
   * @param {Function} callback function to be triggered with trip point data
   * @example
   * orb.getVoltageTripPoints(function(err, data) {
   *   if (err) {
   *     console.log("error: ", err);
   *   } else {
   *     console.log("data:");
   *     console.log("  vLow:", data.vLow);
   *     console.log("  vCrit:", data.vCrit);
   *   }
   * }
   * @return {void}
   */
  device.getVoltageTripPoints = function(callback) {
    command(commands.getPowerTrips, null, callback);
  };

  /**
   * The Set Voltage Trip Points command assigns the voltage trip points for Low
   * and Critical battery voltages.
   *
   * Values are specified in 100ths of a volt, and there are limitations on
   * adjusting these from their defaults:
   *
   * - vLow must be in the range 675-725
   * - vCrit must be in the range 625-675
   *
   * There must be 0.25v of separation between the values.
   *
   * Shifting these values too low can result in very little warning before
   * Sphero forces itself to sleep, depending on the battery pack. Be careful.
   *
   * @param {Number} vLow new voltage trigger for Low battery
   * @param {Number} vCrit new voltage trigger for Crit battery
   * @param {Function} callback function to be triggered when done writing
   * @example
   * orb.setVoltageTripPoints(675, 650, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.setVoltageTripPoints = function(vLow, vCrit, callback) {
    vLow = utils.intToHexArray(vLow, 2);
    vCrit = utils.intToHexArray(vCrit, 2);

    var data = [].concat(vLow, vCrit);

    command(commands.setPowerTrips, data, callback);
  };

  /**
   * The Set Inactivity Timeout command sets the timeout delay before Sphero
   * goes to sleep automatically.
   *
   * By default, the value is 600 seconds (10 minutes), but this command can
   * alter it to any value of 60 seconds or greater.
   *
   * @param {Number} time new delay before sleeping
   * @param {Function} callback function to be triggered when done writing
   * @example
   * orb.setInactivityTimeout(120, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.setInactivityTimeout = function(time, callback) {
    var data = utils.intToHexArray(time, 2);
    command(commands.setInactiveTimer, data, callback);
  };

  /**
   * The Jump To Bootloader command requests a jump into the Bootloader to
   * prepare for a firmware download.
   *
   * All commands after this one must comply with the Bootloader Protocol
   * Specification.
   *
   * @param {Function} callback function to be triggered when done writing
   * @example
   * orb.jumpToBootLoader(function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.jumpToBootloader = function(callback) {
    command(commands.goToBl, null, callback);
  };

  /**
   * The Perform Level 1 Diagnostics command is a developer-level command to
   * help diagnose aberrant behaviour in Sphero.
   *
   * Most process flags, system counters, and system states are decoded to
   * human-readable ASCII.
   *
   * For more details, see the Sphero API documentation.
   *
   * @param {Function} callback function to be triggered with diagnostic data
   * @example
   * orb.runL1Diags(function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.runL1Diags = function(callback) {
    command(commands.runL1Diags, null, callback);
  };

  /**
   * The Perform Level 2 Diagnostics command is a developer-level command to
   * help diagnose aberrant behaviour in Sphero.
   *
   * It's much less informative than the Level 1 command, but is in binary
   * format and easier to parse.
   *
   * For more details, see the Sphero API documentation.
   *
   * @param {Function} callback function to be triggered with diagnostic data
   * @example
   * orb.runL2Diags(function(err, data) {
   *   if (err) {
   *     console.log("error: ", err);
   *   } else {
   *     console.log("data:");
   *     console.log("  recVer:", data.recVer);
   *     console.log("  rxGood:", data.rxGood);
   *     console.log("  rxBadId:", data.rxBadId);
   *     console.log("  rxBadDlen:", data.rxBadDlen);
   *     console.log("  rxBadCID:", data.rxBadCID);
   *     console.log("  rxBadCheck:", data.rxBadCheck);
   *     console.log("  rxBufferOvr:", data.rxBufferOvr);
   *     console.log("  txMsg:", data.txMsg);
   *     console.log("  txBufferOvr:", data.txBufferOvr);
   *     console.log("  lastBootReason:", data.lastBootReason);
   *     console.log("  bootCounters:", data.bootCounters);
   *     console.log("  chargeCount:", data.chargeCount);
   *     console.log("  secondsSinceCharge:", data.secondsSinceCharge);
   *     console.log("  secondsOn:", data.secondsOn);
   *     console.log("  distancedRolled:", data.distancedRolled);
   *     console.log("  sensorFailures:", data.sensorFailures);
   *     console.log("  gyroAdjustCount:", data.gyroAdjustCount);
   *   }
   * }
   * @return {void}
   */
  device.runL2Diags = function(callback) {
    command(commands.runL2Diags, null, callback);
  };

  /**
   * The Clear Counters command is a developer-only command to clear the various
   * system counters created by the L2 diagnostics.
   *
   * It is denied when the Sphero is in Normal mode.
   *
   * @private
   * @param {Function} callback function to be triggered when done writing
   * @example
   * orb.clearCounters(function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.clearCounters = function(callback) {
    command(commands.clearCounters, null, callback);
  };

  device._coreTimeCmd = function(cmd, time, callback) {
    var data = utils.intToHexArray(time, 4);
    command(cmd, data, callback);
  };

  /**
   * The Assign Time command sets a specific value to Sphero's internal 32-bit
   * relative time counter.
   *
   * @param {Number} time the new value to set
   * @param {Function} callback function to be triggered when done writing
   * @example
   * orb.assignTime(0x00ffff00, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.assignTime = function(time, callback) {
    device._coreTimeCmd(commands.assignTime, time, callback);
  };

  /**
   * The Poll Packet Times command helps users profile the transmission and
   * processing latencies in Sphero.
   *
   * For more details, see the Sphero API documentation.
   *
   * @param {Number} time a timestamp to use for profiling
   * @param {Function} callback function to be triggered when done writing
   * @example
   * orb.assignTime(0x00ffff, function(err, data) {
   *   if (err) {
   *     console.log("error: ", err);
   *   } else {
   *     console.log("data:");
   *     console.log("  t1:", data.t1);
   *     console.log("  t2:", data.t2);
   *     console.log("  t3:", data.t3);
   *   }
   * }
   * @return {void}
   */
  device.pollPacketTimes = function(time, callback) {
    device._coreTimeCmd(commands.pollTimes, time, callback);
  };
};

},{"../commands/core":82,"../utils":92}],85:[function(require,module,exports){
"use strict";

// "custom" Sphero commands.
//
// These usually remix or pre-process arguments for existing methods.

var colors = require("../colors"),
    utils = require("../utils");

// regular expression to match hex strings
var hexRegex = /^[A-Fa-f0-9]{6}$/m;

/**
 * Converts a hex color number to RGB values
 *
 * @private
 * @param {Number} num color value to convert
 * @return {Object} RGB color values
 */
function hexToRgb(num) {
  return {
    red: (num >> 16 & 0xff),
    green: (num >> 8 & 0xff),
    blue: num & 0xff
  };
}

module.exports = function custom(device) {
  function mergeMasks(id, mask, remove) {
    if (remove) {
      mask = utils.xor32bit(mask);
      return device.ds[id] & mask;
    }

    return device.ds[id] | mask;
  }

  /**
   * Generic Data Streaming setup, using Sphero's setDataStraming command.
   *
   * Users need to listen for the `dataStreaming` event, or a custom event, to
   * get the data.
   *
   * @private
   * @param {Object} args event, masks, fields, and sps data
   * @return {void}
   */
  device.streamData = function(args) {
    // options for streaming data
    var opts = {
      n: Math.round(400 / (args.sps || 2)),
      m: 1,
      mask1: mergeMasks("mask1", args.mask1, args.remove),
      pcnt: 0,
      mask2: mergeMasks("mask2", args.mask2, args.remove)
    };

    device.on("dataStreaming", function(data) {
      var params = {};

      for (var i = 0; i < args.fields.length; i++) {
        params[args.fields[i]] = data[args.fields[i]];
      }

      device.emit(args.event, params);
    });

    device.setDataStreaming(opts);
  };

  /**
   * The Color command wraps Sphero's built-in setRgb command, allowing for
   * a greater range of possible inputs.
   *
   * @param {Number|String|Object} color what color to change Sphero to
   * @param {Function} callback function to be triggered with response
   * @example
   * orb.color("#00ff00", function(err, data) {
   *   console.log(err || "Color Changed!");
   * });
   * @example
   * orb.color(0xff0000, function(err, data) {
   *   console.log(err || "Color Changed!");
   * });
   * @example
   * orb.color({ red: 0, green: 0, blue: 255 }, function(err, data) {
   *   console.log(err || "Color Changed!");
   * });
   * @return {void}
   */
  device.color = function(color, callback) {
    switch (typeof color) {
      case "number":
        color = hexToRgb(color);
        break;

      case "string":
        if (colors[color]) {
          color = hexToRgb(colors[color]);
          break;
        }

        if (color[0] === "#") {
          color = color.slice(1);
        }

        if (hexRegex.test(color)) {
          var matches = hexRegex.exec(color);
          color = hexToRgb(parseInt(matches[0], 16));
        } else {
          // passed some weird value, just use white
          console.error("invalid color provided", color);
          color = hexToRgb(0xFFFFFF);
        }

        break;

      case "object":
        // upgrade shorthand properties
        ["red", "green", "blue"].forEach(function(hue) {
          var h = hue[0];

          if (color[h] && typeof color[hue] === "undefined") {
            color[hue] = color[h];
          }
        });

        break;
    }

    device.setRgbLed(color, callback);
  };

  /**
   * The Random Color command sets Sphero to a randomly-generated color.
   *
   * @param {Function} callback (err, data) to be triggered with response
   * @example
   * orb.randomColor(function(err, data) {
   *   console.log(err || "Random Color!");
   * });
   * @return {void}
   */
  device.randomColor = function(callback) {
    device.setRgbLed(utils.randomColor(), callback);
  };

  /**
   * Passes the color of the sphero Rgb LED to the callback (err, data)
   *
   * @param {Function} callback function to be triggered with response
   * @example
   * orb.getColor(function(err, data) {
   *   if (err) {
   *     console.log("error: ", err);
   *   } else {
   *     console.log("data:");
   *     console.log("  color:", data.color);
   *     console.log("  red:", data.red);
   *     console.log("  green:", data.green);
   *     console.log("  blue:", data.blue);
   *   }
   * });
   * @return {void}
   */
  device.getColor = function(callback) {
    device.getRgbLed(callback);
  };

  /**
   * The Detect Collisions command sets up Sphero's collision detection system,
   * and automatically parses asynchronous packets to re-emit collision events
   * to 'collision' event listeners.
   *
   * @param {Function} callback (err, data) to be triggered with response
   * @example
   * orb.detectCollisions();
   *
   * orb.on("collision", function(data) {
   *   console.log("data:");
   *   console.log("  x:", data.x);
   *   console.log("  y:", data.y);
   *   console.log("  z:", data.z);
   *   console.log("  axis:", data.axis);
   *   console.log("  xMagnitud:", data.xMagnitud);
   *   console.log("  yMagnitud:", data.yMagnitud);
   *   console.log("  speed:", data.timeStamp);
   *   console.log("  timeStamp:", data.timeStamp);
   * });
   * @return {void}
   */
  device.detectCollisions = function(callback) {
    device.configureCollisions({
      meth: 0x01,
      xt: 0x40,
      yt: 0x40,
      xs: 0x50,
      ys: 0x50,
      dead: 0x50
    }, callback);
  };

  /**
   * The Start Calibration command sets up Sphero for manual heading
   * calibration.
   *
   * It does this by turning on the tail light (so you can tell where it's
   * facing) and disabling stabilization (so you can adjust the heading).
   *
   * When done, call #finishCalibration to set the new heading, and re-enable
   * stabilization.
   *
   * @param {Function} callback (err, data) to be triggered with response
   * @example
   * orb.startCalibration();
   * @return {void}
   */
  device.startCalibration = function(callback) {
    device.setBackLed(127);
    device.setStabilization(0, callback);
  };

  /**
   * The Finish Calibration command ends Sphero's calibration mode, by setting
   * the new heading as current, turning off the back LED, and re-enabling
   * stabilization.
   *
   * @param {Function} callback function to be triggered with response
   * @example
   * orb.finishCalibration();
   * @return {void}
   */
  device.finishCalibration = function(callback) {
    device.setHeading(0);
    device.setBackLed(0);
    device.setStabilization(1, callback);
  };

  /**
   * Starts streaming of odometer data
   *
   * It uses sphero's data streaming command. User needs to listen
   * for the `dataStreaming` or `odometer` event to get the data.
   *
   * @param {Number} [sps=5] samples per second
   * @param {Boolean} [remove=false] forces velocity streaming to stop
   * @example
   * orb.streamOdometer();
   *
   * orb.on("odometer", function(data) {
   *   console.log("data:");
   *   console.log("  xOdomoter:", data.xOdomoter);
   *   console.log("  yOdomoter:", data.yOdomoter);
   * });
   * @return {void}
   */
  device.streamOdometer = function(sps, remove) {
    device.streamData({
      event: "odometer",
      mask2: 0x0C000000,
      fields: ["xOdometer", "yOdometer"],
      sps: sps,
      remove: remove
    });
  };

  /**
   * Starts streaming of velocity data
   *
   * It uses sphero's data streaming command. User needs to listen
   * for the `dataStreaming` or `velocity` event to get the velocity values.
   *
   * @param {Number} [sps=5] samples per second
   * @param {Boolean} [remove=false] forces velocity streaming to stop
   * @example
   * orb.streamVelocity();
   *
   * orb.on("velocity", function(data) {
   *   console.log("data:");
   *   console.log("  xVelocity:", data.xVelocity);
   *   console.log("  yVelocity:", data.yVelocity);
   * });
   * @return {void}
   */
  device.streamVelocity = function(sps, remove) {
    device.streamData({
      event: "velocity",
      mask2: 0x01800000,
      fields: ["xVelocity", "yVelocity"],
      sps: sps,
      remove: remove
    });
  };

  /**
   * Starts streaming of accelOne data
   *
   * It uses sphero's data streaming command. User needs to listen
   * for the `dataStreaming` or `accelOne` event to get the data.
   *
   * @param {Number} [sps=5] samples per second
   * @param {Boolean} [remove=false] forces velocity streaming to stop
   * @example
   * orb.streamAccelOne();
   *
   * orb.on("accelOne", function(data) {
   *   console.log("data:");
   *   console.log("  accelOne:", data.accelOne);
   * });
   * @return {void}
   */
  device.streamAccelOne = function(sps, remove) {
    device.streamData({
      event: "accelOne",
      mask2: 0x02000000,
      fields: ["accelOne"],
      sps: sps,
      remove: remove
    });
  };

  /**
   * Starts streaming of IMU angles data
   *
   * It uses sphero's data streaming command. User needs to listen
   * for the `dataStreaming` or `imuAngles` event to get the data.
   *
   * @param {Number} [sps=5] samples per second
   * @param {Boolean} [remove=false] forces velocity streaming to stop
   * @example
   * orb.streamImuAngles();
   *
   * orb.on("imuAngles", function(data) {
   *   console.log("data:");
   *   console.log("  pitchAngle:", data.pitchAngle);
   *   console.log("  rollAngle:", data.rollAngle);
   *   console.log("  yawAngle:", data.yawAngle);
   * });
   * @return {void}
   */
  device.streamImuAngles = function(sps, remove) {
    device.streamData({
      event: "imuAngles",
      mask1: 0x00070000,
      fields: ["pitchAngle", "rollAngle", "yawAngle"],
      sps: sps,
      remove: remove
    });
  };

  /**
   * Starts streaming of accelerometer data
   *
   * It uses sphero's data streaming command. User needs to listen
   * for the `dataStreaming` or `accelerometer` event to get the data.
   *
   * @param {Number} [sps=5] samples per second
   * @param {Boolean} [remove=false] forces velocity streaming to stop
   * @example
   * orb.streamAccelerometer();
   *
   * orb.on("accelerometer", function(data) {
   *   console.log("data:");
   *   console.log("  xAccel:", data.xAccel);
   *   console.log("  yAccel:", data.yAccel);
   *   console.log("  zAccel:", data.zAccel);
   * });
   * @return {void}
   */
  device.streamAccelerometer = function(sps, remove) {
    device.streamData({
      event: "accelerometer",
      mask1: 0x0000E000,
      fields: ["xAccel", "yAccel", "zAccel"],
      sps: sps,
      remove: remove
    });
  };

  /**
   * Starts streaming of gyroscope data
   *
   * It uses sphero's data streaming command. User needs to listen
   * for the `dataStreaming` or `gyroscope` event to get the data.
   *
   * @param {Number} [sps=5] samples per second
   * @param {Boolean} [remove=false] forces velocity streaming to stop
   * @example
   * orb.streamGyroscope();
   *
   * orb.on("gyroscope", function(data) {
   *   console.log("data:");
   *   console.log("  xGyro:", data.xGyro);
   *   console.log("  yGyro:", data.yGyro);
   *   console.log("  zGyro:", data.zGyro);
   * });
   * @return {void}
   */
  device.streamGyroscope = function(sps, remove) {
    device.streamData({
      event: "gyroscope",
      mask1: 0x00001C00,
      fields: ["xGyro", "yGyro", "zGyro"],
      sps: sps,
      remove: remove
    });
  };

  /**
   * Starts streaming of motor back EMF data
   *
   * It uses sphero's data streaming command. User needs to listen
   * for the `dataStreaming` or `motorsBackEmf` event to get the data.
   *
   * @param {Number} [sps=5] samples per second
   * @param {Boolean} [remove=false] forces velocity streaming to stop
   * @example
   * orb.streamMotorsBackEmf();
   *
   * orb.on("motorsBackEmf", function(data) {
   *   console.log("data:");
   *   console.log("  rMotorBackEmf:", data.rMotorBackEmf);
   *   console.log("  lMotorBackEmf:", data.lMotorBackEmf);
   * });
   * @return {void}
   */
  device.streamMotorsBackEmf = function(sps, remove) {
    device.streamData({
      event: "motorsBackEmf",
      mask1: 0x00000060,
      fields: ["rMotorBackEmf", "lMotorBackEmf"],
      sps: sps,
      remove: remove
    });
  };

  /**
   * The Stop On Disconnect command sends a flag to Sphero. This flag tells
   * Sphero whether or not it should automatically stop when it detects
   * that it's disconnected.
   *
   * @param {Boolean} [remove=false] whether or not to stop on disconnect
   * @param {Function} callback triggered on complete
   * @example
   * orb.stopOnDisconnect(function(err, data) {
   *   console.log(err || "data" + data);
   * });
   * @return {void}
   */
  device.stopOnDisconnect = function(remove, callback) {
    if (typeof remove === "function") {
      callback = remove;
      remove = false;
    }

    var bitmask = (remove) ? 0x00 : 0x01;

    device.setTempOptionFlags(bitmask, callback);
  };


  /**
   * Stops sphero the optimal way by setting flag 'go' to 0
   * and speed to a very low value.
   *
   * @param {Function} callback triggered on complete
   * @example
   * sphero.stop(function(err, data) {
   *   console.log(err || "data" + data);
   * });
   * @return {void}
   */
  device.stop = function(callback) {
    this.roll(0, 0, 0, callback);
  };
};

},{"../colors":81,"../utils":92}],86:[function(require,module,exports){
"use strict";

var utils = require("../utils"),
    commands = require("../commands/sphero");

module.exports = function sphero(device) {
  // Sphero Virtual Device Address = 0x02
  var command = device.command.bind(device, 0x02);

  /**
   * The Set Heading command tells Sphero to adjust it's orientation, by
   * commanding a new reference heading (in degrees).
   *
   * If stabilization is enabled, Sphero will respond immediately to this.
   *
   * @param {Number} heading Sphero's new reference heading, in degrees (0-359)
   * @param {Function} callback function to be triggered after writing
   * @example
   * orb.setHeading(180, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.setHeading = function(heading, callback) {
    heading = utils.intToHexArray(heading, 2);
    command(commands.setHeading, heading, callback);
  };

  /**
   * The Set Stabilization command turns Sphero's internal stabilization on or
   * off, depending on the flag provided.
   *
   * @param {Number} flag stabilization setting flag (0 - off, 1 - on)
   * @param {Function} callback function to be triggered after writing
   * @example
   * orb.setStabilization(1, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.setStabilization = function(flag, callback) {
    flag &= 0x01;
    command(commands.setStabilization, [flag], callback);
  };

  /**
   * The Set Rotation Rate command allows control of the rotation rate Sphero
   * uses to meet new heading commands.
   *
   * A lower value offers better control, but with a larger turning radius.
   *
   * Higher values yield quick turns, but Sphero may lose control.
   *
   * The provided value is in units of 0.784 degrees/sec.
   *
   * @param {Number} rotation new rotation rate (0-255)
   * @param {Function} callback function to be triggered after writing
   * @example
   * orb.setRotationRate(180, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.setRotationRate = function(rotation, callback) {
    rotation &= 0xFF;
    command(commands.setRotationRate, [rotation], callback);
  };

  /**
   * The Get Chassis ID command returns the 16-bit chassis ID Sphero was
   * assigned at the factory.
   *
   * @param {Function} callback function to be triggered with a response
   * @example
   * orb.getChassisId(function(err, data) {
   *   if (err) {
   *     console.log("error: ", err);
   *   } else {
   *     console.log("data:");
   *     console.log("  chassisId:", data.chassisId);
   *   }
   * }
   * @return {void}
   */
  device.getChassisId = function(callback) {
    command(commands.getChassisId, null, callback);
  };

  /**
   *
   * The Set Chassis ID command assigns Sphero's chassis ID, a 16-bit value.
   *
   * This command only works if you're at the factory.
   *
   * @param {Number} chassisId new chassis ID
   * @param {Function} callback function to be triggered after writing
   * @example
   * orb.setChassisId(0xFE75, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.setChassisId = function(chassisId, callback) {
    chassisId = utils.intToHexArray(chassisId, 2);
    command(commands.getChassisId, chassisId, callback);
  };

  /**
   * The Self Level command controls Sphero's self-level routine.
   *
   * This routine attempts to achieve a horizontal orientation where pitch/roll
   * angles are less than the provided Angle Limit.
   *
   * After both limits are satisfied, option bits control sleep, final
   * angle(heading), and control system on/off.
   *
   * An asynchronous message is returned when the self level routine completes.
   *
   * For more detail on opts param, see the Sphero API documentation.
   *
   * opts:
   *  - angleLimit: 0 for defaul, 1 - 90 to set.
   *  - timeout: 0 for default, 1 - 255 to set.
   *  - trueTime: 0 for default, 1 - 255 to set.
   *  - options: bitmask 4bit e.g. 0xF;
   * };
   *
   * @param {Object} opts self-level routine options
   * @param {Function} callback function to be triggered after writing
   * @example
   * var opts = {
   *   angleLimit: 0,
   *   timeout: 0, ,
   *   trueTime: 0,
   *   options: 0x7
   * };
   *
   * orb.selfLevel(opts, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.selfLevel = function(opts, callback) {
    var data = [
      opts.options,
      opts.angleLimit,
      opts.timeout,
      opts.trueTime
    ];
    command(commands.selfLevel, data, callback);
  };

  /**
   * The Set Data Streaming command configures Sphero's built-in support for
   * asynchronously streaming certain system and sensor data.
   *
   * This command selects the internal sampling frequency, packet size,
   * parameter mask, and (optionally) the total number of packets.
   *
   * These options are provided as an object, with the following properties:
   *
   * - **n** - divisor of the maximum sensor sampling rate
   * - **m** - number of sample frames emitted per packet
   * - **mask1** - bitwise selector of data sources to stream
   * - **pcnt** - packet count 1-255 (or 0, for unlimited streaming)
   * - **mask2** - bitwise selector of more data sources to stream (optional)
   *
   * For more explanation of these options, please see the Sphero API
   * documentation.
   *
   * @param {Object} opts object containing streaming data options
   * @param {Function} callback function to be triggered after writing
   * @example
   * var opts = {
   *   n: 400,
   *   m: 1,
   *   mask1: 0x00000000,
   *   mask2: 0x01800000,
   *   pcnt: 0
   * };
   *
   * orb.setDataStreaming(opts, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.setDataStreaming = function(opts, callback) {
    var n = utils.intToHexArray(opts.n, 2),
        m = utils.intToHexArray(opts.m, 2),
        mask1 = utils.intToHexArray(opts.mask1, 4),
        pcnt = opts.pcnt &= 0xff,
        mask2 = utils.intToHexArray(opts.mask2, 4);

    device.ds = {
      mask1: opts.mask1,
      mask2: opts.mask2
    };

    var data = [].concat(n, m, mask1, pcnt, mask2);

    command(commands.setDataStreaming, data, callback);
  };

  /**
   * The Configure Collisions command configures Sphero's collision detection
   * with the provided parameters.
   *
   * These include:
   *
   * - **meth** - which detection method to use. Supported methods are 0x01,
   *   0x02, and 0x03 (see the collision detection document for details). 0x00
   *   disables this service.
   * - **xt, yt** - 8-bit settable threshold for the X (left, right) and
   *   y (front, back) axes of Sphero. 0x00 disables the contribution of that
   *   axis.
   * - **xs, ys** - 8-bit settable speed value for X/Y axes. This setting is
   *   ranged by the speed, than added to `xt` and `yt` to generate the final
   *   threshold value.
   * - **dead** - an 8-bit post-collision dead time to prevent re-triggering.
   *   Specified in 10ms increments.
   *
   * @param {Object} opts object containing collision configuration opts
   * @param {Function} cb function to be triggered after writing
   * @example
   * var opts = {
   *   meth: 0x01,
   *   xt: 0x0F,
   *   xs: 0x0F,
   *   yt: 0x0A,
   *   ys: 0x0A,
   *   dead: 0x05
   * };
   *
   * orb.configureCollisions(opts, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.configureCollisions = function(opts, cb) {
    var data = [
      opts.meth,
      opts.xt,
      opts.xs,
      opts.yt,
      opts.ys,
      opts.dead
    ];
    command(commands.setCollisionDetection, data, cb);
  };

  /**
   * The Configure Locator command configures Sphero's streaming location data
   * service.
   *
   * The following options must be provided:
   *
   * - **flags** - bit 0 determines whether calibrate commands auto-correct the
   *   yaw tare value. When false, positive Y axis coincides with heading 0.
   *   Other bits are reserved.
   * - **x, y** - the current (x/y) coordinates of Sphero on the ground plane in
   *   centimeters
   * - **yawTare** - controls how the x,y-plane is aligned with Sphero's heading
   *   coordinate system. When zero, yaw = 0 corresponds to facing down the
   *   y-axis in the positive direction. Possible values are 0-359 inclusive.
   *
   * @param {Object} opts object containing locator service configuration
   * @param {Function} callback function to be triggered after writing
   * @example
   * var opts = {
   *   flags: 0x01,
   *   x: 0x0000,
   *   y: 0x0000,
   *   yawTare: 0x0
   * };
   *
   * orb.configureLocator(opts, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.configureLocator = function(opts, callback) {
    var flags = opts.flags & 0xFF,
        x = utils.intToHexArray(opts.x, 2),
        y = utils.intToHexArray(opts.y, 2),
        yawTare = utils.intToHexArray(opts.yawTare, 2);

    var data = [].concat(flags, x, y, yawTare);

    command(commands.locator, data, callback);
  };

  /**
   * The Set Accelerometer Range command tells Sphero what accelerometer range
   * to use.
   *
   * By default, Sphero's solid-state accelerometer is set for a range of ±8Gs.
   * You may wish to change this, perhaps to resolve finer accelerations.
   *
   * This command takes an index for the supported range, as explained below:
   *
   * - `0`: ±2Gs
   * - `1`: ±4Gs
   * - `2`: ±8Gs (default)
   * - `3`: ±16Gs
   *
   * @param {Number} idx what accelerometer range to use
   * @param {Function} callback function to be triggered after writing
   * @example
   * orb.setAccelRange(0x02, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.setAccelRange = function(idx, callback) {
    idx &= idx;
    command(commands.setAccelerometer, [idx], callback);
  };

  /**
   * The Read Locator command gets Sphero's current position (X,Y), component
   * velocities, and speed-over-ground (SOG).
   *
   * The position is a signed value in centimeters, the component velocities are
   * signed cm/sec, and the SOG is unsigned cm/sec.
   *
   * @param {Function} callback function to be triggered with data
   * @example
   * orb.readLocator(function(err, data) {
   *   if (err) {
   *     console.log("error: ", err);
   *   } else {
   *     console.log("data:");
   *     console.log("  xpos:", data.xpos);
   *     console.log("  ypos:", data.ypos);
   *     console.log("  xvel:", data.xvel);
   *     console.log("  yvel:", data.yvel);
   *     console.log("  sog:", data.sog);
   *   }
   * }
   * @return {void}
   */
  device.readLocator = function(callback) {
    command(commands.readLocator, null, callback);
  };

  /**
   * The Set RGB LED command sets the colors of Sphero's RGB LED.
   *
   * An object containaing `red`, `green`, and `blue` values must be provided.
   *
   * If `opts.flag` is set to 1 (default), the color is persisted across power
   * cycles.
   *
   * @param {Object} opts object containing RGB values for Sphero's LED
   * @param {Function} callback function to be triggered after writing
   * @example
   * orb.setRgbLed({ red: 0, green: 0, blue: 255 }, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.setRgbLed = function(opts, callback) {
    var data = [opts.red, opts.green, opts.blue, opts.flag || 0x01];

    for (var i = 0; i < data.length; i++) {
      data[i] &= 0xFF;
    }

    command(commands.setRgbLed, data, callback);
  };

  /**
   * The Set Back LED command allows brightness adjustment of Sphero's tail
   * light.
   *
   * This value does not persist across power cycles.
   *
   * @param {Number} brightness brightness to set to Sphero's tail light
   * @param {Function} callback function to be triggered after writing
   * @example
   * orb.setbackLed(255, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.setBackLed = function(brightness, callback) {
    command(commands.setBackLed, [brightness], callback);
  };

  /**
   * The Get RGB LED command fetches the current "user LED color" value, stored
   * in Sphero's configuration.
   *
   * This value may or may not be what's currently displayed by Sphero's LEDs.
   *
   * @param {Function} callback function to be triggered after writing
   * @example
   * orb.getRgbLed(function(err, data) {
   *   if (err) {
   *     console.log("error: ", err);
   *   } else {
   *     console.log("data:");
   *     console.log("  color:", data.color);
   *     console.log("  red:", data.red);
   *     console.log("  green:", data.green);
   *     console.log("  blue:", data.blue);
   *   }
   * }
   * @return {void}
   */
  device.getRgbLed = function(callback) {
    command(commands.getRgbLed, null, callback);
  };

  /**
   * The Roll command tells Sphero to roll along the provided vector.
   *
   * Both a speed and heading are required, the latter is considered relative to
   * the last calibrated direction.
   *
   * Permissible heading values are 0 to 359 inclusive.
   *
   * @param {Number} speed what speed Sphero should roll at
   * @param {Number} heading what heading Sphero should roll towards (0-359)
   * @param {Number} [state] optional state parameter
   * @param {Function} callback function to be triggered after writing
   * @example
   * orb.setbackLed(180, 0, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.roll = function(speed, heading, state, callback) {
    if (typeof state === "function" || typeof state === "undefined") {
      callback = state;
      state = 0x01;
    }

    speed &= 0xFF;
    heading = utils.intToHexArray(heading, 2);
    state &= 0x03;

    var data = [].concat(speed, heading, state);

    command(commands.roll, data, callback);
  };

  /**
   * The Boost command executes Sphero's boost macro.
   *
   * It takes a 1-byte parameter, 0x01 to start boosting, or 0x00 to stop.
   *
   * @param {Number} boost whether or not to boost (1 - yes, 0 - no)
   * @param {Function} callback function to be triggered after writing
   * @example
   * orb.boost(1, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.boost = function(boost, callback) {
    boost &= 0x01;
    command(commands.boost, [boost], callback);
  };

  /**
   * The Set Raw Motors command allows manual control over one or both of
   * Sphero's motor output values.
   *
   * Each motor (left and right requires a mode and a power value from 0-255.
   *
   * This command will disable stabilization is both mode's aren't "ignore", so
   * you'll need to re-enable it once you're done.
   *
   * Possible modes:
   *
   * - `0x00`: Off (motor is open circuit)
   * - `0x01`: Forward
   * - `0x02`: Reverse
   * - `0x03`: Brake (motor is shorted)
   * - `0x04`: Ignore (motor mode and power is left unchanged
   *
   * @param {Object} opts object with mode/power values (e.g. lmode, lpower)
   * @param {Function} callback function to be triggered after writing
   * @example
   * var opts = {
   *   lmode: 0x01,
   *   lpower: 180,
   *   rmode: 0x02,
   *   rpower: 180
   * }
   *
   * orb.setRawMotors(opts, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.setRawMotors = function(opts, callback) {
    var lmode = opts.lmode & 0x07,
        lpower = opts.lpower & 0xFF,
        rmode = opts.rmode & 0x07,
        rpower = opts.rpower & 0xFF;

    var data = [lmode, lpower, rmode, rpower];

    command(commands.setRawMotors, data, callback);
  };

  /**
   * The Set Motion Timeout command gives Sphero an ultimate timeout for the
   * last motion command to keep Sphero from rolling away in the case of
   * a crashed (or paused) application.
   *
   * This defaults to 2000ms (2 seconds) upon wakeup.
   *
   * @param {Number} time timeout length in milliseconds
   * @param {Function} callback function to be triggered when done writing
   * @example
   * orb.setMotionTimeout(0x0FFF, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.setMotionTimeout = function(time, callback) {
    time = utils.intToHexArray(time, 2);
    command(commands.setMotionTimeout, time, callback);
  };

  /**
   * The Set Permanent Option Flags command assigns Sphero's permanent option
   * flags to the provided values, and writes them immediately to the config
   * block.
   *
   * See below for the bit definitions.
   *
   * @param {Array} flags permanent option flags
   * @param {Function} callback function to be triggered when done writing
   * @example
   * // Force tail LED always on
   * orb.setPermOptionFlags(0x00000008, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.setPermOptionFlags = function(flags, callback) {
    flags = utils.intToHexArray(flags, 4);
    command(commands.setOptionsFlag, flags, callback);
  };

  /**
   * The Get Permanent Option Flags command returns Sphero's permanent option
   * flags, as a bit field.
   *
   * Here's possible bit fields, and their descriptions:
   *
   * - `0`: Set to prevent Sphero from immediately going to sleep when placed in
   *   the charger and connected over Bluetooth.
   * - `1`: Set to enable Vector Drive, that is, when Sphero is stopped and
   *   a new roll command is issued it achieves the heading before moving along
   *   it.
   * - `2`: Set to disable self-leveling when Sphero is inserted into the
   *   charger.
   * - `3`: Set to force the tail LED always on.
   * - `4`: Set to enable motion timeouts (see DID 02h, CID 34h)
   * - `5`: Set to enable retail Demo Mode (when placed in the charger, ball
   *   runs a slow rainbow macro for 60 minutes and then goes to sleep).
   * - `6`: Set double tap awake sensitivity to Light
   * - `7`: Set double tap awake sensitivity to Heavy
   * - `8`: Enable gyro max async message (NOT SUPPORTED IN VERSION 1.47)
   * - `6-31`: Unassigned
   *
   * @param {Function} callback function triggered with option flags data
   * @example
   * orb.getPermOptionFlags(function(err, data) {
   *   if (err) {
   *     console.log("error: ", err);
   *   } else {
   *     console.log("data:");
   *     console.log("  sleepOnCharger:", data.sleepOnCharger);
   *     console.log("  vectorDrive:", data.vectorDrive);
   *     console.log("  selfLevelOnCharger:", data.selfLevelOnCharger);
   *     console.log("  tailLedAlwaysOn:", data.tailLedAlwaysOn);
   *     console.log("  motionTimeouts:", data.motionTimeouts);
   *     console.log("  retailDemoOn:", data.retailDemoOn);
   *     console.log("  awakeSensitivityLight:", data.awakeSensitivityLight);
   *     console.log("  awakeSensitivityHeavy:", data.awakeSensitivityHeavy);
   *     console.log("  gyroMaxAsyncMsg:", data.gyroMaxAsyncMsg);
   *   }
   * }
   * @return {void}
   */
  device.getPermOptionFlags = function(callback) {
    command(commands.getOptionsFlag, null, callback);
  };

  /**
   * The Set Temporary Option Flags command assigns Sphero's temporary option
   * flags to the provided values. These do not persist across power cycles.
   *
   * See below for the bit definitions.
   *
   * @param {Array} flags permanent option flags
   * @param {Function} callback function to be triggered when done writing
   * @example
   * // enable stop on disconnect behaviour
   * orb.setTempOptionFlags(0x01, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.setTempOptionFlags = function(flags, callback) {
    flags = utils.intToHexArray(flags, 4);
    command(commands.setTempOptionFlags, flags, callback);
  };

  /**
   * The Get Temporary Option Flags command returns Sphero's temporary option
   * flags, as a bit field:
   *
   * - `0`: Enable Stop On Disconnect behavior
   * - `1-31`: Unassigned
   *
   * @param {Function} callback function triggered with option flags data
   * @example
   * orb.getTempOptionFlags(function(err, data) {
   *   if (err) {
   *     console.log("error: ", err);
   *   } else {
   *     console.log("data:");
   *     console.log("  stopOnDisconnect:", data.stopOnDisconnect);
   *   }
   * }
   * @return {void}
   */
  device.getTempOptionFlags = function(callback) {
    command(commands.getTempOptionFlags, null, callback);
  };

  /**
   * The Get Configuration Block command retrieves one of Sphero's configuration
   * blocks.
   *
   * The response is a simple one; an error code of 0x08 is returned when the
   * resources are currently unavailable to send the requested block back. The
   * actual configuration block data returns in an asynchronous message of type
   * 0x04 due to its length (if there is no error).
   *
   * ID = `0x00` requests the factory configuration block
   * ID = `0x01` requests the user configuration block, which is updated with
   * current values first
   *
   * @param {Number} id which configuration block to fetch
   * @param {Function} callback function to be triggered after writing
   * @example
   * orb.getConfigBlock(function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.getConfigBlock = function(id, callback) {
    id &= 0xFF;
    command(commands.getConfigBlock, [id], callback);
  };

  device._setSsbBlock = function(cmd, pwd, block, callback) {
    pwd = utils.intToHexArray(pwd, 4);
    var data = [].concat(pwd, block);
    command(cmd, data, callback);
  };

  /**
   * The Set SSB Modifier Block command allows the SSB to be patched with a new
   * modifier block - including the Boost macro.
   *
   * The changes take effect immediately.
   *
   * @param {Number} pwd a 32 bit (4 bytes) hexadecimal value
   * @param {Array} block array of bytes with the data to be written
   * @param {Function} callback a function to be triggered after writing
   * @example
   * orb.setSsbModBlock(0x0000000F, data, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.setSsbModBlock = function(pwd, block, callback) {
    device._setSsbBlock(commands.setSsbParams, pwd, block, callback);
  };

  /**
   * The Set Device Mode command assigns the operation mode of Sphero based on
   * the supplied mode value.
   *
   * - **0x00**: Normal mode
   * - **0x01**: User Hack mode. Enables ASCII shell commands, refer to the
   *   associated document for details.
   *
   * @param {Number} mode which mode to set Sphero to
   * @param {Function} callback function to be called after writing
   * @example
   * orb.setDeviceMode(0x00, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.setDeviceMode = function(mode, callback) {
    mode &= 0x01;
    command(commands.setDeviceMode, [mode], callback);
  };

  /**
   * The Set Config Block command accepts an exact copy of the configuration
   * block, and loads it into the RAM copy of the configuration block.
   *
   * The RAM copy is then saved to flash.
   *
   * The configuration block can be obtained by using the Get Configuration
   * Block command.
   *
   * @private
   * @param {Array} block - An array of bytes with the data to be written
   * @param {Function} callback - To be triggered when done
   * @example
   * orb.setConfigBlock(dataBlock, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.setConfigBlock = function(block, callback) {
    command(commands.setConfigBlock, block, callback);
  };

  /**
   * The Get Device Mode command gets the current device mode of Sphero.
   *
   * Possible values:
   *
   * - **0x00**: Normal mode
   * - **0x01**: User Hack mode.
   *
   * @param {Function} callback function to be called with response
   * @example
   * orb.getDeviceMode(function(err, data) {
   *   if (err) {
   *     console.log("error: ", err);
   *   } else {
   *     console.log("data:");
   *     console.log("  mode:", data.mode);
   *   }
   * }
   * @return {void}
   */
  device.getDeviceMode = function(callback) {
    command(commands.getDeviceMode, null, callback);
  };

  /**
   * The Get SSB command retrieves Sphero's Soul Block.
   *
   * The response is simple, and then the actual block of soulular data returns
   * in an asynchronous message of type 0x0D, due to it's 0x440 byte length
   *
   * @private
   * @param {Function} callback function to be called with response
   * @example
   * orb.getSsb(function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.getSsb = function(callback) {
    command(commands.getSsb, null, callback);
  };

  /**
   * The Set SSB command sets Sphero's Soul Block.
   *
   * The actual payload length is 0x404 bytes, but if you use the special DLEN
   * encoding of 0xff, Sphero will know what to expect.
   *
   * You need to supply the password in order for it to work.
   *
   * @private
   * @param {Number} pwd a 32 bit (4 bytes) hexadecimal value
   * @param {Array} block array of bytes with the data to be written
   * @param {Function} callback a function to be triggered after writing
   * @example
   * orb.setSsb(pwd, block, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.setSsb = function(pwd, block, callback) {
    device._setSsbBlock(commands.setSsb, pwd, block, callback);
  };

  /**
   * The Refill Bank command attempts to refill either the Boost bank (0x00) or
   * the Shield bank (0x01) by attempting to deduct the respective refill cost
   * from the current number of cores.
   *
   * If it succeeds, the bank is set to the maximum obtainable for that level,
   * the cores are spent, and a success response is returned with the lower core
   * balance.
   *
   * If there aren't enough cores available to spend, Sphero responds with an
   * EEXEC error (0x08)
   *
   * @private
   * @param {Number} type what bank to refill (0 - Boost, 1 - Shield)
   * @param {Function} callback function to be called with response
   * @example
   * orb.refillBank(0x00, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.refillBank = function(type, callback) {
    type &= 0xFF;
    command(commands.ssbRefill, [type], callback);
  };

  /**
   * The Buy Consumable command attempts to spend cores on consumables.
   *
   * The consumable ID is given (0 - 7), as well as the quantity requested to
   * purchase.
   *
   * If the purchase succeeds, the consumable count is increased, the cores are
   * spent, and a success response is returned with the increased quantity and
   * lower balance.
   *
   * If there aren't enough cores available to spend, or the purchase would
   * exceed the max consumable quantity of 255, Sphero responds with an EEXEC
   * error (0x08)
   *
   * @private
   * @param {Number} id what consumable to buy
   * @param {Number} qty how many consumables to buy
   * @param {Function} callback function to be called with response
   * @example
   * orb.buyConsumable(0x00, 5, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.buyConsumable = function(id, qty, callback) {
    id &= 0xFF;
    qty &= 0xFF;
    command(commands.ssbBuy, [id, qty], callback);
  };

  /**
   * The Use Consumable command attempts to use a consumable if the quantity
   * remaining is non-zero.
   *
   * On success, the return message echoes the ID of this consumable and how
   * many of them remain.
   *
   * If the associated macro is already running, or the quantity remaining is
   * zero, this returns an EEXEC error (0x08).
   *
   * @private
   * @param {Number} id what consumable to use
   * @param {Function} callback function to be called with response
   * @example
   * orb.useConsumable(0x00, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.useConsumable = function(id, callback) {
    id &= 0xFF;
    command(commands.ssbUseConsumeable, [id], callback);
  };

  /**
   * The Grant Cores command adds the supplied number of cores.
   *
   * If the first bit in the flags byte is set, the command immediately commits
   * the SSB to flash. Otherwise, it does not.
   *
   * All other bits are reserved.
   *
   * If the password is not accepted, this command fails without consequence.
   *
   * @private
   * @param {Number} pw 32-bit password
   * @param {Number} qty 32-bit number of cores to add
   * @param {Number} flags 8-bit flags byte
   * @param {Function} callback function to be triggered with response
   * @example
   * orb.grantCores(pwd, 5, 0x01, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.grantCores = function(pw, qty, flags, callback) {
    pw = utils.intToHexArray(pw, 4);
    qty = utils.intToHexArray(qty, 4);
    flags &= 0xFF;

    var data = [].concat(pw, qty, flags);

    command(commands.ssbGrantCores, data, callback);
  };

  device._xpOrLevelUp = function(cmd, pw, gen, cb) {
    pw = utils.intToHexArray(pw, 4);
    gen &= 0xFF;

    command(cmd, [].concat(pw, gen), cb);
  };

  /**
   * The add XP command increases XP by adding the supplied number of minutes
   * of drive time, and immediately commits the SSB to flash.
   *
   * If the password is not accepted, this command fails without consequence.
   *
   * @private
   * @param {Number} pw 32-bit password
   * @param {Number} qty 8-bit number of minutes of drive time to add
   * @param {Function} callback function to be triggered with response
   * @example
   * orb.addXp(pwd, 5, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.addXp = function(pw, qty, callback) {
    device._xpOrLevelUp(commands.ssbAddXp, pw, qty, callback);
  };

  /**
   * The Level Up Attribute command attempts to increase the level of the
   * specified attribute by spending attribute points.
   *
   * The IDs are:
   *
   * - **0x00**: speed
   * - **0x01**: boost
   * - **0x02**: brightness
   * - **0x03**: shield
   *
   *
   * If successful, the SSB is committed to flash, and a response packet
   * containing the attribute ID, new level, and remaining attribute points is
   * returned.
   *
   * If there are not enough attribute points, this command returns an EEXEC
   * error (0x08).
   *
   * If the password is not accepted, this command fails without consequence.
   *
   * @private
   * @param {Number} pw 32-bit password
   * @param {Number} id which attribute to level up
   * @param {Function} callback function to be triggered with response
   * @example
   * orb.levelUpAttr(pwd, 0x00, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.levelUpAttr = function(pw, id, callback) {
    device._xpOrLevelUp(commands.ssbLevelUpAttr, pw, id, callback);
  };

  /**
   * The Get Password Seed command returns Sphero's password seed.
   *
   * Protected Sphero commands require a password.
   *
   * Refer to the Sphero API documentation, Appendix D for more information.
   *
   * @private
   * @param {Function} callback function to be triggered with response
   * @example
   * orb.getPasswordSeed(function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.getPasswordSeed = function(callback) {
    command(commands.getPwSeed, null, callback);
  };

  /**
   * The Enable SSB Async Messages command turns on/off soul block related
   * asynchronous messages.
   *
   * These include shield collision/regrowth messages, boost use/regrowth
   * messages, XP growth, and level-up messages.
   *
   * This feature defaults to off.
   *
   * @private
   * @param {Number} flag whether or not to enable async messages
   * @param {Function} callback function to be triggered after write
   * @example
   * orb.enableSsbAsyncMsg(0x01, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.enableSsbAsyncMsg = function(flag, callback) {
    flag &= 0x01;
    command(commands.ssbEnableAsync, [flag], callback);
  };

  /**
   * The Run Macro command attempts to execute the specified macro.
   *
   * Macro IDs are split into groups:
   *
   * 0-31 are System Macros. They are compiled into the Main Application, and
   * cannot be deleted. They are always available to run.
   *
   * 32-253 are User Macros. They are downloaded and persistently stored, and
   * can be deleted in total.
   *
   * 255 is the Temporary Macro, a special user macro as it is held in RAM for
   * execution.
   *
   * 254 is also a special user macro, called the Stream Macro that doesn't
   * require this call to begin execution.
   *
   * This command will fail if there is a currently executing macro, or the
   * specified ID code can't be found.
   *
   * @param {Number} id 8-bit Macro ID to run
   * @param {Function} callback function to be triggered with response
   * @example
   * orb.runMacro(0x01, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.runMacro = function(id, callback) {
    id &= 0xFF;
    command(commands.runMacro, [id], callback);
  };

  /**
   * The Save Temporary Macro stores the attached macro definition into the
   * temporary RAM buffer for later execution.
   *
   * If this command is sent while a Temporary or Stream Macro is executing it
   * will be terminated so that its storage space can be overwritten. As with
   * all macros, the longest definition that can be sent is 254 bytes.
   *
   * @param {Array} macro array of bytes with the data to be written
   * @param {Function} callback function to be triggered with response
   * @example
   * orb.saveTempMacro(0x01, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.saveTempMacro = function(macro, callback) {
    command(commands.saveTempMacro, macro, callback);
  };

  /** Save macro
   *
   * The Save Macro command stores the attached macro definition into the
   * persistent store for later execution. This command can be sent even if
   * other macros are executing.
   *
   * You will receive a failure response if you attempt to send an ID number in
   * the System Macro range, 255 for the Temp Macro and ID of an existing user
   * macro in the storage block.
   *
   * As with all macros, the longest definition that can be sent is 254 bytes.
   *
   * @param {Array} macro array of bytes with the data to be written
   * @param {Function} callback function to be triggered with response
   * @example
   * orb.saveMacro(0x01, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.saveMacro = function(macro, callback) {
    command(commands.saveMacro, macro, callback);
  };

  /**
   * The Reinit Macro Executive command terminates any running macro, and
   * reinitializes the macro system.
   *
   * The table of any persistent user macros is cleared.
   *
   * @param {Function} callback function to be triggered with response
   * @example
   * orb.reInitMacroExec(function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.reInitMacroExec = function(callback) {
    command(commands.initMacroExecutive, null, callback);
  };

  /**
   * The Abort Macro command aborts any executing macro, and returns both it's
   * ID code and the command number currently in progress.
   *
   * An exception is a System Macro executing with the UNKILLABLE flag set.
   *
   * A returned ID code of 0x00 indicates that no macro was running, an ID code
   * of 0xFFFF as the CmdNum indicates the macro was unkillable.
   *
   * @param {Function} callback function to be triggered with response
   * @example
   * orb.abortMacro(function(err, data) {
   *   if (err) {
   *     console.log("error: ", err);
   *   } else {
   *     console.log("data:");
   *     console.log("  id:", data.id);
   *     console.log("  cmdNum:", data.cmdNum);
   *   }
   * }
   * @return {void}
   */
  device.abortMacro = function(callback) {
    command(commands.abortMacro, null, callback);
  };

  /**
   * The Get Macro Status command returns the ID code and command number of the
   * currently executing macro.
   *
   * If no macro is running, the 0x00 is returned for the ID code, and the
   * command number is left over from the previous macro.
   *
   * @param {Function} callback function to be triggered with response
   * @example
   * orb.getMacroStatus(function(err, data) {
   *   if (err) {
   *     console.log("error: ", err);
   *   } else {
   *     console.log("data:");
   *     console.log("  idCode:", data.idCode);
   *     console.log("  cmdNum:", data.cmdNum);
   *   }
   * }
   * @return {void}
   */
  device.getMacroStatus = function(callback) {
    command(commands.macroStatus, null, callback);
  };

  /**
   * The Set Macro Parameter command allows system globals that influence
   * certain macro commands to be selectively altered from outside of the macro
   * system itself.
   *
   * The values of Val1 and Val2 depend on the parameter index.
   *
   * Possible indices:
   *
   * - **00h** Assign System Delay 1: Val1 = MSB, Val2 = LSB
   * - **01h** Assign System Delay 2: Val1 = MSB, Val2 = LSB
   * - **02h** Assign System Speed 1: Val1 = speed, Val2 = 0 (ignored)
   * - **03h** Assign System Speed 2: Val1 = speed, Val2 = 0 (ignored)
   * - **04h** Assign System Loops: Val1 = loop count, Val2 = 0 (ignored)
   *
   * For more details, please refer to the Sphero Macro document.
   *
   * @param {Number} index what parameter index to use
   * @param {Number} val1 value 1 to set
   * @param {Number} val2 value 2 to set
   * @param {Function} callback function to be triggered with response
   * @example
   * orb.setMacroParam(0x02, 0xF0, 0x00, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.setMacroParam = function(index, val1, val2, callback) {
    command(
      commands.setMacroParam,
      utils.argsToHexArray(index, val1, val2),
      callback
    );
  };

  /**
   * The Append Macro Chunk project stores the attached macro definition into
   * the temporary RAM buffer for later execution.
   *
   * It's similar to the Save Temporary Macro command, but allows building up
   * longer temporary macros.
   *
   * Any existing Macro ID can be sent through this command, and executed
   * through the Run Macro call using ID 0xFF.
   *
   * If this command is sent while a Temporary or Stream Macro is executing it
   * will be terminated so that its storage space can be overwritten. As with
   * all macros, the longest chunk that can be sent is 254 bytes.
   *
   * You must follow this with a Run Macro command (ID 0xFF) to actually get it
   * to go and it is best to prefix this command with an Abort call to make
   * certain the larger buffer is completely initialized.
   *
   * @param {Array} chunk of bytes to append for macro execution
   * @param {Function} callback function to be triggered with response
   * @example
   * orb.appendMacroChunk(, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.appendMacroChunk = function(chunk, callback) {
    command(commands.appendTempMacroChunk, chunk, callback);
  };

  /**
   * The Erase orbBasic Storage command erases any existing program in the
   * specified storage area.
   *
   * Specify 0x00 for the temporary RAM buffer, or 0x01 for the persistent
   * storage area.
   *
   * @param {Number} area which area to erase
   * @param {Function} callback function to be triggered with response
   * @example
   * orb.eraseOrbBasicStorage(0x00, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.eraseOrbBasicStorage = function(area, callback) {
    area &= 0xFF;
    command(commands.eraseOBStorage, [area], callback);
  };

  /**
   * The Append orbBasic Fragment command appends a patch of orbBasic code to
   * existing ones in the specified storage area (0x00 for RAM, 0x01 for
   * persistent).
   *
   * Complete lines are not required. A line begins with a decimal line number
   * followed by a space and is terminated with a <LF>.
   *
   * See the orbBasic Interpreter document for complete information.
   *
   * Possible error responses would be ORBOTIX_RSP_CODE_EPARAM if an illegal
   * storage area is specified or ORBOTIX_RSP_CODE_EEXEC if the specified
   * storage area is full.
   *
   * @param {Number} area which area to append the fragment to
   * @param {String} code orbBasic code to append
   * @param {Function} callback function to be triggered with response
   * @example
   * orb.appendOrbBasicFragment(0x00, OrbBasicCode, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.appendOrbBasicFragment = function(area, code, callback) {
    area &= 0xFF;
    var data = [].concat(area, code);
    command(commands.appendOBFragment, data, callback);
  };

  /**
   * The Execute orbBasic Program command attempts to run a program in the
   * specified storage area, beginning at the specified line number.
   *
   * This command will fail if there is already an orbBasic program running.
   *
   * @param {Number} area which area to run from
   * @param {Number} slMSB start line
   * @param {Number} slLSB start line
   * @param {Function} callback function to be triggered with response
   * @example
   * orb.executeOrbBasicProgram(0x00, 0x00, 0x00, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.executeOrbBasicProgram = function(area, slMSB, slLSB, callback) {
    command(
      commands.execOBProgram,
      utils.argsToHexArray(area, slMSB, slLSB),
      callback
    );
  };

  /**
   * The Abort orbBasic Program command aborts execution of any currently
   * running orbBasic program.
   *
   * @param {Function} callback function to be triggered with response
   * @example
   * orb.abortOrbBasicProgram(function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.abortOrbBasicProgram = function(callback) {
    command(commands.abortOBProgram, null, callback);
  };

  /**
   * The Submit value To Input command takes the place of the typical user
   * console in orbBasic and allows a user to answer an input request.
   *
   * If there is no pending input request when this API command is sent, the
   * supplied value is ignored without error.
   *
   * Refer to the orbBasic language document for further information.
   *
   * @param {Number} val value to respond with
   * @param {Function} callback function to be triggered with response
   * @example
   * orb.submitValuetoInput(0x0000FFFF, function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.submitValueToInput = function(val, callback) {
    val = utils.intToHexArray(val, 4);
    command(commands.answerInput, val, callback);
  };

  /**
   * The Commit To Flash command copies the current orbBasic RAM program to
   * persistent flash storage.
   *
   * It will fail if a program is currently executing out of flash.
   *
   * @param {Function} callback function to be triggered with response
   * @example
   * orb.commitToFlash(function(err, data) {
   *   console.log(err || "data: " + data);
   * }
   * @return {void}
   */
  device.commitToFlash = function(callback) {
    command(commands.commitToFlash, null, callback);
  };

  device._commitToFlashAlias = function(callback) {
    command(commands.commitToFlashAlias, null, callback);
  };
};

},{"../commands/sphero":83,"../utils":92}],87:[function(require,module,exports){
"use strict";

function isSerialPort(str) {
  // use regexp to determine whether or not 'str' is a serial port
  return /(\/dev\/|com\d+).*/i.test(str);
}

/**
 * Loads an adaptor based on provided connection string and system state
 *
 * @param {String} conn connection string (serial port or BLE UUID)
 * @return {Object} adaptor instance
 */
module.exports.load = function load(conn) {
  var isSerial = isSerialPort(conn),
      isChrome = typeof chrome !== "undefined",
      Adaptor;

  if (isSerial) {
    Adaptor = require("./adaptors/serialport");
  } else if (isChrome) {
    // load chrome BLE adaptor
  } else {
    // load BLE adaptor (noble?)
  }

  return new Adaptor(conn);
};

},{"./adaptors/serialport":80}],88:[function(require,module,exports){
(function (Buffer){
"use strict";

var inherits = require("util").inherits,
    EventEmitter = require("events").EventEmitter;

var utils = require("./utils"),
    RES_PARSER = require("./parsers/response.js"),
    ASYNC_PARSER = require("./parsers/async.js");

var MIN_BUFFER_SIZE = 6,
    FIELDS = {
      size: 5,
      sop1: {
        pos: 0,
        hex: 0xFF
      },
      sop2: {
        pos: 1,
        sync: 0xFF,
        async: 0xFE,
      },
      mrspHex: 0x00,
      seqHex: 0x00,
      mrspIdCode: 2,
      seqMsb: 3,
      dlenLsb: 4,
      checksum: 5,
      didHex: 0x00,
      cidHex: 0x01
    };

var Packet = module.exports = function() {
  this.partialBuffer = new Buffer(0);
  this.partialCounter = 0;
};

inherits(Packet, EventEmitter);

Packet.prototype.create = function(opts) {
  opts = opts || {};

  var sop1 = (opts.sop1 === undefined) ? FIELDS.sop1.hex : opts.sop1,
      sop2 = (opts.sop2 === undefined) ? FIELDS.sop2.sync : opts.sop2,
      did = (opts.did === undefined) ? FIELDS.didHex : opts.did,
      cid = (opts.cid === undefined) ? FIELDS.cidHex : opts.cid,
      seq = (opts.seq === undefined) ? FIELDS.seqHex : opts.seq,
      data = (!opts.data) ? [] : opts.data,
      // Add 1 to dlen, since it also counts the checksum byte
      dlen = data.length + 1,
      checksum = 0x00;

  // Create array with packet bytes
  var packet = [
    sop1, sop2, did, cid, seq, dlen
  ].concat(data);

  // Get checksum for final byte in packet
  checksum = utils.checksum(packet.slice(2));

  // Add checksum to packet
  packet.push(checksum);

  return packet;
};

Packet.prototype.parse = function(buffer) {
  if (this.partialBuffer.length > 0) {
    buffer = Buffer.concat(
      [this.partialBuffer, buffer],
      buffer.length + this.partialBuffer.length
    );

    this.partialBuffer = new Buffer(0);
  } else {
    this.partialBuffer = new Buffer(buffer);
  }

  if (this._checkSOPs(buffer)) {
    // Check the packet is at least 6 bytes long
    if (this._checkMinSize(buffer)) {
      // Check the buffer length matches the
      // DLEN value specified in the buffer
      if (this._checkExpectedSize(buffer) > -1) {
        // If the packet looks good parse it
        return this._parse(buffer);
      }
    }

    this.partialBuffer = new Buffer(buffer);
  }

  return null;
};

Packet.prototype._parse = function(buffer) {
  var packet = {};
  packet.sop1 = buffer[FIELDS.sop1.pos];
  packet.sop2 = buffer[FIELDS.sop2.pos];

  var bByte2 = buffer[FIELDS.mrspIdCode],
      bByte3 = buffer[FIELDS.seqMsb],
      bByte4 = buffer[FIELDS.dlenLsb];

  if (FIELDS.sop2.sync === buffer[FIELDS.sop2.pos]) {
    packet.mrsp = bByte2;
    packet.seq = bByte3;
    packet.dlen = bByte4;
  } else {
    packet.idCode = bByte2;
    packet.dlenMsb = bByte3;
    packet.dlenLsb = bByte4;
  }

  packet.dlen = this._extractDlen(buffer);

  // Create new Buffer for data that is dlen -1 (minus checksum) in size
  packet.data = new Buffer(packet.dlen - 1);
  // Copy data from buffer into packet.data
  buffer.copy(packet.data, 0, FIELDS.size, FIELDS.size + packet.dlen - 1);
  packet.checksum = buffer[FIELDS.size + packet.dlen - 1];

  this._dealWithExtraBytes(buffer);

  return this._verifyChecksum(buffer, packet);
};

Packet.prototype._dealWithExtraBytes = function(buffer) {
  // If the packet was parsed successfully, and the buffer and
  // expected size of the buffer are the same,clean up the
  // partialBuffer, otherwise assign extrabytes to partialBuffer
  var expectedSize = this._checkExpectedSize(buffer);
  if (buffer.length > expectedSize) {
    this.partialBuffer = new Buffer(buffer.length - expectedSize);
    buffer.copy(this.partialBuffer, 0, expectedSize);
  } else {
    this.partialBuffer = new Buffer(0);
  }
};

Packet.prototype._verifyChecksum = function(buffer, packet) {
  var bSlice = buffer.slice(
        FIELDS.mrspIdCode,
        FIELDS.checksum + packet.dlen - 1
      ),
      checksum = utils.checksum(bSlice);

  // If we got an incorrect checksum we cleanup the packet,
  // partialBuffer, return null and emit an error event
  if (checksum !== packet.checksum) {
    packet = null;
    this.partialBuffer = new Buffer(0);
    this.emit("error", new Error("Incorrect checksum, packet discarded!"));
  }

  return packet;
};

Packet.prototype.parseAsyncData = function(payload, ds) {
  var parser = ASYNC_PARSER[payload.idCode];

  return this._parseData(parser, payload, ds);
};

Packet.prototype.parseResponseData = function(cmd, payload) {
  if (!cmd || cmd.did === undefined || cmd.cid === undefined) {
    return payload;
  }

  var parserId = cmd.did.toString(16) + ":" + cmd.cid.toString(16),
      parser = RES_PARSER[parserId];

  return this._parseData(parser, payload);
};

Packet.prototype._parseData = function(parser, payload, ds) {
  var data = payload.data,
      pData, fields, field;


  if (parser && (data.length > 0)) {

    ds = this._checkDSMasks(ds, parser);

    if (ds === -1) {
      return payload;
    }

    fields = parser.fields;

    pData = {
      desc: parser.desc,
      idCode: parser.idCode,
      event: parser.event,
      did: parser.did,
      cid: parser.cid,
      packet: payload
    };


    var dsIndex = 0,
        dsFlag = 0,
        i = 0;

    while (i < fields.length) {
      field = fields[i];

      dsFlag = this._checkDSBit(ds, field);

      if (dsFlag === 1) {
        field.from = dsIndex;
        field.to = dsIndex = dsIndex + 2;
      } else if (dsFlag === 0) {
        i = this._incParserIndex(i, fields, data, dsFlag, dsIndex);
        continue;
      }

      pData[field.name] = this._parseField(field, data, pData);

      i = this._incParserIndex(i, fields, data, dsFlag, dsIndex);
    }
  } else {
    pData = payload;
  }

  return pData;
};

Packet.prototype._checkDSMasks = function(ds, parser) {
  if (parser.idCode === 0x03) {
    if (!(ds && ds.mask1 != null && ds.mask2 != null)) {
      return -1;
    }
  } else {
    return null;
  }

  return ds;
};

Packet.prototype._incParserIndex = function(i, fields, data, dsFlag, dsIndex) {
  i++;

  if ((dsFlag >= 0) && (i === fields.length) && (dsIndex < data.length)) {
    i = 0;
  }

  return i;
};

Packet.prototype._checkDSBit = function(ds, field) {
  if (!ds) {
    return -1;
  }

  if (Math.abs(ds[field.maskField] & field.bitmask) > 0) {
    return 1;
  }

  return 0;
};

Packet.prototype._parseField = function(field, data, pData) {
  var pField;

  data = data.slice(field.from, field.to);
  pField = utils.bufferToInt(data);

  switch (field.type) {
    case "number":
      if (field.format === "hex") {
        pField = "0x" + pField.toString(16).toUpperCase();
      }
      break;
    case "string":
      pField = data.toString(field.format).replace(/\0/g, "0");
      break;
    case "raw":
      pField = new Buffer(data);
      break;
    case "predefined":
      if (field.mask != null) {
        pField &= field.mask;
      }
      pField = field.values[pField];
      break;
    case "bitmask":
      pField = this._parseBitmaskField(pField, field, pData);
      break;
    default:
      this.emit("error", new Error("Data could not be parsed!"));
      pField = "Data could not be parsed!";
      break;
  }

  return pField;
};

Packet.prototype._parseBitmaskField = function(val, field, pData) {
  var pField = {};

  if (val > field.range.top) {
    val = utils.twosToInt(val, 2);
  }

  if (pData[field.name]) {
    pField = pData[field.name];
    pField.value.push(val);
  } else {
    pField = {
      sensor: field.sensor,
      range: field.range,
      units: field.units,
      value: [val]
    };
  }

  return pField;
};

Packet.prototype._checkSOPs = function(buffer) {
  return (this._checkSOP1(buffer)) ? this._checkSOP2(buffer) : false;
};

Packet.prototype._checkSOP1 = function(buffer) {
  return (buffer[FIELDS.sop1.pos] === FIELDS.sop1.hex);
};

Packet.prototype._checkSOP2 = function(buffer) {
  var sop2 = buffer[FIELDS.sop2.pos];

  if (sop2 === FIELDS.sop2.sync) {
    return "sync";
  } else if (sop2 === FIELDS.sop2.async) {
    return "async";
  }

  return false;
};

Packet.prototype._checkExpectedSize = function(buffer) {
  // Size = buffer fields size (SOP1, SOP2, MSRP, SEQ and DLEN) + DLEN value
  var expectedSize = FIELDS.size + this._extractDlen(buffer),
      bufferSize = buffer.length;

  return (bufferSize < expectedSize) ? -1 : expectedSize;
};

Packet.prototype._checkMinSize = function(buffer) {
  return (buffer.length >= MIN_BUFFER_SIZE);
};

Packet.prototype._extractDlen = function(buffer) {
  if (buffer[FIELDS.sop2.pos] === FIELDS.sop2.sync) {
    return buffer[FIELDS.dlenLsb];
  }

  // We shift the dlen MSB 8 bits and then do a binary OR
  // between the two values to obtain the dlen value
  return (buffer[FIELDS.seqMsb] << 8) | buffer[FIELDS.dlenLsb];
};

}).call(this,require("buffer").Buffer)
},{"./parsers/async.js":89,"./parsers/response.js":90,"./utils":92,"buffer":5,"events":7,"util":31}],89:[function(require,module,exports){
"use strict";

module.exports = {
  0x01: {
    desc: "Battery Power State",
    idCode: 0x01,
    did: 0x00,
    cid: 0x21,
    event: "battery",
    fields: [
      {
        name: "state",
        type: "predefined",
        values: {
          0x01: "Battery Charging",
          0x02: "Battery OK",
          0x03: "Battery Low",
          0x04: "Battery Critical"
        }
      }
    ]
  },
  0x02: {
    desc: "Level 1 Diagnostic Response",
    idCode: 0x02,
    did: 0x00,
    cid: 0x40,
    event: "level1Diagnostic",
    fields: [
      {
        name: "diagnostic",
        type: "string",
        format: "ascii",
        from: 0,
        to: undefined
      }
    ]
  },
  0x03: {
    desc: "Sensor Data Streaming",
    idCode: 0x03,
    did: 0x02,
    cid: 0x11,
    event: "dataStreaming",
    fields: [
      {
        name: "xAccelRaw",
        type: "bitmask",
        bitmask: 0x80000000,
        maskField: "mask1",
        sensor: "accelerometer axis X, raw",
        range: {
          bottom: -2048,
          top: 2047
        },
        units: "4mg"
      },
      {
        name: "yAccelRaw",
        type: "bitmask",
        bitmask: 0x40000000,
        maskField: "mask1",
        sensor: "accelerometer axis Y, raw",
        range: {
          bottom: -2048,
          top: 2047
        },
        units: "4mG"
      },
      {
        name: "zAccelRaw",
        type: "bitmask",
        bitmask: 0x20000000,
        maskField: "mask1",
        sensor: "accelerometer axis Z, raw",
        range: {
          bottom: -2048,
          top: 2047
        },
        units: "4mG"
      },
      {
        name: "xGyroRaw",
        type: "bitmask",
        bitmask: 0x10000000,
        maskField: "mask1",
        sensor: "gyroscope axis X, raw",
        range: {
          bottom: -32768,
          top: 32767
        },
        units: "0.068 degrees"
      },
      {
        name: "yGyroRaw",
        type: "bitmask",
        bitmask: 0x08000000,
        maskField: "mask1",
        sensor: "gyroscope axis Y, raw",
        range: {
          bottom: -32768,
          top: 32767
        },
        units: "0.068 degrees"
      },
      {
        name: "zGyroRaw",
        type: "bitmask",
        bitmask: 0x04000000,
        maskField: "mask1",
        sensor: "gyroscope axis Z, raw",
        range: {
          bottom: -32768,
          top: 32767
        },
        units: "0.068 degrees"
      },
      {
        name: "rMotorBackEmfRaw",
        type: "bitmask",
        bitmask: 0x00400000,
        maskField: "mask1",
        sensor: "right motor back EMF, raw",
        range: {
          bottom: -32768,
          top: 32767
        },
        units: "22.5cm"
      },
      {
        name: "lMotorBackEmfRaw",
        type: "bitmask",
        bitmask: 0x00200000,
        maskField: "mask1",
        sensor: "left motor back EMF, raw",
        range: {
          bottom: -32768,
          top: 32767
        },
        units: "22.5cm"
      },
      {
        name: "lMotorPWMRaw",
        type: "bitmask",
        bitmask: 0x00100000,
        maskField: "mask1",
        sensor: "left motor PWM, raw",
        range: {
          bottom: -2048,
          top: 2047
        },
        units: "dutyCycle"
      },
      {
        name: "rMotorPWMRaw",
        type: "bitmask",
        bitmask: 0x00080000,
        maskField: "mask1",
        sensor: "right motor PWM, raw",
        range: {
          bottom: -2048,
          top: 2047
        },
        units: "dutyCycle"
      },
      {
        name: "pitchAngle",
        type: "bitmask",
        bitmask: 0x00040000,
        maskField: "mask1",
        sensor: "IMU pitch angle, filtered",
        range: {
          bottom: -179,
          top: 180
        },
        units: "degrees"
      },
      {
        name: "rollAngle",
        type: "bitmask",
        bitmask: 0x00020000,
        maskField: "mask1",
        sensor: "IMU roll angle, filtered",
        range: {
          bottom: -179,
          top: 180
        },
        units: "degrees"
      },
      {
        name: "yawAngle",
        type: "bitmask",
        bitmask: 0x00010000,
        maskField: "mask1",
        sensor: "IMU yaw angle, filtered",
        range: {
          bottom: -179,
          top: 180
        },
        units: "degrees"
      },
      {
        name: "xAccel",
        type: "bitmask",
        bitmask: 0x00008000,
        maskField: "mask1",
        sensor: "accelerometer axis X, filtered",
        range: {
          bottom: -32768,
          top: 32767
        },
        units: "1/4096 G"
      },
      {
        name: "yAccel",
        type: "bitmask",
        bitmask: 0x00004000,
        maskField: "mask1",
        sensor: "accelerometer axis Y, filtered",
        range: {
          bottom: -32768,
          top: 32767
        },
        units: "1/4096 G"
      },
      {
        name: "zAccel",
        type: "bitmask",
        bitmask: 0x00002000,
        maskField: "mask1",
        sensor: "accelerometer axis Z, filtered",
        range: {
          bottom: -32768,
          top: 32767
        },
        units: "1/4096 G"
      },
      {
        name: "xGyro",
        type: "bitmask",
        bitmask: 0x00001000,
        maskField: "mask1",
        sensor: "gyro axis X, filtered",
        range: {
          bottom: -20000,
          top: 20000
        },
        units: "0.1 dps"
      },
      {
        name: "yGyro",
        type: "bitmask",
        bitmask: 0x00000800,
        maskField: "mask1",
        sensor: "gyro axis Y, filtered",
        range: {
          bottom: -20000,
          top: 20000
        },
        units: "0.1 dps"
      },
      {
        name: "zGyro",
        type: "bitmask",
        bitmask: 0x00000400,
        maskField: "mask1",
        sensor: "gyro axis Z, filtered",
        range: {
          bottom: -20000,
          top: 20000
        },
        units: "0.1 dps"
      },
      {
        name: "rMotorBackEmf",
        type: "bitmask",
        bitmask: 0x00000040,
        maskField: "mask1",
        sensor: "right motor back EMF, filtered",
        range: {
          bottom: -32768,
          top: 32767
        },
        units: "22.5 cm"
      },
      {
        name: "lMotorBackEmf",
        type: "bitmask",
        bitmask: 0x00000020,
        maskField: "mask1",
        sensor: "left motor back EMF, filtered",
        range: {
          bottom: -32768,
          top: 32767
        },
        units: "22.5 cm"
      },
      {
        name: "quaternionQ0",
        type: "bitmask",
        bitmask: 0x80000000,
        maskField: "mask2",
        sensor: "quaternion Q0",
        range: {
          bottom: -10000,
          top: 10000
        },
        units: "1/10000 Q"
      },
      {
        name: "quaternionQ1",
        type: "bitmask",
        bitmask: 0x40000000,
        maskField: "mask2",
        sensor: "quaternion Q1",
        range: {
          bottom: -10000,
          top: 10000
        },
        units: "1/10000 Q"
      },
      {
        name: "quaternionQ2",
        type: "bitmask",
        bitmask: 0x20000000,
        maskField: "mask2",
        sensor: "quaternion Q2",
        range: {
          bottom: -10000,
          top: 10000
        },
        units: "1/10000 Q"
      },
      {
        name: "quaternionQ3",
        type: "bitmask",
        bitmask: 0x10000000,
        maskField: "mask2",
        sensor: "quaternion Q3",
        range: {
          bottom: -10000,
          top: 10000
        },
        units: "1/10000 Q"
      },
      {
        name: "xOdometer",
        type: "bitmask",
        bitmask: 0x08000000,
        maskField: "mask2",
        sensor: "odomoter X",
        range: {
          bottom: -32768,
          top: 32767
        },
        units: "cm"
      },
      {
        name: "yOdometer",
        type: "bitmask",
        bitmask: 0x04000000,
        maskField: "mask2",
        sensor: "odomoter Y",
        range: {
          bottom: -32768,
          top: 32767
        },
        units: "cm"
      },
      {
        name: "accelOne",
        type: "bitmask",
        bitmask: 0x02000000,
        maskField: "mask2",
        sensor: "acceleration one",
        range: {
          bottom: 0,
          top: 8000
        },
        units: "1mG"
      },
      {
        name: "xVelocity",
        type: "bitmask",
        bitmask: 0x01000000,
        maskField: "mask2",
        sensor: "velocity X",
        range: {
          bottom: -32768,
          top: 32767
        },
        units: "mm/s"
      },
      {
        name: "yVelocity",
        type: "bitmask",
        bitmask: 0x00800000,
        maskField: "mask2",
        sensor: "velocity Y",
        range: {
          bottom: -32768,
          top: 32767
        },
        units: "mm/s"
      }
    ]
  },
  0x04: {
    desc: "Config Block Contents",
    idCode: 0x04,
    did: 0x02,
    cid: 0x40,
    event: "configBlock",
    fields: [
      {
        name: "content",
        type: "raw",
      }
    ]
  },
  0x05: {
    desc: "Pre-sleep Warning",
    idCode: 0x05,
    did: null,
    cid: null,
    event: "preSleepWarning",
    fields: [
      {
        name: "content",
        type: "raw",
      }
    ]
  },
  0x06: {
    desc: "Macro Markers",
    idCode: 0x06,
    did: null,
    cid: null,
    event: "macroMarkers",
    fields: [
      {
        name: "content",
        type: "raw",
      }
    ]
  },
  0x07: {
    desc: "Collision detected",
    idCode: 0x07,
    did: 0x02,
    cid: 0x12,
    event: "collision",
    fields: [
      {
        name: "x",
        type: "number",
        from: 0,
        to: 2
      },
      {
        name: "y",
        type: "number",
        from: 2,
        to: 4
      },
      {
        name: "z",
        type: "number",
        from: 4,
        to: 6
      },
      {
        name: "axis",
        type: "number",
        from: 6,
        to: 7
      },
      {
        name: "xMagnitude",
        type: "number",
        from: 7,
        to: 9
      },
      {
        name: "yMagnitude",
        type: "number",
        from: 9,
        to: 11
      },
      {
        name: "speed",
        type: "number",
        from: 11,
        to: 12
      },
      {
        name: "timestamp",
        type: "number",
        from: 12,
        to: 16
      }
    ]
  },
  0x08: {
    desc: "Orb-basic Print Message",
    idCode: 0x08,
    did: null,
    cid: null,
    event: "obPrint",
    fields: [
      {
        name: "content",
        type: "raw",
      }
    ]
  },
  0x09: {
    desc: "Orb-basic ASCII Error Message",
    idCode: 0x09,
    did: null,
    cid: null,
    event: "obAsciiError",
    fields: [
      {
        name: "content",
        type: "string",
        format: "ascii",
        from: 0,
        to: undefined
      }
    ]
  },
  0x0A: {
    desc: "Orb-basic Binary Error Message",
    idCode: 0x0A,
    did: null,
    cid: null,
    event: "obBinaryError",
    fields: [
      {
        name: "content",
        type: "raw",
      }
    ]
  },
  0x0B: {
    desc: "Self Level",
    idCode: 0x0B,
    did: 0x02,
    cid: 0x09,
    event: "selfLevel",
    fields: [
      {
        name: "result",
        type: "predefined",
        values: {
          0x00: "Unknown",
          0x01: "Timed Out (level was not achived)",
          0x02: "Sensors Error",
          0x03: "Self Level Disabled (see Option flags)",
          0x04: "Aborted (by API call)",
          0x05: "Charger Not Found",
          0x06: "Success"
        }
      }
    ]
  },
  0x0C: {
    desc: "Gyro Axis Limit Exceeded",
    idCode: 0x0C,
    did: null,
    cid: null,
    event: "gyroAxisExceeded",
    fields: [
      {
        name: "x",
        type: "predefined",
        mask: 0x03,
        values: {
          0x00: "none",
          0x01: "positive",
          0x02: "negative"
        }
      },
      {
        name: "y",
        type: "predefined",
        mask: 0x0C,
        values: {
          0x00: "none",
          0x04: "positive",
          0x08: "negative"
        }
      },
      {
        name: "z",
        type: "predefined",
        mask: 0x30,
        values: {
          0x00: "none",
          0x10: "positive",
          0x20: "negative"
        }
      }
    ]
  },
  0x0D: {
    desc: "Sphero's Soul Data",
    idCode: 0x0D,
    did: 0x02,
    cid: 0x43,
    event: "spheroSoulData",
    fields: [
      {
        name: "content",
        type: "raw",
      }
    ]
  },
  0x0E: {
    desc: "Level Up",
    idCode: 0x0E,
    did: null,
    cid: null,
    event: "levelUp",
    fields: [
      {
        name: "robotLevel",
        type: "number",
        from: 0,
        to: 2
      },
      {
        name: "attributePoints",
        type: "number",
        from: 2,
        to: 4
      }
    ]
  },
  0x0F: {
    desc: "Shield Damage",
    idCode: 0x0F,
    did: null,
    cid: null,
    event: "shieldDamage",
    fields: [
      {
        name: "robotLevel",
        type: "number",
        from: 0,
        to: 1
      },
    ]
  },
  0x10: {
    desc: "XP % towards next robot level (0 = 0%, 255 = 100%)",
    idCode: 0x10,
    did: null,
    cid: null,
    event: "xpUpdate",
    fields: [
      {
        name: "cp",
        type: "number",
        from: 0,
        to: 1
      },
    ]
  },
  0x11: {
    desc: "Boost power left (0 = 0%, 255 = 100%)",
    idCode: 0x11,
    did: null,
    cid: null,
    event: "boostUpdate",
    fields: [
      {
        name: "boost",
        type: "number",
        from: 0,
        to: 1
      },
    ]
  }
};

},{}],90:[function(require,module,exports){
"use strict";

module.exports = {
  "0:2": {
    desc: "Get Version",
    did: 0x00,
    cid: 0x02,
    event: "version",
    fields: [
      {
        name: "recv",
        type: "number",
        from: 0,
        to: 1
      },
      {
        name: "mdl",
        type: "number",
        from: 1,
        to: 2
      },
      {
        name: "hw",
        type: "number",
        from: 2,
        to: 3
      },
      {
        name: "msaVer",
        type: "number",
        from: 3,
        to: 4
      },
      {
        name: "msaRev",
        type: "number",
        from: 4,
        to: 5
      },
      {
        name: "bl",
        type: "number",
        format: "hex",
        from: 5,
        to: 6
      },
      {
        name: "bas",
        type: "number",
        format: "hex",
        from: 6,
        to: 7
      },
      {
        name: "macro",
        type: "number",
        format: "hex",
        from: 7,
        to: 8
      },
      {
        name: "apiMaj",
        type: "number",
        from: 8,
        to: 9
      },
      {
        name: "apiMin",
        type: "number",
        from: 9,
        to: 10
      },
    ]
  },
  "0:11": {
    desc: "Get Bluetooth Info",
    did: 0x00,
    cid: 0x11,
    event: "bluetoothInfo",
    fields: [
      {
        name: "name",
        type: "string",
        format: "ascii",
        from: 0,
        to: 16
      },
      {
        name: "btAddress",
        type: "string",
        format: "ascii",
        from: 16,
        to: 28
      },
      {
        name: "separator",
        type: "number",
        from: 28,
        to: 29
      },
      {
        name: "colors",
        type: "number",
        format: "hex",
        from: 29,
        to: 32
      }
    ]
  },
  "0:13": {
    desc: "Get Auto-reconnect Info",
    did: 0x00,
    cid: 0x13,
    event: "autoReconnectInfo",
    fields: [
      {
        name: "flag",
        type: "number",
        from: 0,
        to: 1
      },
      {
        name: "time",
        type: "number",
        from: 1,
        to: 2
      }
    ]
  },
  "0:20": {
    desc: "Get Power State Info",
    did: 0x00,
    cid: 0x20,
    event: "powerStateInfo",
    fields: [
      {
        name: "recVer",
        type: "number",
        from: 0,
        to: 1
      },
      {
        name: "batteryState",
        type: "predefined",
        from: 1,
        to: 2,
        values: {
          0x01: "Battery Charging",
          0x02: "Battery OK",
          0x03: "Battery Low",
          0x04: "Battery Critical"
        }
      },
      {
        name: "batteryVoltage",
        type: "number",
        from: 2,
        to: 4
      },
      {
        name: "chargeCount",
        type: "number",
        from: 4,
        to: 6
      },
      {
        name: "secondsSinceCharge",
        type: "number",
        from: 6,
        to: 8
      }
    ]
  },
  "0:23": {
    desc: "Get Voltage Trip Points",
    did: 0x00,
    cid: 0x23,
    event: "voltageTripPoints",
    fields: [
      {
        name: "vLow",
        type: "number",
        from: 0,
        to: 2
      },
      {
        name: "vCrit",
        type: "number",
        from: 2,
        to: 4
      }
    ]
  },
  "0:41": {
    desc: "Level 2 Diagnostics",
    did: 0x00,
    cid: 0x41,
    event: "level2Diagnostics",
    fields: [
      {
        name: "recVer",
        type: "number",
        from: 0,
        to: 2
      },
      {
        name: "rxGood",
        type: "number",
        from: 3,
        to: 7
      },
      {
        name: "rxBadDID",
        type: "number",
        from: 7,
        to: 11
      },
      {
        name: "rxBadDlen",
        type: "number",
        from: 11,
        to: 15
      },
      {
        name: "rxBadCID",
        type: "number",
        from: 15,
        to: 19
      },
      {
        name: "rxBadCheck",
        type: "number",
        from: 19,
        to: 23
      },
      {
        name: "rxBufferOvr",
        type: "number",
        from: 23,
        to: 27
      },
      {
        name: "txMsg",
        type: "number",
        from: 27,
        to: 31
      },
      {
        name: "txBufferOvr",
        type: "number",
        from: 31,
        to: 35
      },
      {
        name: "lastBootReason",
        type: "number",
        from: 35,
        to: 36
      },
      {
        name: "bootCounters",
        type: "number",
        format: "hex",
        from: 36,
        to: 68
      },
      {
        name: "chargeCount",
        type: "number",
        from: 70,
        to: 72
      },
      {
        name: "secondsSinceCharge",
        type: "number",
        from: 72,
        to: 74
      },
      {
        name: "secondsOn",
        type: "number",
        from: 74,
        to: 78
      },
      {
        name: "distanceRolled",
        type: "number",
        from: 78,
        to: 82
      },
      {
        name: "sensorFailures",
        type: "number",
        from: 82,
        to: 84
      },
      {
        name: "gyroAdjustCount",
        type: "number",
        from: 84,
        to: 88
      }
    ]
  },
  "0:51": {
    desc: "Poll Packet Times",
    did: 0x00,
    cid: 0x51,
    event: "packetTimes",
    fields: [
      {
        name: "t1",
        type: "number",
        from: 0,
        to: 4
      },
      {
        name: "t2",
        type: "number",
        from: 4,
        to: 8
      },
      {
        name: "t3",
        type: "number",
        from: 8,
        to: 12
      }
    ]
  },
  "2:7": {
    desc: "Get Chassis Id",
    did: 0x02,
    cid: 0x07,
    event: "chassisId",
    fields: [
      {
        name: "chassisId",
        type: "number",
      }
    ]
  },
  "2:15": {
    desc: "Read Locator",
    did: 0x02,
    cid: 0x15,
    event: "readLocator",
    fields: [
      {
        name: "xpos",
        type: "number",
        from: 0,
        to: 2
      },
      {
        name: "ypos",
        type: "number",
        from: 2,
        to: 4
      },
      {
        name: "xvel",
        type: "number",
        from: 4,
        to: 6
      },
      {
        name: "yvel",
        type: "number",
        from: 6,
        to: 8
      },
      {
        name: "sog",
        type: "number",
        from: 8,
        to: 10
      }
    ]
  },
  "2:22": {
    desc: "Get RGB LED",
    did: 0x02,
    cid: 0x22,
    event: "rgbLedColor",
    fields: [
      {
        name: "color",
        type: "number",
        format: "hex",
        from: 0,
        to: 3
      },
      {
        name: "red",
        type: "number",
        from: 0,
        to: 1
      },
      {
        name: "green",
        type: "number",
        from: 1,
        to: 2
      },
      {
        name: "blue",
        type: "number",
        from: 2,
        to: 3
      }
    ]
  },
  "2:36": {
    desc: "Get Permanent Option Flags",
    did: 0x02,
    cid: 0x36,
    event: "permanentOptionFlags",
    fields: [
      {
        name: "sleepOnCharger",
        type: "predefined",
        mask: 0x01,
        values: {
          0x00: false,
          0x01: true
        }
      },
      {
        name: "vectorDrive",
        type: "predefined",
        mask: 0x02,
        values: {
          0x00: false,
          0x02: true
        }
      },
      {
        name: "selfLevelOnCharger",
        type: "predefined",
        mask: 0x04,
        values: {
          0x00: false,
          0x04: true
        }
      },
      {
        name: "tailLedAlwaysOn",
        type: "predefined",
        mask: 0x08,
        values: {
          0x00: false,
          0x08: true
        }
      },
      {
        name: "motionTimeouts",
        type: "predefined",
        mask: 0x10,
        values: {
          0x00: false,
          0x10: true
        }
      },
      {
        name: "retailDemoOn",
        type: "predefined",
        mask: 0x20,
        values: {
          0x00: false,
          0x20: true
        }
      },
      {
        name: "awakeSensitivityLight",
        type: "predefined",
        mask: 0x40,
        values: {
          0x00: false,
          0x40: true
        }
      },
      {
        name: "awakeSensitivityHeavy",
        type: "predefined",
        mask: 0x80,
        values: {
          0x00: false,
          0x80: true
        }
      },
      {
        name: "gyroMaxAsyncMsg",
        type: "predefined",
        mask: 0x100,
        values: {
          0x00: false,
          0x100: true
        }
      }
    ]
  },
  "2:38": {
    desc: "Get Temporal Option Flags",
    did: 0x02,
    cid: 0x38,
    event: "temporalOptionFlags",
    fields: [
      {
        name: "stopOnDisconnect",
        type: "predefined",
        mask: 0x01,
        values: {
          0x00: false,
          0x01: true
        }
      }
    ]
  },
  "2:44": {
    desc: "Get Device Mode",
    did: 0x02,
    cid: 0x44,
    event: "deviceMode",
    fields: [
      {
        name: "mode",
        type: "predefined",
        values: {
          0x00: "Normal",
          0x01: "User Hack"
        }
      }
    ]
  },
  "2:48": {
    desc: "Refill Bank",
    did: 0x02,
    cid: 0x48,
    event: "refillBank",
    fields: [
      {
        name: "coresRemaining",
        type: "number"
      }
    ]
  },
  "2:49": {
    desc: "Buy Consumable",
    did: 0x02,
    cid: 0x49,
    event: "buyConsumable",
    fields: [
      {
        name: "qtyRemaining",
        type: "number",
        from: 0,
        to: 1
      }, { name: "coresRemaining",
        type: "number",
        from: 1,
        to: 5
      }
    ]
  },
  "2:4A": {
    desc: "Use Consumable",
    did: 0x02,
    cid: 0x4A,
    event: "buyConsumable",
    fields: [
      {
        name: "id",
        type: "number",
        from: 0,
        to: 1
      },
      {
        name: "qtyRemaining",
        type: "number",
        from: 1,
        to: 2
      }
    ]
  },
  "2:4B": {
    desc: "Grant Cores",
    did: 0x02,
    cid: 0x4B,
    event: "grantCores",
    fields: [
      {
        name: "coresRemaining",
        type: "number",
      }
    ]
  },
  "2:4C": {
    desc: "Add XP",
    did: 0x02,
    cid: 0x4C,
    event: "addXp",
    fields: [
      {
        name: "toNextLevel",
        type: "number",
      }
    ]
  },
  "2:4D": {
    desc: "Level up Attr",
    did: 0x02,
    cid: 0x4D,
    event: "levelUpAttr",
    fields: [
      {
        name: "attrId",
        type: "number",
        from: 0,
        to: 1
      },
      {
        name: "attrLevel",
        type: "number",
        from: 1,
        to: 2
      },
      {
        name: "attrPtsRemaining",
        type: "number",
        from: 2,
        to: 4
      }
    ]
  },
  "2:4E": {
    desc: "GET PWD SEED",
    did: 0x02,
    cid: 0x4E,
    event: "passwordSeed",
    fields: [
      {
        name: "seed",
        type: "number"
      }
    ]
  },
  "2:55": {
    desc: "Abort Macro",
    did: 0x02,
    cid: 0x55,
    event: "abortMacro",
    fields: [
      {
        name: "id",
        type: "number",
        from: 0,
        to: 1
      },
      {
        name: "cmdNum",
        type: "number",
        from: 1,
        to: 3
      }
    ]
  },
  "2:56": {
    desc: "Get Macro Status",
    did: 0x02,
    cid: 0x55,
    event: "macroStatus",
    fields: [
      {
        name: "idCode",
        type: "number",
        from: 0,
        to: 1
      },
      {
        name: "cmdNum",
        type: "number",
        from: 1,
        to: 3
      }
    ]
  }
};

},{}],91:[function(require,module,exports){
"use strict";

var util = require("util"),
    EventEmitter = require("events").EventEmitter,
    Packet = require("./packet");

var core = require("./devices/core"),
    sphero = require("./devices/sphero"),
    custom = require("./devices/custom"),
    loader = require("./loader");

var SOP2 = {
  answer: 0xFD,
  resetTimeout: 0xFE,
  both: 0xFF,
  none: 0xFC,
  sync: 0xFF,
  async: 0xFE
};

function classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

/**
 * Creates a new sphero instance
 *
 * @constructor
 * @private
 * @param {String} address of the connected sphero
 * @param {Object} opts for sphero setup
 * @param {Object} [opts.adaptor=serial] sets the adaptor for the connection
 * @param {Number} [opts.sop2=0xFD] sop2 to be passed to commands
 * @param {Number} [opts.timeout=500] deadtime between commands, in ms
 * @example
 * var orb = new Sphero("/dev/rfcomm0", { timeout: 300 });
 * @returns {Sphero} a new instance of Sphero
 */
var Sphero = module.exports = function Sphero(address, opts) {
  // check that we were called with 'new'
  classCallCheck(this, Sphero);

  opts = opts || {};

  this.busy = false;
  this.ready = false;
  this.packet = new Packet();
  this.connection = opts.adaptor || loader.load(address);
  this.callbackQueue = [];
  this.commandQueue = [];
  this.sop2Bitfield = SOP2[opts.sop2] || SOP2.answer;
  this.seqCounter = 0x00;
  this.timeout = opts.timeout || 500;
  this.ds = {};

  // add commands to Sphero via mutator
  core(this);
  sphero(this);
  custom(this);
};

util.inherits(Sphero, EventEmitter);

/**
 * Establishes a connection to Sphero.
 *
 * Once connected, commands can be sent to Sphero.
 *
 * @param {Function} callback function to be triggered once connected
 * @example
 * orb.connect(function() {
 *   // Sphero is connected, tell it to do stuff!
 *   orb.color("magenta");
 * });
 * @return {void}
 */
Sphero.prototype.connect = function(callback) {
  var self = this,
      connection = this.connection,
      packet = this.packet;

  function emit(name) {
    return self.emit.bind(self, name);
  }

  packet.on("error", emit("error"));

  connection.on("open", emit("open"));

  connection.open(function() {
    self.ready = true;

    connection.onRead(function(payload) {
      self.emit("data", payload);

      var parsedPayload = packet.parse(payload),
          parsedData, cmd;

      if (parsedPayload && parsedPayload.sop1) {

        if (parsedPayload.sop2 === SOP2.sync) {
          // synchronous packet
          self.emit("response", parsedPayload);
          cmd = self._responseCmd(parsedPayload.seq);
          parsedData = packet.parseResponseData(cmd, parsedPayload);
          self._execCallback(parsedPayload.seq, parsedData);
        } else if (parsedPayload.sop2 === SOP2.async) {
          // async packet
          parsedData = packet.parseAsyncData(parsedPayload, self.ds);
          self.emit("async", parsedData);
        }

        if (parsedData && parsedData.event) {
          self.emit(parsedData.event, parsedData);
        }
      }
    });

    connection.on("close", emit("close"));
    connection.on("error", emit("error"));

    self.emit("ready");

    if (typeof callback === "function") {
      callback();
    }
  });
};

/**
 * Ends the connection to Sphero.
 *
 * After this is complete, no further commands can be sent to Sphero.
 *
 * @param {Function} callback function to be triggered once disconnected
 * @example
 * orb.disconnect(function() {
 *   console.log("Now disconnected from Sphero");
 * });
 * @return {void}
 */
Sphero.prototype.disconnect = function(callback) {
  this.connection.close(callback);
};

/**
 * Adds a command to the queue and calls for the next command in the queue
 * to try to execute.
 *
 * @private
 * @param {Number} vDevice the virtual device address
 * @param {Number} cmdName the command to execute
 * @param {Array} data to be passed to the command
 * @param {Function} callback function to be triggered once disconnected
 * @example
 * sphero.command(0x00, 0x02, [0x0f, 0x01, 0xff], callback);
 * @return {void}
 */
Sphero.prototype.command = function(vDevice, cmdName, data, callback) {
  var seq = this._incSeq(),
      opts = {
        sop2: this.sop2Bitfield,
        did: vDevice,
        cid: cmdName,
        seq: seq,
        data: data
      };

  var cmdPacket = this.packet.create(opts);

  this._queueCommand(cmdPacket, callback);
  this._execCommand();
};

/**
 * Adds a sphero command to the queue
 *
 * @private
 * @param {Array} cmdPacket the bytes array to be send through the wire
 * @param {Function} callback function to be triggered once disconnected
 * @example
 * this._queueCommand(cmdPacket, callback);
 * @return {void}
 */
Sphero.prototype._queueCommand = function(cmdPacket, callback) {
  if (this.commandQueue.length === 256) {
    this.commandQueue.shift();
  }

  this.commandQueue.push({ packet: cmdPacket, cb: callback });
};

/**
 * Tries to execute the next command in the queue if sphero not busy
 * and there's something in the queue.
 *
 * @private
 * @example
 * sphero._execCommand();
 * @return {void}
 */
Sphero.prototype._execCommand = function() {
  var cmd;
  if (!this.busy && (this.commandQueue.length > 0)) {
    // Get the seq number from the cmd packet/buffer
    // to store the callback response in that position
    cmd = this.commandQueue.shift();
    this.busy = true;
    this._queueCallback(cmd.packet, cmd.cb);
    this.connection.write(cmd.packet);
  }
};

/**
 * Adds a callback to the queue, to be executed when a response
 * gets back from the sphero.
 *
 * @private
 * @param {Array} cmdPacket the bytes array to be send through the wire
 * @param {Function} callback function to be triggered once disconnected
 * @example
 * sphero._execCommand();
 * @return {void}
 */
Sphero.prototype._queueCallback = function(cmdPacket, callback) {
  var seq = cmdPacket[4];

  var cb = function(err, packet) {
    clearTimeout(this.callbackQueue[seq].timeoutId);
    this.callbackQueue[seq] = null;
    this.busy = false;

    if (typeof callback === "function") {
      if (!err && !!packet) {
        callback(null, packet);
      } else {
        var error = new Error("Command sync response was lost.");
        callback(error, null);
      }
    }

    this._execCommand();
  };

  var timeoutId = setTimeout(cb.bind(this), this.timeout);

  this.callbackQueue[seq] = {
    callback: cb.bind(this),
    timeoutId: timeoutId,
    did: cmdPacket[2],
    cid: cmdPacket[3]
  };
};

/**
 * Executes a callback from the queue, usually when we get a response
 * back from the sphero or the deadtime for the commands sent expires.
 *
 * @private
 * @param {Number} seq from the sphero response packet
 * @param {Packet} packet parsed from the sphero response packet
 * @example
 * sphero._execCallback(0x14, packet);
 * @return {void}
 */
Sphero.prototype._execCallback = function(seq, packet) {
  var queue = this.callbackQueue[seq];

  if (queue) {
    queue.callback(null, packet);
  }
};

/**
 * Returns the response cmd (did, cid) passed to the sphero
 * based on the seq from the response (used for parsing responses).
 *
 * @private
 * @param {Number} seq from the sphero response packet
 * @example
 * sphero._responseCmd(0x14);
 * @return {Object|void} containing cmd ids { did: number, cid: number }
 */
Sphero.prototype._responseCmd = function(seq) {
  var queue = this.callbackQueue[seq];

  if (queue) {
    return { did: queue.did, cid: queue.cid };
  }

  return null;
};

/**
 * Auto-increments seq counter for command and callback queues.
 *
 * @private
 * @example
 * sphero._responseCmd(0x14);
 * @return {Number} the increased value of seqCounter
 */
Sphero.prototype._incSeq = function() {
  if (this.seqCounter > 255) {
    this.seqCounter = 0x00;
  }

  return this.seqCounter++;
};

},{"./devices/core":84,"./devices/custom":85,"./devices/sphero":86,"./loader":87,"./packet":88,"events":7,"util":31}],92:[function(require,module,exports){
(function (Buffer){
"use strict";

var exports = module.exports;

/**
 * Converts Red, Green, and Blue vlaues to an equivalent hex number
 *
 * @param {Number} red (0-255)
 * @param {Number} green (0-255)
 * @param {Number} blue (0-255)
 * @return {Number} computed number
 */
exports.rgbToHex = function rgbToHex(red, green, blue) {
  return blue | (green << 8) | (red << 16);
};

/**
 * Generates a random rgb color
 *
 * @return {Object} random color R/G/B values
 */
exports.randomColor = function randomColor() {
  function rand() { return Math.floor(Math.random() * 255); }
  return { red: rand(), green: rand(), blue: rand() };
};

/**
 * Calculates an Array-like object's checksum through mod-256ing it's contents
 * then ones-complimenting the result.
 *
 * @param {Array|Buffer} data value to checksum
 * @return {Number} checksum value
 */
exports.checksum = function checksum(data) {
  var isBuffer = Buffer.isBuffer(data),
      value = 0x00;

  for (var i = 0; i < data.length; i++) {
    value += isBuffer ? data.readUInt8(i) : data[i];
  }

  return (value % 256) ^ 0xFF;
};

/**
 * Converts a number to an array of hex values within the provided byte frame.
 *
 * @param {Number} value - number to convert
 * @param {Number} numBytes - byte frame size
 * @return {Array} hex numbers - generated
 */
exports.intToHexArray = function intToHexArray(value, numBytes) {
  var hexArray = new Array(numBytes);

  for (var i = numBytes - 1; i >= 0; i--) {
    hexArray[i] = value & 0xFF;
    value >>= 8;
  }

  return hexArray;
};

/**
 * Converts arguments to array.
 *
 * @return {Array} hex numbers generated
 */
exports.argsToHexArray = function argsToHexArray() {
  var args = [];

  for (var i = 0; i < arguments.length; i++) {
    args.push(arguments[i] & 0xFF);
  }

  return args;
};

/**
 * Converts Buffer to integer.
 *
 * @param {Buffer} buffer - Buffer to be converted to integer
 * @return {Array} hex numbers generated
 */
exports.bufferToInt = function bufferToInt(buffer) {
  var value = buffer[0];

  for (var i = 1; i < buffer.length; i++) {
    value <<= 8;
    value |= buffer[i];
  }

  return value;
};

/**
 * Converts Signed Two's Complement Bytes to integer.
 *
 * @param {Integer} value - two byte int value
 * @param {Integer} numBytes - Number of bytes to apply Two's complement
 * @return {Integer} negative value
 */
exports.twosToInt = function twosToInt(value, numBytes) {
  var mask = 0x00;
  numBytes = numBytes || 2;

  for (var i = 0; i < numBytes; i++) {
    mask = (mask << 8) | 0xFF;
  }

  return ~(value ^ mask);
};

/**
 * Applies bit Xor to 32 bit value.
 *
 * @param {Number} value - The 32bit hex value
 * @param {Number} mask - byte mask to apply to each element in the array
 * @return {Array} with xor applied to each element
 */
exports.xor32bit = function xor32bit(value, mask) {
  var bytes = exports.intToHexArray(value, 4);
  mask = mask || 0xFF;

  for (var i = 0; i < bytes.length; i++) {
    bytes[i] ^= mask;
  }

  return exports.bufferToInt(bytes);
};

}).call(this,{"isBuffer":require("../../../../browserify/node_modules/is-buffer/index.js")})
},{"../../../../browserify/node_modules/is-buffer/index.js":10}],93:[function(require,module,exports){
arguments[4][40][0].apply(exports,arguments)
},{"./lib/adaptor":94,"./lib/api":95,"./lib/config":97,"./lib/driver":98,"./lib/io/digital-pin":100,"./lib/io/utils":101,"./lib/logger":102,"./lib/mcp":103,"./lib/robot":105,"./lib/utils":110,"_process":14,"dup":40,"readline":1}],94:[function(require,module,exports){
arguments[4][41][0].apply(exports,arguments)
},{"./basestar":96,"./utils":110,"./utils/helpers":111,"dup":41}],95:[function(require,module,exports){
arguments[4][42][0].apply(exports,arguments)
},{"./logger":102,"./mcp":103,"./utils/helpers":111,"dup":42}],96:[function(require,module,exports){
arguments[4][43][0].apply(exports,arguments)
},{"./utils":110,"./utils/helpers":111,"dup":43,"events":7}],97:[function(require,module,exports){
arguments[4][44][0].apply(exports,arguments)
},{"./utils/helpers":111,"dup":44}],98:[function(require,module,exports){
arguments[4][45][0].apply(exports,arguments)
},{"./basestar":96,"./utils":110,"./utils/helpers":111,"dup":45}],99:[function(require,module,exports){
arguments[4][46][0].apply(exports,arguments)
},{"./config":97,"./registry":104,"./utils/helpers":111,"_process":14,"dup":46}],100:[function(require,module,exports){
arguments[4][47][0].apply(exports,arguments)
},{"../utils":110,"dup":47,"events":7,"fs":1}],101:[function(require,module,exports){
arguments[4][48][0].apply(exports,arguments)
},{"dup":48}],102:[function(require,module,exports){
arguments[4][49][0].apply(exports,arguments)
},{"./config":97,"./utils/helpers":111,"_process":14,"dup":49}],103:[function(require,module,exports){
arguments[4][50][0].apply(exports,arguments)
},{"./config":97,"./logger":102,"./robot":105,"./utils":110,"./utils/helpers":111,"dup":50,"events":7}],104:[function(require,module,exports){
(function (process){
"use strict";

var Logger = require("./logger"),
    _ = require("./utils/helpers"),
    path = require("path");

// Explicitly these modules here, so Browserify can grab them later
require("./test/loopback");
require("./test/test-adaptor");
require("./test/test-driver");
require("./test/ping");
require("cylon-sphero")

var missingModuleError = function(module) {
  var str = "Cannot find the '" + module + "' module.\n";
  str += "This problem might be fixed by installing it with ";
  str += "'npm install " + module + "' and trying again.";

  console.log(str);

  process.emit("SIGINT");
};

var Registry = module.exports = {
  data: {},

  register: function(module) {
    if (this.data[module]) {
      return this.data[module].module;
    }

    var pkg;

    try {
      if (this.isModuleInDevelopment(module)) {
        pkg = require(path.resolve(".") + "/index");
      } else {
        pkg = require(module);
      }
    } catch (e) {
      if (e.code === "MODULE_NOT_FOUND") {
        missingModuleError(module);
      }

      throw e;
    }

    this.data[module] = {
      module: pkg,
      adaptors: pkg.adaptors || [],
      drivers: pkg.drivers || [],
      dependencies: pkg.dependencies || []
    };

    this.logRegistration(module, this.data[module]);

    this.data[module].dependencies.forEach(function(dep) {
      Registry.register(dep);
    });

    return this.data[module].module;
  },

  findBy: function(prop, name) {
    // pluralize, if necessary
    if (prop.slice(-1) !== "s") {
      prop += "s";
    }

    return this.search(prop, name);
  },

  findByModule: function(module) {
    if (!this.data[module]) {
      return null;
    }

    return this.data[module].module;
  },

  logRegistration: function(name) {
    var module = this.data[name];

    Logger.debug("Registering module " + name);

    ["adaptors", "drivers", "dependencies"].forEach(function(field) {
      if (module[field].length) {
        Logger.debug("  " + field + ":");
        module[field].forEach(function(item) {
          Logger.debug("    - " + item);
        });
      }
    });
  },

  search: function(entry, value) {
    for (var name in this.data) {
      if (this.data.hasOwnProperty(name)) {
        var repo = this.data[name];

        if (repo[entry] && _.includes(repo[entry], value)) {
          return repo.module;
        }
      }
    }

    return false;
  },

  isModuleInDevelopment: function(module) {
    return (path.basename(path.resolve(".")) === module);
  }
};

// Default drivers/adaptors:
["loopback", "ping", "test-adaptor", "test-driver"].forEach(function(module) {
  Registry.register("./test/" + module);
});

}).call(this,require('_process'))
},{"./logger":102,"./test/loopback":106,"./test/ping":107,"./test/test-adaptor":108,"./test/test-driver":109,"./utils/helpers":111,"_process":14,"cylon-sphero":32,"path":12}],105:[function(require,module,exports){
(function (process){
"use strict";

var initializer = require("./initializer"),
    Logger = require("./logger"),
    Utils = require("./utils"),
    Config = require("./config"),
    _ = require("./utils/helpers");

var validator = require("./validator");

var EventEmitter = require("events").EventEmitter;

// used when creating default robot names
var ROBOT_ID = 1;

/**
 * Creates a new Robot instance based on provided options
 *
 * @constructor
 * @param {Object} opts object with Robot options
 * @param {String} [name] the name the robot should have
 * @param {Object} [connections] object containing connection info for the Robot
 * @param {Object} [devices] object containing device information for the Robot
 * @param {Function} [work] a function the Robot will run when started
 * @returns {Robot} new Robot instance
 */
var Robot = module.exports = function Robot(opts) {
  Utils.classCallCheck(this, Robot);

  opts = opts || {};

  validator.validate(opts);

  // auto-bind prototype methods
  for (var prop in Object.getPrototypeOf(this)) {
    if (this[prop] && prop !== "constructor") {
      this[prop] = this[prop].bind(this);
    }
  }

  this.initRobot(opts);

  _.each(opts, function(opt, name) {
    if (this[name] !== undefined) {
      return;
    }

    if (_.isFunction(opt)) {
      this[name] = opt.bind(this);

      if (opts.commands == null) {
        this.commands[name] = opt.bind(this);
      }
    } else {
      this[name] = opt;
    }
  }, this);

  if (opts.commands) {
    var cmds;

    if (_.isFunction(opts.commands)) {
      cmds = opts.commands.call(this);
    } else {
      cmds = opts.commands;
    }

    if (_.isObject(cmds)) {
      this.commands = cmds;
    } else {
      var err = "#commands must be an object ";
      err += "or a function that returns an object";
      throw new Error(err);
    }
  }

  var mode = Utils.fetch(Config, "mode", "manual");

  if (mode === "auto") {
    // run on the next tick, to allow for "work" event handlers to be set up
    setTimeout(this.start, 0);
  }
};

Utils.subclass(Robot, EventEmitter);

/**
 * Condenses information on a Robot to a JSON-serializable format
 *
 * @return {Object} serializable information on the Robot
 */
Robot.prototype.toJSON = function() {
  return {
    name: this.name,
    connections: _.invoke(this.connections, "toJSON"),
    devices: _.invoke(this.devices, "toJSON"),
    commands: Object.keys(this.commands),
    events: _.isArray(this.events) ? this.events : []
  };
};

/**
 * Adds a new Connection to the Robot with the provided name and details.
 *
 * @param {String} name string name for the Connection to use
 * @param {Object} conn options for the Connection initializer
 * @return {Object} the robot
 */
Robot.prototype.connection = function(name, conn) {
  conn.robot = this;
  conn.name = name;

  if (this.connections[conn.name]) {
    var original = conn.name,
        str;

    conn.name = Utils.makeUnique(original, Object.keys(this.connections));

    str = "Connection names must be unique.";
    str += "Renaming '" + original + "' to '" + conn.name + "'";
    this.log(str);
  }
  if ("adapter" in conn) {
    conn.adaptor = conn.adapter;
  }
  this.connections[conn.name] = initializer("adaptor", conn);

  return this;
};

/**
 * Initializes all values for a new Robot.
 *
 * @param {Object} opts object passed to Robot constructor
 * @return {void}
 */
Robot.prototype.initRobot = function(opts) {
  this.name = opts.name || "Robot " + ROBOT_ID++;
  this.running = false;

  this.connections = {};
  this.devices = {};

  this.work = opts.work || opts.play;

  this.commands = {};

  if (!this.work) {
    this.work = function() { this.log("No work yet."); };
  }

  _.each(opts.connections, function(conn, key) {
    var name = _.isString(key) ? key : conn.name;

    if (conn.devices) {
      opts.devices = opts.devices || {};

      _.each(conn.devices, function(device, d) {
        device.connection = name;
        opts.devices[d] = device;
      });

      delete conn.devices;
    }

    this.connection(name, _.extend({}, conn));
  }, this);

  _.each(opts.devices, function(device, key) {
    var name = _.isString(key) ? key : device.name;
    this.device(name, _.extend({}, device));
  }, this);
};

/**
 * Adds a new Device to the Robot with the provided name and details.
 *
 * @param {String} name string name for the Device to use
 * @param {Object} device options for the Device initializer
 * @return {Object} the robot
 */
Robot.prototype.device = function(name, device) {
  var str;

  device.robot = this;
  device.name = name;

  if (this.devices[device.name]) {
    var original = device.name;
    device.name = Utils.makeUnique(original, Object.keys(this.devices));

    str = "Device names must be unique.";
    str += "Renaming '" + original + "' to '" + device.name + "'";
    this.log(str);
  }

  if (_.isString(device.connection)) {
    if (this.connections[device.connection] == null) {
      str = "No connection found with the name " + device.connection + ".\n";
      this.log(str);
      process.emit("SIGINT");
    }

    device.connection = this.connections[device.connection];
  } else {
    for (var c in this.connections) {
      device.connection = this.connections[c];
      break;
    }
  }

  this.devices[device.name] = initializer("driver", device);

  return this;
};

/**
 * Starts the Robot's connections, then devices, then work.
 *
 * @param {Function} callback function to be triggered when the Robot has
 * started working
 * @return {Object} the Robot
 */
Robot.prototype.start = function(callback) {
  if (this.running) {
    return this;
  }

  var mode = Utils.fetch(Config, "workMode", "async");

  var start = function() {
    if (mode === "async") {
      this.startWork();
    }
  }.bind(this);

  _.series([
    this.startConnections,
    this.startDevices,
    start
  ], function(err, results) {
    if (err) {
      this.log("An error occured while trying to start the robot:");
      this.log(err);

      this.halt(function() {
        if (_.isFunction(this.error)) {
          this.error.call(this, err);
        }

        if (this.listeners("error").length) {
          this.emit("error", err);
        }
      }.bind(this));
    }

    if (_.isFunction(callback)) {
      callback(err, results);
    }
  }.bind(this));

  return this;
};

/**
 * Starts the Robot's work function
 *
 * @return {void}
 */
Robot.prototype.startWork = function() {
  this.log("Working.");

  this.emit("ready", this);
  this.work.call(this, this);
  this.running = true;
};

/**
 * Starts the Robot's connections
 *
 * @param {Function} callback function to be triggered after the connections are
 * started
 * @return {void}
 */
Robot.prototype.startConnections = function(callback) {
  this.log("Starting connections.");

  var starters = _.map(this.connections, function(conn) {
    return function(cb) {
      return this.startConnection(conn, cb);
    }.bind(this);
  }, this);

  return _.parallel(starters, callback);
};

/**
 * Starts a single connection on Robot
 *
 * @param {Object} connection to start
 * @param {Function} callback function to be triggered after the connection is
 * started
 * @return {void}
 */
Robot.prototype.startConnection = function(connection, callback) {
  if (connection.connected === true) {
    return callback.call(connection);
  }

  var str = "Starting connection '" + connection.name + "'";

  if (connection.host) {
    str += " on host " + connection.host;
  } else if (connection.port) {
    str += " on port " + connection.port;
  }

  this.log(str + ".");
  this[connection.name] = connection;
  connection.connect.call(connection, callback);
  connection.connected = true;
  return true;
};

/**
 * Starts the Robot's devices
 *
 * @param {Function} callback function to be triggered after the devices are
 * started
 * @return {void}
 */
Robot.prototype.startDevices = function(callback) {
  var log = this.log;

  log("Starting devices.");

  var starters = _.map(this.devices, function(device) {
    return function(cb) {
      return this.startDevice(device, cb);
    }.bind(this);
  }, this);

  return _.parallel(starters, callback);
};

/**
 * Starts a single device on Robot
 *
 * @param {Object} device to start
 * @param {Function} callback function to be triggered after the device is
 * started
 * @return {void}
 */
Robot.prototype.startDevice = function(device, callback) {
  if (device.started === true) {
    return callback.call(device);
  }

  var log = this.log;
  var str = "Starting device '" + device.name + "'";

  if (device.pin) {
    str += " on pin " + device.pin;
  }

  log(str + ".");
  this[device.name] = device;
  device.start.call(device, callback);
  device.started = true;

  return device.started;
};

/**
 * Halts the Robot, attempting to gracefully stop devices and connections.
 *
 * @param {Function} callback to be triggered when the Robot has stopped
 * @return {void}
 */
Robot.prototype.halt = function(callback) {
  callback = callback || function() {};

  if (!this.running) {
    return callback();
  }

  // ensures callback(err) won't prevent others from halting
  function wrap(fn) {
    return function(cb) { fn.call(null, cb.bind(null, null)); };
  }

  var devices = _.pluck(this.devices, "halt").map(wrap),
      connections = _.pluck(this.connections, "disconnect").map(wrap);

  try {
    _.parallel(devices, function() {
      _.parallel(connections, callback);
    });
  } catch (e) {
    var msg = "An error occured while attempting to safely halt the robot";
    this.log(msg);
    this.log(e.message);
  }

  this.running = false;
};

/**
 * Generates a String representation of a Robot
 *
 * @return {String} representation of a Robot
 */
Robot.prototype.toString = function() {
  return "[Robot name='" + this.name + "']";
};

Robot.prototype.log = function(str) {
  Logger.log("[" + this.name + "] - " + str);
};

}).call(this,require('_process'))
},{"./config":97,"./initializer":99,"./logger":102,"./utils":110,"./utils/helpers":111,"./validator":113,"_process":14,"events":7}],106:[function(require,module,exports){
arguments[4][53][0].apply(exports,arguments)
},{"../adaptor":94,"../utils":110,"dup":53}],107:[function(require,module,exports){
arguments[4][54][0].apply(exports,arguments)
},{"../driver":98,"../utils":110,"dup":54}],108:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"../adaptor":94,"../utils":110,"dup":55}],109:[function(require,module,exports){
arguments[4][56][0].apply(exports,arguments)
},{"../driver":98,"../utils":110,"dup":56}],110:[function(require,module,exports){
arguments[4][57][0].apply(exports,arguments)
},{"./utils/helpers":111,"./utils/monkey-patches":112,"dup":57}],111:[function(require,module,exports){
arguments[4][58][0].apply(exports,arguments)
},{"dup":58}],112:[function(require,module,exports){
arguments[4][59][0].apply(exports,arguments)
},{"dup":59}],113:[function(require,module,exports){
arguments[4][60][0].apply(exports,arguments)
},{"./logger":102,"./utils/helpers":111,"dup":60}],114:[function(require,module,exports){
(function(ext) {
    var device = null;
    var connected = false;
    var Cylon = require('cylon');

    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {};

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        if(!connected) return {status: 1, msg: 'Device not connected'};
        return {status: 2, msg: 'Device connected'};
    }

    var potentialDevices = [];
    ext._deviceConnected = function(dev) {
        if (dev.id == "COM8" && !connected) {
            device = Cylon.robot({
                        connections: {
                            bluetooth: { adaptor: 'sphero', port: 'COM8' }
                        },

                        devices: {
                            sphero: { driver: 'sphero' }
                        },

                        work: function(my) {
                            connected = true;
                            console.log("Sphero connected");
                        }
                     });
        };
    };

    ext.my_first_block = function() {
        console.log("test");
    };

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            [' ', 'my first block', 'my_first_block']
        ],
        url: 'https://toonr.github.io/Sphero-Blocks/sphero_blocks.js'
    };

    var serial_info = {type: 'serial'};
    // Register the extension
    ScratchExtensions.register('Sample extension', descriptor, ext, serial_info);
})({});
},{"cylon":93}]},{},[114]);
