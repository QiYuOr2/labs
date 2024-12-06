/**
 * @param {string[]} strs
 * @return {string[][]}
 */
var groupAnagrams = function (strs) {
  const map = new Map();
  
  for (let index in strs) {
    const key = strs[index].split('').sort().join('');
    const value = map.get(key) || [];
    value.push(strs[index]);
    map.set(key, value);
  }
  return Array.from(map.values());
};
