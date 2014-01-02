module.exports = function(config) {
  config.set({
    globals: {
      co: require('co'),
      wait: require('co-wait'),
      comm: require('./index')
    },
    tests: [
      'test/*.js'
    ]
  });
};
