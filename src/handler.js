/**
 * Return a function to process the given list of callbacks,
 * keeping the call stack flat in case `next` is called synchronously.
 *
 * @param {Array<Function>} stack
 * @return {Function}
 */
export default function handler(stack) {
  return function (...args) {
    const self = this;
    const next = args.pop();
    args.push(iter);

    let index = 0;
    let sync = true;

    console.log('handler', self);
    iter();

    function iter(err) {
      if (err) {
        sync = true;
      }

      while (sync) {
        sync = false;
        if (err || index >= stack.length) {
          next.call(self, err);
        } else {
          try {
            stack[index++].call(self, ...args);
          }
          catch (e) {
            sync = true;
            err = e;
          }
        }
      }

      sync = true;
    }
  };
}
