/* global describe it expect */

const fs = require('fs')
const path = require('path')
const vuedoc = require('../..')

function getFileContent(filename) {
  const filepath = path.join(__dirname, '../fixtures', filename)

  return fs.readFileSync(filepath, 'utf8')
}

const fixtures = [
  'jsdoc.param',
  'jsdoc.returns',
  'mdn.string',
  'mdn.regexp'
]

describe('snapshots', () => {
  fixtures.forEach((fixture) => it(`should successfully render ${fixture}`, () => {
    const filecontent = getFileContent(`${fixture}.vue`)
    const expected = getFileContent(`${fixture}.snapshot.md`)

    return vuedoc.md({ filecontent }).then((component) => expect(component).toMatchSnapshot(expected))
  }))
})
