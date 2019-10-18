'use strict'

const vuedoc = require('../..')

/* global describe it */

describe('features', () => {
  describe('jsdoc', () => {
    it('should successfully render function parameters', () => {
      const filecontent = `
        <script>
          export default {
            methods: {
              /**
               * Set the checkbox ID
               * @param {string} id - The checkbox ID
               * @param {string} [name] - The checkbox name
               * @param {number} [order=1] - The checkbox order
               * @param {string|string[]} [values] - The checkbox values
               * @param {*} [...rest] - The rest options
               * @return {boolean} True on success; ortherwise false
               */
              set (id, name, ...rest) {}
            }
          }
        </script>
      `
      const expected = '# methods \n\n- `set(id, name, order, values, ...rest)` \n\n  Set the checkbox ID \n\n  **parameters:** \n\n     - `id` **string** - The checkbox ID \n     - `name` **string** *(optional)* - The checkbox name \n     - `order` **number** *(optional)* `default: 1` - The checkbox order \n     - `values` **string|string[]** *(optional)* - The checkbox values \n     - `...rest` **Any** *(optional)* - The rest options \n\n   **return value:** \n\n     - **boolean** - True on success; ortherwise false \n'

      return vuedoc.md({ filecontent }).then((md) => {
        expect(md).toEqual(expected)
      })
    })

    it('should successfully render event arguments', () => {
      const filecontent = `
        <script>
          export default {
            methods: {
              set (id, name, ...rest) {
                const status = true

                /**
                 * Emitted the event \`finished\` when loaded
                 * Multilign
                 * @arg {*} status - The finishing status
                 */
                this.$emit('finished', status)
              }
            }
          }
        </script>
      `
      const expected = '# events \n\n- `finished` \n\n  Emitted the event `finished` when loaded\n  Multilign \n\n  **arguments:** \n\n     - `status` **Any** - The finishing status \n\n'

      return vuedoc.md({ filecontent }).then((md) => {
        expect(md).toEqual(expected)
      })
    })
  })
})
