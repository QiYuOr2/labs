import { defineConfig } from 'tsup';
import type { Options } from 'tsup';
import fs from 'fs';

type ArrayItem<T> = T extends Array<infer U> ? U : never;
type Plugin = ArrayItem<Options['esbuildPlugins']>;

/**
 * 迁移UserScript注释
 */
function UserScriptPlugin(): Plugin {
  let userScriptComment = '';

  return {
    name: 'userScriptPlugin',
    setup(build) {
      // 在load阶段提取UserScript注释
      build.onLoad({ filter: /.*/ }, (args) => {
        const contents = fs.readFileSync(args.path, 'utf8');
        const match = contents.match(/(\/\/ ==UserScript==[\s\S]*?\/\/ ==\/UserScript==)/);
        if (match) {
          userScriptComment = match[0];
        }
        return null;
      });

      // 在end阶段将UserScript注释添加到打包后的文件顶部
      build.onEnd(async (result) => {
        if (userScriptComment && result.outputFiles) {
          const outputFile = result.outputFiles[0];
          outputFile.contents = new Uint8Array(Buffer.from(userScriptComment + '\n' + Buffer.from(outputFile.contents).toString('utf8')));
        }
      });
    },
  };
}

export const config: Options = {
  entry: ['./src/*.ts'],
  format: ['iife'],
  dts: true,
  splitting: false,
  clean: true,
  minify: true,
  sourcemap: false,
  esbuildPlugins: [UserScriptPlugin()],
};

export default defineConfig(config);
