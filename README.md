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

## Usage

First use comments to document your component:

```vue
<template>
  <div>
    <!-- Use this slot to set the label -->
    <label :for="id"><slot name="label"></slot></label>
    <textarea :id="id" @keyup="keyup" @input="input">
      <!-- Use this slot to set the devault value -->
      <slot></slot></textarea>
  </div>
</template>

<script>
  import _ from 'lodash'

  /**
   * The custom HTML `<textarea>` component.
   */
  export default {
    name: 'my-textarea',
    props: {
      /**
       * Use this directive to create two-way data bindings with the component. It automatically picks the correct way to update the element based on the input type.
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
       */
      isEmpty () {
        return !this.value || this.value.length === 0
      },
      /**
       * @private
       */
      input (e) {
        this.value = e.target.value
        this.clearError()
        /**
         * Fired when the value is changed.
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
# generate a Markdown documentation
# this print documentation in the standard output
vuedoc.md components/textarea.vue

# generate a Markdown documentation in a file docs/textarea.md
vuedoc.md components/textarea.vue --output docs/

# generate a Markdown documentation all your components
vuedoc.md components/*.vue --output docs/

# using pipe
cat components/textarea.vue | vuedoc.md
```

Output:

```md
# my-textarea 
The custom HTML `<textarea>` component. 

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
--level [integer]        - Set the title level. An integer betwen 1 and 6
--output [file or dir]   - The output directory. If absent, the STDOUT will be used
--section [section name] - Set the README's section name to update. Works with `--output file`
--ignore-name            - Ignore the component name on parsing
--ignore-description     - Ignore the component description on parsing
```

## Programmatic Usage
```js
const vuedoc = require('@vuedoc/md')
const options = {
  filename: 'test/fixtures/checkbox.vue'
}

vuedoc.md(options)
  .then((document) => console.log(document))
  .catch((err) => console.error(err))
```

## Keywords
- `@public` By default all commented members are public; this mean they will be part of the documented members.
- `@protected` Commented members with this will be ignored.
- `@private` Commented members with this will be ignored.


## Examples
`vuedoc.md` has been used to generate documentation of bellow components:
- `vx-input`: [https://github.com/vx-components/textarea](https://github.com/vx-components/input)
- `vx-checkbox`: [https://github.com/vx-components/textarea](https://github.com/vx-components/checkbox)
- `vx-textarea`: [https://github.com/vx-components/textarea](https://github.com/vx-components/textarea)
- `vue-json-schema`: [https://github.com/demsking/vue-json-schema](https://github.com/demsking/vue-json-schema)


## License
Under the MIT license. See [LICENSE](https://github.com/vuedoc/md/blob/master/LICENSE) file for more details.
