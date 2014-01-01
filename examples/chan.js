var Chan = require('../index').Chan;
var co = require('co');

var calc = co(function*(port) {
  var sum = 0, num;

  while (num = yield port.recv()) {
    if (null === num) break;
    sum += num;
  }

  console.log(sum);
});

exports.main = co(function*() {
  var sock = Chan();
  var chan = sock[1];

  calc(sock[0]);

  chan.send(2 * 10);
  chan.send(2 * 20);
  chan.send(2 * 30);
  chan.send(null);
})();
