// @flow
const isPlainObject = require('is-plain-object');

export default function filter(value: any, fn: Function) {
  if (Array.isArray(value)) {
    return filterArray(value, fn);
  }
  if (isPlainObject(value)) {
    return filterObject(value, fn);
  }

  return value;
}

function filterObject(obj, fn) {
  const newObj = {};
  // let key;
  let value;

  Object.keys(obj).forEach(key => {
    value = filter(obj[key], fn);

    if (fn.call(obj, value, key, obj)) {
      if (value !== obj[key] && !isCollection(value)) {
        value = obj[key];
      }

      newObj[key] = value;
    }
  });

  return newObj;
}

function filterArray(arrayToFilter, fn) {
  const filtered = [];

  arrayToFilter.forEach((value: any, index: any, array: any) => {
    let newValue = filter(value, fn);

    if (fn.call(array, value, index, array)) {
      if (value !== array[index] && !isCollection(value)) {
        newValue = array[index];
      }

      filtered.push(newValue);
    }
  });

  return filtered;
}

function isCollection(value) {
  return Array.isArray(value) || isPlainObject(value);
}
