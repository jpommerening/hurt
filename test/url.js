/* eslint-env mocha */

import { expect } from 'chai';

import { mixin } from '../src/url';
import route from '../src/route';
import mix from '../src/mixin';

import { mixin as regexpMixin } from '../src/regexp-route';
import { mixin as templateMixin } from '../src/template-route';

describe('url#mixin()', () => {

  let url;
  let host;
  let call;
  let stack;

  beforeEach(() => {
    url = mixin();
    call = {};
    stack = [];
    host = {
      pre: [],
      post: [],
      route,
      use(...args) {
        call = { this: this, args };
        stack.push(...args);
        return this;
      }
    };
  });

  it('returns an object that can be mixed into routers', () => {
    expect(url).to.be.an('object');
  });

  describe('#base([url])', () => {

    beforeEach(() => {
      mix(host, url);
    });

    it('is a method of the returned mixin', () => {
      expect(url).to.have.a.property('base');
      expect(url.base).to.be.a('function');
    });

    it('can be used to get and set the current base-url', () => {
      expect(host.base()).to.equal('');
      expect(host.base('/test')).to.equal(host);
      expect(host.base()).to.equal('/test');
    });
  });

  describe('#use(url, ...stack)', () => {

    beforeEach(() => {
      mix(host, regexpMixin());
      mix(host, templateMixin());
      mix(host, url);
    });

    it('is a method of the returned mixin', () => {
      expect(url).to.have.a.property('use');
      expect(url.use).to.be.a('function');
    });

    describe('when called with a URL template string', () => {

      it('returns `this`', () => {
        expect(host.use('/path', () => {})).to.equal(host);
      });

      it('calls the host object\'s use() method with a custom handler', () => {
        host.use('/path', () => {});
        expect(call).to.have.a.property('args');
        expect(call.args).to.have.length(1);
        expect(call.args[0]).to.be.a('function');
      });

      it('calls the handler when the host object processes a matching request', () => {
        let called = false;
        host.use('/path', (req, next) => {
          called = true;
          expect(req.url).to.eql('/path');
          next();
        });

        request('/path/notfound');
        expect(called).to.eql(false);
        request('/path');
        expect(called).to.eql(true);
      });

      it('stores template matches in the request object\'s params property', () => {
        let called = false;
        host.use('/{path}', (req, next) => {
          called = true;
          expect(req.url).to.eql('/path');
          expect(req.params).to.eql({
            path: 'path'
          });
          next();
        });

        request('/path');
        expect(called).to.eql(true);
      });

    });

    describe('when called with a RegExp', () => {

      it('returns `this`', () => {
        expect(host.use(/\/path/, () => {})).to.equal(host);
      });

      it('calls the host object\'s use() method with a custom handler', () => {
        host.use(/\/path/, () => {});

        expect(call).to.have.a.property('args');
        expect(call.args).to.have.length(1);
        expect(call.args[0]).to.be.a('function');
      });

      it('calls the handler when the host object processes a matching request', () => {
        let called = false;
        host.use(/\/path/, (req, next) => {
          called = true;
          expect(req.url).to.eql('/path');
          next();
        });

        request('/path/notfound');
        expect(called).to.eql(false);
        request('/path');
        expect(called).to.eql(true);
      });

      it('only matches at the beginning and end of the URL path', () => {
        let called = false;
        host.use(/\/path/, (req, next) => {
          called = true;
          next();
        });

        request('/some/path');
        expect(called).to.eql(false);
        request('/path/some');
        expect(called).to.eql(false);
        request('/path');
        expect(called).to.eql(true);
      });

      it('stores RegExp matches in the request object\'s params property', () => {
        let called = false;
        host.use(/\/(.*)/, (req, next) => {
          called = true;
          expect(req.url).to.eql('/path');
          expect(req.params).to.eql({
            0: '/path',
            1: 'path',
            length: 2
          });
          next();
        });

        request('/path');
        expect(called).to.eql(true);
      });

    });

    describe('when called with something that has a `url` property', () => {

      it('returns `this`', () => {
        expect(host.use({ url: '/path' }, () => {})).to.equal(host);
      });

      it('calls the host object\'s use() method with a custom handler', () => {
        host.use({ url: '/path' }, () => {});

        expect(call).to.have.a.property('args');
        expect(call.args).to.have.length(1);
        expect(call.args[0]).to.be.a('function');

        host.use({ url: /\/path/ }, () => {});

        expect(call).to.have.a.property('args');
        expect(call.args).to.have.length(1);
        expect(call.args[0]).to.be.a('function');
      });

    });

    describe('when called with something that has no `url` property', () => {
      it('returns `this`', () => {
        expect(host.use({ test: 'path' }, () => {})).to.equal(host);
      });

      it('calls the host object\'s use() method with the handler returned from route()', () => {
        host.use({ test: 'path' }, () => {});

        expect(call).to.have.a.property('args');
        expect(call.args).to.have.length(1);
        expect(call.args[0]).to.be.a('function');
      });
    });

    describe('when called with a function instead of a URL', () => {

      it('returns `this`', () => {
        const fn1 = () => {};
        const fn2 = () => {};
        expect(host.use(fn1, fn2)).to.equal(host);
      });

      it('calls the host object\'s use() method with the handler returned from route()', () => {
        const fn1 = () => {};
        const fn2 = () => {};
        host.use(fn1, fn2);
        expect(call).to.have.a.property('args');
        expect(call.args).to.have.length(1);
        expect(call.args[0]).to.be.a('function');
      });

      it('calls the host object\'s use() method with `this` referencing the host object', () => {
        const fn1 = () => {};
        const fn2 = () => {};
        host.use(fn1, fn2);
        expect(call).to.have.a.property('this');
        expect(call.this).to.equal(host);
      });

      it('creates a focal point for routes, where all requests pass through before re-entering URL matching', () => {
        let called;

        host.use((req, next) => {
          called.push(1);
          next();
        });
        host.use('/a', (req, next) => {
          called.push('2a');
          next();
        });
        host.use('/b', (req, next) => {
          called.push('2b');
          next();
        });
        host.use((req, next) => {
          called.push(3);
          next();
        });
        host.use('/a', (req, next) => {
          called.push('4a');
          next();
        });
        host.use('/c', (req, next) => {
          called.push('4c');
          next();
        });
        host.use((req, next) => {
          called.push(5);
          next();
        });
        host.use((req, next) => {
          called.push(6);
          next();
        });

        called = [];
        request('/a');
        expect(called).to.eql([1, '2a', 3, '4a', 5, 6]);

        called = [];
        request('/b');
        expect(called).to.eql([1, '2b', 3, 5, 6]);

        called = [];
        request('/c');
        expect(called).to.eql([1, 3, '4c', 5, 6]);
      });

    });

    describe('when called without arguments', () => {
      it('might throw', () => {
        try {
          host.use();
        }
        catch (e) {
          //eslint-disable-no-empty
        }
      });
    });

  });

  describe('#notfound(...stack)', () => {

    beforeEach(() => {
      mix(host, regexpMixin());
      mix(host, templateMixin());
      mix(host, url);

      host.use('/path', (req, next) => {
        next();
      });
    });

    it('is a method of the returned mixin', () => {
      expect(url).to.have.a.property('notfound');
      expect(url.notfound).to.be.a('function');
    });

    describe('when used to register a handler for non-matching requests', () => {

      it('returns `this`', () => {
        expect(host.notfound(() => {})).to.equal(host);
      });

      it('calls the handler when the host object processes a request that was not matched', () => {
        let called = false;
        host.notfound((req, next) => {
          expect(req.url).to.eql('/notfound');
          called = true;
          next();
        });
        request('/notfound');
        expect(called).to.eql(true);
      });

      it('does not call the handler when the host object processes a request that was matched', () => {
        let called = false;
        host.notfound((req, next) => {
          called = true;
          next();
        });
        request('/path');
        expect(called).to.eql(false);
      });

    });

  });

  function request(path) {
    const handlers = [].concat(
      host.pre,
      stack,
      host.post
    );
    const req = {
      url: path
    };

    handlers.forEach(handler => {
      let called = false;
      handler(req, () => { called = true; });
      if (!called) {
        throw new Error(`handler did not call next()`);
      }
    });
  }

});
