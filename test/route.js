/* eslint-env mocha */

import { expect } from 'chai';

import route from '../src/route';

describe('route(...options)', () => {

  it('creates a function that can be called with a callback', done => {
    const fn = route();
    expect(fn).to.be.a('function');
    fn(done);
  });

  describe('when called with options objects', () => {
    it('collects given options and sets them as properties of the returned function', () => {
      const fn = route({ foo: 1 }, { bar: 2 });
      expect(fn.foo).to.equal(1);
      expect(fn.bar).to.equal(2);
    });

    it('gives precedence to the first given option if options objects overlap', () => {
      const fn = route({ foo: 1 }, { foo: 2 });
      expect(fn.foo).to.equal(1);
    });

    it('sets the name property of the returned function', () => {
      const fn = route({ name: 'a test' });
      expect(fn.name).to.equal('a test');
    });
  });

  describe('when called with handler functions', () => {
    it('sets the name property of the returned function to name of the first function', () => {
      const fn = route(function foo() {}, function bar() {});
      expect(fn.name).to.equal('foo');
    });

    describe('the returned function', () => {
      it('calls the given handler function in the order they were given', () => {
        const called = [];
        const fn = route(next => {
          called.push('foo');
          next();
        }, next => {
          called.push('bar');
          next();
        });
        fn(() => {});
        expect(called).to.eql(['foo', 'bar']);
      });
    });
  });
});
