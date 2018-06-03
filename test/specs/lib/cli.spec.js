'use strict'

const fs = require('fs')
const path = require('path')
const stream = require('stream')
const assert = require('assert')
const Parser = require('@vuedoc/parser/lib/parser')
const { spawn } = require('child_process')

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
  join: false,
  stream: true,
  filenames: [],
  features: Parser.SUPPORTED_FEATURES
}

/* global describe it */

describe('lib/cli', () => {
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

    describe('--join', () => {
      const join = true
      const options = Object.assign({}, defaultOptions, { join })

      it('should failed with invalid --output option value', () => {
        const output = fixturesPath
        const _options = Object.assign({}, options, { output })

        assert.throws(
          () => cli.validateOptions(_options), /--output value must be a file when using --join/)
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

    describe('--join', () => {
      it('should successfully set the join option', () => {
        const argv = [ '--join' ]

        assert.doesNotThrow(() => (options = cli.parseArgs(argv)))

        const expected = Object.assign({}, defaultOptions, { join: true })

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

      it('with --join', () => {
        const join = true
        const file1 = path.join(fixturesPath, 'join.component.1.js')
        const file2 = path.join(fixturesPath, 'join.component.2.vue')
        const filenames = [ file1, file2 ]
        const options = { join, filenames }
        const expected = '# checkbox \n\nA simple checkbox component \n\n- **author** - Sébastien \n- **license** - MIT \n- **input** \n\n## slots \n\n- `default`  \n\n- `label` Use this slot to set the checkbox label \n\n## props \n\n- `schema` ***Object|Promise*** (*required*) \n\n   The JSON Schema object. Use the `v-if` directive \n\n- `v-model` ***Object*** (*optional*) `default: [object Object]` \n\n   Use this directive to create two-way data bindings \n\n- `model` ***Array*** (*required*) `twoWay = true` \n\n   The checkbox model \n\n- `disabled` ***Boolean*** (*optional*) \n\n   Initial checkbox state \n\n## events \n\n- `created` \n\n   Emitted when the component has been created \n\n- `loaded` \n\n   Emitted when the component has been loaded \n\n'

        return cli.processWithOutputOption(options)
          .then(() => assert.equal(streamContent, expected))
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

    it('should successfully generate the component documentation with --join', () => {
      const join = true
      const file1 = path.join(fixturesPath, 'join.component.1.js')
      const file2 = path.join(fixturesPath, 'join.component.2.vue')
      const filenames = [ file1, file2 ]
      const options = { join, filenames }
      const expected = '# checkbox \n\nA simple checkbox component \n\n- **author** - Sébastien \n- **license** - MIT \n- **input** \n\n## slots \n\n- `default`  \n\n- `label` Use this slot to set the checkbox label \n\n## props \n\n- `schema` ***Object|Promise*** (*required*) \n\n   The JSON Schema object. Use the `v-if` directive \n\n- `v-model` ***Object*** (*optional*) `default: [object Object]` \n\n   Use this directive to create two-way data bindings \n\n- `model` ***Array*** (*required*) `twoWay = true` \n\n   The checkbox model \n\n- `disabled` ***Boolean*** (*optional*) \n\n   Initial checkbox state \n\n## events \n\n- `created` \n\n   Emitted when the component has been created \n\n- `loaded` \n\n   Emitted when the component has been loaded \n\n'

      return cli.processWithoutOutputOption(options)
        .then(() => assert.equal(streamContent, expected))
    })
  })

  describe('exec(argv, componentRawContent)', () => {
    it('should successfully generate the component documentation', () => {
      const argv = []
      const filename = checkboxfile
      const componentRawContent = fs.readFileSync(filename, 'utf8')

      return cli.exec(argv, componentRawContent)
    })
  })

  describe('exec(argv)', () => {
    it('should successfully print version with --version', (done) => {
      const { version } = require('../../../package')
      const expected = `@vuedoc/md v${version}\n`
      const cli = spawn('node', ['bin/cli.js', '--version'])

      cli.stdout.on('data', (data) => {
        assert.equal(data.toString(), expected)
        done()
      })
    })

    it('should successfully generate the component documentation with --output', () => {
      return cli.exec([ checkboxfile, '--output', fixturesPath ])
    })

    it('should successfully generate the component documentation', () => {
      return cli.exec([ checkboxfile ])
    })

    it('should successfully generate the joined components documentation', () => {
      const joinExpectedDoc = path.join(fixturesPath, 'join.expected.doc.md')
      const expected = 'A simple checkbox component \n\n- **author** - Sébastien \n- **license** - MIT \n- **input** \n\n# slots \n\n- `default`  \n\n- `label` Use this slot to set the checkbox label \n\n# props \n\n- `schema` ***Object|Promise*** (*required*) \n\n   The JSON Schema object. Use the `v-if` directive \n\n- `v-model` ***Object*** (*optional*) `default: [object Object]` \n\n   Use this directive to create two-way data bindings \n\n- `model` ***Array*** (*required*) `twoWay = true` \n\n   The checkbox model \n\n- `disabled` ***Boolean*** (*optional*) \n\n   Initial checkbox state \n\n# events \n\n- `created` \n\n   Emitted when the component has been created \n\n- `loaded` \n\n   Emitted when the component has been loaded \n\n'
      const file1 = path.join(fixturesPath, 'join.component.1.js')
      const file2 = path.join(fixturesPath, 'join.component.2.vue')

      return cli.exec([ '--ignore-name', '--join', file1, file2 ])
        .then(() => assert.equal(streamContent, expected))
    })
  })

  describe('silenceExec(argv)', () => {
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

  describe('integration', () => {
    describe('jsdoc', () => {
      it('should successfully render with JSDoc tags', () => {
        const filename = path.join(fixturesPath, 'jsdoc.vue')
        const expected = '# checkbox \n\n## events \n\n- `finished` \n\n   Emitted the event `finished` when loaded Multilign \n\n   **arguments:** \n\n     - `status` **Any** - The finishing status \n\n## methods \n\n- `set(id, name, order, values, ...rest)` \n\n   Set the checkbox ID \n\n   **parameters:** \n\n     - `id` **string** - The checkbox ID \n     - `name` **string** *(optional)* - The checkbox name \n     - `order` **number** *(optional)* `default: 1` - The checkbox order \n     - `values` **string|string[]** *(optional)* - The checkbox values \n     - `...rest` **Any** *(optional)* - The rest options \n\n   **return value:** \n\n     - **boolean** - True on success; ortherwise false \n'
        const options = { filename }

        return cli.exec([ filename ])
          .then(() => assert.equal(streamContent, expected))
      })
    })
  })
})
