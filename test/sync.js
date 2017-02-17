/* eslint-env mocha */

import { expect } from 'chai';

import sync from '../src/sync';

describe('sync(handler)', () => {

  it('creates a function that can be called with a callback', done => {
    const fn = sync(() => {});
    expect(fn).to.be.a('function');
    fn(done);
  });

  it('passes arguments to the wrapped function omitting the callback', done => {
    let called = {};
    const fn = sync((...args) => {
      called = { args };
    });

    fn(1, 2, () => {
      expect(called.args).to.eql([1, 2]);
      done();
    });
  });

  it('passes "this" to the wrapped function', done => {
    let called = {};
    const fn = sync(function () {
      called = { this: this };
    });
    const obj = { a: 1, fn };

    obj.fn(1, 2, () => {
      expect(called.this).to.eql(obj);
      done();
    });
  });

  it('catches exceptions and calls the callback with the thrown error', done => {
    const fn = sync(message => {
      throw new Error(message);
    });

    fn('test-123', err => {
      expect(err).to.be.an('error');
      expect(err.message).to.eql('test-123');
      done();
    });
  });

});
