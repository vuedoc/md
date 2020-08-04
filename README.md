# Vuedoc Markdown Documentation Generator

Generate a Markdown Documentation for a Vue file

[![npm](https://img.shields.io/npm/v/@vuedoc/md.svg)](https://www.npmjs.com/package/@vuedoc/md) [![Build status](https://gitlab.com/vuedoc/md/badges/master/pipeline.svg)](https://gitlab.com/vuedoc/md/pipelines) [![Test coverage](https://gitlab.com/vuedoc/md/badges/master/coverage.svg)](https://gitlab.com/vuedoc/md/-/jobs)

## Table of Contents

- [Install](#install)
- [Features](#features)
- [Command line usage](#command-line-usage)
- [Command line options](#command-line-options)
- [Programmatic Usage](#programmatic-usage)
- [Documentation Syntax](#documentation-syntax)
- [Visibility Keywords](#visibility-keywords)
- [Specific Keywords for Props](#specific-keywords-for-props)
- [Specific Keywords for Methods](#specific-keywords-for-methods)
- [Examples](#examples)
  * [Generate a documentation for an SFC component](#generate-a-documentation-for-an-sfc-component)
  * [Generate a MDN-like documentation for a method](#generate-a-mdn-like-documentation-for-a-method)
- [Related projects](#related-projects)
- [Contribute](#contribute)
- [Versioning](#versioning)
- [License](#license)

## Install

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
- Support of JSDoc

## Command line usage

```sh
# display the vuedoc.md version
vuedoc.md --version

# this print documentation in the standard output
vuedoc.md components/textarea.vue

# generate a Markdown documentation in a file docs/textarea.md
vuedoc.md components/textarea.vue --output docs/

# generate a Markdown documentation all components
vuedoc.md components/*.vue --output docs/

# update the API section of README.md with generated documentation
vuedoc.md components/textarea.vue --section "API" --output README.md

# combine generated documentations of all components into one
vuedoc.md --join components/*.vue --output README.md

# using pipe
cat components/textarea.vue | vuedoc.md
```

Bellow an output sample of [test/fixtures/textarea.example.vue](test/fixtures/textarea.example.vue):

````md
# MyTextarea

The custom HTML `<textarea>` component.

- **author** - Arya Stark
- **license** - MIT

## Slots

| Name      | Description                             |
| --------- | --------------------------------------- |
| `label`   | Use this slot to set the label          |
| `default` | Use this slot to set the textarea value |

## Props

| Name            | Type      | Description                                                                                                                                                  | Default                      |
| --------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------- |
| `v-model`       | `String`  | Use this directive to create two-way data bindings with the component. It automatically picks the correct way to update the element based on the input type. |                              |
| `id` *required* | `String`  | Defines a unique identifier (ID) which must be unique in the whole document.                                                                                 |                              |
| `disabled`      | `Boolean` | This Boolean property indicates that the user cannot interact with the control.                                                                              | `false`                      |
| `theme`         | `Object`  | Define a custom theme for the component.                                                                                                                     | `new DefaultTextareaTheme()` |

## Events

| Name    | Description                                                                                                                                                                                                                                                                                                                                     |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `input` | Fired when the value is changed.<br>**Arguments**<br><ul><li>**`value: string`** — The updated value</li></ul>                                                                                                                                                                                                                                  |
| `keyup` | Fired when a key is released.<br>**Arguments**<br><ul><li>**`event: KeyboardEvent`** — Object describes a user interaction with the keyboard</li><li>**`event.code: DOMString`** — The code value of the physical key represented by the event</li><li>**`event.key: DOMString`** — The key value of the key represented by the event</li></ul> |

## Methods

### Textarea.replace()

The `replace()` method returns a new string with some or all matches of
a `pattern` replaced by a `replacement`. The `pattern` can be a string
or a RegExp, and the `replacement` can be a string or a function to be
called for each match. If `pattern` is a string, only the first
occurrence will be replaced.

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

- **`pattern: RegExp`**<br>
  A RegExp object or literal. The match or matches are replaced with newSubstr or the value returned by the specified function.

- **`substr: String`**<br>
  A String that is to be replaced by newSubstr. It is treated as a literal string and is not interpreted as a regular expression. Only the first occurrence will be replaced.

- **`newSubstr: String`**<br>
  The String that replaces the substring specified by the specified regexp or substr parameter. A number of special replacement patterns are supported; see the "Specifying a string as a parameter" section below.

- **`callback: Function`**<br>
  A function to be invoked to create the new substring to be used to replace the matches to the given regexp or substr. The arguments supplied to this function are described in the "Specifying a function as a parameter" section below.

**Return value**

A new string, with some or all matches of a pattern replaced by a replacement.
````

## Command line options

```sh
--join                      # Combine generated documentation for multiple component files into only one
--config [js file]  # Set to `false` to disable parsing of litteral values and stringify litteral values. Default: `true`
--level [integer]           # Set the title level. An integer between 1 and 6
--output [file or dir]      # The output directory. If absent, the STDOUT will be used
--section [section name]    # Inject the generated documentation to a section. Works with `--output file`
--ignore-name               # Ignore the component name on parsing
--ignore-description        # Ignore the component description on parsing
--ignore-keywords           # Ignore the component keywords on parsing
--ignore-slots              # Ignore the component slots on parsing
--ignore-props              # Ignore the component props on parsing
--ignore-computed           # Ignore the component computed properties on parsing
--ignore-data               # Ignore the component data on parsing
--ignore-methods            # Ignore the component methods on parsing
--ignore-events             # Ignore the component events on parsing
```

**Overwrite Vuedoc Parser configuration using `vuedoc.config.js`**

```js
// vuedoc.config.js
const Vuedoc = require('@vuedoc/md')
const TypePugLoader = require('@vuedoc/parser/loader/pug')
const TypeScriptLoader = require('@vuedoc/parser/loader/typescript')

module.exports = {
  features: ['name', 'description', 'keywords', 'slots', 'model', 'props', 'events', 'methods'],
  loaders: [
    Vuedoc.Parser.Loader.extend('pug', TypePugLoader),
    Vuedoc.Parser.Loader.extend('ts', TypeScriptLoader)
  ]
}
```

And then:

```sh
vuedoc.md --output docs/ --config vuedoc.config.js components/*.vue
```

See [Vuedoc Parser documentation](https://gitlab.com/vuedoc/parser#options)
for parsing options.

## Programmatic Usage

**Options**

| Name            | Type    | Description                                                                                                |
|-----------------|---------|------------------------------------------------------------------------------------------------------------|
| `level`         | Integer | Set the title level. An integer between 1 and 6                                                            |
| `output`        | String  | The output of the documentation. Can be a directory or a Markdown file. If absent, the STDOUT will be used |
| `section`       | String  | Inject the generated documentation to a section. Works with `options.output` as Markdown file output       |
| `join`          | Boolean | Combine generated documentation for multiple component files into only one                                 |
| `parsing` | Object  | Overwrite the default [Vuedoc Parser configuration](https://gitlab.com/vuedoc/parser#options)              |

**Usage**

```js
const vuedoc = require('@vuedoc/md')
const options = {
  filename: 'test/fixtures/checkbox.vue'
}

vuedoc.md(options)
  .then((document) => console.log(document))
  .catch((err) => console.error(err))
```

**Overwrite the default Vuedoc Parser configuration**

```js
const Vuedoc = require('@vuedoc/md')
const TypePugLoader = require('@vuedoc/parser/loader/pug')
const TypeScriptLoader = require('@vuedoc/parser/loader/typescript')

const options = {
  filename: 'test/fixtures/checkbox.vue',
  parsing: {
    features: ['name', 'description', 'keywords', 'slots', 'model', 'props', 'events', 'methods'],
    loaders: [
      Vuedoc.Parser.Loader.extend('pug', TypePugLoader),
      Vuedoc.Parser.Loader.extend('ts', TypeScriptLoader)
    ]
  }
}

Vuedoc.md(options)
  .then((document) => console.log(document))
  .catch((err) => console.error(err))
```

See [Vuedoc Parser documentation](https://gitlab.com/vuedoc/parser#options)
for parsing options.

## Documentation Syntax

For the complete documentation syntax, please follow this link:

- Vuedoc Syntax: https://gitlab.com/vuedoc/parser#syntax

## Visibility Keywords

| Keywords      | Description
|---------------|-----------------------------------------------------------------------------------------------------|
| `@public`     | By default all commented members are public; this means they will be part of the documented members |
| `@protected`  | Commented members with this will be ignored                                                         |
| `@private`    | Commented members with this will be ignored                                                         |

**Example**

```js
export default {
  name: 'CheckboxInput',
  props: {
    /**
     * The input format callback
     * @public
     */
    format: Function
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
    commit() {}
  }
}
```

## Specific Keywords for Methods

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

## Examples

Vuedoc Markdown has been used to generate documentation of bellow components:

### Generate a documentation for an SFC component

| Component file                                                            | Markdown output                                                       |
|---------------------------------------------------------------------------|-----------------------------------------------------------------------|
| [test/fixtures/checkbox.example.vue](test/fixtures/checkbox.example.vue)  | [test/fixtures/checkbox.output.md](test/fixtures/checkbox.output.md)  |
| [test/fixtures/textarea.example.vue](test/fixtures/textarea.example.vue)  | [test/fixtures/textarea.output.md](test/fixtures/textarea.output.md)  |

### Generate a MDN-like documentation for a method

| Component file                                                                | Markdown output                                                           |
|-------------------------------------------------------------------------------|---------------------------------------------------------------------------|
| [test/fixtures/mdn.event.example.vue](test/fixtures/mdn.event.example.vue)    | [test/fixtures/mdn.event.output.md](test/fixtures/mdn.event.output.md)    |
| [test/fixtures/mdn.string.example.vue](test/fixtures/mdn.string.example.vue)  | [test/fixtures/mdn.string.output.md](test/fixtures/mdn.string.output.md)  |
| [test/fixtures/mdn.regexp.example.vue](test/fixtures/mdn.regexp.example.vue)  | [test/fixtures/mdn.regexp.output.md](test/fixtures/.output.md)            |

Find more examples here: [test/fixtures](test/fixtures)

## Related projects

- `jsdoc-vuedoc`: [https://github.com/ccqgithub/jsdoc-vuedoc](https://github.com/ccqgithub/jsdoc-vuedoc)

## Contribute

Contributions to Vuedoc Markdown are welcome. Here is how you can contribute:

1. [Submit bugs or a feature request](https://gitlab.com/vuedoc/md/issues) and
   help us verify fixes as they are checked in
2. Create your working branch from the `dev` branch: `git checkout dev -b feature/my-awesome-feature`
3. Install development dependencies: `npm run install:dev`
4. Write code for a bug fix or for your new awesome feature
5. Write test cases for your changes
6. [Submit merge requests](https://gitlab.com/vuedoc/md/merge_requests) for bug
   fixes and features and discuss existing proposals

## Versioning

Given a version number `MAJOR.MINOR.PATCH`, increment the:

- `MAJOR` version when you make incompatible API changes,
- `MINOR` version when you add functionality in a backwards-compatible manner, and
- `PATCH` version when you make backwards-compatible bug fixes.

Additional labels for pre-release and build metadata are available as extensions to the `MAJOR.MINOR.PATCH` format.

See [SemVer.org](https://semver.org/) for more details.

## License

Under the MIT license.
See [LICENSE](https://gitlab.com/vuedoc/md/blob/master/LICENSE) file for more
details.
