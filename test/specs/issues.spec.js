'use strict'

const vuedoc = require('../..')
const path = require('path')

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
      const expected = '# props\n\n- `value` ***Boolean*** (*optional*) `default: undefined`'

      return vuedoc.md(options)
        .then((doc) => expect(doc.trim()).toEqual(expected))
    })
  })
})
