import handler from './handler';
import route from './route';
import mixin from './mixin';
import { proxy } from './_util';

export default function router({ mixins = router.mixins, ...options } = {}) {
  const stack = [];
  const fn = route(
    options,
    handler(stack)
  );

  mixin(fn, {
    route,
    use(...args) {
      const context = proxy(this, 'route');
      const route = this.route({ context: () => context }, ...args);

      context.route = route;
      stack.push(route);
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
