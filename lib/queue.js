/*!
 * Module dependencies
 */

// external utilites
var debug = require('sherlock')('comm:arr');
var Future = require('oath');

/**
 * Async double-ended queue implementation that is
 * `co` compatible.
 *
 * @api public
 */

var Queue = exports.Queue = function Queue() {
  this._queueState = { queue: [], waiting: [], drain: [] };
}

/*!
 * Prototype
 */

Queue.prototype = {

  /**
   * Get count of items waiting to be retrieved.
   *
   * @return {Number} length of queue
   * @api public
   */

  get length() {
    return this._queueState.queue.length;
  },

  /**
   * Get count of futures waiting to be resolved.
   *
   * @return {Number} length of waiting futures
   * @api public
   */

  get waiting() {
    return this._queueState.waiting.length;
  },

  /**
   * Async `Arroy#pop()` that will resolve with either
   * last item in queue or wait for item.
   *
   * @param {Function} callback
   * @returns {Oath} future
   * @api public
   */

  pop: getter('pop'),

  /**
   * Async `Arroy#push()` that will add item to
   * end of queue. Will resolve when item has been
   * retrieved.
   *
   * @param {Mixed} object
   * @param {Function} callback
   * @returns {Oath} future
   * @api public
   */

  push: setter('push'),

  /**
   * Async `Arroy#shift()` that will resolve with either
   * first item in queue or wait for item.
   *
   * @param {Function} callback
   * @returns {Oath} future
   * @api public
   */

  shift: getter('shift'),

  /**
   * Async `Arroy#unshift()` that will add item to
   * begining of queue. Will resolve when item has been
   * retrieved.
   *
   * @param {Mixed} object
   * @param {Function} callback
   * @returns {Oath} future
   * @api public
   */

  unshift: setter('unshift'),

  /**
   * Async function that will be resolved on
   * the NEXT occurance of the queue being empty
   * (will wait if queue is currently empty).
   *
   * @param {Function} callback
   * @returns {Oath} future
   * @api public
   */

  drain: function(cb) {
    var future = Future(cb);
    var state = this._queueState;
    debug('(drain) waiting');
    state.drain.push(future);
    return future.thunk();
  }

}

/*!
 * Wrapper for async getter methods.
 *
 * @param {String} method to use on queue
 * @return {Function} getter(cb)
 * @api private
 */

function getter(method) {
  return function(cb) {
    var future = Future(cb);
    var state = this._queueState;

    if (state.queue.length) {
      var res = state.queue[method]();
      setImmediate(function() {
        debug('(%s) resolved', method);
        future(null, res[0]);
        res[1]();

        if (state.queue.length) return;

        while (state.drain.length) {
          debug('(drain) resolve');
          state.drain.shift()(null, true);
        }
      });
    } else {
      debug('(%s) waiting', method);
      state.waiting.push(future);
    }

    return future.thunk();
  }
}

/*!
 * Wrapper for async setter methods.
 *
 * @param {String} method to use on queue
 * @return {Function} setter(obj, cb)
 * @api private
 */

function setter(method) {
  return function(obj, cb) {
    var future = Future(cb);
    var state = this._queueState;

    if (state.waiting.length) {
      var cb = state.waiting.shift();
      setImmediate(function() {
        debug('(%s) resolved', method);
        cb(null, obj);
        future();
      });
    } else {
      debug('(%s) waiting', method);
      state.queue[method]([ obj, future ]);
    }

    return future.thunk();
  }
}
