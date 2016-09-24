function routes(...names) {
  const options = [
    { name: 'uri-1',      test: '/test' },
    { name: 'uri-2',      test: '/test/' },
    { name: 'regexp-1',   test: /^[\/]test$/ },
    { name: 'regexp-2',   test: /[\/]test$/ },
    { name: 'regexp-3',   test: /^[\/]test/ },
    { name: 'regexp-4',   test: /^[\/]([^\/]+)$/ },
    { name: 'template-1', test: '/{test}' },
    { name: 'template-2', test: '/{a}{/b}' },
    { name: 'template-3', test: '{?test+}' }
  ];

  return options.filter(({ name }) => names.indexOf(name) >= 0);
}

const tests = [
  {
    name: 'Plain URI routes match verbatim',
    urls: [ '/test', '/test/', '/test/1' ],
    routes: routes('uri-1'),
    expect: [ true, false, false ]
  },
  {
    name: 'Plain URI routes respect trailing slashes',
    urls: [ '/test', '/test/' ],
    routes: routes('uri-2'),
    expect: [ false, true ]
  },
  {
    name: 'RegExp routes must match URLs',
    urls: [ '/test', '/test/' ],
    routes: routes('regexp-1'),
    expect: [ false, true ]
  },
  {
    name: 'RegExp routes must match at the beginning of URLs',
    urls: [ '/test', '/test/' ],
    routes: routes('regexp-2'),
    expect: [ false, true ]
  },
  {
    name: 'RegExp routes may leave the tail of the URL unmatched',
    urls: [ '/test', '/test/', '/test/1' ],
    routes: routes('regexp-3'),
    expect: [ true, true, true ]
  },
  {
    name: 'RegExp store matches as route params',
    urls: [ '/test', '/test/', '/test/1' ],
    routes: routes('regexp-4'),
    expect: [ {
      params: [ '/test', 'test' ]
    }, false, false ]
  }
];

export default tests;
