import { add, match } from './trie';
import handler from './handler';

import uriTemplate from 'uri-templates';

function templatePrefix(template) {
  const index = template.indexOf('{');
  const prefix = index < 0 ? template : template.substr(0, index);
  return prefix;
}

function templateParams(template) {
  const t = uriTemplate(template);
  return url => {
    const match = t.fromUri(url);
    return match;
  };
}

function regExpPrefix(regexp) {
  const source = regexp.source.replace(/(^\^|\$$)/g, '');
  const match = /(^|[^\\])([[({.]|\\[dDsSwWxu])/.exec(source);
  const prefix = match ? source.substr(0, match.index + match[1].length) : source;
  return prefix.replace(/\\([/\\().*\[\]])/g, '$1');
}

function regExpParams(regexp) {
  return url => {
    const match = regexp.exec(url);
    return match && (match[0] === url) && match;
  };
}

function routeHandler(params, fn) {
  return function (req, ...args) {
    const next = args.pop();
    const match = params(req.url);

    if (match) {
      req.params = {
        ...req.params,
        ...match
      };

      fn.call(this, req, ...args, function (err) {
        if (!err) {
          req.handled = true;
        }
        next(err);
      });
    }
    else {
      next();
    }
  };
}

export function mixin({ base = '' } = {}) {
  const EMPTY = {};
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
    use(options, ...stack) {
      let url;
      let prefix;
      let params;

      if (typeof options === 'string' || options instanceof RegExp) {
        url = options;
        options = { url };
      }
      else {
        url = options.url;
      }

      if (typeof url === 'string') {
        prefix = templatePrefix(url);
        params = templateParams(url);
      }
      else if (url instanceof RegExp) {
        prefix = regExpPrefix(url);
        params = regExpParams(url);
      }
      else {
        if (tries[tries.length - 1] !== EMPTY) {
          tries.push(EMPTY);
        }
        return this.use(options, ...stack);
      }

      const route = this.route(options, ...stack)
      const trie = tries.pop();
      const index = tries.length;

      tries.push(add(trie, prefix, [ routeHandler(params, route) ]));

      if (trie === EMPTY) {
        return this.use(function (req, ...args) {
          const stack = match(tries[ index ], req.url, []);

          if (stack.length) {
            handler(stack).call(this, req, ...args);
          }
          else {
            const next = args[ args.length - 1 ];
            next();
          }
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
