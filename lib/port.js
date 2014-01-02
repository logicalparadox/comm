/*!
 * Module dependencies
 */

// external utilites
var debug = require('sherlock')('comm:port');
var Future = require('oath');

/**
 * Ports handle the retrieval of messages via the
 * provided read function. The `read` function is
 * invoked on construction providing an `emit` function
 * as the single argument.
 *
 * @param {Function} read invoked on construction
 * @api public
 */

var Port = exports.Port = function Port(read) {
  this._portState = { read: read, open: true };
};

/*!
 * Prototype
 */

Port.prototype = {

  /**
   * Return boolean indicating if port will
   * return more data via `.recv()`.
   *
   * @return {Boolean} is port closed
   * @api public
   */

  get closed() {
    return !this._portState.open;
  },

  /**
   * Using either the returned future or a
   * provided callback wait for Port's `read`
   * handle to emit a value. A value of `null`
   * indicates that no more messages will be sent.
   *
   * @param {Function} cb to invoke on recieve
   * @return {Oath} thunk to invoke on recieve
   * @api public
   */

  recv: function(cb) {
    var done = Future(cb);
    var state = this._portState;

    if (!state.open) {
      debug('(recv) err: port closed');
      done(new Error('port closed'));
      return done.thunk();
    }

    debug('(recv) yield read');
    state.read.call(this, function(err, msg) {
      if (err) return done(err);

      if (null == msg) {
        debug('(recv) end');
        state.open = false;
      } else {
        debug('(recv) message');
      }

      done(null, msg);
    });

    return done.thunk();
  }

}
