/*!
 * Module dependencies
 */

// external utilites
var debug = require('sherlock')('comm:spsc:stream-producer');
var inherits = require('super');

// internal constructors
var Consumer = require('./consumer').Consumer;
var Producer = require('./producer').Producer;

/**
 * A StreamProducer wraps around any writable
 * node.js stream. Best when stream has `objectMode`
 * set to `true.
 *
 * @param {Stream} write capable stream to wrap
 * @api public
 */

var StreamProducer = exports.StreamProducer = function StreamProducer(stream) {
  if (!(this instanceof StreamProducer)) return new StreamProducer(stream);
  Producer.call(this);
  wrap(this, stream);
};

/*!
 * Inherits `Producer`
 */

inherits(StreamProducer, Producer);

/*!
 * Init hook that continually checks for message
 * in the internal async queue and writes message
 * to the underlying stream.
 *
 * @param {Stream} write capable stream
 * @api private
 */

function wrap(self, stream) {
  var state = self._producerState;
  var queue = state.queue;

  function write(err, obj) {
    var done = obj[1];
    var msg = obj[0][1];

    if (null == msg) {
      debug('(stream) yield end');
      return stream.end(function(err) {
        if (err) return done(err);
        debug('(stream) end successful');
        done();
      });
    }

    debug('(stream) yield write');
    stream.write(msg, function(err) {
      if (err) return done(err);
      debug('(stream) write successful');
      done();
      queue.shift(write);
    });
  }

  state.stream = stream;
  queue.shift(write);
}
