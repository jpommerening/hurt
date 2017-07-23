import handler from './handler';
import { Symbol } from './_util';

const STACK = Symbol('stack');
const OPTIONS = Symbol('options');

export function unshift(route, ...stack) {
  route[STACK].unshift(...stack);
}

export function push(route, ...stack) {
  route[STACK].push(...stack);
}

function isroute(arg) {
  return ( typeof arg === 'function' ) && arg[STACK] && arg[OPTIONS];
}

export function defaults() {
  return {
    pre: [],
    post: []
  };
}

export default function route(...args) {
  if (args.length === 1 && isroute(args[0])) {
    return args[0];
  }

  const stack = [];
  const options = {};
  const fn = handler(stack);

  [ ...args, defaults() ].forEach(arg => {
    if (isroute(arg)) {
      stack.push(...arg[STACK]);
      arg = arg[OPTIONS];
    }
    else if (typeof arg === 'function') {
      stack.push(arg);
      arg = { name: arg.name };
    }
    Object.keys(arg).forEach(key => {
      if (!options.hasOwnProperty(key)) {
        options[key] = arg[key];

        try {
          Object.defineProperty(fn, key, {
            value: options[key],
            writable: false
          });
        }
        catch (e) {
          //eslint-disable-no-empty
        }
      }
    });
  });

  fn[STACK] = stack;
  fn[OPTIONS] = options;

  unshift(fn, handler(options.pre, fn));
  push(fn, handler(options.post, fn));

  return fn;
}
