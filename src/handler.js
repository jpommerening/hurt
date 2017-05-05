/**
 * Return a function to process the given list of callbacks,
 * keeping the call stack flat in case `next` is called synchronously.
 *
 * @param {Array<Function>} stack
 * @param {*} [context]
 * @return {Function}
 */
export default function handler(stack, context) {
  return function (...args) {
    const self = context || this;
    const next = args.pop();

    let index = 0;
    let sync = true;

    args.push(iter);
    iter();

    function iter(err) {
      if (err) {
        sync = true;
      }

      while (sync) {
        sync = false;
        if (err || index >= stack.length) {
          next(err);
        } else {
          try {
            stack[index++].apply(self, args);
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
