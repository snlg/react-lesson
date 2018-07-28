const isString = (str) => {
  return (typeof str == 'string') && str.constructor == String;
}
const isArray = (obj) => {
  return toString.call(obj) === '[object Array]'
}

const isObject = (obj) => {
  return toString.call(obj) === '[object Object]'
}

const isFunction = (obj) => {
  return toString.call(obj) === '[object Function]'
}

export { isString, isArray, isObject, isFunction }