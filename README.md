# comm

#### Features

- TODO

## Installation

#### Node.js

`comm` is available through [npm](http://npmjs.org):

    npm install comm

#### Component

`comm` is available as a [component](https://github.com/component/component).

    component install logicalparadox/comm

## Example

```js
var co = require('co');
var DuplexStream = require('comm').DuplexStream;

function *calc(chan) {
  var sum = 0, num;

  while (num = yield chan.recv()) {
    if (null == num) break;
    sum += num;
  }

  chan.send(sum);
  chan.send(null);
}

co(function *main() {
  var sock = DuplexStream();
  var req = sock[0];

  co(calc)(sock[1]);

  req.send(2 * 10);
  req.send(2 * 20);
  req.send(2 * 30);
  req.send(null);

  var res = yield req.recv();
  console.log(res); // => 120
})();
```

## Usage

TODO

## License

(The MIT License)

Copyright (c) 2014 Jake Luer <jake@alogicalparadox.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
