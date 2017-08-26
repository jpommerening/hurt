import handler from './handler';
import { Symbol } from './_util';

const STACK = Symbol('stack');
const OPTIONS = Symbol('options');

function isroute(arg) {
  return ( typeof arg === 'function' ) && arg[STACK] && arg[OPTIONS];
}

export function unshift(route, ...stack) {
  route[STACK].unshift(...stack);
}

export function push(route, ...stack) {
  route[STACK].push(...stack);
}

export function defaults() {
  return {
    context: obj => obj ? Object.create(obj) : {},
    args: (...args) => args.slice(0, args.length - 1),
    next: (...args) => args[args.length - 1],
    match: () => true,
    pre: [],
    post: []
  };
}

function base(options, stack) {
  const fn = handler(stack);

  return function () {
    const context = options.context(this);
    const args = options.args.apply(context, arguments);
    const next = options.next.apply(context, arguments);
    const match = options.match.apply(context, arguments);

    return match ? fn.call(context, ...args, next) : next();
  };
}

export default function route(...args) {
  if (args.length === 1 && isroute(args[0])) {
    return args[0];
  }

  const options = {};
  const stack = [];
  const fn = base(options, stack);

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
