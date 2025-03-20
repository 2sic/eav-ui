import isEqual from 'lodash-es/isEqual';
import isObject from 'lodash-es/isObject';
import transform from 'lodash-es/transform';
// https://gist.github.com/Yimiprod/7ee176597fef230d1451?permalink_comment_id=2569085

/**
 * This code is licensed under the terms of the MIT license
 *
 * Deep diff between two object, using lodash
 * @param  {Object} object Object compared
 * @param  {Object} base   Object to compare with
 * @return {Object}        Return a new object who represent the diff
 */
export function difference(object: any, base: any) {
  function changes(object: any, base: any) {
    return transform(object, function (result: Record<string, any>, value, key: string) {
      if (!isEqual(value, base[key])) {
        result[key] = (isObject(value) && isObject(base[key])) ? changes(value, base[key]) : value;
      }
    });
  }
  return changes(object, base);
}
