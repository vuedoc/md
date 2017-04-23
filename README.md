# The vuedoc Markdown Documentation Generator
Generate a Markdown Documentation for a Vue file

[![Build Status](https://travis-ci.org/vuedoc/md.svg?branch=master)](https://travis-ci.org/vuedoc/md)
[![bitHound Dependencies](https://www.bithound.io/github/vuedoc/md/badges/dependencies.svg)](https://www.bithound.io/github/vuedoc/md/master/dependencies/npm)

## Install
```sh
# using in your project
npm install --save @vuedoc/md

# using in command line
npm install --global @vuedoc/md
```

## Usage
```js
const vuedoc = require('@vuedoc/md')
const options = {
  filename: 'test/fixtures/checkbox.vue'
}

vuedoc.md(options)
  .then((document) => console.log(document))
  .catch((err) => console.error(err))
```

The `document` variable contains this string:

```md
# checkbox 
A simple checkbox component 

## props 
- `model` ***Array*** (*required*) `twoWay = true` 
The checbox model 

- `disabled` ***Boolean*** (*optional*) 
Initial checbox state

- `checked` ***Boolean*** (*optional*) `default: true` 
Initial checbox value

## slots 
- `default` Use this slot to set the checbox label 

## events 
- `loaded` Emitted when the component has been loaded

## methods 
- `check()` 
Check the checbox
```

## CLI Usage
```sh
# generate a Markdown documentation
# this print documentation in the standard output
vuedoc.md components/checkbox.vue

# generate a Markdown documentation in a file
vuedoc.md components/checkbox.vue > docs/checbox.md

# generate a Markdown documentation all your components
vuedoc.md components/*.vue > docs.md
```

## License

Under the MIT license. See [LICENSE](https://github.com/vuedoc/md/blob/master/LICENSE) file for more details.
