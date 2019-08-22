#!/usr/bin/env node
const { existsSync } = require('fs');
const path = require('path');
const { homedir } = require('os');

const { argv, exit, stdin, stdout } = process;
let [opt, ...code] = argv.slice(2);
if (code.length === 0) {
  code = opt;
} else {
  if (opt[0] === '-') {
    code = code.join('; ');
    opt = opt
      .split('')
      .slice(1)
      .reduce((opts, flag) => {
        opts[flag.toLowerCase()] = true;
        return opts;
      }, {});
  } else {
    code = [opt, ...code].join('; ');
    opt = {};
  }
}
const __es_global__ = {
  $: require,
  $$: req => require(require.resolve(req, { paths: [process.cwd()] }))
};
const __run = chunk => {
  let input = opt['b'] ? chunk : ('' + chunk).trim();
  if (!opt['b'] && !opt['f']) {
    input = input.split(/\r?\n/g);
  }
  (opt['a'] || opt['b'] || opt['f'] ? [input] : input).forEach(self => {
    with (__es_global__) {
      with (self) {
        const ret = eval(code);
        ret != null && stdout.write(Buffer.isBuffer(ret) ? ret : '' + ret);
      }
    }
  });
};

if (code == null || /^-[\w]+$/.test(code)) {
  console.error(`invalid code: "${code}"`);
  exit(1);
} else {
  // read rc file
  [path.join(homedir(), '.cjs', 'config.js')].filter(existsSync).forEach(m => require(m));

  if (opt['s']) {
    stdin.on('data', chunk => __run(chunk));
  } else {
    const buffs = [];
    stdin.on('data', chunk => {
      buffs.push(chunk);
    });
    stdin.on('end', () => __run(Buffer.concat(buffs)));
  }
}
