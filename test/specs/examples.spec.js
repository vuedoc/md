/* global describe it expect */

const fs = require('fs')
const path = require('path')
const vuedoc = require('../..')

function getFilePath(filename) {
  return path.join(__dirname, '../fixtures', filename)
}

function getFileContent(filename) {
  return fs.readFileSync(getFilePath(filename), 'utf8')
}

const fixtures = [
  'jsdoc.all',
  'jsdoc.param',
  'jsdoc.returns',
  'mdn.event',
  'mdn.regexp',
  'mdn.string'
]

// Update snapshots
if (false) {
  fixtures.forEach((fixture) => {
    const filecontent = getFileContent(`${fixture}.example.vue`)
    const snapshotFilename = getFilePath(`${fixture}.output.md`)

    vuedoc.md({ filecontent }).then((component) => fs.writeFileSync(snapshotFilename, component))
  })
}

describe('examples', () => {
  fixtures.forEach((fixture) => it(`should successfully render ${fixture}`, () => {
    const filecontent = getFileContent(`${fixture}.example.vue`)
    const expected = getFileContent(`${fixture}.output.md`)

    return vuedoc.md({ filecontent }).then((component) => expect(component).toEqual(expected))
  }))
})
