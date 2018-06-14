# The vuedoc Markdown Documentation Generator
Generate a Markdown Documentation for a Vue file

[![Build Status](https://travis-ci.org/vuedoc/md.svg?branch=master)](https://travis-ci.org/vuedoc/md) [![Coverage Status](https://coveralls.io/repos/github/vuedoc/md/badge.svg?branch=master)](https://coveralls.io/github/vuedoc/md?branch=master)

## Install
```sh
# using in your project
npm install --save @vuedoc/md

# using in command line
npm install --global @vuedoc/md
```

## Features
- Generate documentation for component props
- Generate documentation for component data
- Generate documentation for computed properties with their dependencies
- Generate documentation for component events
- Generate documentation for component slots
- Generate documentation for component methods
- Support of JSDoc

## Usage

First use comments to document your component (see [test/fixtures/checkbox.vue](https://gitlab.com/vuedoc/md/blob/master/test/fixtures/checkbox.vue) for a complete example):

```vue
<template>
  <div>
    <label :for="id">
      <!-- Use this slot to set the label -->
      <slot name="label"></slot>
    </label>
    <textarea :id="id" @keyup="keyup" @input="input">
      <!-- Use this slot to set the devault value -->
      <slot></slot>
    </textarea>
  </div>
</template>

<script>
  import _ from 'lodash'

  /**
   * The custom HTML `<textarea>` component.
   * 
   * @author Sébastien
   * @license MIT
   */
  export default {
    name: 'my-textarea',
    props: {
      /**
       * Use this directive to create two-way data bindings with the component.
       * It automatically picks the correct way to update the element based on the input type.
       * @model
       */
      value: { type: String },
      /**
       * Defines a unique identifier (ID) which must be unique in the whole document.
       */
      id: { type: String, required: true },
      /**
       * This Boolean property indicates that the user cannot interact with the control.
       */
      disable: { type: Boolean, default: false }
    },
    methods: {
      /**
       * Define if the control value is empty of not.
       * @return {boolean} true if empty; otherwise false
       */
      isEmpty () {
        return !this.value || this.value.length === 0
      },
      /**
       * @private
       */
      input (e) {
        this.value = e.target.value

        /**
         * Fired when the value is changed.
         * @param {string} value - The updated value
         */
        this.$emit('input', this.value)
      },
      /**
       * @private
       */
      keyup (e) {
        /**
         * Fired when a key is released.
         */
        this.$emit('keyup')
      }
    }
  }
</script>
```

Then use the CLI to generate the documentation:

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

# comone generated documentations of all components into one
vuedoc.md --join components/*.vue --output README.md

# using pipe
cat components/textarea.vue | vuedoc.md
```

Output:

```md
# my-textarea 
The custom HTML `<textarea>` component.

- **author** - Sébastien 
- **license** - MIT 

## props 
- `v-model` ***String*** (*optional*) 
Use this directive to create two-way data bindings with the component. It automatically picks the correct way to update the element based on the input type. 

- `id` ***String*** (*required*) 
Defines a unique identifier (ID) which must be unique in the whole document. 

- `disable` ***Boolean*** (*optional*) `default: false` 
This Boolean property indicates that the user cannot interact with the control. 

## slots 
- `label` Use this slot to set the label 

- `default` Use this slot to set the devault value 

## events 
- `input` Fired when the value is changed. 

- `keyup` Fired when a key is released. 

## methods 
- `isEmpty()` 
Define if the control value is empty of not.
```

## Command line options
```
--join                   - Combine generated documentation for multiple component files into only one
--level [integer]        - Set the title level. An integer betwen 1 and 6
--output [file or dir]   - The output directory. If absent, the STDOUT will be used
--section [section name] - Inject the generated documentation to a section. Works with `--output file`
--ignore-name            - Ignore the component name on parsing
--ignore-description     - Ignore the component description on parsing
--ignore-keywords        - Ignore the component keywords on parsing
--ignore-slots           - Ignore the component slots on parsing
--ignore-props           - Ignore the component props on parsing
--ignore-computed        - Ignore the component computed properties on parsing
--ignore-data            - Ignore the component data on parsing
--ignore-methods         - Ignore the component methods on parsing
--ignore-events          - Ignore the component events on parsing
```

## Programmatic Usage

**Options**

| name    | type    | description                                                                                                |
|---------|---------|------------------------------------------------------------------------------------------------------------|
| level   | integer | Set the title level. An integer betwen 1 and 6                                                             |
| output  | string  | The output of the documentation. Can be a directory or a Markdown file. If absent, the STDOUT will be used |
| section | string  | Inject the generated documentation to a section. Works with `options.output` as Markdown file output       |
| join    | boolean | Combine generated documentation for multiple component files into only one                                 |

For parsing options please read the [@vuedoc/parser documentation](https://gitlab.com/vuedoc/parser#options)

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

## Visibility Keywords
- `@public` By default all commented members are public; this mean they will be part of the documented members.
- `@protected` Commented members with this will be ignored.
- `@private` Commented members with this will be ignored.

## Examples
`vuedoc.md` has been used to generate documentation of bellow components:
- `vx-input`: [https://gitlab.com/vx-components/textarea](https://gitlab.com/vx-components/input)
- `vx-checkbox`: [https://gitlab.com/vx-components/textarea](https://gitlab.com/vx-components/checkbox)
- `vx-textarea`: [https://gitlab.com/vx-components/textarea](https://gitlab.com/vx-components/textarea)
- `FormSchema/native`: [https://gitlab.com/formschema/native](https://gitlab.com/formschema/native)

## Related projects
- `jsdoc-vuedoc`: [https://github.com/ccqgithub/jsdoc-vuedoc](https://github.com/ccqgithub/jsdoc-vuedoc)

## License
Under the MIT license. See [LICENSE](https://gitlab.com/vuedoc/md/blob/master/LICENSE) file for more details.
