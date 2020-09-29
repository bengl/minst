const { spawnSync } = require('child_process');
const { join, sep } = require('path');

const beginning = `
SHELL := /bin/bash
AT := @

define get
	@mkdir -p $1
	@cd $1
	@curl $2 2> /dev/null | tar -xz 2> /dev/null
	@export tar_dir=\`ls -d */ | grep -v node_modules\`
	@shopt -s dotglob
	@mv $$tar_dir* .
	@rmdir $$tar_dir
endef

all:\\
`;

const recipes = '\n';

module.exports = class MakefileMaker {
  constructor() {
    this.beginning = beginning;
    this.recipes = recipes;
  }

  addEntry(mod, name, destDir) {
    const url = esc(mod.resolved);
    const target = esc(join(destDir, 'package.json'));
    this.beginning += `    ${target}\\\n`;
    this.recipes += `
.ONESHELL:
${target}:${getDep(target)}
	$(call get,${esc(destDir)},${url})
`;

  }

  out() {
    return ['Makefile', this.beginning + this.recipes];
  }

  build(filename) {
    return spawnSync('make', ['-j', '-f', filename], { stdio: 'inherit' });
  }
};

function esc(str) {
  return str.replace(/@/g, '$(AT)');
}

function getDep(target) {
  // This whole function isn't strictly necessary, but by depending on
  // higher-level directories, it prevents `mkdir -p` from having to build up
  // too many parent directories before it can do subdirectories.
  const splitted = target.split(sep);
  let popped;
  while (popped !== 'node_modules') {
    popped = splitted.pop();
  }
  splitted.push('package.json');
  return splitted.length > 1 ? ' ' + splitted.join(sep) : '';
}
