var Queue = comm.deque.Queue;

test('resolves when queue has drained', function(done) {
  function *get(queue) {
    yield queue.shift();
    yield queue.shift();
    yield queue.shift();
  }

  co(function*() {
    var queue = new Queue();

    queue.push('a');
    queue.push('b');
    queue.push('c');

    queue.should.have.lengthOf(3);

    co(get)(queue);

    var empty = yield queue.drain();
    empty.should.be.true;
    queue.should.have.lengthOf(0);
  })(done);
});
