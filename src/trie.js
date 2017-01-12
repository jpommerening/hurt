/**
 * A prefix tree supporting add and filter operations.
 * Inner nodes are represented as objects mapping prefixes to subtrees.
 * Leaf-nodes are arrays containing potential matches.
 */
export default function trie(root = {}) {
  return {
    flatten() {
      return flatten(root);
    },
    match(key) {
      return match(root, key);
    },
    add(key, ...items) {
      return root = add(root, key, items);
    }
  };
}

/**
 * Return a new trie containing the items of the given trie plus
 * the given items stored at the given key.
 */
export function add(trie, key, items) {
  if (!trie || (Array.isArray(trie) && trie.length === 0)) {
    return key ? { [ key ]: items } : items;
  }

  if (Array.isArray(trie)) {
    return key ? { '': trie, [ key ]: items } : trie.concat(items);
  }

  if (!key) {
    return {
      ...trie,
      '': add(trie[''], '', items)
    };
  }

  for (const k in trie) {
    if (k && trie.hasOwnProperty(k)) {
      const p = prefix(k, key);

      if (p === k) {
        return {
          ...trie,
          [ p ]: add(trie[k], key.substr(p.length), items)
        };
      }
      else if (p) {
        return rmprop(k, {
          ...trie,
          [ p ]: {
            [ k.substr(p.length) ]: trie[k],
            [ key.substr(p.length) ]: items
          }
        });
      }
    }
  }

  return {
    ...trie,
    [ key ]: items
  };
}

/**
 * Return a map of all items whose keys are prefixes of the given key.
 * Place matching items in a map, where the key is the suffix of the given
 * key that exceeds the prefix.
 * For example, when filtering with '/users/123', with an item '/users/'
 * and an item '/users/123' present, the result will be a map containing the
 * key '123' pointing to the value stored at '/users' and the key '' pointing
 * to the value stored at '/users/123'.
 */
export function match(trie, key, output = {}) {
  if (Array.isArray(trie)) {
    if (Array.isArray(output)) {
      Array.prototype.push.apply(output, trie);
    }
    else {
      output[ key ] = trie;
    }
  }
  else {
    Object.keys(trie)
      .filter(k => (key.substr(0, k.length) === k))
      .forEach(k => match(trie[k], key.substr(k.length), output));
  }
  return output;
}

/**
 * Return a map of all stored keys and values as a plain object.
 */
export function flatten(trie, key = '', output = {}) {
  if (Array.isArray(trie)) {
    output[ key ] = trie;
  }
  else {
    Object.keys(trie)
      .forEach(k => flatten(trie[k], key + k, output));
  }
  return output;
}

/**
 * Remove the given property from the object and return the object.
 */
function rmprop(prop, obj) {
  delete obj[prop];
  return obj;
}

/**
 * Return the common prefix of strings a and b.
 */
function prefix(a, b) {
  let i;
  for (i = 0; a[i] === b[i] && i < a.length; i++);
  return a.substr(0, i);
}
