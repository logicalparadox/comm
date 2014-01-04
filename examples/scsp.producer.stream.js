var co = require('co');
var transmute = require('transmute');

var comm = require('..');
var StreamProducer = comm.scsp.StreamProducer;

co(function *main() {
  var stream = transmute({ options: { objectMode: true, highWaterMark: 1 }});
  var producer = new StreamProducer(stream);

  stream.on('end', function() {
    console.log('stream ended');
  });

  stream.on('readable', function() {
    var data = this.read();
    if (!data) return;
    console.log('msg:', data);
  });

  producer.write({ hello: 'world' });
  producer.write({ hello: 'universe' });
  yield producer.write(null);
  console.log('producer closed:', producer.closed);
})();
