const { sep } = require('path');

module.exports = class Maker {
  getDep(target) {
    // This whole function isn't strictly necessary, but by depending on
    // higher-level directories, it prevents `mkdir -p` from having to build up
    // too many parent directories before it can do subdirectories.
    const splitted = target.split(sep);
    let popped;
    while (popped !== 'node_modules') {
      popped = splitted.pop();
    }
    splitted.push('package.json');
    return splitted;
  }

  out() {
    return [this.file, this.body];
  }
};
