es
===

Tiny command helps you run Node.js one-liners (for version 8+).

Heavily inspired from [rb][github/rb].

## Full source

```javascript
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
}, {
  $: require,
  $$: req => require(require.resolve(req, { paths: [process.cwd()] }))
});
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
```

## Installation

First, grab the code by:

* Copy code above and save it as `es`, or,
* Clone this repository and copy `es.js` and rename to `es`

And put it somewhere else on your `$PATH`. Don't forget to give execute permission (if you're on Linux / maxOS).

For Windows users, I wrote wrapper script `es.cmd`.

## Usage

```sh
$ es [options] <code>
```

`es` evaluate JavaScript `code` you give, just like `node -p` command. Only difference is it apply evaluated code against inputs from `STDIN`.

### Behavior

If no options specified, it process input for each **line**, refer current value as `self`, treat as if it is a `string`.

This means you can call any method of `String.prototype` for `self`.

```sh
$ ls -1 | es 'self.toUpperCase().repeat(2)'
BIN/BIN/
LIB/LIB/
WORKSPACE/WORKSPACE/
```

It uses infamous JavaScript `with` statement, so if you don't mind, you don't have to write `self` at all.

```sh
$ ls -1 | es 'toUpperCase().repeat(2)'
```

If the `code` returns some value when it's get evaluated, `es` will print the result with coercing it to `string`. If the code returns nothing (`undefined`), it won't print anything. When you prefer to use `Node.js` console formatters (and colored outputs), you can use `console.log` in `code` argument:

```sh
$ echo 'hello' | es 'console.log({ value: self })'
{ value: 'hello' }
```

### Array context

With `-a` option, it treats input as `Array` of `string`s which contains each line of input string. In this mode `self` is refer to the `Array` object.

```sh
$ ls -1 | es -a 'slice(0, 2)'
```

Note that `es` would still coerce return value to `string` when `-a` is enabled, so you might want to `join('\n')` explicitly if you pipe the result to something else (e.g. another `es` call).

```sh
$ seq 4 | es -a 'map(v => parseInt(v) + 1)'
2,3,4,5

$ seq 4 | es -a 'map(v => parseInt(v) + 1).join("\n")'
2
3
4
5
```

### Modules

In `es` one-liner, some `Node.js` builtin modules exposed to global scope. They are:

* [OS][docs/os] (as `os`)
* [Path][docs/path] (as `path`)
* [Utilities][docs/util] (as `util`)

Example:

```sh
$ ls -1 | es 'path.resolve(self)'
/home/ubuntu/bin
/home/ubuntu/lib
/home/ubuntu/workspace
```

If you find yourself wishing another builtin modules, `es` expose `require` as `$`.

```sh
$ cat package.json | es -a '$("querystring").stringify(JSON.parse(join("")))'
name=es&version=0.1.0&description=Sketchy%20replacement%20and%20extension%20for%20%60node%20-p%60&author=lettenj61&license=MIT
```

### Streaming

`es` buffers input by default. It means the code gets evaluated **after** it consumes `STDIN` completely. If you don't want this, use `-s` switch to apply code immediately for each `data` it read.

```sh
$ ping 127.0.0.1 -c 6 | es -s 'match(/\d+ bytes/)'
64 bytes
64 bytes
...
```

## License

MIT

[github/rb]:https://github.com/thisredone/rb
[docs/os]:https://nodejs.org/api/os.html
[docs/path]:https://nodejs.org/api/path.html
[docs/util]:https://nodejs.org/api/util.html
