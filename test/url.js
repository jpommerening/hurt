/* eslint-env node, mocha */

import { expect } from 'chai';

import { mixin } from '../src/url';
import mix from '../src/mixin';

describe('url#mixin()', () => {

  let url;

  beforeEach(() => {
    url = mixin();
  });

  it('returns an object that can be mixed into routers', () => {
    expect(url).to.be.an('object');
  });

  describe('#use(url, ...stack)', () => {

    let host;
    let call;

    beforeEach(() => {
      call = {};
      host = {
        use: function (...args) {
          call = { this, args };
          return this;
        }
      }

      mix(host, url);
    });

    it('is a method of the returned mixin', () => {
      expect(url).to.have.a.property('use');
      expect(url.use).to.be.a('function');
    });

    describe('when called with a function instead of a URL', () => {

      it('returns `this`', () => {
        const fn1 = () => {};
        const fn2 = () => {};
        expect(host.use(fn1, fn2)).to.equal(host);
      });

      it('passes parameters unmodified to the host object\'s use() method', () => {
        const fn1 = () => {};
        const fn2 = () => {};
        host.use(fn1, fn2);
        expect(call).to.have.a.property('args');
        expect(call.args).to.eql([fn1, fn2]);
      });

      it('calls the host object\'s use() method with `this` referencing the host object', () => {
        const fn1 = () => {};
        const fn2 = () => {};
        host.use(fn1, fn2);
        expect(call).to.have.a.property('this');
        expect(call.this).to.equal(host);
      });

    });

    describe('when called with a URL template string', () => {

      it('returns `this`', () => {
        expect(host.use('/path', () => {})).to.equal(host);
      });

      it('calls the host object\'s use() method with a custom handler', () => {
        expect(host.use('/path', () => {}));
        expect(call).to.have.a.property('args');
        expect(call.args).to.have.length(1);
        expect(call.args[0]).to.be.a('function');
      });

    });

    describe('when called with a RegExp', () => {
    });

  });

  describe('#notfound(...stack)', () => {

    it('is a method of the returned mixin', () => {
      expect(url).to.have.a.property('notfound');
      expect(url.notfound).to.be.a('function');
    });

  });

});
