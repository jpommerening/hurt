export default function sync(fn) {
  return function(...args) {
    const next = args.pop();
    fn.apply(this, args);
    next();
  };
}
