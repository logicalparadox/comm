var Queue = comm.Queue;

test('adds item to queue if no waiting', function(done) {
  co(function*() {
    var queue = new Queue();
    queue.should.have.lengthOf(0);
    queue.push(1);
    queue.should.have.lengthOf(1);
    queue.push(2);
    queue.should.have.lengthOf(2);
    queue._queueState.queue[0][0].should.equal(1);
    queue._queueState.queue[1][0].should.equal(2);
  })(done);
});

test('forwards item to getter waiting', function(done) {
  co(function*() {
    var queue = new Queue();
    var shift = queue.shift();

    yield queue.push(1);

    var res = yield shift;
    res.should.equal(1);
  })(done);
});
