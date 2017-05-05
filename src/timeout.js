const noop = () => {};

export function mixin({ timeout = 0 } = {}) {
  let handler_;

  return {
    pre: [
      function (req, res, ...args) {
        const next = args.pop();
        const handler = handler_ || noop;

        if (res.setTimeout) {
          res.setTimeout(timeout, () => {
            if (typeof this.emit === 'function') {
              this.emit('timeout', req, res, ...args);
            }
            handler(req, res, ...args, noop);
          });
        }

        next();
      }
    ],
    post: [
      function (req, res, ...args) {
        const next = args.pop();
        if (res.setTimeout) {
          res.setTimeout(0);
        }
        next();
      }
    ],
    timeout(delay, handler) {
      timeout = delay;
      if (handler) {
        handler_ = handler;
      }
      return this;
    }
  };
}
