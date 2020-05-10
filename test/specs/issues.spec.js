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
})
