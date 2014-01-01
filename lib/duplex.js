/*!
 * Module dependencies
 */

// external utilites
var debug = require('sherlock')('comm:duplex');

// internal constructors
var Chan = require('../chan').Chan;

/**
 * DuplexStreams handle bi-directional communication between
 * a pair of of `[ port, chan ]` pairs.
 *
 */

var DuplexStream = exports.DuplexStream = function DuplexStream(port, chan) {
  if (!(this instanceof DuplexStream)) return DuplexStream.create();
  this.__refs = [ port, chan ];
}

/**
 * Create a pair of `DuplexStream`s that can
 * communicate with eachother. Given return `[ a, b ]`,
 * messages sent to `a` will be recieved on `b` and visa-versa.
 *
 * @return {Array} pair of `DuplexStream`s
 * @api public
 */

DuplexStream.create = function() {
  var a = Chan();
  var b = Chan();
  var dsa = new DuplexStream(a[0], b[1]);
  var dsb = new DuplexStream(b[0], a[1]);
  return [ dsa, dsb ];
}

/*!
 * Prototype
 */

DuplexStream.prototype = {

  /**
   * @see Chan#send
   * @api public
   */

  send: function(msg, cb) {
    return this.__refs[1].send(msg, cb);
  },

  /**
   * @see Port#recv
   * @api public
   */

  recv: function(cb) {
    return this.__refs[0].recv(cb);
  },

  /**
   * @see Port#peek
   * @api public
   */

  peek: function() {
    return this.__refs[0].peek();
  }

}
