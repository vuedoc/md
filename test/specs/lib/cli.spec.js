'use strict'

const fs = require('fs')
const path = require('path')
const stream = require('stream')
const assert = require('assert')
const Parser = require('@vuedoc/parser/lib/parser')

const cli = require('../../../lib/cli')
const fixturesPath = path.join(__dirname, '../../fixtures')
const readmefile = path.join(fixturesPath, 'README.md')
const notfoundfile = path.join(fixturesPath, 'notfound.vue')
const checkboxfile = path.join(fixturesPath, 'checkbox.vue')

let streamContent = ''

class OutputStream extends stream.Writable {
  _write(chunk, enc, next) {
    streamContent += chunk.toString()
    next()
  }
}

const vuecomponent = `
  <script>
    /**
     * Void component
     */
    export default {
      name: 'void',
      render () {
        return null
      }
    }
  </script>
`

const originalStdout = process.stdout

const defaultOptions = {
  stream: true,
  filenames: [],
  features: Parser.SUPPORTED_FEATURES
}

/* global describe it */

describe('lib/cli', () => {
  describe('validateOptions(options)', () => {
    const defaultOptions = { stream: true, filenames: [] }

    describe('--section', () => {
      const section = 'API'
      const options = Object.assign({}, defaultOptions, { section })

      it('should failed with missing --output option', () => {
        assert.throws(
          () => cli.validateOptions(options), /--output is required/)
      })

      it('should failed with invalid --output option value', () => {
        const output = fixturesPath
        const _options = Object.assign({}, options, { output })

        assert.throws(
          () => cli.validateOptions(_options), /--output value must be an existing file/)
      })

      it('should successfully validate', () => {
        const output = readmefile
        const _options = Object.assign({}, options, { output })

        assert.doesNotThrow(() => cli.validateOptions(_options))
      })
    })

    describe('with right options', () => {
      it('should successfully validate', () => {
        assert.doesNotThrow(() => cli.validateOptions(defaultOptions))
      })
    })
  })

  describe('parseArgs(argv)', () => {
    let options

    beforeEach(() => {
      options = {}
    })

    describe('--level', () => {
      it('should failed with missing level value', () => {
        const argv = [ '--level' ]

        assert.throws(() => cli.parseArgs(argv), /Missing level value/)
      })

      it('should failed with invalid level value', () => {
        const argv = [ '--level', 'hello.vue' ]

        assert.throws(() => cli.parseArgs(argv), /Invalid level value/)
      })

      it('should successfully set the level option', () => {
        const level = 2
        const argv = [ '--level', level ]

        assert.doesNotThrow(() => (options = cli.parseArgs(argv)))

        const expected = Object.assign({}, defaultOptions, { level })

        assert.deepEqual(options, expected)
      })
    })

    describe('--output', () => {
      it('should failed with missing level value', () => {
        const argv = [ '--output' ]

        assert.throws(() => cli.parseArgs(argv), /Missing output value/)
      })

      it('should successfully set the output option', () => {
        const output = fixturesPath
        const argv = [ '--output', output ]

        assert.doesNotThrow(() => (options = cli.parseArgs(argv)))

        const expected = Object.assign({}, defaultOptions, { output })

        assert.deepEqual(options, expected)
      })
    })

    describe('--section', () => {
      it('should failed with missing level value', () => {
        const argv = [ '--section' ]

        assert.throws(() => cli.parseArgs(argv), /Missing section value/)
      })

      it('should successfully set the section option', () => {
        const section = 'API'
        const output = readmefile
        const argv = [
          '--section', section,
          '--output', output
        ]

        assert.doesNotThrow(() => (options = cli.parseArgs(argv)))

        const expected = Object.assign({}, defaultOptions, { section, output })

        assert.deepEqual(options, expected)
      })
    })

    defaultOptions.features.forEach((feature) => {
      describe(`--ignore-${feature}`, () => {
        it(`should successfully set the ignore-${feature} option`, () => {
          const argv = [ `--ignore-${feature}` ]
          const features = defaultOptions.features.filter((item) => item !== feature)
          const expected = Object.assign({}, defaultOptions, { features })

          assert.doesNotThrow(() => {
            const options = cli.parseArgs(argv)

            assert.deepEqual(options, expected)
          })
        })
      })
    })

    describe('filenames', () => {
      it('should successfully set files', () => {
        const filenames = [ '/tmp/checkbox.vue', '/tmp/textarea.vue' ]
        const argv = filenames
        const expected = Object.assign({}, defaultOptions, { filenames })

        assert.doesNotThrow(() => {
          const options = cli.parseArgs(argv)

          assert.deepEqual(options, expected)
        })
      })
    })
  })

  describe('parseArgs(argv, requireFiles)', () => {
    let options
    const argv = ['node', 'vuedoc.md']

    beforeEach(() => {
      options = {}
    })

    it('should failed with missing files', () => {
      assert.throws(() => cli.parseArgs([], true), /Missing filename/)
    })

    it('should successfully set files', () => {
      const filenames = [ '/tmp/checkbox.vue', '/tmp/textarea.vue' ]
      const argv = filenames

      assert.doesNotThrow(() => (options = cli.parseArgs(argv, true)))

      const expected = Object.assign({}, defaultOptions, { filenames })

      assert.deepEqual(options, expected)
    })
  })

  describe('findSectionNode(section)', () => {
    it('should successfully found section node', () => {
      const section = 'API'
      const node = {
        type: 'Header',
        children: [
          {
            type: 'Str',
            value: section,
            raw: section
          }
        ],
        raw: `# ${section}`
      }
      const tree = {
        type: 'Document',
        children: [
          {
            type: 'Str',
            value: 'Text',
            raw: 'Text'
          },
          node
        ],
        raw: `Text\n\n# ${section}`
      }
      const expected = node
      const foundNode = tree.children.find(cli.findSectionNode(section))

      assert.ok(foundNode)
      assert.deepEqual(foundNode, expected)
    })
  })

  describe('processRawContent(argv, componentRawContent)', () => {
    beforeEach(() => {
      process.__defineGetter__('stdout', function() {
        return new OutputStream()
      })
    })

    afterEach(() => {
      process.__defineGetter__('stdout', function() {
        return originalStdout
      })
    })

    it('should failed to generate the component documentation', (done) => {
      const argv = []
      const componentRawContent = `
        <template>
          <input @click="input"/>
        </template>
        <script>var skrgj=!</script>
      `

      cli.processRawContent(argv, componentRawContent)
        .then(() => done(new Error()))
        .catch(() => done())
    })

    it('should successfully generate the component documentation', () => {
      const argv = []
      const filename = checkboxfile
      const componentRawContent = fs.readFileSync(filename, 'utf8')

      return cli.processRawContent(argv, componentRawContent)
    })
  })

  describe('processWithOutputOption(options)', () => {
    const output = readmefile
    const filenames = [ checkboxfile ]

    describe('should successfully generate the component documentation', () => {
      const originalCreateWriteStream = fs.createWriteStream
      const originalReadFileSync = fs.readFileSync
      const originalWriteFile = fs.writeFileSync
      const voidfile = '/tmp/void.vue'
      const filenames = [ voidfile ]
      const files = {
        [voidfile]: vuecomponent,
        [readmefile]: '# Sample\nDescription\n\n# API\n**WIP**\n\n# License\nMIT'
      }
      let writeFileContent = ''

      beforeEach(() => {
        streamContent = ''
        writeFileContent = ''

        fs.writeFileSync = (filename, content) => {
          writeFileContent = content
        }

        fs.readFileSync = (filename, encoding) => {
          if (!files.hasOwnProperty(filename)) {
            return originalReadFileSync.call(fs, filename, encoding)
          }

          if (encoding) {
            return files[filename]
          }

          return {
            toString () {
              return files[filename]
            }
          }
        }

        fs.createWriteStream = (filename) => {
          return new OutputStream()
        }
      })

      afterEach(() => {
        fs.writeFileSync = originalWriteFile
        fs.readFileSync = originalReadFileSync
        fs.createWriteStream = originalCreateWriteStream
      })

      it('with --section', () => {
        const section = 'API'
        const options = { output, filenames, section }
        const expected = '# Sample\nDescription\n\n# API\n\n## void\nVoid component\n\n# License\nMIT'

        return cli.processWithOutputOption(options).then(() => {
          assert.notEqual(writeFileContent.search(/\n## void/), -1)
          assert.notEqual(writeFileContent.search(/\nVoid component/), -1)
        })
      })

      it('with --section and --level', () => {
        const section = 'API'
        const level = 3
        const options = { output, filenames, section, level }

        return cli.processWithOutputOption(options).then(() => {
          assert.notEqual(writeFileContent.search(/\n### void/), -1)
          assert.notEqual(writeFileContent.search(/\nVoid component/), -1)
        })
      })

      it('should successfully generate the component documentation', () => {
        const options = { output, filenames }

        return cli.processWithOutputOption(options)
      })

      it('should successfully generate the component documentation with output directory', () => {
        const output = fixturesPath
        const options = { output, filenames }

        return cli.processWithOutputOption(options)
      })
    })

    describe('should failed to generate the component documentation', () => {
      it('without --section', (done) => {
        const filenames = [ notfoundfile ]
        const options = { output, filenames }

        cli.processWithOutputOption(options)
          .then(() => done(new Error()))
          .catch(() => done())
      })
    })
  })

  describe('processWithoutOutputOption(options)', () => {
    beforeEach(() => {
      process.__defineGetter__('stdout', function() {
        return new OutputStream()
      })
    })

    afterEach(() => {
      process.__defineGetter__('stdout', function() {
        return originalStdout
      })
    })

    it('should failed to generate the component documentation', (done) => {
      const options = { filenames: [ notfoundfile ] }

      cli.processWithoutOutputOption(options)
        .then(() => done(new Error()))
        .catch(() => done())
    })

    it('should successfully generate the component documentation', () => {
      const options = { filenames: [ checkboxfile ] }

      return cli.processWithoutOutputOption(options)
    })
  })

  describe('exec(argv, componentRawContent)', () => {
    beforeEach(() => {
      process.__defineGetter__('stdout', function() {
        return new OutputStream()
      })
    })

    afterEach(() => {
      process.__defineGetter__('stdout', function() {
        return originalStdout
      })
    })

    it('should successfully generate the component documentation', () => {
      const argv = []
      const filename = checkboxfile
      const componentRawContent = fs.readFileSync(filename, 'utf8')

      return cli.exec(argv, componentRawContent)
    })
  })

  describe('exec(argv)', () => {
    const argv = [ checkboxfile ]

    beforeEach(() => {
      process.__defineGetter__('stdout', function() {
        return new OutputStream()
      })
    })

    afterEach(() => {
      process.__defineGetter__('stdout', function() {
        return originalStdout
      })
    })

    it('should successfully generate the component documentation with --output', () => {
      return cli.exec(argv.concat(['--output', fixturesPath]))
    })

    it('should successfully generate the component documentation', () => {
      return cli.exec(argv)
    })
  })

  describe('silenceExec(argv)', () => {
    const originalStderr = process.stderr
    const originalConsoleError = console.error

    beforeEach(() => {
      streamContent = ''

      console.error = (message) => (streamContent = message)

      process.__defineGetter__('stdout', function() {
        return new OutputStream()
      })

      process.__defineGetter__('stderr', function() {
        return new OutputStream()
      })
    })

    afterEach(() => {
      console.error = originalConsoleError

      process.__defineGetter__('stdout', function() {
        return originalStdout
      })

      process.__defineGetter__('stderr', function() {
        return originalStderr
      })
    })

    it('should successfully generate the component documentation with --output', () => {
      cli.silenceExec([ checkboxfile ])
    })

    it('should failed with an exception', () => {
      cli.silenceExec([])

      assert.notEqual(streamContent.search(/Missing filename/), -1)
    })

    it('should failed promise error catching', () => {
      cli.silenceExec([notfoundfile])
    })
  })
})
