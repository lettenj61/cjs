#!/usr/bin/env node
const { existsSync } = require('fs');
const path = require('path');
const readline = require('readline');
const { homedir } = require('os');

const { argv, exit, stdin, stdout } = process;
let [opts, ...code] = argv.slice(2);
if (code.length === 0) {
  handleHelp(opts);
  code = opts;
} else {
  if (opts[0] === '-') {
    code = code.join('; ');
    opts = opts
      .split('')
      .slice(1)
      .reduce((opts, flag) => {
        opts[flag] = true;
        return opts;
      }, {});
  } else {
    code = [opts, ...code].join('; ');
    opts = {};
  }
}
const __cjs_global__ = {
  $: require,
  $$: req => require(require.resolve(req, { paths: [process.cwd()] }))
};

function __eval(self) {
  with (__cjs_global__) {
    with (self) {
      const ret = eval(code);
      if (ret != null) {
        if (opts['p']) {
          console.log(ret);
        } else {
          stdout.write(Buffer.isBuffer(ret) ? ret : '' + ret);
        }
      }
    }
  }
}

function __run(chunk) {
  let input = opts['b'] ? chunk : ('' + chunk).trim();
  if (opts['l'] || opts['a']) {
    input = input.split(/\r?\n/g);
  }
  (opts['l'] ? input : [input]).forEach(__eval);
}

function handleHelp(opts1) {
  if (opts1 === '-v' || opts1 === '--version') {
    console.error('0.0.3');
    exit(0);
  }

  if (opts1 === '-h' || opts1 === '--help') {
    console.error('usage: cjs -abdlps|-h,--help|-v,--version');
    exit(0);
  }
}

function main() {
  if (opts['v']) {
    console.error('0.0.3');
    exit(0);
  }
  if (code == null || /^-[\w]+$/.test(code)) {
    console.error(`invalid code: "${code}"`);
    exit(1);
  } else {
    // read rc file
    [path.join(homedir(), '.cjs', 'config.js')].filter(existsSync).forEach(m => require(m));

    if (opts['d']) {
      const longOpts = {
        'a': 'array',
        'b': 'buffer',
        'd': 'debug',
        'l': 'line',
        'p': 'pretty',
        's': 'stream'
      };
      console.error({
        options: Object.keys(opts).map(s => longOpts[s] || `unknown(${s})`),
        code
      });
    }

    if (opts['l'] && opts['s']) {
      const rl = readline.createInterface({
        input: stdin,
        output: null,
        historySize: 0,
        prompt: ''
      });

      rl.on('line', line => {
        if (opts['a']) {
          line = line.split(/\s/g);
        }
        __eval(line);
      })
    } else if (opts['s']) {
      stdin.on('data', chunk => {
        let input = opts['b'] ? chunk : '' + chunk;
        if (opts['a']) {
          input = input.split(/\s/g);
        }
        __eval(input);
      });
    } else {
      const buffs = [];
      stdin.on('data', chunk => {
        buffs.push(opts['b'] ? chunk : '' + chunk);
      });
      stdin.on('end', () => {
        opts['b'] ? __run(Buffer.concat(buffs)) : __run(buffs.join(''));
      });
    }
  }
}

if (__filename === argv[1]) {
  main();
}
