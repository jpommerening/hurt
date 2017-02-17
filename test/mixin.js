/* eslint-env mocha */

import { expect } from 'chai';

import mixin from '../src/mixin';

describe('mixin(target, mixin)', () => {

  describe('when called on an empty target object', () => {

    let target;

    beforeEach(() => {
      target = {};
    });

    it('returns nothing', () => {
      expect(mixin(target, {})).to.equal(undefined);
    });

    it('copies array and value properties from the mixin onto the object', () => {
      const source = {
        a: 1,
        b: 'test',
        c: [1, 2, 3]
      };
      mixin(target, source);
      expect(target.a).to.eql(source.a);
      expect(target.b).to.eql(source.b);
      expect(target.c).to.eql(source.c);
    });

    it('binds function properties to the target instance', () => {
      let call = {};
      const source = {
        a(...args) {
          call = { this: this, args };
          return 4;
        }
      };
      mixin(target, source);
      expect(target.a).to.be.a('function');

      const fn = target.a;
      const res = fn(1, 2, 3);
      expect(res).to.eql(4);
      expect(call).to.have.a.property('this');
      expect(call.this).to.equal(target);
      expect(call).to.have.a.property('args');
      expect(call.args).to.eql([1, 2, 3]);
    });

  });

  describe('when called on a object with existin properties', () => {

    let target;

    beforeEach(() => {
      target = {
        a: [1, 2, 3],
        s: 'test'
      };
    });

    it('extends existing array properties by appending new elements from source arrays', () => {
      const source = {
        a: [4, 5, 6]
      };

      mixin(target, source);
      expect(target.a).to.eql([1, 2, 3, 4, 5, 6]);
    });

    it('extends existing array properties by appending plain properties from source', () => {
      const source = {
        a: 4
      };

      mixin(target, source);
      expect(target.a).to.eql([1, 2, 3, 4]);
    });

    it('replaces existing non-array properties', () => {
      const source = {
        s: [1, 2, 3]
      };

      mixin(target, source);
      expect(target.a).to.eql([1, 2, 3]);
    });

    it('proxies the target instance for function properties if the given property already exists', () => {
      let call = {};
      const source = {
        s(...args) {
          call = { this: this, args };
          return this.s;
        }
      };
      mixin(target, source);
      expect(target.s).to.be.a('function');

      const res = target.s(1, 2, 3);
      expect(res).to.eql('test');
      expect(call).to.have.a.property('args');
      expect(call.args).to.eql([1, 2, 3]);
    });

    it('unwraps the this instance if it is returned from a proxied function', () => {
      const source = {
        s() {
          return this;
        }
      };
      mixin(target, source);
      expect(target.s).to.be.a('function');

      const res = target.s();
      expect(res).to.eql(target);
    });

    it('proxies the target instance for function properties if the given property already exists', () => {
      let call = {};
      const source = {
        a(...args) {
          return this.a(...args, 3);
        }
      };
      const target = {
        a(...args) {
          call = { this: this, args };
          return 4;
        }
      }
      mixin(target, source);
      expect(target.a).to.be.a('function');

      const fn = target.a;
      const res = fn(1, 2);
      expect(res).to.eql(4);
      expect(call).to.have.a.property('args');
      expect(call.args).to.eql([1, 2, 3]);
    });

  });

});
