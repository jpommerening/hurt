/* eslint-env node, mocha */

import { expect } from 'chai';

import { add, flatten, match } from '../src/trie';
import create from '../src/trie';

describe('trie#add(trie, key, items)', () => {

  const tests = [
    {
      input: {},
      key: '',
      items: [1, 2, 3],
      expect: { '': [1, 2, 3] },
      it: 'adds empty keys to empty objects'
    },
    {
      input: {},
      key: 'key',
      items: [1, 2, 3],
      expect: { key: [1, 2, 3] },
      it: 'adds new keys to empty objects'
    },
    {
      input: { key: [1, 2, 3] },
      key: 'key',
      items: [4, 5, 6],
      expect: { key: [1, 2, 3, 4, 5, 6] },
      it: 'adds new items to existing keys on the root level'
    },
    {
      input: { keya: [1, 2, 3] },
      key: 'keyb',
      items: [4, 5, 6],
      expect: { key: { a: [1, 2, 3], b: [4, 5, 6] } },
      it: 'splits keys with common prefixes'
    },
    {
      input: { key: { '': [1, 2], a: [3, 4] } },
      key: 'key',
      items: [5, 6],
      expect: { key: { '': [1, 2, 5, 6], a: [3, 4] } },
      it: 'adds items for keys that already exist and are prefixes of other keys'
    },
    {
      input: { key: { '': [1, 2], a: [3, 4] } },
      key: 'keya',
      items: [5, 6],
      expect: { key: { '': [1, 2], a: [3, 4, 5, 6] } },
      it: 'adds items for keys that already exist and are prefixed by other keys'
    },
    {
      input: { key: { '': [1, 2], a: [3, 4] } },
      key: 'keyb',
      items: [5, 6],
      expect: { key: { '': [1, 2], a: [3, 4], b: [5, 6] } },
      it: 'adds items for keys that are prefixed by existing keys which are prefixes of other keys'
    },
    {
      input: { key: [1, 2, 3] },
      key: 'keyx',
      items: [4, 5, 6],
      expect: { key: { '': [1, 2, 3], x: [4, 5, 6] } },
      it: 'relocates items for keys that are prefixes of new keys'
    },
    {
      input: { keyx: [1, 2, 3] },
      key: 'key',
      items: [4, 5, 6],
      expect: { key: { x: [1, 2, 3], '': [4, 5, 6] } },
      it: 'relocates items for keys that are prefixed by new keys'
    },
    {
      input: { key: [1, 2, 3] },
      key: 'subtrie',
      items: { x: [4, 5, 6] },
      expect: { key: [1, 2, 3], subtrie: { x: [4, 5, 6] } },
      it: 'can add disjoint subtries'
    }
  ];

  tests.forEach(test => {
    it(test.it, () => {
      const trie = add(test.input, test.key, test.items);
      expect(trie).to.eql(test.expect);
    });
  });

  it('does not modify the input trie', () => {
    tests.forEach(test => {
      const input = JSON.parse(JSON.stringify(test.input));
      add(test.input, test.key, test.items);
      expect(test.input).to.eql(input);
    });
  });

});

describe('trie#flatten(trie)', () => {

  it('returns a flat object with all keys of the nested trie', () => {
    const trie = {
      one: {
        '': [1, 2, 3],
        s: [4]
      },
      t: {
        wo: [5, 6, 7],
        hree: [8, 9]
      }
    };

    expect(flatten(trie)).to.eql({
      one: [1, 2, 3],
      ones: [4],
      two: [5, 6, 7],
      three: [8, 9]
    });
  });

});

describe('trie#match(trie, key[, output])', () => {

  it('returns a map possible suffixes the given key', () => {
    const trie = {
      one: {
        '': [1, 2, 3],
        s: [4]
      },
      t: {
        wo: [5, 6, 7],
        hree: [8, 9]
      }
    };

    expect(match(trie, 'onesie')).to.eql({
      sie: [1, 2, 3],
      ie: [4]
    });
  });

  it('appends items into the output if it is a list', () => {
    const trie = {
      one: {
        '': [1, 2, 3],
        s: [4]
      },
      t: {
        wo: [5, 6, 7],
        hree: [8, 9]
      }
    };

    expect(match(trie, 'onesie', [])).to.eql([1, 2, 3, 4]);
  });

});

describe('trie([root])', () => {
  it('creates a wrapper built of the above methods', () => {
    const trie = create();
    expect(trie.flatten).to.be.a('function');
    expect(trie.match).to.be.a('function');
    expect(trie.add).to.be.a('function');

    trie.add('one', 1, 2, 3);
    trie.add('ones', 4);
    expect(trie.flatten()).to.eql({ one: [1, 2, 3], ones: [4] });
    expect(trie.match('onesie', [])).to.eql([1, 2, 3, 4]);
  });
});
