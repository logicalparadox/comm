
var debug = require('sherlock')('comm:port:state');
var EventEmitter = require('drip').EventEmitter;
var inherits = require('super');

var PortState = exports.PortState = function PortState(read) {
  var self = this;

  this.messages = [];
  this.pipes = [];
  this.waiting = [];

  read(function emit(err, msg) {
    debug('(emit) %s', err ? 'error' : 'message');
    self.push([ err, msg ]);
    self.process();
  });
}

inherits(PortState, EventEmitter);

PortState.prototype = {

  push: function(msg) {
    var self = this;
    this.messages.push(msg);

    setImmediate(function() {
      self.process();
    });
  },

  recv: function(future) {
    var self = this;
    this.waiting.push(future);

    setImmediate(function() {
      self.process();
    });
  },

  process: function() {
    if (!this.messages.length) return;
    if (!this.waiting.length) return;

    var self = this;
    var cb = this.waiting.shift();
    var msg = this.messages.shift();

    if (msg[0]) cb(msg[0]);
    else cb(null, msg[1]);

    setImmediate(function() {
      self.process();
    });
  }

}
