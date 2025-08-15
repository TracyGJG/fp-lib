export function compose(...functions) {
  return (args) => functions.reduce((arg, fn) => fn(arg), args);
}

export function curry(fn, ...args) {
  return args.length === fn.length
    ? fn(...args)
    : (..._args) => curry(fn, ...args, ..._args);
}

const PROPERTY_DECONSTRUCTION = /\]?\??\.\[?|\]?\[|\]/;
const PROPERTY_STRING_OR_ARRAY_DIGITS = /^(\"([^"]{1,1000})\")|(\d{1,10})$/;
const removeWrappingDoubleQuites = (str) => str.replaceAll(/^"|"$/g, '');
const lensReducer = (ob, pr) =>
  PROPERTY_STRING_OR_ARRAY_DIGITS.exec(pr)
    ? ob[removeWrappingDoubleQuites(pr)]
    : ob?.[pr];

export function lens(...props) {
  const _props = props
    .join('.')
    .split(PROPERTY_DECONSTRUCTION)
    .filter((item) => item !== '');

  return (obj) => _props.reduce(lensReducer, obj);
}

export function lensFn(fn, ...props) {
  const propLens = lens(...props);
  return (obj) => {
    const prop = propLens(obj);
    if (undefined !== prop) {
      return fn(prop, obj);
    }
  };
}

export function memoise(fn, _cache = new Map()) {
  return (...args) => {
    const key = JSON.stringify(args);
    !_cache.has(key) && _cache.set(key, fn(...args));
    return _cache.get(key);
  };
}

export function tap(fn) {
  return (datum) => fn(datum) ?? datum;
}
