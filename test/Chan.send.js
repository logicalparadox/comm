var Chan = comm.Chan;

test('single message', function(done) {
  var msgs = [];

  var deliver = co(function*(msg) {
    yield wait(10);
    msgs.push(msg);
  });

  co(function*() {
    var chan = new Chan(deliver);
    var sent = yield chan.send({ hello: 'universe' });
    sent.should.be.true;
    msgs.should
      .have.lengthOf(1)
      .with.deep.property('[0]')
      .that.deep.equals({ hello: 'universe' });
  })(done);
});

test('message then end', function(done) {
  var msgs = [];

  var deliver = co(function*(msg) {
    yield wait(10);
    msgs.push(msg);
  });

  co(function*() {
    var chan = new Chan(deliver);
    chan.closed.should.be.false;

    var one = yield chan.send({ hello: 'universe' });
    one.should.be.true;
    chan.closed.should.be.false;

    var exit = yield chan.send(null);
    exit.should.be.true;
    chan.closed.should.be.true;

    msgs.should.have.lengthOf(2)
    assert.equal(msgs[1], null);
  })(done);
});
