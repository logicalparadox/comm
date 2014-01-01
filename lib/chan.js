/*!
 * Module dependencies
 */

// external utilites
var debug = require('sherlock')('comm:chan');
var Future = require('oath');

// internal constructors
var Arr = require('../arr').Arr;
var Port = require('../port').Port;

/**
 * Channels handle the sending of messages via the
 * provided deliver function.
 *
 * @param {Function} deliver invoked for each message sent
 * @api public
 */

var Chan = exports.Chan = function Chan(deliver) {
  if (!(this instanceof Chan)) return Chan.create();
  this._chanState = { deliver: deliver, open: true };
};

/**
 * Create a `[ port, chan ]` for message passing.
 *
 * @return {Array} refs
 * @api public
 */

Chan.create = function() {
  var arr = new Arr();

  function read(cb) {
    debug('(pair) yield read');
    arr.next(function(err, msg) {
      if (err) return cb(err);
      debug('(pair) read complete');
      cb(null, msg);
    });
  }

  function deliver(msg, cb) {
    debug('(pair) yield deliver');
    arr.push(msg, function(err) {
      if (err) return cb(err);
      debug('(pair) deliver complete');
      cb();
    });
  }

  return [ new Port(read), new Chan(deliver) ];
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

  send: function(msg) {
    var done = Future();
    var state = this._chanState;

    if (!state.open) {
      debug('(send) err: chan closed');
      done(new Error('chan closed'));
      return done.thunk();
    }

    if (null == msg) {
      debug('(send) end');
      state.open = false;
    }

    debug('(send) deliver wait');
    state.deliver(msg, function(err) {
      if (err) return done(err);
      debug('(send) deliver done');
      done(null, true);
    });

    return done.thunk();
  }

}
