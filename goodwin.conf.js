var comm = require('./index');
module.exports = function(config) {
  config.set({
    globals: {
      co: require('co'),
      comm: require('./index'),
      wait: require('co-wait'),

      Deque: comm.Deque,
      Chan: comm.Chan,
      Port: comm.Port,
      Duplex: comm.Duplex
    },
    tests: [
      'test/*.js'
    ]
  });
};
