import uriTemplate from 'uri-templates';

function getPrefix(template) {
  const index = template.indexOf('{');
  const prefix = index < 0 ? template : template.substr(0, index);
  return prefix;
}

function updateArgs(args) {
  let template;
  if (typeof args[0] === 'string') {
    template = args.shift();
  }
  else if (args[0] && typeof args[0].url === 'string') {
    template = args[0].url;
  }

  if (template) {
    const t = uriTemplate(template);
    args.unshift({
      url: template,
      prefix: getPrefix(template),
      match: req => {
        const url = req.url;
        const match = t.fromUri(url);
        if (match) {
          req.handled = true;
          req.params = {
            ...req.params,
            ...match
          };
          return true;
        }
        return false;
      }
    });
  }

  return args;
}

export function mixin() {
  return {
    route(...args) {
      return this.route(...updateArgs(args));
    }
  };
}
