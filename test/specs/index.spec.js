import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { VuedocParser } from '@vuedoc/parser';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderMarkdown } from '../../index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const filename = join(__dirname, '../fixtures/checkbox.example.vue');

describe('vuedoc', () => {
  let doc = null;
  const ignore = ['name', 'description'];
  const features = VuedocParser.SUPPORTED_FEATURES.filter((feature) => !ignore.includes(feature));
  const options = { filenames: [filename], parsing: { features } };

  beforeEach(async () => {
    doc = await renderMarkdown(options);
  });

  it('should render without main title', () => {
    expect(doc).not.toMatch(/# checkbox/);
  });

  it('should render without description', () => expect(doc).not.toMatch(/A simple checkbox component/));

  it('should successfully joined parsed files', async () => {
    const ignore = ['name'];
    const options = {
      join: true,
      filenames: [
        join(__dirname, '../fixtures/join.component.1.js'),
        join(__dirname, '../fixtures/join.component.2.vue'),
      ],
      parsing: {
        features: VuedocParser.SUPPORTED_FEATURES.filter((feature) => !ignore.includes(feature)),
      },
    };

    const expected = [
      '**Author:** Sébastien',
      '',
      'A simple checkbox component',
      '',
      '- **license** - MIT',
      '- **input**',
      '',
      '# Slots',
      '',
      '| Name      | Description                             |',
      '| --------- | --------------------------------------- |',
      '| `default` |                                         |',
      '| `label`   | Use this slot to set the checkbox label |',
      '',
      '# Props',
      '',
      '| Name                | Type                      | Description                                        | Default |',
      '| ------------------- | ------------------------- | -------------------------------------------------- | ------- |',
      '| `schema` *required* | `object` &#124; `Promise` | The JSON Schema object. Use the `v-if` directive   |         |',
      '| `v-model`           | `object`                  | Use this directive to create two-way data bindings | `{}`    |',
      '| `model` *required*  | `array`                   | The checkbox model                                 |         |',
      '| `disabled`          | `boolean`                 | Initial checkbox state                             | &nbsp;  |',
      '',
      '# Events',
      '',
      '| Name      | Description                                 |',
      '| --------- | ------------------------------------------- |',
      '| `created` | Emitted when the component has been created |',
      '| `loaded`  | Emitted when the component has been loaded  |',
      '',
    ].join('\n');

    const component = await renderMarkdown(options);

    return expect(component).toEqual(expected);
  });

  it('should successfully render multiple files', async () => {
    const options = {
      filenames: [
        join(__dirname, '../fixtures/join.component.1.js'),
        join(__dirname, '../fixtures/join.component.2.vue'),
      ],
    };

    const expected = [
      [
        '# join.component.1',
        '',
        '## Props',
        '',
        '| Name                | Type                      | Description                                        | Default |',
        '| ------------------- | ------------------------- | -------------------------------------------------- | ------- |',
        '| `schema` *required* | `object` &#124; `Promise` | The JSON Schema object. Use the `v-if` directive   |         |',
        '| `v-model`           | `object`                  | Use this directive to create two-way data bindings | `{}`    |',
        '',
        '## Events',
        '',
        '| Name      | Description                                 |',
        '| --------- | ------------------------------------------- |',
        '| `created` | Emitted when the component has been created |',
        '',
      ].join('\n'),
      [
        '# checkbox',
        '',
        '**Author:** Sébastien',
        '',
        'A simple checkbox component',
        '',
        '- **license** - MIT',
        '- **input**',
        '',
        '## Slots',
        '',
        '| Name      | Description                             |',
        '| --------- | --------------------------------------- |',
        '| `default` |                                         |',
        '| `label`   | Use this slot to set the checkbox label |',
        '',
        '## Props',
        '',
        '| Name               | Type      | Description            |',
        '| ------------------ | --------- | ---------------------- |',
        '| `model` *required* | `array`   | The checkbox model     |',
        '| `disabled`         | `boolean` | Initial checkbox state |',
        '',
        '## Events',
        '',
        '| Name     | Description                                |',
        '| -------- | ------------------------------------------ |',
        '| `loaded` | Emitted when the component has been loaded |',
        '',
      ].join('\n'),
    ];

    const component = await renderMarkdown(options);

    return expect(component).toEqual(expected);
  });

  it('should successfully render with only one file', async () => {
    const ignore = ['name'];
    const options = {
      filenames: [
        join(__dirname, '../fixtures/join.component.1.js'),
      ],
      parsing: {
        features: VuedocParser.SUPPORTED_FEATURES.filter((feature) => !ignore.includes(feature)),
      },
    };

    const expected = [
      '# Props',
      '',
      '| Name                | Type                      | Description                                        | Default |',
      '| ------------------- | ------------------------- | -------------------------------------------------- | ------- |',
      '| `schema` *required* | `object` &#124; `Promise` | The JSON Schema object. Use the `v-if` directive   |         |',
      '| `v-model`           | `object`                  | Use this directive to create two-way data bindings | `{}`    |',
      '',
      '# Events',
      '',
      '| Name      | Description                                 |',
      '| --------- | ------------------------------------------- |',
      '| `created` | Emitted when the component has been created |',
      '',
    ].join('\n');

    const component = await renderMarkdown(options);

    return expect(component).toEqual(expected);
  });

  it('should successfully render with options.filename', async () => {
    const ignore = ['name'];
    const options = {
      filename: join(__dirname, '../fixtures/join.component.1.js'),
      parsing: {
        features: VuedocParser.SUPPORTED_FEATURES.filter((feature) => !ignore.includes(feature)),
      },
    };

    const expected = [
      '# Props',
      '',
      '| Name                | Type                      | Description                                        | Default |',
      '| ------------------- | ------------------------- | -------------------------------------------------- | ------- |',
      '| `schema` *required* | `object` &#124; `Promise` | The JSON Schema object. Use the `v-if` directive   |         |',
      '| `v-model`           | `object`                  | Use this directive to create two-way data bindings | `{}`    |',
      '',
      '# Events',
      '',
      '| Name      | Description                                 |',
      '| --------- | ------------------------------------------- |',
      '| `created` | Emitted when the component has been created |',
      '',
    ].join('\n');

    const component = await renderMarkdown(options);

    return expect(component).toEqual(expected);
  });

  it('should successfully generate doc with options.wordwrap', async () => {
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

    const component = await renderMarkdown(options);

    return expect(component).toEqual(expected);
  });

  it('should successfully generate doc with options.wordwrap === 0', async () => {
    const options = {
      wordwrap: 0,
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
      '- `value: number`<br/>  ',
      '  Lorem ipsum dolor sit amet, consectetur adipiscing elit.  ',
      '  Curabitur suscipit odio nisi, vel pellentesque augue tempor sed.  ',
      '  Quisque tempus tortor metus, sit amet vehicula nisi tempus sit amet.',
      '',
    ].join('\n');

    const component = await renderMarkdown(options);

    return expect(component).toEqual(expected);
  });

  it('should successfully throw an error with missing filenames and parser.filecontent', () => {
    const options = {
      parsing: {},
    };

    expect(() => renderMarkdown(options)).rejects.toThrow(/^Invalid options\. Missing options\.filenames$/);
  });

  it('should successfully generate doc with @typeref', async () => {
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
      '| `v-model` | [`number`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) &#124; [`string`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | Initial input value |',
      '',
    ].join('\n');

    const component = await renderMarkdown(options);

    return expect(component).toEqual(expected);
  });

  it('should successfully generate doc with @version, @since, @category, @deprecated, @see and @author', async () => {
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
      '**Since:** 1.0.0<br/>',
      '**Version:** 1.2.3<br/>',
      '**Deprecated:** since 1.2.0<br/>',
      '**See:** http://arya.got<br/>',
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
      '- `value: number`<br/>',
      '  Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      '  Curabitur suscipit odio nisi, vel pellentesque augue tempor sed.',
      '  Quisque tempus tortor metus, sit amet vehicula nisi tempus sit amet.',
      '',
    ].join('\n');

    const component = await renderMarkdown(options);

    return expect(component).toEqual(expected);
  });

  it('should successfully generate doc with @description, @desc and @example', async () => {
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
      '- `value: number`<br/>',
      '  Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      '  Curabitur suscipit odio nisi, vel pellentesque augue tempor sed.',
      '  Quisque tempus tortor metus, sit amet vehicula nisi tempus sit amet.',
      '',
    ].join('\n');

    const component = await renderMarkdown(options);

    return expect(component).toEqual(expected);
  });

  it('should successfully generate doc with @kind function', async () => {
    const options = {
      parsing: {
        filecontent: `
          <script>
            export default {
              name: 'NumericInput',
              props: {
                /**
                 * The validator function to use to validate data before to emit the \`input\` event.
                 *
                 * @see [Custom Validation API](#custom-validation-api)
                 * @kind function
                 * @param {GenericField} field - The field that requests validation
                 * @param {string} field.id - The input ID attribute value
                 * @param {string} field.name - The input name attribute value
                 * @param {any} field.value - The input value for validation
                 * @param {JsonSchema} field.schema - The JSON Schema object of the input
                 * @param {boolean} field.required - Boolean indicating whether or not the field is mandatory
                 * @param {boolean} field.hasChildren - Boolean indicating whether or not the field has children
                 * @param {any} field.initialValue - The initial input value
                 * @param {Message[]} field.messages - The input value for validation
                 * @returns {Promise<boolean>} A promise that return \`true\` if validation success and \`false\` otherwise
                 */
                validator: {
                  type: Function,
                  default: null
                }
              }
            }
          </script>
        `,
      },
    };

    const expected = [
      '# NumericInput',
      '',
      '## Props',
      '',
      '| Name        | Type       | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Default |',
      '| ----------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |',
      '| `validator` | `function` | The validator function to use to validate data before to emit the `input` event.<br/>**Syntax**<br/><code class="language-typescript">function validator(field: GenericField): Promise&lt;boolean&gt;</code><br/>**Parameters**<br/><ul><li>`field: GenericField` The field that requests validation</li><li>`field.id: string` The input ID attribute value</li><li>`field.name: string` The input name attribute value</li><li>`field.value: any` The input value for validation</li><li>`field.schema: JsonSchema` The JSON Schema object of the input</li><li>`field.required: boolean` Boolean indicating whether or not the field is mandatory</li><li>`field.hasChildren: boolean` Boolean indicating whether or not the field has children</li><li>`field.initialValue: any` The initial input value</li><li>`field.messages: Message[]` The input value for validation</li></ul>**Return value**<br/>A promise that return `true` if validation success and `false` otherwise<br/> | `null`  |',
      '',
    ].join('\n');

    const component = await renderMarkdown(options);

    return expect(component).toEqual(expected);
  });
});
