function getPrefix(regexp) {
  const source = regexp.source.replace(/(^\^|\$$)/g, '');
  const match = /(^|[^\\])([[({.]|\\[dDsSwWxu])/.exec(source);
  const prefix = (match ? source.substr(0, match.index + match[1].length) : source);

  return prefix.replace(/\\([/\\().*\[\]])/g, '$1');
}

function updateArgs(args) {
  let regexp;
  if (args[0] instanceof RegExp) {
    regexp = args.shift();
  }
  else if (args[0] && args[0].url instanceof RegExp) {
    regexp = args[0].url;
  }

  if (regexp) {
    args.unshift({
      url: regexp,
      prefix: getPrefix(regexp),
      match: req => {
        const url = req.url;
        const match = regexp.exec(url);
        return (match && match[0] === url) ? match : null;
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
