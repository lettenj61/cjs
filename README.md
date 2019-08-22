cjs
===

Tiny command helps you write pipeable Node.js one-liners (for version 8+).

Heavily inspired from [rb][github/rb].


## Installation

First, grab the code by clone this repository, rename `cjs.js` to `cjs`.

And put it somewhere else on your `$PATH`. Don't forget to give execute permission (if you're on Linux / maxOS).

For Windows users, I wrote wrapper script `cjs.cmd`.


## Usage

```sh
$ cjs --help
usage: cjs [-abcdps|-h,--help|-v,--version] <code>...
```

`cjs` evaluate JavaScript `code` you give, just like `node -p` command. Only difference is it apply evaluated code against inputs from `STDIN`.

In your code, input data can be referenced as `self`. The code will be wrapped in `with` statement, so you may omit `self` identifier completely.

Following 2 snippet produce same result:

```sh
$ ls -1 | cjs -p 'self.toUpperCase().repeat(2)'
```

```sh
$ ls -1 | cjs -p 'toUpperCase().repeat(2)'
```


## Input handling

* default: Decode input as `String`, process code for each line (with `readline` module).
* `-c`: Input will be buffered and concatenated into single string.
* `-a`: Convert input to array. By default, split each line on whitespace (regular expression `/\s/g`). When with `-c`, split entire input into lines.
* `-b`: Treat input as raw `Buffer`. Input will be buffered and concatenated before the code get evaluated.
* `-t`: Trim each line.


## Output format

If the `code` returns some value, `cjs` will print the result (with coercing it to `string`). If the code returns nothing (`null` or `undefined` value), it won't print anything.

If you prefer to use Node.js console formatters (and colored outputs), you can give `-p` option to use `console.log`:

```sh
$ cat package.json | cjs -c 'JSON.parse(self)'
[object Object]

$ cat package.json | cjs -cp 'JSON.parse(self)'
{
  name: 'cjs',
  version: '0.0.3',
  description: 'Sketchy replacement and extension for `node -p`',
  author: 'lettenj61',
  license: 'MIT',
  devDependencies: { '@types/node': '^12.7.2', typescript: '^3.5.3' }
}
```


## Configuration file

`cjs` will look for preamble script `~/.cjs/config.js`. If it find one, `require` it automatically.

It is useful when you need some extra dependency or setup code before executing scripts.


## Modules

`cjs` expose `require` as `$` and `require.resolve` as `$$` to use them within one-liners.

```sh
$ cat package.json | cjs -c 'val = JSON.parse(self)' '$("querystring").stringify(val)'
name=cjs&version=0.0.3&description=Sketchy%20replacement%20and%20extension%20for%20%60node%20-p%60&author=lettenj61&license=MIT&devDependencies=
```


## License

MIT


[github/rb]:https://github.com/thisredone/rb
