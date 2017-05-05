/* eslint-env mocha */

import { expect } from 'chai';

import { mixin } from '../src/timeout';
import handler from '../src/handler';
import mix from '../src/mixin';

describe('timeout#mixin([options])', () => {

  let timeout;
  let host;

  beforeEach(() => {
    timeout = mixin();
    host = {
      pre: [],
      post: []
    };
  });

  it('returns an object that can be mixed into routers', () => {
    expect(timeout).to.be.an('object');
  });

  it('can be created with a default timeout', () => {
    expect(mixin({ timeout: 100 })).to.be.an('object');
  });

  describe('#timeout(delay, [callback])', () => {
    let stack;
    let fn;

    beforeEach(() => {
      mix(host, timeout);
      stack = [];
      fn = handler([
        ...host.pre,
        handler(stack),
        ...host.post
      ]).bind(host);
    });

    it('does nothing if response objects lack a `setTimeout` method', () => {
      let called;
      host.timeout(100);
      fn({}, {}, () => {
        called = true;
      });
      expect(called).to.equal(true);
    });

    it('does nothing if no timeout was given', () => {
      let called;
      let waiting;
      stack.push(() => {
        waiting = true;
      });
      fn({}, {
        setTimeout(timeout) {
          called = timeout;
        }
      }, () => {});
      expect(waiting).to.equal(true);
      expect(called).to.equal(0);
    });

    it('sets a timeout on response objects', () => {
      const called = [];
      host.timeout(100);
      fn({}, {
        setTimeout(timeout) {
          called.push(timeout);
        }
      }, () => {});
      expect(called.shift()).to.equal(100);
    });

    it('removes the timeout after processing the request', () => {
      const called = [];
      host.timeout(100);
      fn({}, {
        setTimeout(timeout) {
          called.push(timeout);
        }
      }, () => {});
      expect(called.pop()).to.equal(0);
    });

    it('allows to be called with additional parameters after the request and response', () => {
      let called;
      stack.push((req, res, num, next) => {
        called = num;
        next();
      });

      fn({}, { setTimeout() {} }, 123, () => {});
      expect(called).to.equal(123);
    });

    describe('when a timeout occurs', () => {

      let waiting;

      beforeEach(() => {
        waiting = false;
        stack.push( () => {
          waiting = true;
        });
      });

      it('calls the given callback like a regular handler', () => {
        let called;
        let callback;

        const req = { a: 1 };
        const res = { b: 2, setTimeout(timeout, fn) { callback = fn; } };

        host.timeout(100, (...args) => {
          const next = args.pop();
          called = args;
          next();
        });

        fn(req, res, () => {});
        expect(waiting).to.equal(true);
        expect(callback).to.be.a('function');
        callback();
        expect(called).to.eql([req, res]);
      });

      it('emits a `timeout` event if the host is an emitter', () => {
        let called;
        let callback;

        const req = { a: 1 };
        const res = { b: 2, setTimeout(timeout, fn) { callback = fn; } };

        host.timeout(100);
        host.emit = function (...args) {
          called = args;
        };

        fn(req, res, () => {});
        expect(waiting).to.equal(true);
        expect(callback).to.be.a('function');
        callback();
        expect(called).to.eql(['timeout', req, res]);
      });
    });

  });

});
