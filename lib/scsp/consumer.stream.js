/*!
 * Module dependencies
 */

// external utilites
var assert = require('assert');
var debug = require('sherlock')('comm:spsc:stream-consumer');
var inherits = require('super');

// internal constructors
var Consumer = require('./consumer').Consumer;
var Producer = require('./producer').Producer;

/**
 * A StreamConsumer wraps around any readable node.js stream. Best when stream
 * has `objectMode` set to `true.
 *
 * @param {Stream} read capable stream to wrap
 * @api public
 */

var StreamConsumer = exports.StreamConsumer = function StreamConsumer(stream) {
  if (!(this instanceof StreamConsumer)) return new StreamConsumer(stream);
  Consumer.call(this);
  wrap(this, stream);
};

/*!
 * Inherits `Consumer`
 */

inherits(StreamConsumer, Consumer);

/**
 * Init hook that sets listeners on the stream for data retrieval, error
 * handling, and stream termination. Pushes data to an internal async queue.
 *
 * @param {Stream} read capable stream
 * @api private
 */

function wrap(self, stream) {
  var state = self._consumerState;
  var queue = state.queue;

  assert('_readableState' in stream, 'stream consumer needs readable stream');

  function read() {
    var data = this.read();
    if (!data) return;
    debug('(stream) read');
    queue.push([[ null, data ]]);
  }

  function end() {
    debug('(stream) end');
    stream.removeListener('error', error);
    stream.removeListener('readable', read);
    queue.push([[ null, null ]]);
  }

  function error() {
    debug('(stream) err: %s', err.message);
    stream.removeListener('end', end);
    stream.removeListener('readable', read);
    queue.push([[ err ]]);
  }

  stream.on('readable', read);
  stream.once('end', end);
  stream.once('error', error);

  state.stream = stream;
  return stream;
}
