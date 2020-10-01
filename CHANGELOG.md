## Vuedoc Markdown v3.0.0

This is the official release of Vuedoc Markdown 3.0.0.
The only change with the previous beta 2 is the requirement to use the
Vuedoc Parser 3.0.0 as a peer dependency.

Please see [release notes of previous betas](https://gitlab.com/vuedoc/md/-/blob/v3.0.0/CHANGELOG.md)
for all changes on Vuedoc Markdown 3.0.0.

## Vuedoc Markdown v3.0.0-beta2

This release improves parsing of props definitions with `@kind function`.
It also requires the latest Vuedoc Parser 3.0.0-beta2.

## Vuedoc Markdown v3.0.0-beta1

This version is the first version with Vuedoc Parser 3.0.0-beta1 support.

**New features**

- Add support of `@version`, `@since`, `@author`, `@deprecated` and `@see`
- Add support of `@description`, `@desc` and `@example`
- Add support of Vuedoc Loader through the `-c,--config` option
- Add option `-w,--wordwrap` to enable word wrapping

**Improvements**

- Add shortcut option `-l` for `--level`
- Add shortcut option `-o` for `--output`
- Add shortcut option `-s` for `--section`
- Add shortcut option `-j` for `--join`

See [README file](https://gitlab.com/vuedoc/md/-/blob/v3.0.0-beta1/README.md#command-line-usage)
to know more about changes and usage.

## Vuedoc Markdown 2.0.0-beta2

This releases adds support of of Vuedoc Parser 2.3.0 and fix parsing of keyword
`@type`

## Vuedoc Markdown 2.0.0-beta1

This is the first beta of the major release of Vuedoc Markdown based on the
latest [Vuedoc Parser v2.2.1](https://gitlab.com/vuedoc/parser/-/releases/v2.2.1). It implements the new [Vuedoc Parser Parsing Output Interface](https://gitlab.com/vuedoc/parser/-/blob/v2.2.1/README.md#parsing-output-interface)
and introduces Markdown Tables.

### Important changes

- Vuedoc Markdown now use Vuedoc Parser as a peer dependency. This means that
  Vuedoc Markdown can now benefit from the improvements of Vuedoc Parser without
  changes. This also means that you will now need to install both `@vuedoc/md`
  and `@vuedoc/parser` packages:

  ```sh
  npm install @vuedoc/parser @vuedoc/md
  ```
- Markdown Tables are now used to render slots, props, data, computed and
  events. See rendering sample: [test/fixtures/checkbox.output.md](https://gitlab.com/vuedoc/md/-/blob/v2.0.0-beta1/test/fixtures/checkbox.output.md)
- Rendering of methods has been drastically improved. The rendering now follow
  the MDN documentation structure. FInd examples in the [README.md file](https://gitlab.com/vuedoc/md/-/blob/v2.0.0-beta1/README.md#generate-a-mdn-like-documentation-for-a-method)
- Section titles are now more human readable:
  - Title `props` is now renamed to `Props`
  - Title `computed` is now renamed to `Computed Properties`
  - Title `data` is now renamed to `Data`
  - Title `methods` is now renamed to `Methods`
  - Title `events` is now renamed to `Events`

### New rendering keywords

Vuedoc Markdown 2.0.0-beta1 introduces specific keywords for methods:
- `@method {name}`: Use this to set a custom method name
- `@syntax {string}`: Use this to set a custom method syntax

**Example**

```js
export default {
  name: 'TextInput',
  methods: {
    /**
     * This use `@method` to set a custom method name and syntax
     * @method String.prototype.match
     * @syntax str.match(regexp)
     */
    match(regexp) {},
    /**
     * Multiple `@syntax` keywords can be used to define a multiline syntax content
     * @syntax target.addEventListener(type, listener [, options]);
     * @syntax target.addEventListener(type, listener [, useCapture]);
     * @syntax target.addEventListener(type, listener [, useCapture, wantsUntrusted  ]); // Gecko/Mozilla only
     */
    addEventListener(type, listener, options, useCapture) {}
  }
}
```

## Vuedoc Markdown v1.6.0

This release adds support of `@type` keyword.

````js
export default {
  props: {
    /**
     * The currency value
     * @type {Currency}
     */
    currency: {
      type: Object
    }
}
````

## Vuedoc Markdown v1.5.0

This release adds new features and bugs fix:

- Add support of `@default` keyword (ffe45df5)
- Allow empty description for events (39e514c5)
- Add `-v` alias for `--version` (04378ada)

## Vuedoc Markdown v1.4.1

This release improves the White Spaces Rendering feature

## Vuedoc Markdown v1.4.0

This release upgrades to `@vuedoc/parser@1.4.0` with a feature to preserve white
spaces

## Vuedoc Markdown v1.3.3

This release fixes rendering of undefined default value and upgrades the
**@vuedoc/parser** to [v1.3.2](https://gitlab.com/vuedoc/parser/tags/v1.3.2)

## Vuedoc Markdown v1.3.1

There are no changes, just a README.md update

## Vuedoc Markdown v1.3.0

This release adds support of [JSDoc](http://usejsdoc.org) with the upgrade of
`@vuedoc/parser@1.3.0`

## Vuedoc Markdown v1.2.0

This release adds support of multiple possible types  and fix some bugs

## Vuedoc Markdown v1.1.1

This release fixes #13 and #14 issues:
- Fix unexpected output when using --version #13 ([c99854d](https://github.com/vuedoc/md/commit/c99854d1745a0ffc5573ad946437881198af8963))
- Fix unexpected output when using --join and STDOUT #14 ([62c06b1](https://github.com/vuedoc/md/commit/62c06b1c96a39591e9c05c3331b738ec66f932bd))

## Vuedoc Markdown v1.1.0

This release uses the last version of `@vuedoc/parser` (`v1.1.0`) and adds two
new options: `--join` and `--version`

### Merge generated documentations #12 ([a266df8](https://github.com/vuedoc/md/commit/a266df87f397f1ddec0128a573b3c283d1866cfe))

It's now possible to merge generated documentations of many components into one.

```sh
vuedoc.md --join FunctionalComponent.js MainComponent.vue --output README.md
```

### Display the `vuedoc.md` version #11 ([79e97a3](https://github.com/vuedoc/md/commit/79e97a38e5fe12f61ff46acd25e96322fae36e78))

Add the `--version` to display the `vuedoc.md` version

```sh
vuedoc.md --version
```

### Bugs fix

- Fix calling with no arguments bug #10 ([759f778](https://github.com/vuedoc/md/commit/759f778bf84e0c3c2e2f6572dd4ab2a08209af32))

## Vuedoc Markdown v1.0.1

This release uses to the last `@vuedoc/parser@1.0.2` which add a support of
Spread Operator and fix some bugs

## Vuedoc Markdown v1.0.0

This major release add a new feature and uses the NodeJS v6.11.2 as default engine.

### Parsing Control
The new `options.features` lets you select which Vue Features you want to parse
and extract using the API.
The CLI usage of this option is `--ignore-[feature]`:

**CLI Usage**
```sh
# parse all features except `name` and `data`
vuedoc.md --ignore-name --ignore-data
```

**Programmatic Usage**
Please read the [@vuedoc/parser@1.0.0 release note](https://github.com/vuedoc/parser/releases/tag/v1.0.0)
to learn more about.

### NodeJS v6.11.2
Now `@vuedoc/parser` requires the `v6.11.2` (or higher) of NodeJS.

## Vuedoc Markdown v0.8.1

This release add the parameters on method signatures. This fixes #6

## Vuedoc Markdown v0.8.0

This release use the  `@vuedoc/parser@0.6.1` with the support of component data
and component computed properties.
