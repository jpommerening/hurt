export default function sync(fn) {
  return function(...args) {
    const next = args.pop();
    try {
      fn.apply(this, args);
      next();
    }
    catch (err) {
      next(err);
    }
  };
}
