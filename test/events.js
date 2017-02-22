/* eslint-env mocha */

import { expect } from 'chai';

import { mixin } from '../src/events';
import mix from '../src/mixin';

import EventEmitter from 'eventemitter3';

describe('events#mixin()', () => {

  let events;
  let host;
  let stack;

  beforeEach(() => {
    events = mixin();
    stack = [];
    host = {
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

  it('shadows all EventEmitter properties', () => {
    const emitter = new EventEmitter();
    Object.keys(emitter).forEach(key => {
      const prop = emitter[key];
      expect(events[key]).to.be.a(typeof prop);
    });
    Object.keys(EventEmitter.prototype).forEach(key => {
      const prop = EventEmitter.prototype[key];
      expect(events[key]).to.be.a(typeof prop);
    });
  });

  it('emits a `handler` event when adding new handlers', () => {
    let handler;
    host.on('handler', h => {
      handler = h;
    });

    host.use(() => {});
    expect(handler).to.equal(stack[0]);
  });

  it('emits a `request` event before processing any handlers', () => {
    let args;
    host.on('request', (...a) => {
      args = a;
    });

    host.pre.forEach(handler => {
      handler.call(host, 1, 2, () => {});
    });
    expect(args).to.eql([1, 2]);
  });

  it('emits a `finish` event after processing all handlers', () => {
    let args;
    host.on('finish', (...a) => {
      args = a;
    });

    host.post.forEach(handler => {
      handler.call(host, 1, 2, () => {});
    });
    expect(args).to.eql([1, 2]);
  });

});
