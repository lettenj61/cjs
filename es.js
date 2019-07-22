#!/usr/bin/env node
const { existsSync } = require('fs');
const path = require('path');
const { homedir } = require('os');

const { argv, exit, stdin } = process;
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
const __eval = chunk => {
  const input = ('' + chunk).trim().split(/\r?\n/g);
  (opt['a'] ? [input] : input).forEach(self => {
    with (__es_global__) {
      with (self) {
        const ret = eval(code);
        ret && console.log(('' + ret).trim());
      }
    }
  });
};

if (/^-(a|s|as|sa)$/.test(code) || code.trim() === '') {
  exit(1);
} else {
  // read rc file
  [path.join(homedir(), '.es', 'config.js')]
    .filter(existsSync)
    .forEach(m => require(m));

  if (opt['s']) {
    stdin.on('data', chunk => __eval(chunk));
  } else {
    let buf = '';
    stdin.on('data', chunk => {
      buf += chunk;
    });
    stdin.on('end', () => __eval(buf));
  }
}
