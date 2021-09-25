const { spawnSync } = require('child_process');
const { join, sep } = require('path');
const Maker = require('./maker.js');

const beginning = `
AT := @

define get
	@mkdir -p $1
	@cd $1
	@curl $2 2> /dev/null | tar -xz --strip-components=1 2> /dev/null
endef

all:\\
`;

const recipes = '\n';

module.exports = class MakefileMaker extends Maker {
  constructor() {
    super();
    this.beginning = beginning;
    this.recipes = recipes;
  }

  addEntry(mod, destDir) {
    const url = esc(mod.resolved);
    const target = esc(join(destDir, 'package.json'));
    this.beginning += `    ${target}\\\n`;
    this.recipes += `
.ONESHELL:
${target}:${this.getDep(target)}
	$(call get,${esc(destDir)},${url})
`;

  }

  get file () {
    return 'Makefile';
  }

  get body () {
    return this.beginning + this.recipes;
  }

  build(filename) {
    return spawnSync('make', ['-j', '-f', filename]);
  }

  getDep(target) {
    const splitted = super.getDep(target);
    return splitted.length > 1 ? ' ' + splitted.join(sep) : '';
  }
};

function esc(str) {
  return str.replace(/@/g, '$(AT)');
}
