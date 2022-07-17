# Vuedoc Markdown Documentation Generator

Generate a Markdown Documentation for a Vue file

[![npm](https://img.shields.io/npm/v/@vuedoc/md.svg)](https://www.npmjs.com/package/@vuedoc/md)
[![Build status](https://gitlab.com/vuedoc/md/badges/main/pipeline.svg)](https://gitlab.com/vuedoc/md/pipelines?ref=main)
[![Test coverage](https://gitlab.com/vuedoc/md/badges/main/coverage.svg)](https://gitlab.com/vuedoc/md/-/jobs)
[![Buy me a beer](https://img.shields.io/badge/Buy%20me-a%20beer-1f425f.svg)](https://www.buymeacoffee.com/demsking)

## Table of Contents

- [Install](#install)
- [Features](#features)
- [Command line usage](#command-line-usage)
- [Command line options](#command-line-options)
- [Programmatic Usage](#programmatic-usage)
- [Documentation Syntax](#documentation-syntax)
- [Specific Tags for Props](#specific-tags-for-props)
- [Examples](#examples)
  * [Generate a documentation for an SFC component](#generate-a-documentation-for-an-sfc-component)
  * [Generate a MDN-like documentation for a method](#generate-a-mdn-like-documentation-for-a-method)
- [Related projects](#related-projects)
- [Development Setup](#development-setup)
- [Contribute](#contribute)
- [Versioning](#versioning)
- [License](#license)

## Install

This package is [ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c)
: Node 16+ is needed to use it and it must be imported instead of required.

```sh
# using in your project
npm install --save @vuedoc/parser @vuedoc/md

# using in command line
npm install --global @vuedoc/parser @vuedoc/md
```

## Features

- Generate documentation for component props
- Generate documentation for component data
- Generate documentation for computed properties with their dependencies
- Generate documentation for component events
- Generate documentation for component slots
- Generate documentation for component methods
- Support of JSDoc, Class Component, Vue Property Decorator, TypeDoc
- Support of `@description`, `@desc` and `@example`

## Command line usage

```sh
# display the Vuedoc Markdown version
vuedoc-md --version

# this print documentation in the standard output
vuedoc-md components/textarea.vue

# generate a Markdown documentation in a file docs/textarea.md
vuedoc-md components/textarea.vue --output docs/

# generate a Markdown documentation all components
vuedoc-md components/*.vue --output docs/

# update the API section of README.md with generated documentation
vuedoc-md components/textarea.vue --section "API" --output README.md

# combine generated documentations of all components into one
vuedoc-md --join components/*.vue --output README.md

# using pipe
cat components/textarea.vue | vuedoc-md

# using a configuration file
vuedoc-md --config vuedoc.config.js components/*.vue

# using the configuration file vuedoc.config.js
vuedoc-md -c components/*.vue
```

Bellow an output sample of [test/fixtures/textarea.example.vue](https://gitlab.com/vuedoc/md/blob/main/test/fixtures/textarea.example.vue):

````md
# MyTextarea

**Author:** Arya Stark

The custom HTML `<textarea>` component.

- **license** - MIT

## Slots

| Name      | Description                             |
| --------- | --------------------------------------- |
| `label`   | Use this slot to set the label          |
| `default` | Use this slot to set the textarea value |

## Props

| Name            | Type            | Description                                                                                                                                                  | Default                      |
| --------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------- |
| `v-model`       | `string`        | Use this directive to create two-way data bindings with the component. It automatically picks the correct way to update the element based on the input type. |                              |
| `id` *required* | `string`        | Defines a unique identifier (ID) which must be unique in the whole document.                                                                                 |                              |
| `disabled`      | `boolean`       | This Boolean property indicates that the user cannot interact with the control.                                                                              | `false`                      |
| `theme`         | `TextareaTheme` | Define a custom theme for the component.                                                                                                                     | `new DefaultTextareaTheme()` |

## Events

| Name    | Description                                                                                                                                                                                                                                                                                                                                       |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `input` | Fired when the value is changed.<br/>**Arguments**<br/><ul><li>**`value: string`** — The updated value</li></ul>                                                                                                                                                                                                                                  |
| `keyup` | Fired when a key is released.<br/>**Arguments**<br/><ul><li>**`event: KeyboardEvent`** — Object describes a user interaction with the keyboard</li><li>**`event.code: DOMString`** — The code value of the physical key represented by the event</li><li>**`event.key: DOMString`** — The key value of the key represented by the event</li></ul> |

## Methods

### Textarea.replace()

The `replace()` method returns a new string with some or all matches of a
`pattern` replaced by a `replacement`. The `pattern` can be a string or a
RegExp, and the `replacement` can be a string or a function to be called for
each match. If `pattern` is a string, only the first occurrence will be
replaced.

The original string is left unchanged.

**Example**

```js
const p = 'The quick brown fox jumps over the lazy dog. If the dog reacted, was it really lazy?';
const regex = /dog/gi;

console.log(p.replace(regex, 'ferret'));
// expected output: "The quick brown fox jumps over the lazy ferret. If the ferret reacted, was it really lazy?"

console.log(p.replace('dog', 'monkey'));
// expected output: "The quick brown fox jumps over the lazy monkey. If the dog reacted, was it really lazy?"
```

**Syntax**

```typescript
const newStr = str.replace(pattern|substr, newSubstr|callback)
```

**Parameters**

- **`str: unknown`**

- **`newSubstr: String`**<br/>
  The String that replaces the substring specified by the specified regexp or
  substr parameter. A number of special replacement patterns are supported; see
  the "Specifying a string as a parameter" section below.

- **`pattern: RegExp`**<br/>
  A RegExp object or literal. The match or matches are replaced with newSubstr
  or the value returned by the specified function.

- **`substr: String`**<br/>
  A String that is to be replaced by newSubstr. It is treated as a literal
  string and is not interpreted as a regular expression. Only the first
  occurrence will be replaced.

- **`callback: Function`**<br/>
  A function to be invoked to create the new substring to be used to replace the
  matches to the given regexp or substr. The arguments supplied to this function
  are described in the "Specifying a function as a parameter" section below.

**Return value**

A new string, with some or all matches of a pattern replaced by a replacement.
````

## Command line options

```sh
-j, --join                    # Combine generated documentation for multiple component files into only one
-c, --config <filename>       # Use this config file (if argument is used but value is unspecified, defaults to vuedoc.config.js)
-l, --level <integer>         # Set the title level. An integer between 1 and 6
-w, --wordwrap <integer>      # The width of the text before wrapping to a new line. Set to `false` to disable word wrapping. Default is `80`
-o, --output <file or dir>    # The output directory. If absent, the STDOUT will be used
-s, --section <section name>  # Inject the generated documentation to a section. Works with `--output file`
--ignore-name                 # Ignore the component name on parsing
--ignore-description          # Ignore the component description on parsing
--ignore-keywords             # Ignore the component keywords on parsing
--ignore-slots                # Ignore the component slots on parsing
--ignore-props                # Ignore the component props on parsing
--ignore-computed             # Ignore the component computed properties on parsing
--ignore-data                 # Ignore the component data on parsing
--ignore-methods              # Ignore the component methods on parsing
--ignore-events               # Ignore the component events on parsing
```

**Overwrite Vuedoc Parser configuration using `vuedoc.config.js`**

```js
// vuedoc.config.js
import { Loader } from '@vuedoc/parser';
import { TypePugLoader } from '@vuedoc/parser/loaders/pug';

export default {
  output: 'docs/',
  parsing: {
    features: ['name', 'description', 'keywords', 'slots', 'model', 'props', 'events', 'methods'],
    loaders: [
      Loader.extend('pug', TypePugLoader),
    ],
  },
};
```

And then:

```sh
vuedoc-md --config vuedoc.config.js components/*.vue
# or
vuedoc-md -c components/*.vue
```

See [Vuedoc Parser documentation](https://gitlab.com/vuedoc/parser#options)
for parsing options.

## Programmatic Usage

**Options**

| Name        | Type                    | Description                                                                                                                                                     |
|-------------|-------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `level`     | Integer                 | Set the title level. An integer between 1 and 6                                                                                                                 |
| `output`    | String                  | The output of the documentation. Can be a directory or a Markdown file. If absent, the STDOUT will be used                                                      |
| `section`   | String                  | Inject the generated documentation to a section. Works with `options.output` as Markdown file output                                                            |
| `parsing`   | Object                  | Overwrite the default [Vuedoc Parser configuration](https://gitlab.com/vuedoc/parser#options)                                                                   |
| `join`      | Boolean                 | Combine generated documentation for multiple component files into only one                                                                                      |
| `filenames` | String[]                | List of component filenames to parse and render. If `options.join === true`, `options.filenames` will parsing will be joined and rendered as a single component |
| `wordwrap`  | Integer                 | The width of the text before wrapping to a new line. Set to `0` to disable word wrapping. Default is `80`                                                       |
| `labels`    | Record<I18nKey, String> | I18n labels for translation. See [`@vuedoc/md/I18n`](https://gitlab.com/vuedoc/md/blob/main/lib/I18n.js)                                                        |

**Usage**

```js
import { renderComponent } from '@vuedoc/md';

const options = {
  join: true,
  filenames: [
    'components/input.mixin.vue',
    'components/checkbox.vue',
  ],
};

renderComponent(options)
  .then((document) => console.log(document))
  .catch((err) => console.error(err))
```

**Overwrite the default Vuedoc Parser configuration**

```js
import { renderComponent } from '@vuedoc/md';
import { TypePugLoader } from '@vuedoc/parser/loaders/pug';
import { Loader } from '@vuedoc/parser';

const options = {
  filenames: [
    'test/fixtures/checkbox.vue',
  ],
  parsing: {
    features: ['name', 'description', 'keywords', 'slots', 'model', 'props', 'events', 'methods'],
    loaders: [
      Loader.extend('pug', TypePugLoader),
    ],
  },
};

renderComponent(options)
  .then((document) => console.log(document))
  .catch((err) => console.error(err));
```

See [Vuedoc Parser documentation](https://gitlab.com/vuedoc/parser#options)
for parsing options.

## Documentation Syntax

For the complete documentation syntax, please follow this link:

- Vuedoc Syntax: https://gitlab.com/vuedoc/parser#syntax

**Example**

```js
export default {
  name: 'CheckboxInput',
  props: {
    /**
     * The input format callback
     * @public
     */
    format: Function,
  },
  methods: {
    /**
     * This will be ignored on parsing and rendering
     * @private
     */
    validate() {},
    /**
     * This will be ignored on parsing and rendering
     * @protected
     */
    commit() {},
  },
};
```

## Specific Tags for Props

You can assign a reference to a type using `@typeref {url}`

**Example**

```js
export default {
  props: {
    /**
     * UI Schema Descriptor to use for rendering.
     *
     * @typeref https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object
     */
    descriptor: {
      type: Object,
    },
  },
};
```

This will render:

````md
| Name         | Type                                                                                                 | Description                                 |
| -------------| ---------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `descriptor` | [`Object`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)  | UI Schema Descriptor to use for rendering.  |
````

You can also define `typeref` for union type:

```js
export default {
  props: {
    /**
     * Initial input value
     * @typeref https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number
     * @typeref https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String
     */
    value: {
      type: [Number, String],
    },
  },
};
```

## Examples

Vuedoc Markdown has been used to generate documentation of bellow components:

### Generate a documentation for an SFC component

| Component file                                                                                                   | Markdown output                                                                                              |
|------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| [test/fixtures/checkbox.example.vue](https://gitlab.com/vuedoc/md/blob/main/test/fixtures/checkbox.example.vue)  | [test/fixtures/checkbox.output.md](https://gitlab.com/vuedoc/md/blob/main/test/fixtures/checkbox.output.md)  |
| [test/fixtures/textarea.example.vue](https://gitlab.com/vuedoc/md/blob/main/test/fixtures/textarea.example.vue)  | [test/fixtures/textarea.output.md](https://gitlab.com/vuedoc/md/blob/main/test/fixtures/textarea.output.md)  |

### Generate a MDN-like documentation for a method

| Component file                                                                                                       | Markdown output                                                                                        |
|----------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|
| [test/fixtures/mdn.event.example.vue](https://gitlab.com/vuedoc/md/blob/main/test/fixtures/mdn.event.example.vue)    | [test/fixtures/mdn.event.output.md](https://gitlab.com/vuedoc/md/blob/main/test/fixtures/mdn.event.output.md)  |
| [test/fixtures/mdn.string.example.vue](https://gitlab.com/vuedoc/md/blob/main/test/fixtures/mdn.string.example.vue)  | [test/fixtures/mdn.string.output.md](https://gitlab.com/vuedoc/md/blob/main/test/fixtures/mdn.string.output.md) |
| [test/fixtures/mdn.regexp.example.vue](https://gitlab.com/vuedoc/md/blob/main/test/fixtures/mdn.regexp.example.vue)  | [test/fixtures/mdn.regexp.output.md](https://gitlab.com/vuedoc/md/blob/main/test/fixtures/.output.md)  |

Find more examples here: [test/fixtures](https://gitlab.com/vuedoc/md/blob/main/test/fixtures)

## Related projects

- `jsdoc-vuedoc`: https://github.com/ccqgithub/jsdoc-vuedoc
- `rollup-plugin-vuedoc`: https://github.com/h-ikeda/rollup-plugin-vuedoc

## Development Setup

1. [Install Nix Package Manager](https://nixos.org/manual/nix/stable/installation/installing-binary.html)

2. [Install `direnv` with your OS package manager](https://direnv.net/docs/installation.html#from-system-packages)

3. [Hook it `direnv` into your shell](https://direnv.net/docs/hook.html)

4. At the top-level of your project run:

   ```sh
   direnv allow
   ```

   > The next time your launch your terminal and enter the top-level of your
   > project, `direnv` will check for changes.

## Contribute

Please follow [CONTRIBUTING.md](https://gitlab.com/vuedoc/md/blob/main/CONTRIBUTING.md).

## Versioning

Given a version number `MAJOR.MINOR.PATCH`, increment the:

- `MAJOR` version when you make incompatible API changes,
- `MINOR` version when you add functionality in a backwards-compatible manner,
  and
- `PATCH` version when you make backwards-compatible bug fixes.

Additional labels for pre-release and build metadata are available as extensions
to the `MAJOR.MINOR.PATCH` format.

See [SemVer.org](https://semver.org/) for more details.

## License

Under the MIT license.
See [LICENSE](https://gitlab.com/vuedoc/md/blob/main/LICENSE) file for more
details.
