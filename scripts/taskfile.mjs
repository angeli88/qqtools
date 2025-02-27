import process from 'node:process';
import path from 'node:path';
import { createRequire } from 'node:module';
import ncc from '@vercel/ncc';
import fse from 'fs-extra';
import { rimraf } from 'rimraf';
import { requireJson } from '@sweet-milktea/utils';
import { appDir } from './utils.mjs';
import packageJson from '../app/package.json' assert { type: 'json' };

const require = createRequire(import.meta.url);

const argv = process.argv.slice(2);

/* 文件路径 */
const appNodeModules = path.join(appDir, 'node_modules'); // app文件夹的node_modules

/**
 * ncc文件编译
 * @param { string } input: 文件路径
 * @param { string } output: 输出目录
 */
async function nccBuild(input, output) {
  const { code } = await ncc(input, {
    minify: true,
    externals: ['electron']
  });

  await fse.outputFile(output, code);
}

/**
 * 根据依赖名称生成文件
 * @param { string } dependenciesName: 依赖名称
 */
async function createFilesByDependenciesName(dependenciesName) {
  const dependenciesDir = path.join(appNodeModules, dependenciesName); // 模块的输出目录
  const dependenciesNodeModulesDir = path.join(path.parse(require.resolve(dependenciesName))
    .dir.split(/node_modules/)[0], 'node_modules', dependenciesName); // 模块在node_modules中的原位置

  await fse.ensureDir(dependenciesDir); // 创建目录
  await nccBuild(require.resolve(dependenciesName), path.join(dependenciesDir, 'index.js')); // 编译文件

  const depPackageJson = await requireJson(path.join(dependenciesNodeModulesDir, 'package.json'));

  await fse.writeJSON(path.join(dependenciesDir, 'package.json'), {
    name: dependenciesName,
    version: depPackageJson.version,
    main: 'index.js',
    license: depPackageJson.license,
    author: depPackageJson.author
  });
}

async function taskFile() {
  await rimraf(appNodeModules);

  // 创建目录和文件
  for (const depName of Object.keys(packageJson.dependencies)) {
    console.log(`正在编译模块：${ depName }...`);
    await createFilesByDependenciesName(depName);
  }
}

export default taskFile;

if (argv[0] === 'build') {
  taskFile();
}