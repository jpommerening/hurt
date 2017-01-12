export default function conditional(test, handle) {
  return function (...args) {
    const next = args.pop();

    if (test(...args)) {
      handle.call(this, ...args, next);
    } else {
      next();
    }
  };
}
