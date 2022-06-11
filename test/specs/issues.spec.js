import { describe, it, expect } from '@jest/globals';
import { renderMarkdown } from '../../index.js';

describe('issues', () => {
  describe('#21 - undefined default value is rendering as a non string', () => {
    it('undefined default value is rendering as a non string', async () => {
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
      `;

      const parsing = { filecontent };
      const expected = [
        '# Props',
        '',
        '| Name      | Type      | Description | Default     |',
        '| --------- | --------- | ----------- | ----------- |',
        '| `v-model` | `Boolean` |             | `undefined` |',
      ].join('\n');

      const doc = await renderMarkdown({ parsing });

      return expect(doc.trim()).toEqual(expected);
    });
  });

  describe('#7 - Spread Operator not working in component methods', () => {
    it('should parse without errors', async () => {
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
        `,
      };

      const expected = [].join('\n');
      const doc = await renderMarkdown({ parsing });

      return expect(doc.trim()).toEqual(expected);
    });
  });

  describe('#27 - feat: consider handling local functions as not part of the component doc', () => {
    it('should parse without errors', async () => {
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
        `,
      };

      const expected = [].join('\n');
      const doc = await renderMarkdown({ parsing });

      return expect(doc.trim()).toEqual(expected);
    });
  });

  describe('#19 - renderMarkdown does not render default param values for function', () => {
    it('should render default param values for function', async () => {
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
        `,
      };

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
        '```typescript',
        'load(schema: object, model: Number | String | Array | Object | Boolean = undefined): void',
        '```',
        '',
        '**Parameters**',
        '',
        '- `schema: object`<br/>',
        '  The JSON Schema object to load',
        '',
        '- `model: Number | String | Array | Object | Boolean = undefined`<br/>',
        '  The initial data for the schema.',
      ].join('\n');

      const doc = await renderMarkdown({ parsing });

      return expect(doc.trim()).toEqual(expected);
    });
  });

  describe('#36 - Property with multiple type options destroys table layout', () => {
    it('should render default param values for function', async () => {
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
        `,
      };

      const expected = [
        '# Props',
        '',
        '| Name       | Type             | Description   | Default |',
        '| ---------- | ---------------- | ------------- | ------- |',
        '| `datetime` | `string or Date` | (Description) | `null`  |',
      ].join('\n');

      const doc = await renderMarkdown({ parsing });

      return expect(doc.trim()).toEqual(expected);
    });
  });

  describe('vuedoc/parser#83 - Parser issue with !(...)', () => {
    it('should render without errors', async () => {
      const parsing = {
        filecontent: `
          <script>
            import Vue from 'vue'

            /**
             * @mixin
             */
            export function TestMixinFactory(boundValue: number) {
                return Vue.extend({
                    methods: {
                        /**
                         * Testing
                         *
                         * @public
                         */
                        myFunction(test: Promise<string>): number {
                            let a, b, c = 0
                            let d = !(a || b || c)
                            return boundValue
                        },
                    },
                })
            }
          </script>
        `,
      };

      const expected = [
        '# TestMixinFactory',
        '',
        '## Methods',
        '',
        '### myFunction()',
        '',
        'Testing',
        '',
        '**Syntax**',
        '',
        '```typescript',
        'myFunction(test: Promise<string>): number',
        '```',
      ].join('\n');

      const doc = await renderMarkdown({ parsing });

      return expect(doc.trim()).toEqual(expected);
    });
  });

  describe('vuedoc/parser#85 - Multiline default breaks table', () => {
    it('should successfully render multiline prop value', async () => {
      const parsing = {
        filecontent: `
          <template>
            <div>

            </div>
          </template>

          <script lang='ts'>
            import mixins         from 'vue-typed-mixins'
            import {PropOptions}  from 'vue'

            const Vue = mixins()
            export default Vue.extend({
              name: "TestComponent",
              props: {
                testProp: {
                  type: Object,
                  default: () => ({
                    a: 1,
                    b: 2,
                  })
                } as PropOptions<Record<string, any>>,
                testProp2: String,
              },
            })
          </script>
        `,
      };

      const expected = [
        '# TestComponent',
        '',
        '## Props',
        '',
        '| Name         | Type                  | Description | Default                   |',
        '| ------------ | --------------------- | ----------- | ------------------------- |',
        '| `test-prop`  | `Record<string, any>` |             | `() => ({ a: 1, b: 2, })` |',
        '| `test-prop2` | `String`              |             | &nbsp;                    |',
      ].join('\n');

      const doc = await renderMarkdown({ parsing });

      return expect(doc.trim()).toEqual(expected);
    });
  });
});
