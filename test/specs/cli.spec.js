'use strict'

const vuedoc = require('../..')
const assert = require('assert')
const path = require('path')

const options = {
  filename: path.join(__dirname, '../fixtures/checkbox.vue')
}

let document = null

vuedoc.md(options)
  .then((_document) => (document = _document))
  .catch((err) => { throw err })

/* global describe it */

describe('options', () => {
  let document = null
  const _options = {}

  Object.assign(_options, options)

  _options.ignoreName = true
  _options.ignoreDescription = true

  vuedoc.md(_options)
    .then((_document) => (document = _document))
    .catch((err) => { throw err })

  it('should render without main title', () =>
    assert.equal(/# checkbox/.test(document), false))
})
