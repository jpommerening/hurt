import handler from './handler';
import mixin from './mixin';

export default function router({ mixins = router.mixins, ...options } = {}) {
  const pre = [];
  const stack = [];
  const post = [];

  const base = handler([
    handler(pre),
    handler(stack),
    handler(post)
  ]);

  const routes = [];

  // wrap to bind `this` to the returned router
  function fn() {
    return base.apply(fn, arguments);
  }

  mixin(fn, {
    pre,
    post,
    route(options) {
      return options;
    },
    use(...args) {
      const route = this.route( (typeof args[0] === 'object') ?
        args.shift() :
        null );
      stack.push.apply(stack, args);
      routes.push(route);
      return this;
    },
    mixin(...mixins) {
      mixins.forEach(m => mixin(this, m));
      return this;
    }
  });

  return fn.mixin(...mixins.map(mixin => mixin(options)));
}
router.mixins = [];
