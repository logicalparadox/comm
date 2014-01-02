// external
var co = require('co');

// internal
var Chan = require('../index').Chan;

/**
 * Generator performing calculation. Uses
 * a while-yield loop to collect data then
 * logs the result.
 *
 * @param {Port} port
 */

function *calc(port) {
  var sum = 0, num;

  while (num = yield port.recv()) {
    sum += num;
  }

  console.log(sum);
}

/**
 * Create `[ port, chan ]` pair. Use `chan`
 * as local request channel. Send `port` to
 * `calc` as the port to listen on.
 */

co(function *main() {
  var sock = Chan();
  var chan = sock[1];

  co(calc)(sock[0]);

  chan.send(2 * 10);
  chan.send(2 * 20);
  chan.send(2 * 30);
  chan.send(null);
})();
