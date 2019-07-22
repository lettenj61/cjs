es
===

Tiny command helps you run Node.js one-liners (for version 8+).

Heavily inspired from [rb][github/rb].


## Installation

First, grab the code by clone this repository, rename `es.js` to `es`.

And put it somewhere else on your `$PATH`. Don't forget to give execute permission (if you're on Linux / maxOS).

For Windows users, I wrote wrapper script `es.cmd`.


## Usage

```sh
$ es (-s,-a) <code>
```

`es` evaluate JavaScript `code` you give, just like `node -p` command. Only difference is it apply evaluated code against inputs from `STDIN`.


### Behavior

If no options specified, it processes input for each **line**, refer current value as `self`, treating it as a `string`.

This means you can call any method of `String.prototype` for `self`.

```sh
$ ls -1 | es 'self.toUpperCase().repeat(2)'
BIN/BIN/
LIB/LIB/
WORKSPACE/WORKSPACE/
```

In fact, it wraps `self` reference in `with` statement, so if you don't mind, you don't have to write `self` at all.

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


### RC File

`es` will look for preamble script `~/.es/config.js`. If it find one, `require` it automatically.

It is useful when you need some extra dependency or setup code before executing `es`.


### Modules

`es` expose `require` as `$` and `require.resolve` as `$$` to use them within one-liners.

```sh
$ cat package.json | es -a '$("querystring").stringify(JSON.parse(join("")))'
name=es&version=0.1.0&description=Sketchy%20replacement%20and%20extension%20for%20%60node%20-p%60&author=lettenj61&license=MIT
```


### Streaming

`es` buffers input by default. It means the code gets evaluated **after** it consumes `STDIN` completely. If you don't want this, use `-s` switch to apply code immediately for each `data` it just read.

```sh
$ ping 127.0.0.1 -c 6 | es -s 'match(/\d+ bytes/)'
64 bytes
64 bytes
...
```


## License

MIT


[github/rb]:https://github.com/thisredone/rb
