export function mixin(options = {}) {

  return {
    attach(window = options.window) {
      attach(window, this, options);
      return this;
    }
  };
}


export function attach(window, handler, options = {}) {
  const {
    history,
    location,
    document
  } = window;

  const base = (options.base ? canonicalizeUrl(options.base) : document.baseURI)
    .replace(/\/$/, '');

  let submit = null;

  document.addEventListener('click', event => {
    const { target, altKey, metaKey } = event;

    if (altKey || metaKey) {
      return;
    }

    if (target.localName === 'button' && target.type === 'submit') {
      submit = target;
    }
    if (target.localName === 'a' && target.href) {
      run({ url: target.href, event });
    }
  });

  document.addEventListener('submit', event => {
    const { target } = event;

    if (target.localName === 'form' && target.action) {
      const url = canonicalizeUrl(/*submit.formAction ||*/ target.action);
      const method = submit.formMethod || target.method;
      submit = null;
      run({ url, method, event });
    }
  });

  window.addEventListener('popstate', event => {
    run({ url: location.href, replace: true, state: history.state, event });
  });

  function run({ url, event, ...options }) {
    const req = {
      method: (options.method || 'GET').toUpperCase(),
      replace: options.replace || false,
      state: options.state || {}
    };
    const res = emptyResponse();

    if (url.substr(0, base.length) !== base) {
      return false;
    }

    req.url = url.substr(base.length);
    req.baseUrl = base;

    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    handler(req, res, function (err) {
      if (err) {
        return;
      }

      const method = req.replace ? history.replaceState : history.pushState;
      const state = req.state;
      method.call(history, state, state.title, base + req.url);
    });
  }

  function canonicalizeUrl(href) {
    const a = document.createElement('a');
    a.href = href;
    return a.href;
  }

  function emptyResponse() {
    let handle;
    const res = {
      setTimeout(timeout, callback) {
        if (handle) {
          clearTimeout(handle);
          handle = null;
        }
        if (timeout) {
          handle = window.setTimeout(callback, timeout);
        }
      },
      end() {
        res.setTimeout(0);
        res.finished = true;
      },
      finished: false
    };
    return res;
  }
}
