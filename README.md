# coc-rime

Rime input method integration of coc.nvim

[中文 README](https://github.com/tonyfettes/coc-rime/blob/master/README.zh_cn.md)

![screenshot](https://user-images.githubusercontent.com/29998228/95216680-f1974680-0824-11eb-94cb-83a8d9a5b59d.gif)

## Install

First you need to install my version of [`rime-cli`](https://github.com/tonyfettes/rime-cli).

You could clone the repo and `make` to get the binary file,
or, if you use Arch Linux, you could use
[this `PKGBUILD`](https://github.com/tonyfettes/pkgbuild/blob/master/rime-cli-git/PKGBUILD).

For now, the only to install the plugin is to clone the repo and run `yarn`,
and add the path of this plugin to your vim's `runtimepath`.

## Keymaps

No keymaps for now, maybe in the future we could let
user to turn of the source.

## Lists

You could use `CocList` to switch between schema.

```vim
:CocList rime_schema
```

## License

MIT

---

> This extension is created by [create-coc-extension](https://github.com/fannheyward/create-coc-extension)
