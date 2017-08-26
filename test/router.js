/* eslint-env mocha */

import { expect } from 'chai';

import router from '../src/router';

describe('router([options])', () => {

  let mixins;

  before(() => {
    mixins = router.mixins;
    router.mixins = [];
  });

  after(() => {
    router.mixins = mixins;
  });

  it('creates a function that can be called with a callback', done => {
    const fn = router();
    expect(fn).to.be.a('function');
    fn(done);
  });

  describe('#route(...options)', () => {
    it('can be called to create a route', () => {
      const fn = router();
      expect(fn.route).to.be.a('function');
      const route = fn.route({ name: 'test' }, next => {
        next();
      });
      expect(route).to.be.a('function');
      expect(route.name).to.equal('test');
    });
  });

  describe('#use([options], ...args)', () => {
    it('can be called to register handlers', () => {
      let step = 0;
      const fn = router();
      expect(fn.use).to.be.a('function');
      fn.use(next => {
        expect(step).to.equal(0);
        step++;
        next();
      });
      fn.use(next => {
        expect(step).to.equal(1);
        step++;
        next();
      }, next => {
        expect(step).to.equal(2);
        step++;
        next();
      });
      fn(() => {
        expect(step).to.equal(3);
        step++;
      });
      expect(step).to.equal(4);
    });

    it('allows to pass route options as the first argument', () => {
      const fn = router();
      let called = false;
      fn.use({ name: 'test' }, function (next) {
        called = true;
        next();
      });
      fn(() => {});
      expect(called).to.equal(true);
    });

    it('allows being called without function args', () => {
      const fn = router();
      fn.use({ name: 'test' });
      fn(() => {});
    });

    it('exposes the correct route object', () => {
      const fn = router();
      fn.use({ name: 'test1' }, function (next) {
        expect(this.route.name).to.equal('test1');
        next();
      });
      fn.use({ name: 'test2' }, function (next) {
        expect(this.route.name).to.equal('test2');
        next();
      });
      fn(() => {});
    });

    it('returns the router instance', () => {
      const fn = router();
      expect(fn.use()).to.equal(fn);
    });
  });

  describe('#mixin(...mixins)', () => {
    it('can be called to mix other mixin instances into the router instance', () => {
      const fn = router();
      fn.mixin({ test: [1] }, { test: [2] });
      expect(fn.test).to.eql([1, 2]);
    });

    it('returns the router instance', () => {
      const fn = router();
      expect(fn.use()).to.equal(fn);
    });
  });

  it('accepts a `mixins` option to override default mixins', () => {
    let step = 0;
    const fn = router({ mixins: [ () => ({
      use(test, ...args) {
        this.use(next => {
          step = test;
          next();
        }, ...args);
      }
    }) ] });

    fn.use(3, next => {
      expect(step).to.equal(3);
      step++;
      next();
    });
    fn(() => {
      expect(step).to.equal(4);
      step++;
    });
    expect(step).to.equal(5);
  });

  it('passes options to mixins', () => {
    let test = 0;
    const fn = router({ test: 3, mixins: [ options => {
      test = options.test;
      return {};
    } ] });
    expect(test).to.equal(3);
    fn(() => {});
  });

});
