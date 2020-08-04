'use strict'

const vuedoc = require('../..')

/* global describe it expect */

describe('issues', () => {
  describe('#21 - undefined default value is rendering as a non string', () => {
    it('undefined default value is rendering as a non string', () => {
      const filecontent = `
        <script>
          export default {
            props: {
              value: {
                type: Boolean,
                default: undefined
              }
            }
          }
        </script>
      `

      const parsing = { filecontent }
      const expected = [
        '# Props',
        '',
        '| Name      | Type      | Description | Default     |',
        '| --------- | --------- | ----------- | ----------- |',
        '| `v-model` | `Boolean` |             | `undefined` |'
      ].join('\n')

      return vuedoc.md({ parsing }).then((doc) => expect(doc.trim()).toEqual(expected))
    })
  })

  describe('#7 - Spread Operator not working in component methods', () => {
    it('should parse without errors', () => {
      const parsing = {
        filecontent: `
          <script>
            import { mapActions, mapMutations, mapGetters } from 'vuex';

            export default {
              methods: {
                ...mapActions(['storeAction']),
                ...mapMutations(['storeMutation']),
              },
              computed: {
                ...mapGetters(['storeGetter']),
              }
            }
          </script>
        `
      }

      const expected = [].join('\n')

      return vuedoc.md({ parsing }).then((doc) => expect(doc.trim()).toEqual(expected))
    })
  })

  describe('#27 - feat: consider handling local functions as not part of the component doc', () => {
    it('should parse without errors', () => {
      const parsing = {
        filecontent: `
          <template>
            <div />
          </template>

          <script>
            export default {

            }

            /**
             * @protected
             * some description
             */
            function someLocalFunction  (params) {

            }
          </script>

          <style lang="css" scoped>
          </style>
        `
      }

      const expected = [].join('\n')

      return vuedoc.md({ parsing }).then((doc) => expect(doc.trim()).toEqual(expected))
    })
  })

  describe('#19 - vuedoc.md does not render default param values for function', () => {
    it('should render default param values for function', () => {
      const parsing = {
        filecontent: `
          <script>
            export default {
              methods: {
                /**
                 * Load the given \`schema\` with initial filled \`value\`
                 * Use this to load async schema.
                 *
                 * @param {object} schema - The JSON Schema object to load
                 * @param {Number|String|Array|Object|Boolean} model - The initial data for the schema.
                 *
                 * @Note \`model\` is not a two-way data bindings.
                 * To get the form data, use the \`v-model\` directive.
                 */
                load (schema, model = undefined) {}
              }
            }
          </script>
        `
      }

      const expected = [
        '# Methods',
        '',
        '## load()',
        '',
        'Load the given `schema` with initial filled `value`',
        'Use this to load async schema.',
        '',
        '**Syntax**',
        '',
        '```ts',
        'load(schema: object, model: Number | String | Array | Object | Boolean = undefined): void',
        '```',
        '',
        '**Parameters**',
        '',
        '- **`schema`**<br>',
        '  The JSON Schema object to load',
        '',
        '- **`model`**<br>',
        '  The initial data for the schema.'
      ].join('\n')

      return vuedoc.md({ parsing }).then((doc) => expect(doc.trim()).toEqual(expected))
    })
  })

  describe('#36 - Property with multiple type options destroys table layout', () => {
    it('should render default param values for function', () => {
      const parsing = {
        filecontent: `
          <script>
            export default {
              props: {
                /**
                 * (Description)
                 * @type string or Date
                 */
                datetime: {
                  type: [Date, String],
                  default: null,
                }// as PropOptions<Date | string | String>,
              }
            }
          </script>
        `
      }

      const expected = [
        '# Props',
        '',
        '| Name       | Type             | Description   | Default |',
        '| ---------- | ---------------- | ------------- | ------- |',
        '| `datetime` | `string or Date` | (Description) | `null`  |'
      ].join('\n')

      return vuedoc.md({ parsing }).then((doc) => expect(doc.trim()).toEqual(expected))
    })
  })
})
