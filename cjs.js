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
          stdout.write(Buffer.isBuffer(ret) ? ret : ret.toString());
        }
      }
    }
  }
}

function __run(chunk) {
  let input = '' + chunk;
  if (opts['t']) {
    input = input.trim();
  }
  if (!opts['c'] && opts['a']) {
    input = input.split(/\s/g);
  }
  [input].forEach(__eval);
}

function handleHelp(opts1) {
  if (opts1 === '-v' || opts1 === '--version') {
    console.error('0.0.3');
    exit(0);
  }

  if (opts1 === '-h' || opts1 === '--help') {
    console.error('usage: cjs [-abcdpt|-h,--help|-v,--version] <code>...');
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
        'c': 'concat',
        'd': 'debug',
        'p': 'pretty',
        't': 'trim'
      };
      console.error({
        options: Object.keys(opts).map(s => longOpts[s] || `unknown(${s})`),
        code
      });
    }

    if (opts['b']) {
      const buff = [];
      stdin.on('data', chunk => buff.push(chunk));
      stdin.on('end', () => {
        __eval(Buffer.concat(buff));
      });
    } else {
      const rl = readline.createInterface({
        input: stdin,
        output: null,
        historySize: 0,
        prompt: ''
      });

      rl.on('SIGINT', () => process.exit(1));

      if (opts['c']) {
        const lines = [];
        rl.on('line', line => lines.push(line));
        rl.on('close', () => {
          if (opts['a']) {
            __eval(lines);
          } else {
            __run(lines.join('\n'));
          }
        });
      } else {
        rl.on('line', __run);
      }
    }
  }
}

if (__filename === argv[1]) {
  main();
}
