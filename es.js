#!/usr/bin/env node

let { argv, exit, stdin } = process;
let [opt, code] = argv.slice(2);
if (typeof code === 'undefined') {
  code = opt;
} else {
  opt = opt.split('').slice(1).reduce((opts, flag) => {
    opts[flag] = true;
    return opts;
  }, {});
}
const _g = 'fs,os,path,util'.split(',').reduce((ctx, k) => {
  ctx[k] = require(k);
  return ctx;
}, { $: require });
const _eval = chunk => {
  const input = chunk.trim().replace(/\r\n/g, '\n').split('\n');
  (opt['a'] ? [input] : input).forEach(self => {
    with (_g) {
      with (self) {
        const ret = eval(code);
        ret && console.log(('' + ret).trim());
      }
    }
  });
};

if (/^-(a|s|as|sa)$/.test(code) || code.trim() === '') { exit(1) } else {
  if (opt['s']) {
    stdin.on('data', chunk => _eval('' + chunk));
  } else {
    let buf = '';
    stdin.on('data', chunk => { buf += chunk });
    stdin.on('end', () => _eval(buf));
  }
}
