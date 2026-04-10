/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
  const map = new Map();
  for (const index in nums) {
      const currentVal = nums[index]
      const needVal = target - currentVal;
      const needValIndex = map.get(needVal);
      map.set(currentVal, index);
      
      if (needValIndex !== undefined ) {
          return [index, needValIndex]
      }
  }
};