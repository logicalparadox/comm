var Chan = comm.Chan;
var Port = comm.Port;

test('returns a port/chan pair via create', function(done) {
  co(function*() {
    var sock = Chan();
    sock.should.be.an('array');
    sock[0].should.be.instanceof(Port);
    sock[1].should.be.instanceof(Chan);

    var msgs = [];

    co(function*(port) {
      var msg;

      while (msg = yield port.recv()) {
        msgs.push(msg);
      }
    })(sock[0]);

    var chan = sock[1];
    chan.send(1);
    chan.send(2);
    chan.send(3);
    yield chan.send(null);

    msgs.should
      .have.lengthOf(3)
      .and.deep.equal([ 1, 2, 3 ]);

    sock[0].closed.should.be.true;
    sock[1].closed.should.be.true;
  })(done);
});
