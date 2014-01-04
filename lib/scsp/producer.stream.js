/*!
 * Module dependencies
 */

// external utilites
var debug = require('sherlock')('comm:spsc:stream-producer');

// internal constructors
var Producer = require('./producer').Producer;
var Queue = require('../queue').Queue;

/**
 * A StreamProducer wraps around any writable
 * node.js stream. Best when stream has `objectMode`
 * set to `true.
 *
 * @param {Stream} write capable stream to wrap
 * @api public
 */

exports.StreamProducer = Producer.extend({

  /*!
   * Init hook that continually checks for message
   * in the internal async queue and writes message
   * to the underlying stream.
   *
   * @param {Stream} write capable stream
   * @api private
   */

  _init: function(stream) {
    var state = this._producerState;
    var queue = state.queue = new Queue();
    state.stream = stream;

    function write(err, obj) {
      var done = obj[1];
      var msg = obj[0];

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

    queue.shift(write);
  },

  /*!
   * Write hook that pushes message to the internal
   * queue.
   *
   * @param {Mixed} message
   * @param {Function} cb(err)
   * @api private
   */

  _write: function(obj, cb) {
    var state = this._producerState;
    state.queue.push([ obj, cb ]);
  }

});
