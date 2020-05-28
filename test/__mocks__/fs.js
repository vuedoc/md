const path = require('path')
const memfs = require('memfs')

/* global jest */

const fs = jest.requireActual('fs')
const jestfs = jest.genMockFromModule('fs')

const fixturesPath = path.join(__dirname, '../fixtures')
const volumes = {}

fs.readdirSync(fixturesPath).forEach((file) => {
  const filename = path.join(fixturesPath, file)
  const content = fs.readFileSync(filename, 'utf8')

  volumes[filename] = content
})


jestfs.$setMockFiles = (newMockFiles) => {
  memfs.vol.fromJSON({ ...volumes, ...newMockFiles })
}

jestfs.readFileSync = memfs.fs.readFileSync
jestfs.writeFileSync = memfs.fs.writeFileSync
jestfs.lstatSync = memfs.fs.lstatSync
jestfs.createWriteStream = memfs.fs.createWriteStream

module.exports = jestfs
