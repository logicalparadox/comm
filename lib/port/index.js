/*!
 * Module dependencies
 */

// external utilites
var debug = require('sherlock')('comm:port');
var Future = require('oath');

// internal constructors
var PortState = require('./state').PortState;

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
  this._portState = new PortState(read);
};

/*!
 * Prototype
 */

Port.prototype = {

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
    var future = Future(cb);

    debug('(recv) waiting');
    future.thunk(function() {
      debug('(recv) fulfilled');
    });

    this._portState.recv(future);
    return future.thunk();
  },

  /**
   * Check for the existence of any messages
   * waiting to be `.recv()`. This includes
   * the `null` end terminator.
   *
   * @return {Boolean} message waiting
   */

  peek: function() {
    return this._portState.messages.length ? true : false;
  }

}
