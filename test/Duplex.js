var Duplex = comm.Duplex;

test('returns a duplex pair via create', function(done) {
  co(function*() {
    var sock = Duplex();
    sock.should.be.an('array');
    sock[0].should.be.instanceof(Duplex);
    sock[1].should.be.instanceof(Duplex);

    co(function*(chan) {
      var msg;

      while (msg = yield chan.recv()) {
        yield chan.send(msg + msg);
      }

      yield chan.send(null);
    })(sock[0]);

    var chan = sock[1];

    chan.send('a');
    var a = yield chan.recv();
    a.should.equal('aa');

    chan.send('b');
    var b = yield chan.recv();
    b.should.equal('bb');

    chan.send('c');
    var c = yield chan.recv();
    c.should.equal('cc');

    chan.send(null);
    var exit = yield chan.recv();
    assert.equal(exit, null);

    sock[0].closed.should.be.true;
    sock[1].closed.should.be.true;
  })(done);
});
