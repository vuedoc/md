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

      const options = { filecontent }
      const expected = [
        '# Props',
        '',
        '| Name      | Type      | Description | Default     |',
        '| --------- | --------- | ----------- | ----------- |',
        '| `v-model` | `Boolean` |             | `undefined` |'
      ].join('\n')

      return vuedoc.md(options).then((doc) => expect(doc.trim()).toEqual(expected))
    })
  })

  describe('#7 - Spread Operator not working in component methods', () => {
    it('should parse without errors', () => {
      const options = {
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

      return vuedoc.md(options).then((doc) => expect(doc.trim()).toEqual(expected))
    })
  })

  describe('#27 - feat: consider handling local functions as not part of the component doc', () => {
    it('should parse without errors', () => {
      const options = {
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

      return vuedoc.md(options).then((doc) => expect(doc.trim()).toEqual(expected))
    })
  })
})
