'use strict';

import EventEmitter from 'eventemitter3';

import sync from './sync';

export function mixin() {
  const eventemitter = new EventEmitter();

  return {
    ...eventemitter,
    ...EventEmitter.prototype,
    pre: [
      sync(function (...args) {
        this.emit('request', ...args);
      })
    ],
    post: [
      sync(function (...args) {
        this.emit('finish', ...args);
      })
    ],
    use(...args) {
      this.emit('handler', ...args);
      this.use(...args);
    }
  };
}
