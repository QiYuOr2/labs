/**
 * 暴力解法为两次循环判断每个序列的长度，时间复杂度最差为 O(n^2) \
 * 实际上如果循环时，开始统计的数字位于序列的 x + y 位置，也就是非序列的开头，那么统计出来的长度一定不会大于在开头统计的长度 \
 * 因此只需要统计序列开头的数字所在序列的长度，其他数字可以跳过
 * ---
 * 判断每个数字是否为序列的开头，即是否存在 num - 1 \
 * 如果是开头，记录其所在序列长度 \ 
 * 使用 set 去重的情况下能保证所有数字都只进入内循环一次
 * ---
 * @param {number[]} nums
 * @return {number}
 */
var longestConsecutive = function(nums) {
  const set = new Set();
  let longesetLength = 0;
  for (const num of nums) {
    set.add(num);
  }

  for (const num of set) {
    if (!set.has(num - 1)) {
      let currentLength = 1;
      let currentNum = num
      while(set.has(currentNum + 1)) {
        currentLength += 1;
        currentNum += 1;
      }

      longesetLength = Math.max(currentLength, longesetLength)
    }
  }

  console.log(longesetLength)
};

longestConsecutive([100,4,200,1,3,2])