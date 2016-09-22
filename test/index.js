/* eslint-env node, mocha */
'use strict';

import { expect } from 'chai';
import {
  Route,
  UriRoute,
  RegExpRoute,
  TemplateRoute,
  MethodRoute
} from '../src';

describe('hurt', () => {

  describe('#Route(callback)', () => {

    it('executes the callback unconditionally', done => {
      const route = new Route((req, res, next) => {
        next();
      });
      route.handle({}, {}, done);
    });

  });

  describe('#UriRoute(uri, callback)', () => {

    it('is a subclass of #Route', () => {
      const route = new UriRoute('/test', () => {});
      expect(route).to.be.an.instanceOf(Route);
    });

    it('executes the callback if the request url equals the given uri', done => {
      const route = new UriRoute('/test', (req, res, next) => {
        next();
      });
      route.handle({ url: '/test' }, {}, done);
    });

  });

  describe('#RegExpRoute(regexp, callback)', () => {

    it('is a subclass of #Route', () => {
      const route = new RegExpRoute(/[\/]test/, () => {});
      expect(route).to.be.an.instanceOf(Route);
    });

    it('executes the callback if the request url matches the RegExp', done => {
      const route = new RegExpRoute(/[\/]test/, (req, res, next) => {
        next();
      });
      route.handle({ url: '/test' }, {}, done);
    });

    it('stores matching groups as req.params', done => {
      const route = new RegExpRoute(/[\/](test)/, (req, res, next) => {
        expect(req.params[1]).to.equal('test');
        next();
      });
      route.handle({ url: '/test' }, {}, done);
    });

  });

  describe('#TemplateRoute(template, callback)', () => {

    it('is a subclass of #Route', () => {
      const route = new TemplateRoute('/test', () => {});
      expect(route).to.be.an.instanceOf(Route);
    });

    it('executes the callback if the request url matches the uri template', done => {
      const route = new TemplateRoute('/test', (req, res, next) => {
        next();
      });
      route.handle({ url: '/test' }, {}, done);
    });

    it('stores matching groups as req.params', done => {
      const route = new TemplateRoute('/{test}', (req, res, next) => {
        expect(req.params.test).to.equal('test');
        next();
      });
      route.handle({ url: '/test' }, {}, done);
    });

  });

  describe('#MethodRoute(method, callback)', () => {

    it('is a subclass of #Route', () => {
      const route = new MethodRoute('GET', () => {});
      expect(route).to.be.an.instanceOf(Route);
    });

    it('executes the callback if the request method equals the given method', done => {
      const route = new MethodRoute('GET', (req, res, next) => {
        next();
      });
      route.handle({ method: 'GET' }, {}, done);
    });

  });

});
