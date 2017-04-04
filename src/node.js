import { replace, noop } from './_util';

export function mixin(options = {}) {
  let finish_ = finish();
  let timeout_ = timeout(options.timeout, finish_);

  return {
    pre: [ timeout_ ],
    post: [ finish_ ],
    timeout(delay, handler) {
      timeout_ = replace(
        this.pre,
        timeout(delay || options.timeout, handler || finish_),
        timeout_
      );
      return this;
    }
  };
}

export function finish() {
  return function (req, res, next = noop) {
    if (!res.finished) {
      res.end();
    }
    next();
  };
}

export function timeout(delay, handler = finish()) {
  return function (req, res, next) {
    if (delay) {
      res.setTimeout(delay, () => {
        if (typeof this.emit === 'function') {
          this.emit('timeout', req, res);
        }
        handler(req, res, noop);
      });
    }
    next();
  };
}
