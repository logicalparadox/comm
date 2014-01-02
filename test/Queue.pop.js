var Queue = comm.Queue;

test('waits if no itesm in queue', function(done) {
  co(function*() {
    var queue = new Queue();
    queue._queueState.waiting.should.have.lengthOf(0);
    var wait = queue.pop();
    queue._queueState.waiting.should.have.lengthOf(1);
  })(done);
});

test('resolves if item in queue', function(done) {
  co(function*() {
    var queue = new Queue();
    queue.push('a');
    queue.push('b');
    queue.push('c');

    var a = yield queue.pop();
    a.should.equal('c');

    var b = yield queue.pop();
    b.should.equal('b');

    var c = yield queue.pop();
    c.should.equal('a');
  })(done);
});
