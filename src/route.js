import handler from './handler';

const STACK = Symbol('stack');
const OPTIONS = Symbol('options');

export function stack(route) {
  return route[STACK] || [];
}

export function options(route) {
  return route[OPTIONS] || [];
}

export default function route(...args) {
  const stack = [];
  const options = {};
  const fn = handler(stack);

  fn[STACK] = stack;
  fn[OPTIONS] = options;

  args.forEach(arg => {
    if (typeof arg === 'function') {
      if (arg[STACK] && arg[OPTIONS]) {
        stack.push(...arg[STACK]);
        arg = arg[OPTIONS];
      } else {
        stack.push(arg);
        arg = { name: arg.name };
      }
    }
    Object.keys(arg).forEach(key => {
      if (!options.hasOwnProperty(key)) {
        options[key] = arg[key];
        Object.defineProperty(fn, key, {
          value: options[key],
          writable: false
        });
      }
    });
  });

  return fn;
}
