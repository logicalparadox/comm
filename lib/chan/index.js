/*!
 * Module dependencies
 */

// external utilites
var debug = require('sherlock')('comm:chan');
var EventEmitter = require('drip').EventEmitter;
var Future = require('oath');

// internal constructors
var ChanState = require('./state').ChanState;
var Port = require('../port').Port;

/**
 * Channels handle the sending of messages via the
 * provided deliver function.
 *
 * @param {Function} deliver invoked for each message sent
 * @api public
 */

var Chan = exports.Chan = function Chan(deliv) {
  if (!(this instanceof Chan)) return Chan.create();
  this._chanState = new ChanState(deliv);
};

/**
 * Create a `[ port, chan ]` for message passing.
 *
 * @return {Array} refs
 * @api public
 */

Chan.create = function() {
  var bindings = new EventEmitter;

  var port = new Port(function read(emit) {
    bindings.on('message', function(msg) {
      debug('(pair) read');
      emit(null, msg);
    });
  });

  var chan = new Chan(function deliver(msg, cb) {
    debug('(pair) deliver');
    bindings.emit('message', msg);
    cb();
  });

  return [ port, chan ];
};

/*!
 * Prototype
 */

Chan.prototype = {

  /**
   * Queue a message for delivery. Callback
   * invoked or Future resolved on flush.
   * Sending `null` will end the channel.
   *
   * @param {Mixed} msg to queue
   * @param {Function} cb to invoke on flush
   * @return {Oath} thunk to invoke on flush
   * @api public
   */

  send: function(msg, cb) {
    var future = Future(cb);

    debug('(send) waiting');
    future.thunk(function() {
      debug('(send) fulfilled');
    });

    this._chanState.push(msg, future);
    return future.thunk();
  }

}
