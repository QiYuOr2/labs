#!/usr/bin/env zx

import 'zx/globals';

const args = argv._;

if (args.length === 0) {
  console.log("请输入目标文件名（可带或不带 .mkv）");
  console.log(`用法: zx ${process.argv[1]} <文件名>`);
  exit(1);
}

let input = args[0];
if (!input.endsWith('.mkv')) input += '.mkv';

const output = input.replace(/\.mkv$/, '');

if (!(await fs.exists(input))) {
  console.error(`文件不存在: ${input}`);
  exit(1);
}

if (await fs.exists(`${output}.mp4`)) {
  const choice = await question(`文件 ${output}.mp4 已存在，是否覆盖？(y/N): `);
  if (choice.trim().toLowerCase() !== 'y') {
    console.log("已取消转换");
    exit(0);
  }
}

console.log(`正在转换 ${input} → ${output}.mp4 ...`);
try {
  await $`ffmpeg -i ${input} -vcodec copy -acodec copy ${output}.mp4`;
  console.log(`转换完成: ${output}.mp4`);
} catch {
  console.error("转换失败，请检查 ffmpeg 输出信息");
}
