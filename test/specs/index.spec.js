const assert = require('assert')
const { join } = require('path')
const { Parser } = require('@vuedoc/parser/lib/parser/Parser')

const vuedoc = require('../..')

/* global describe it beforeEach expect */

const filename = join(__dirname, '../fixtures/checkbox.example.vue')

describe('vuedoc', () => {
  let doc = null
  const ignore = ['name', 'description']
  const features = Parser.SUPPORTED_FEATURES.filter((feature) => !ignore.includes(feature))
  const options = { filename, features }

  beforeEach(() => {
    return vuedoc.md(options)
      .then((_doc) => (doc = _doc))
      .catch((err) => { throw err })
  })

  it('should render without main title', () => {
    assert.equal(/# checkbox/.test(doc), false)
  })

  it('should render without description', () =>
    assert.equal(/A simple checkbox component/.test(doc), false))

  it('should successfully joined parsed files', () => {
    const ignore = ['name']
    const options = {
      join: true,
      filenames: [
        join(__dirname, '../fixtures/join.component.1.js'),
        join(__dirname, '../fixtures/join.component.2.vue')
      ],
      parsing: {
        features: Parser.SUPPORTED_FEATURES.filter((feature) => !ignore.includes(feature))
      }
    }

    const expected = {
      "inheritAttrs": true,
      "description": "A simple checkbox component",
      "author": [
        "Sébastien"
      ],
      "keywords": [
        {
          "name": "license",
          "description": "MIT"
        },
        {
          "name": "input"
        }
      ],
      "slots": [
        {
          "kind": "slot",
          "visibility": "public",
          "description": undefined,
          "keywords": [],
          "name": "default",
          "category": undefined,
          "props": []
        },
        {
          "kind": "slot",
          "visibility": "public",
          "description": "Use this slot to set the checkbox label",
          "keywords": [],
          "name": "label",
          "category": undefined,
          "props": []
        }
      ],
      "props": [
        {
          "kind": "prop",
          "visibility": "public",
          "description": "The JSON Schema object. Use the `v-if` directive",
          "keywords": [],
          "name": "schema",
          "type": ["Object", "Promise"],
          "default": undefined,
          "required": true,
          "category": undefined,
          "describeModel": false
        },
        {
          "kind": "prop",
          "visibility": "public",
          "description": "Use this directive to create two-way data bindings",
          "keywords": [],
          "name": "value",
          "type": "Object",
          "default": "{}",
          "required": false,
          "category": undefined,
          "describeModel": true
        },
        {
          "kind": "prop",
          "visibility": "public",
          "description": "The checkbox model",
          "keywords": [],
          "name": "model",
          "type": "Array",
          "default": undefined,
          "required": true,
          "category": undefined,
          "describeModel": false
        },
        {
          "kind": "prop",
          "visibility": "public",
          "description": "Initial checkbox state",
          "keywords": [],
          "name": "disabled",
          "type": "Boolean",
          "default": undefined,
          "required": false,
          "category": undefined,
          "describeModel": false
        }
      ],
      "data": [],
      "computed": [],
      "events": [
        {
          "kind": "event",
          "visibility": "public",
          "description": "Emitted when the component has been created",
          "keywords": [],
          "name": "created",
          "category": undefined,
          "arguments": []
        },
        {
          "kind": "event",
          "visibility": "public",
          "description": "Emitted when the component has been loaded",
          "keywords": [],
          "name": "loaded",
          "category": undefined,
          "arguments": []
        }
      ],
      "methods": [],
      "errors": []
    }

    return vuedoc.join(options).then((ast) => expect(ast).toEqual(expected))
  })

  it('should successfully generate doc with options.wordwrap', () => {
    const options = {
      wordwrap: 5,
      parsing: {
        filecontent: `
          <script>
            /**
             * Initial input value
             */
            export default {
              name: 'NumericInput'
            }
          </script>
        `,
      },
    };

    const expected = [
      '# NumericInput',
      '',
      'Initial',
      'input',
      'value',
      '',
    ].join('\n');

    return vuedoc.md(options).then((component) => expect(component).toEqual(expected))
  })

  it('should successfully generate doc with options.wordwrap === false', () => {
    const options = {
      wordwrap: false,
      parsing: {
        filecontent: `
          <script>
            /**
             * Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur suscipit odio nisi, vel pellentesque augue tempor sed. Quisque tempus tortor metus, sit amet vehicula nisi tempus sit amet. Sed maximus massa ex, sed dictum dolor posuere in. Integer metus velit, euismod in turpis id, tincidunt tristique urna. Vivamus sit amet varius nisi. Nullam orci odio, tristique eget convallis ultrices, sodales at mi. Maecenas orci est, placerat eu dolor id, rhoncus congue lacus. Ut facilisis euismod vulputate. Nam metus nibh, blandit in eleifend ultricies, vehicula tempus dolor. Morbi varius lectus vehicula lectus bibendum suscipit. Nunc vel cursus eros, cursus lobortis sem. Nam tellus neque, dapibus id eros non, rhoncus ultricies turpis.
             */
            export default {
              name: 'NumericInput',
              methods: {
                /**
                 * @param {number} value - Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                 *                         Curabitur suscipit odio nisi, vel pellentesque augue tempor sed.
                 *                         Quisque tempus tortor metus, sit amet vehicula nisi tempus sit amet.
                 */
                check(value) {}
              }
            }
          </script>
        `,
      },
    };

    const expected = [
      '# NumericInput',
      '',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur suscipit odio nisi, vel pellentesque augue tempor sed. Quisque tempus tortor metus, sit amet vehicula nisi tempus sit amet. Sed maximus massa ex, sed dictum dolor posuere in. Integer metus velit, euismod in turpis id, tincidunt tristique urna. Vivamus sit amet varius nisi. Nullam orci odio, tristique eget convallis ultrices, sodales at mi. Maecenas orci est, placerat eu dolor id, rhoncus congue lacus. Ut facilisis euismod vulputate. Nam metus nibh, blandit in eleifend ultricies, vehicula tempus dolor. Morbi varius lectus vehicula lectus bibendum suscipit. Nunc vel cursus eros, cursus lobortis sem. Nam tellus neque, dapibus id eros non, rhoncus ultricies turpis.',
      '',
      '## Methods',
      '',
      '### check()',
      '',
      '**Syntax**',
      '',
      '```typescript',
      'check(value: number): void',
      '```',
      '',
      '**Parameters**',
      '',
      '- **`value: number`**<br>  ',
      '  Lorem ipsum dolor sit amet, consectetur adipiscing elit.  ',
      '  Curabitur suscipit odio nisi, vel pellentesque augue tempor sed.  ',
      '  Quisque tempus tortor metus, sit amet vehicula nisi tempus sit amet.',
      '',
    ].join('\n');

    return vuedoc.md(options).then((component) => expect(component).toEqual(expected))
  })

  it('should successfully generate doc with @typeref', () => {
    const options = {
      parsing: {
        filecontent: `
          <script>
            export default {
              props: {
                /**
                 * Initial input value
                 * @typeref https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number
                 * @typeref https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String
                 */
                value: {
                  type: [Number, String]
                }
              }
            }
          </script>
        `,
      },
    };

    const expected = [
      '# Props',
      '',
      '| Name      | Type                                                                                                                                                                                                           | Description         |',
      '| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |',
      '| `v-model` | [`Number`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) &#124; [`String`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | Initial input value |',
      '',
    ].join('\n');

    return vuedoc.md(options).then((component) => expect(component).toEqual(expected))
  })

  it('should successfully generate doc with @version, @since, @category, @deprecated, @see and @author', () => {
    const options = {
      parsing: {
        filecontent: `
          <script>
            /**
             * Lorem ipsum dolor sit amet, consectetur adipiscing elit.
             * @author Arya Stark
             * @version 1.2.3
             * @since 1.0.0
             * @category form
             * @deprecated since 1.2.0
             * @see http://arya.got
             */
            export default {
              name: 'NumericInput',
              methods: {
                /**
                 * @param {number} value - Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                 *                         Curabitur suscipit odio nisi, vel pellentesque augue tempor sed.
                 *                         Quisque tempus tortor metus, sit amet vehicula nisi tempus sit amet.
                 */
                check(value) {}
              }
            }
          </script>
        `,
      },
    };

    const expected = [
      '# NumericInput',
      '',
      '**Since:** 1.0.0<br>',
      '**Version:** 1.2.3<br>',
      '**Deprecated:** since 1.2.0<br>',
      '**See:** http://arya.got<br>',
      '**Author:** Arya Stark',
      '',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      '',
      '## Methods',
      '',
      '### check()',
      '',
      '**Syntax**',
      '',
      '```typescript',
      'check(value: number): void',
      '```',
      '',
      '**Parameters**',
      '',
      '- **`value: number`**<br>',
      '  Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      '  Curabitur suscipit odio nisi, vel pellentesque augue tempor sed.',
      '  Quisque tempus tortor metus, sit amet vehicula nisi tempus sit amet.',
      '',
    ].join('\n');

    return vuedoc.md(options).then((component) => expect(component).toEqual(expected))
  })

  it('should successfully generate doc with @description, @desc and @example', () => {
    const options = {
      parsing: {
        filecontent: `
          <script>
            /**
             * Lorem ipsum dolor sit amet, consectetur adipiscing elit.
             * @example
             * \`\`\`js
             * console.log('hello')
             * \`\`\`
             * @description Description suite
             * @example
             * \`\`\`js
             * console.log('hello mario')
             * \`\`\`
             * @desc Description suite 2
             */
            export default {
              name: 'NumericInput',
              methods: {
                /**
                 * Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                 * @example
                 * \`\`\`js
                 * console.log('hello')
                 * \`\`\`
                 * @description Description suite
                 * @example
                 * \`\`\`js
                 * console.log('hello mario')
                 * \`\`\`
                 * @desc Description suite 2
                 * @param {number} value - Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                 *                         Curabitur suscipit odio nisi, vel pellentesque augue tempor sed.
                 *                         Quisque tempus tortor metus, sit amet vehicula nisi tempus sit amet.
                 */
                check(value) {}
              }
            }
          </script>
        `,
      },
    };

    const expected = [
      '# NumericInput',
      '',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      '',
      '**Example**',
      '',
      '```js',
      'console.log(\'hello\')',
      '```',
      '',
      'Description suite',
      '',
      '**Example**',
      '',
      '```js',
      'console.log(\'hello mario\')',
      '```',
      '',
      'Description suite 2',
      '',
      '## Methods',
      '',
      '### check()',
      '',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      '',
      '**Example**',
      '',
      '```js',
      'console.log(\'hello\')',
      '```',
      '',
      'Description suite',
      '',
      '**Example**',
      '',
      '```js',
      'console.log(\'hello mario\')',
      '```',
      '',
      'Description suite 2',
      '',
      '**Syntax**',
      '',
      '```typescript',
      'check(value: number): void',
      '```',
      '',
      '**Parameters**',
      '',
      '- **`value: number`**<br>',
      '  Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      '  Curabitur suscipit odio nisi, vel pellentesque augue tempor sed.',
      '  Quisque tempus tortor metus, sit amet vehicula nisi tempus sit amet.',
      '',
    ].join('\n');

    return vuedoc.md(options).then((component) => expect(component).toEqual(expected))
  })
})
