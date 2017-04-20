import handler from './handler';

export default function route(...args) {
  const stack = [];
  const options = {};
  const fn = handler(stack);

  args.forEach(arg => {
    if (typeof arg === 'function') {
      stack.push(arg);
      arg = { name: arg.name };
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
