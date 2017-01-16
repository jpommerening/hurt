const noop = () => {};

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
        handler(req, res, noop);
      });
    }
    next();
  };
}

export function request() {
  return function (req, res, next) {
    next();
  };
}

export function mixin(options = {}) {
  let finish_ = finish();
  let timeout_ = timeout(options.timeout, finish_);

  return {
    pre: [ timeout_ ],
    post: [ finish_ ],
    timeout(delay, handler) {
      const index = this.pre.indexOf( timeout_ );

      timeout_ = timeout(delay || options.timeout, handler || finish_);

      if( index < 0 ) {
        this.pre.push( timeout_ );
      } else {
        this.pre[ index ] = timeout_;
      }
      return this;
    }
  };
}
