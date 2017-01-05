'use strict';

/**
 * Return a function to process the given list of callbacks,
 * keeping the call stack flat in case `next` is called synchronously.
 *
 * @param {Array<Function>} stack
 * @return {Function}
 */
export default function handler(stack) {
  return function (...args) {
    const next = args.pop();

    let index = 0;
    let sync = true;

    iter();

    function iter(err) {
      while (sync) {
        sync = false;
        if (err || index >= stack.length) {
          next(err);
        } else {
          try {
            stack[index++](...args, iter);
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
