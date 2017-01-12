const noop = () => {};

export function finish() {
  return function (req, res, next = noop) {
    next();
  };
}

export function timeout(delay, handler = noop) {
  return function(...args) {
    const next = args.pop();
    if (delay) {
      setTimeout(() => {
        handler(...args, noop);
      });
    }
    next();
  };
}

export function attach(window, handler, options = {}) {
  const {
    history,
    location,
    document
  } = window;

  let submit = null;
  let cycle = 0;

  const base = (options.base ? parseUrl(options.base).href : document.baseURI)
    .replace(/\/$/, '');

  document.addEventListener('submit', function (event) {
    const { target } = event;
    if (target.localName === 'form' && target.action) {
      const url = parseUrl(/*submit.formAction ||*/ target.action);

      if (url.href.substr(0, base.length) === base) {
        event.stopPropagation();
        event.preventDefault();

        run({
          url: url.href.substr(base.length),
          method: submit.formMethod || target.method
        });
      }
    }
    submit = null;
  });

  document.addEventListener('click', function (event) {
    const { target } = event;
    if (target.localName === 'button' && target.type === 'submit') {
      submit = target;
    }
    if (target.localName === 'a' && target.href) {
      const url = parseUrl(target.href);

      if (url.href.substr(0, base.length) === base) {
        event.stopPropagation();
        event.preventDefault();

        run({ url: url.href.substr(base.length) });
      }
    }
  });

  window.addEventListener('popstate', function (event) {
    event.stopPropagation();
    event.preventDefault();

    const url = parseUrl(location.href);

    run({ url: url.href.substr(base.length), replace: true }, history.state || {});
  });

  function run(options, res = { cycle: cycle++ }) {
    const req = {
      url: options.url,
      baseUrl: base,
      method: (options.method || 'GET').toUpperCase(),
      replace: options.replace || false
    };

    handler(req, res, function (err) {
      if (err) {
        throw err;
      }
      else {
        const method = req.replace ? history.replaceState : history.pushState;

        method.call(history, res, res.title, base + req.url);
      }
    });
  }

  function parseUrl(href) {
    const a = document.createElement('a');
    a.href = href;
    return {
      href: a.href,
      pathname: a.pathname,
      search: a.search
    };
  }
}

export function mixin(options) {
  let finish_ = finish();
  let timeout_ = timeout(options.timeout, finish_);

  return {
    pre: [ timeout_ ],
    post: [ finish_ ],
    attach(window = options.window) {
      attach(window, this, options);
      return this;
    },
    timeout(delay, handler) {
      const index = this.pre.indexOf( timeout_ );

      timeout_ = timeout(delay || options.timeout, handler || finish_);

      if( index < 0 ) {
        this.pre.push( timeout_ );
      } else {
        this.pre[ index ] = timeout_;
      }
      return this;
    }
  };
}
