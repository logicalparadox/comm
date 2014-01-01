module.exports = function(config) {
  config.set({
    globals: {
      comm: require('./index')
    },
    tests: [
      'test/**/*.js'
    ]
  });
};
