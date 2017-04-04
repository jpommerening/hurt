export function noop() {}

export function replace(list, item, old) {
  const index = list.indexOf(old);

  if( index < 0 ) {
    list.push(item);
  } else {
    list[ index ] = item;
  }
  return item;
}
