'use strict'

const vuedoc = require('..')
const assert = require('assert')
const path = require('path')

const options = {
  filename: path.join(__dirname, 'fixtures/checkbox.vue')
}

let document = null

vuedoc.md(options)
  .then((_document) => (document = _document))
  .catch((err) => { throw err })

/* global describe it */

describe('header', () => {
  it('should render the component name as main title', () =>
    assert.ok(/# checkbox/.test(document)))

  it('should render the component description', () =>
    assert.ok(/A simple checkbox component/.test(document)))
})

describe('props', () => {
  it('should render props title', () =>
    assert.ok(/## props/.test(document)))

  it('should render props.model with a description', () => {
    assert.ok(/- .model. \*\*\*Array\*\*\* \(\*required\*\) .twoWay = true./.test(document))
    assert.ok(/The checbox model/.test(document))
  })

  it('should render props.disabled with a description', () => {
    assert.ok(/- .disabled. \*\*\*Boolean\*\*\* \(\*optional\*\)/.test(document))
    assert.ok(/Initial checbox state/.test(document))
  })

  it('should render props.checked with a description', () => {
    assert.ok(/- .enabled. \*\*\*Boolean\*\*\* \(\*optional\*\) .default: true../.test(document))
    assert.ok(/Initial checbox value/.test(document))
  })
})

describe('slots', () => {
  it('should render slots title', () =>
    assert.ok(/## slots/.test(document)))

  it('should render the default slot without a description', () => {
    assert.ok(/- .default./.test(document))
  })

  it('should render the nammed slot with a description', () => {
    assert.ok(/- .label. Use this slot to set the checbox label/.test(document))
  })
})

describe('events', () => {
  it('should render events title', () =>
    assert.ok(/## events/.test(document)))

  it('should render an event with a description', () => {
    assert.ok(/- .loaded. Emitted when the component has been loaded/.test(document))
  })

  it('should render an event with a multiline description', () => {
    assert.ok(/- .enabled. Emitted the event .enabled. when loaded\s+Multilign/.test(document))
  })
})

describe('methods', () => {
  it('should render methods title', () =>
    assert.ok(/## methods/.test(document)))

  it('should render an event with a description', () => {
    assert.ok(/- .check\(\).\s+Check if the input is checked/.test(document))
  })

  it('should render an event without a description', () => {
    assert.ok(/- .prop\(\)./.test(document))
  })
})
