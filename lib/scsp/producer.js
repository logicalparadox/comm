/*!
 * Module dependencies
 */

// external utilites
var debug = require('sherlock')('comm:spsc:producer');
var future = require('oath');
var inherits = require('super');

// internal constructors
var Queue = require('../queue').Queue;

/**
 * A `Producer` is the handle that writes messages to the
 * underlying data source. Designed to be extended.
 *
 * @param {Mixed} options
 * @api public
 */

var Producer = exports.Producer = function Producer(opts) {
  if (!(this instanceof Producer)) return new Producer(opts);
  this._producerState = { err: null, open: true };
  this.init(opts);
}

/**
 * Extend the Producer constructor, creating a new constructor.
 */

Producer.extend = inherits.extend;

/*!
 * Prototype
 */

Producer.prototype = {

  /*!
   * Constructor reference
   */

  constructor: Producer,

  get closed() {
    return !this._producerState.open;
  },

  /**
   * Invoke the intialize sequence.
   */

  init: function(opts) {
    this._init(opts);
  },

  /**
   * Write a message to the internal handle.
   *
   * @param {Mixed} message
   * @param {Function} cb(err)
   * @return {Oath} future
   * @api public
   */

  write: function(msg, cb) {
    var done = future(cb);
    var state = this._producerState;

    function error(err) {
      debug('(write) _write err: %s', err.message);
      state.err = err;
      done(err);
    }

    if (state.err) {
      err = new Error('producer in error state');
      err.error = state.err;
      setImmediate(function() { error(err); });
      return done.thunk();
    }

    if (null == msg) {
      debug('(write) closed');
      state.open = false;
    }

    debug('(write) yield _write');
    this._write(msg, function(err) {
      if (err) return error(err);
      debug('(write) _write successful');
      done();
    });

    return done.thunk();
  },

  /*!
   * Default `_init` allows for a local
   * producer via an asynchronous queue.
   *
   * @param {Queue} queue
   * @api private
   */

  _init: function(queue) {
    var state = this._producerState;
    state.queue = queue || new Queue();
  },

  /*!
   * Default `_write` pushes data to
   * the local asynchronous queue.
   *
   * @param {Function} cb(err, msg)
   * @api private
   */

  _write: function(obj, cb) {
    var state = this._producerState;
    state.queue.push(obj, cb);
  }

}
