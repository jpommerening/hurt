import handler from './handler';
import { default as route, unshift, push } from './route';
import mixin from './mixin';
import { proxy } from './_util';

export default function router({ mixins = router.mixins, ...options } = {}) {
  const pre = [];
  const stack = [];
  const post = [];
  const fn = route(
    options,
    handler(stack),
  );

  unshift(fn, handler(pre, fn));
  push(fn, handler(post, fn));

  mixin(fn, {
    pre,
    post,
    route,
    use(...args) {
      const route = this.route(...args);
      const context = proxy(this, 'route');
      context.route = route;
      stack.push((...args) => context.route(...args));
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
