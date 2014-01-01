module.exports = function(config) {
  config.set({
    globals: {
      Arr: require('./lib/arr').Arr,
      co: require('co'),
      comm: require('./index'),
      wait: require('co-wait')
    },
    tests: [
      'test/*.js'
    ]
  });
};
