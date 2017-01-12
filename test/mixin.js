/* eslint-env node, mocha */

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
          call = { this, args };
        }
      };
      mixin(target, source);
      expect(target.a).to.be.a('function');

      const fn = target.a;
      fn(1, 2, 3);
      expect(call).to.have.a.property('this');
      expect(call.this).to.equal(target);
      expect(call).to.have.a.property('args');
      expect(call.args).to.eql([1, 2, 3]);
    });

  });

});
