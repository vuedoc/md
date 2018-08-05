'use strict'

const vuedoc = require('../..')
const assert = require('assert')
const path = require('path')

/* global describe it */

const FIXTURES_PATH = path.join(__dirname, '../fixtures')

describe('features', () => {
  describe('jsdoc', () => {
    it('should successfully render with JSDoc tags', () => {
      const filename = path.join(FIXTURES_PATH, 'jsdoc.vue')
      const expected = '# checkbox \n\n## events \n\n- `finished` \n\n  Emitted the event `finished` when loaded\n  Multilign \n\n  **arguments:** \n\n     - `status` **Any** - The finishing status \n\n## methods \n\n- `set(id, name, order, values, ...rest)` \n\n  Set the checkbox ID \n\n  **parameters:** \n\n     - `id` **string** - The checkbox ID \n     - `name` **string** *(optional)* - The checkbox name \n     - `order` **number** *(optional)* `default: 1` - The checkbox order \n     - `values` **string|string[]** *(optional)* - The checkbox values \n     - `...rest` **Any** *(optional)* - The rest options \n\n   **return value:** \n\n     - **boolean** - True on success; ortherwise false \n'

      return vuedoc.md({ filename })
        .then((md) => {
          require('fs').writeFileSync('md.md', md)
          return md
        })
        .then((md) => expect(md).toEqual(expected))
    })
  })
})
