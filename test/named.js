/* eslint-env mocha */

import { expect } from 'chai';

import { mixin } from '../src/named';
import route from '../src/route';
import mix from '../src/mixin';

describe('named#mixin([options])', () => {

  let named;
  let host;

  beforeEach(() => {
    named = mixin();
    host = {
      route(...args) {
        return route(...args);
      }
    };
  });

  it('returns an object that can be mixed into routers', () => {
    expect(named).to.be.an('object');
  });

  describe('#name', () => {
    it('corresponds to the name option', () => {
      const named = mixin({ name: 'test' });
      expect(named.name).to.equal('test');
    });
    it('defaults to an empty string', () => {
      const named = mixin({});
      expect(named.name).to.equal('');
    });
  });

  describe('#route(...options)', () => {

    beforeEach(() => {
      mix(host, named);
    });

    it('can be used to add and retrieve routes with a given name', () => {
      const route1 = host.route({ name: 'test' }, next => {
        next();
      });
      const route2 = host.route({ name: 'test' });
      expect(route1).to.equal(route2);
    });

    it('returns an anonymous route when called without arguments', () => {
      const route = host.route();
      expect(route).to.be.a('function');
      expect(route.name).to.equal('');
    });
  });

});
