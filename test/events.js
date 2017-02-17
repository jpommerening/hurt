/* eslint-env mocha */

import { expect } from 'chai';

import { mixin } from '../src/events';
import mix from '../src/mixin';

describe('events#mixin()', () => {

  let events;
  let host;
  let stack;

  beforeEach(() => {
    events = mixin();
    stack = [];
    host = {
      pre: [],
      post: [],
      use(...args) {
        stack.push(...args);
        return this;
      }
    };

    mix(host, events);
  });


  it('returns an object that can be mixed into routers', () => {
    expect(events).to.be.an('object');
  });

});
