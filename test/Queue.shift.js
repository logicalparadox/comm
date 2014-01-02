var Queue = comm.Queue;

test('waits if no items in queue', function(done) {
  co(function*() {
    var queue = new Queue();
    queue._queueState.waiting.should.have.lengthOf(0);
    var wait = queue.shift();
    queue._queueState.waiting.should.have.lengthOf(1);
  })(done);
});

test('resolves if item in queue', function(done) {
  co(function*() {
    var queue = new Queue();
    queue.push('a');
    queue.push('b');
    queue.push('c');

    var a = yield queue.shift();
    a.should.equal('a');

    var b = yield queue.shift();
    b.should.equal('b');

    var c = yield queue.shift();
    c.should.equal('c');
  })(done);
});
