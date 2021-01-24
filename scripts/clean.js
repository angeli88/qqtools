const util = require('util');
const glob = require('glob');
const path = require('path');
const { promises: fs } = require('fs');
const fse = require('fs-extra');
const { version } = require('../lerna.json');

const globPromise = util.promisify(glob);

const cwd = path.join(__dirname, '../');
const build = path.join(cwd, 'build');

async function clean() {
  // 删除mac
  /*
  const macFiles = await globPromise(path.join(build, 'mac/mac/qqtools.app/Contents/Resources/*.lproj'));
  const macDeleteTasks = [];

  macFiles.forEach((o) => !/zh_CN/i.test(o) && macDeleteTasks.push(fse.remove(o)));

  await Promise.all(macDeleteTasks);
  */

  // 删除win
  const winFiles = await globPromise(path.join(build, 'win/win-unpacked/locales/*.pak'));
  const winDeleteTasks = [];

  winFiles.forEach((o) => !/zh-CN/i.test(o) && winDeleteTasks.push(fse.remove(o)));

  await Promise.all(winDeleteTasks);

  // 写入版本号
  // await fs.writeFile(path.join(build, 'mac/mac/version'), `v${ version }`);
  await fs.writeFile(path.join(build, 'win/win-unpacked/version'), `v${ version }`);

  // 重命名
  // await fs.rename(path.join(build, 'mac/mac'), path.join(build, `mac/qqtools-mirai-${ version }-mac`));
  await fs.rename(path.join(build, 'win/win-unpacked'), path.join(build, `win/qqtools-mirai-${ version }-winx64`));
}

clean();