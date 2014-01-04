/*!
 * Module dependencies
 */

// external utilites
var debug = require('sherlock')('comm:spsc:stream-consumer');

// internal constructors
var Consumer = require('./consumer').Consumer;
var Queue = require('../queue').Queue;

/**
 * A StreamConsumer wraps around any readable
 * node.js stream. Best when stream has `objectMode`
 * set to `true.
 *
 * @param {Stream} read capable stream to wrap
 * @api public
 */

exports.StreamConsumer = Consumer.extend({

  /*!
   * Init hook that sets listeners on the stream
   * for data retrieval, error handling, and stream
   * termination. Pushes data to an internal async queue.
   *
   * @param {Stream} read capable stream
   * @api private
   */

  _init: function(stream) {
    var state = this._consumerState;
    var queue = state.queue = new Queue();
    state.stream = stream;

    function read() {
      var data = this.read();
      if (!data) return;
      debug('(stream) read');
      queue.push([ null, data ]);
    }

    function end() {
      debug('(stream) end');
      stream.removeListener('error', error);
      stream.removeListener('readable', read);
      queue.push([ null, null ]);
    }

    function error() {
      debug('(stream) err: %s', err.message);
      stream.removeListener('end', end);
      stream.removeListener('readable', read);
      queue.push([ err ]);
    }

    stream.on('readable', read);
    stream.once('end', end);
    stream.once('error', error);
  },

  /*!
   * Read hook that shifts message from the internal
   * queue and passes message back to public api.
   *
   * @param {Function} cb(err, msg)
   * @api private
   */

  _read: function(cb) {
    var state = this._consumerState;
    state.queue.shift(function(err, obj) {
      err = err || obj[0];
      if (err) return cb(err);
      cb(null, obj[1]);
    });
  }

});
