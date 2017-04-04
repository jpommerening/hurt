/* eslint-env mocha */

import { expect } from 'chai';

import router from '../src/router';

describe('router()', () => {

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
      fn.use({ name: 'test' }, next => {
        //expect(this.route.name).to.equal('test');
        next();
      });
      fn(() => {});
    });
  });

  describe('#mixin(...mixins)', () => {
  });

  it('exposes an array property `pre` to register handler to be called before processing the stack', () => {
    let step = 0;
    const fn = router();
    expect(fn.pre).to.be.an('array');
    fn.pre.push(next => {
      expect(step).to.equal(0);
      step++;
      next();
    });
    fn.use(next => {
      expect(step).to.equal(1);
      step++;
      next();
    });
    fn(() => {
      expect(step).to.equal(2);
      step++;
    });
    expect(step).to.equal(3);
  });

  it('exposes an array property `post` to register handler to be called after processing the stack', () => {
    let step = 0;
    const fn = router();
    expect(fn.post).to.be.an('array');
    fn.post.push(next => {
      expect(step).to.equal(1);
      step++;
      next();
    });
    fn.use(next => {
      expect(step).to.equal(0);
      step++;
      next();
    });
    fn(() => {
      expect(step).to.equal(2);
      step++;
    });
    expect(step).to.equal(3);
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
