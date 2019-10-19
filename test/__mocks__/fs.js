/* eslint-disable */

const stream = require('stream')
const path = require('path')
const memfs = require('memfs')
const fs = jest.requireActual('fs')
const fixturesPath = path.join(__dirname, '../fixtures')
const volumes = {}

fs.readdirSync(fixturesPath).forEach((file) => {
  const filename = path.join(fixturesPath, file)
  const content = fs.readFileSync(filename, 'utf8')

  volumes[filename] = content
})

const jestfs = jest.genMockFromModule('fs')

jestfs.__setMockFiles = (newMockFiles) => {
  memfs.vol.fromJSON({ ...volumes, ...newMockFiles })
}

jestfs.readFileSync = memfs.fs.readFileSync
jestfs.writeFileSync = memfs.fs.writeFileSync
jestfs.lstatSync = memfs.fs.lstatSync
jestfs.createWriteStream = memfs.fs.createWriteStream

// class OutputStream extends stream.Writable {
//   constructor(...args) {
//     super(...args)

//     this.content = ''
//   }

//   _write(chunk, enc, next) {
//     this.content += chunk.toString()
//     next()
//   }
// }

// fs.createWriteStream.mockImplementation = (filename) => {
//   return new OutputStream()
// }

module.exports = jestfs
