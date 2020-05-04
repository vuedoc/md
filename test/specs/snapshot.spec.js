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
fixtures.forEach((fixture) => {
  const filecontent = getFileContent(`${fixture}.vue`)
  const snapshotFilename = getFilePath(`${fixture}.snapshot.md`)

  vuedoc.md({ filecontent }).then((component) => fs.writeFileSync(snapshotFilename, component))
})

describe('snapshots', () => {
  fixtures.forEach((fixture) => it(`should successfully render ${fixture}`, () => {
    const filecontent = getFileContent(`${fixture}.vue`)
    const expected = getFileContent(`${fixture}.snapshot.md`)

    return vuedoc.md({ filecontent }).then((component) => expect(component).toMatchSnapshot(expected))
  }))
})
