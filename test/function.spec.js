const assert = require('assert');  // Node.js `assert` module
const sayHello = require('./hello').sayHello;


// standard test
describe('App test!', function () {
  it('sayHello should return hello', function (done) {
    if (sayHello() === 'hello') {
      done();
    }
  });
});


// test with assert module
describe('App test!', function () {
  it('sayHello should return "hello"', function () {
    assert.equal(sayHello(), 'hello');
  });
});