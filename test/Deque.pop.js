test('waits if no itesm in queue', function(done) {
  co(function*() {
    var deque = new Deque();
    deque._dequeState.waiting.should.have.lengthOf(0);
    var wait = deque.pop();
    deque._dequeState.waiting.should.have.lengthOf(1);
  })(done);
});

test('resolves if item in queue', function(done) {
  co(function*() {
    var deque = new Deque();
    deque.push('a');
    deque.push('b');
    deque.push('c');

    var a = yield deque.pop();
    a.should.equal('c');

    var b = yield deque.pop();
    b.should.equal('b');

    var c = yield deque.pop();
    c.should.equal('a');
  })(done);
});
