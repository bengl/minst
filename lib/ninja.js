const { join, sep } = require('path');
const { spawnSync } = require('child_process');
const Maker = require('./maker.js');

const beginning = `
rule get
  command = mkdir -p $destdir && cd $destdir && curl $url 2> /dev/null | tar -xz --strip-components=1 2> /dev/null

`;

module.exports = class NinjaMaker extends Maker {
  constructor() {
    super();
    this.body = beginning;
  }

  addEntry(mod, destDir) {
    const url = mod.resolved;
    const target = join(destDir, 'package.json');
    this.body += `
build ${target}: get${this.getDep(target)}
  destdir = ${destDir}
  url = ${url}
`;
  }

  get file () {
    return 'build.ninja';
  }

  build(filename) {
    return spawnSync('ninja', ['-f', filename])
  }

  getDep(target) {
    const splitted = super.getDep(target);
    return splitted.length > 1 ? ' || ' + splitted.join(sep) : '';
  }
};
