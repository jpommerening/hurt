'use strict';

import handler from './handler';

export default function router() {
  const pre = [];
  const stack = [];
  const post = [];
  const mixins = [];

  const fn = handler([
    handler(pre),
    handler(stack),
    handler(post)
  ]);

  fn.mixin = function (mixin) {
    mixins.push(mixin);
  };

  fn.use = function (handler) {
    stack.push(handler);
  };

  /*
  fn.timeout = function (delay, handle) {
    pre.push(timeout(delay, handle));
  };
  */

  return fn;
}

/*
fn.mixin({
  pre: [
    function (req, res, next) {
      this.emit('request', req);
      next();
    }
  ],
  post: [
    function (req, res, next) {
      this.emit('finish', res);
      next();
    }
  ],
  emit() {},
  on() {},
  once() {}
});

fn.mixin({
  pre: [],
  post: [],
  method(method, ...handler) {
  },
  get(path, ...handler) {
  },
  post(path, ...handler) {
  },
  timeout(delay, ...handler) {
  }
});

*/
