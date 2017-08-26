import { add, match } from './trie';
import handler from './handler';

const EMPTY = {};

export function mixin({ base = '' } = {}) {
  const tries = [EMPTY];
  const notfound = [];
  const handle = handler(notfound);

  return {
    post: [
      function (req, ...args) {
        if (!req.handled) {
          handle.call(this, req, ...args);
        }
        else {
          const next = args[ args.length - 1 ];
          next();
        }
      }
    ],
    base(url) {
      if (typeof url === 'string') {
        base = url;
        return this;
      }
      return base;
    },
    use(...stack) {
      const route = this.route(...stack)
      const index = tries.length - 1;

      if (!route.prefix) {
        if (tries[index] !== EMPTY) {
          tries.push(EMPTY);
        }
        return this.use(route);
      }

      const trie = tries.pop();

      tries.push(add(trie, route.prefix, [route]));

      if (trie === EMPTY) {
        return this.use(function (req, ...args) {
          const stack = match(tries[ index ], req.url, []);
          handler(stack).call(this, req, ...args);
        });
      }
      else {
        return this;
      }
    },
    notfound(...stack) {
      notfound.push(...stack);
      return this;
    }
  };
}
