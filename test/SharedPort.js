var Chan = comm.Chan;
var SharedPort = comm.SharedPort;

test('returns of array of [ sharedPort, chan ]', function() {
  var sock = SharedPort();
  sock.should.be.an('array');
  sock[0].should.be.instanceof(SharedPort);
  sock[1].should.be.instanceof(Chan);
});

test('read with single clone', function(done) {
  function *send(chan) {
    yield chan.send('a');
    yield chan.send('b');
    yield chan.send('c');
  }

  co(function*() {
    var sock = SharedPort();
    var port = yield sock[0].clone();
    var chan = sock[1];

    co(send)(chan);

    var a = yield port.recv();
    var b = yield port.recv();
    var c = yield port.recv();
    [ a, b, c ].should.deep.equal([ 'a', 'b', 'c' ]);

    sock[0].closed.should.be.false;
    port.closed.should.be.false;

    chan.send(null);
    var exit = yield port.recv();
    assert.equal(exit, null);

    chan.closed.should.be.true;
    port.closed.should.be.true;
    sock[0].closed.should.be.true;
  })(done);
});


test('read with multiple clones', function(done) {
  function *send(chan) {
    yield chan.send('a');
    yield chan.send('b');
    yield chan.send('c');
  }

  function *read(port) {
    var a = yield port.recv();
    var b = yield port.recv();
    var c = yield port.recv();
    [ a, b, c ].should.deep.equal([ 'a', 'b', 'c' ]);
    var exit = yield port.recv();
    assert.equal(exit, null);
  }

  co(function*() {
    var sock = SharedPort();
    var chan = sock[1];

    var one = yield sock[0].clone();
    var two = yield sock[0].clone();
    var thr = yield sock[0].clone();

    co(read)(one);
    co(read)(two);
    co(read)(thr);

    yield send(chan);

    one.closed.should.be.false;
    two.closed.should.be.false;
    thr.closed.should.be.false;
    sock[0].closed.should.be.false;

    yield chan.send(null);

    one.closed.should.be.true;
    two.closed.should.be.true;
    thr.closed.should.be.true;
    sock[0].closed.should.be.true;

  })(done);
});
