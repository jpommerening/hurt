/* eslint-env node, mocha */

import { expect } from 'chai';

import handler from '../src/handler';

describe('handler(stack)', () => {

  it('creates a function that can be called with a callback', done => {
    const fn = handler([]);
    expect(fn).to.be.a('function');
    fn(done);
  });

  describe('when the stack is modified after creation', () => {

    let fn;
    let stack;

    beforeEach(() => {
      const step = next => {
        next();
      };

      stack = [step, step];
      fn = handler(stack);
    });

    it('processes calls with the modified stack', done => {
      let called = false;
      stack.splice(1, 0, next => {
        called = true;
        next();
      });

      fn(() => {
        expect(called).to.equal(true);
        done();
      });
    });

    it('does not try to prevent modification during execution', done => {
      let called = false;

      stack.splice(1, 0, next => {
        stack.splice(2, 0, next => {
          called = true;
          next();
        });
        next();
      });

      fn(() => {
        expect(called).to.equal(true);
        done();
      });
    });

  });

  describe('when `next` is called synchronously', () => {

    let fn;
    let stack;

    beforeEach(() => {
      const step = next => {
        stack++;
        next();
        stack--;
      };

      fn = handler([step, step]);
      stack = 0;
    });

    it('calls the next handler after the previous handler completed', done => {
      fn(() => {
        expect(stack).to.equal(0);
        done();
      });
    });

    it('processes the handler synchronously', done => {
      let finished = false;
      fn(() => {
        expect(finished).to.equal(false);
        done();
      });
      finished = true;
    });

  });

  describe('when `next` is called asynchronously', () => {

    let fn;
    let last;

    beforeEach(() => {
      const step = next => {
        setTimeout(next, 0);
        last++;
      };

      fn = handler([step, step]);
      last = 0;
    });

    it('calls the given callback all handlers completed', done => {
      fn(() => {
        expect(last).to.equal(2);
        done();
      });
    });

  });



  describe('when a handler throws an error', () => {

    let fn;
    let last;

    beforeEach(() => {
      const step = next => {
        last++;
        next();
      };
      const err = () => {
        last++;
        throw new Error('the message');
      };

      fn = handler([step, err, step]);
      last = 0;
    });

    it('does not execute any further handlers', done => {
      fn(() => {
        expect(last).to.equal(2);
        done();
      });
    });

    it('calls the given callback with the error that occurred', done => {
      fn(err => {
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.equal('the message');
        done();
      });
    });

  });

  describe('when `next` is called with an error', () => {

    let fn;
    let last;

    beforeEach(() => {
      const step = next => {
        last++;
        next();
      };
      const err = next => {
        last++;
        next(new Error('the message'));
      };

      fn = handler([step, err, step]);
      last = 0;
    });

    it('does not execute any further handlers', done => {
      fn(() => {
        expect(last).to.equal(2);
        done();
      });
    });

    it('calls the given callback with the error that occurred', done => {
      fn(err => {
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.equal('the message');
        done();
      });
    });

  });

});
