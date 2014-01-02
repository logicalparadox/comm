test('waits if no items in queue', function(done) {
  co(function*() {
    var deque = new Deque();
    deque._dequeState.waiting.should.have.lengthOf(0);
    var wait = deque.shift();
    deque._dequeState.waiting.should.have.lengthOf(1);
  })(done);
});

test('resolves if item in queue', function(done) {
  co(function*() {
    var deque = new Deque();
    deque.push('a');
    deque.push('b');
    deque.push('c');

    var a = yield deque.shift();
    a.should.equal('a');

    var b = yield deque.shift();
    b.should.equal('b');

    var c = yield deque.shift();
    c.should.equal('c');
  })(done);
});
