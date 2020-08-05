const path = require('path')
const child = require('child_process')
const stream = require('stream')
const assert = require('assert')

const { Parser } = require('@vuedoc/parser/lib/parser/Parser')
const { spawn } = require('child_process')

const cli = require('../../../lib/cli')
const fixturesPath = path.join(__dirname, '../../fixtures')
const readmefile = path.join(fixturesPath, 'README.md')
const readme2file = path.join(fixturesPath, 'README2.md')
const notfoundfile = path.join(fixturesPath, 'notfound.vue')
const checkboxfile = path.join(fixturesPath, 'checkbox.example.vue')

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
  parsing: {
    features: Parser.SUPPORTED_FEATURES
  }
}

const voidfile = '/tmp/void.vue'
const parsingFile = path.join(fixturesPath, 'vuedoc.config.js')

jest.mock('fs')

const fs = require('fs')

fs.$setMockFiles({
  [voidfile]: vuecomponent,
  [readmefile]: [
    '# Sample\n\n',
    'Description\n\n',
    '# API\n',
    '**WIP**\n\n',
    '# License\n\n',
    'MIT'
  ].join(''),
  [readme2file]: [
    '# Sample\n\n',
    'Description\n\n',
    '###### API\n',
    '**WIP**\n\n',
    '# License\n\n',
    'MIT'
  ].join('')
})

/* global describe it expect */

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
    });

    [ '-v', '--version' ].forEach((arg) => describe(arg, () => {
      it(`should display package version with ${arg}`, (done) => {
        const exec = path.join(__dirname, '../../../bin/cli.js')
        const args = [ arg ]
        const proc = child.spawn(exec, args, { stdio: 'pipe' })

        const { name, version } = require('../../../package.json')
        const expected = `${name} v${version}\n`

        proc.stderr.once('data', done)

        proc.stdout.once('data', (output) => {
          expect(output.toString('utf-8')).toEqual(expected)
          done()
        })
      })
    }));

    [ '-c', '--config' ].forEach((arg) => describe(arg, () => {
      it('should successfully parse with missing config value', () => {
        const argv = [ arg ]

        assert.doesNotThrow(() => cli.parseArgs(argv))
      })

      it('should failed with invalid config value', () => {
        const argv = [ arg, 'no found file' ]

        assert.throws(() => cli.parseArgs(argv), /Cannot find module/)
      })

      it('should successfully set the parsing config option', () => {
        const argv = [ arg, parsingFile ]

        assert.doesNotThrow(() => (options = cli.parseArgs(argv)))

        const expected = Object.assign({}, defaultOptions, {
          parsing: {
            ...defaultOptions.parsing,
            features: ['name', 'description', 'keywords', 'slots', 'model', 'props', 'events', 'methods'],
            loaders: []
          }
        })

        expect(options).toEqual(expected)
      })
    }));

    [ '-l', '--level' ].forEach((arg) => describe(arg, () => {
      it('should failed with missing level value', () => {
        const argv = [ arg ]

        assert.throws(() => cli.parseArgs(argv), /Missing level value/)
      })

      it('should failed with invalid level value', () => {
        const argv = [ arg, 'hello.vue' ]

        assert.throws(() => cli.parseArgs(argv), /Invalid level value/)
      })

      it('should successfully set the level option', () => {
        const level = 2
        const argv = [ arg, level ]

        assert.doesNotThrow(() => (options = cli.parseArgs(argv)))

        const expected = Object.assign({}, defaultOptions, { level })

        assert.deepEqual(options, expected)
      })
    }));

    [ '-o', '--output' ].forEach((arg) => describe(arg, () => {
      it('should failed with missing level value', () => {
        const argv = [ arg ]

        assert.throws(() => cli.parseArgs(argv), /Missing output value/)
      })

      it('should successfully set the output option', () => {
        const output = fixturesPath
        const argv = [ arg, output ]

        assert.doesNotThrow(() => (options = cli.parseArgs(argv)))

        const expected = Object.assign({}, defaultOptions, { output })

        assert.deepEqual(options, expected)
      })
    }));

    [ '-s', '--section' ].forEach((arg) => describe(arg, () => {
      it('should failed with missing level value', () => {
        const argv = [ arg ]

        assert.throws(() => cli.parseArgs(argv), /Missing section value/)
      })

      it('should successfully set the section option', () => {
        const section = 'API'
        const output = readmefile
        const argv = [
          arg, section,
          '--output', output
        ]

        assert.doesNotThrow(() => (options = cli.parseArgs(argv)))

        const expected = Object.assign({}, defaultOptions, { section, output })

        assert.deepEqual(options, expected)
      })
    }));

    [ '-j', '--join' ].forEach((arg) => describe(arg, () => {
      it('should successfully set the join option', () => {
        const argv = [ arg ]

        assert.doesNotThrow(() => (options = cli.parseArgs(argv)))

        const expected = Object.assign({}, defaultOptions, { join: true })

        assert.deepEqual(options, expected)
      })
    }));

    defaultOptions.parsing.features.forEach((feature) => {
      describe(`--ignore-${feature}`, () => {
        it(`should successfully set the ignore-${feature} option`, () => {
          const argv = [ `--ignore-${feature}` ]
          const expected = Object.assign({}, defaultOptions, {
            parsing: {
              ...defaultOptions.parsing,
              features: defaultOptions.parsing.features.filter((item) => item !== feature)
            }
          })

          assert.doesNotThrow(() => {
            const options = cli.parseArgs(argv)

            expect(options).toEqual(expected)
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
    it('should fail to generate documentation for an invalid component (javascript syntax error)', (done) => {
      const argv = []
      const componentRawContent = `
        <template>
          <input @click="input"/>
        </template>
        <script>var invalid js code = !</script>
      `

      return cli.processRawContent(argv, componentRawContent)
        .then(() => done(new Error()))
        .catch(() => done())
    })

    it('should successfully generate the component documentation', () => {
      const argv = []
      const filename = checkboxfile
      const componentRawContent = fs.readFileSync(filename).toString()

      return cli.processRawContent(argv, componentRawContent)
    })
  })

  describe('processWithOutputOption(options)', () => {
    const output = readmefile

    describe('should successfully generate the component documentation', () => {
      const voidfile = '/tmp/void.vue'
      const filenames = [ voidfile ]

      it('with --section', () => {
        const section = 'API'
        const options = { output, filenames, section }
        const expected = [
          '# Sample\n\n',
          'Description\n\n',
          '# API\n\n',
          '## void\n\n',
          'Void component\n\n',
          '# License\n\n',
          'MIT\n'
        ].join('')

        return cli.processWithOutputOption(options).then(() => {
          expect(fs.readFileSync(output, 'utf8')).toEqual(expected)
        })
      })

      it('with --section and implicit level === 6', () => {
        const section = 'API'
        const output = readme2file
        const options = { output, filenames, section }
        const expected = [
          '# Sample\n\n',
          'Description\n\n',
          '###### API\n\n',
          '###### void\n\n',
          'Void component\n\n',
          '# License\n\n',
          'MIT\n'
        ].join('')

        return cli.processWithOutputOption(options).then(() => {
          expect(fs.readFileSync(output, 'utf8')).toEqual(expected)
        })
      })

      it('with --section and --level', () => {
        const section = 'API'
        const level = 3
        const options = { output, filenames, section, level }

        return cli.processWithOutputOption(options).then(() => {
          const content = fs.readFileSync(output, 'utf8')

          assert.notEqual(content.search(/\n### void/), -1)
          assert.notEqual(content.search(/\nVoid component/), -1)
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

        const expected = [
          '# checkbox',
          '',
          'A simple checkbox component',
          '',
          '- **author** - Sébastien',
          '- **license** - MIT',
          '- **input**',
          '',
          '## Slots',
          '',
          '| Name      | Description                             |',
          '| --------- | --------------------------------------- |',
          '| `default` |                                         |',
          '| `label`   | Use this slot to set the checkbox label |',
          '',
          '## Props',
          '',
          '| Name                | Type                      | Description                                        | Default |',
          '| ------------------- | ------------------------- | -------------------------------------------------- | ------- |',
          '| `schema` *required* | `Object` &#124; `Promise` | The JSON Schema object. Use the `v-if` directive   |         |',
          '| `v-model`           | `Object`                  | Use this directive to create two-way data bindings | `{}`    |',
          '| `model` *required*  | `Array`                   | The checkbox model                                 |         |',
          '| `disabled`          | `Boolean`                 | Initial checkbox state                             | &nbsp;  |',
          '',
          '## Events',
          '',
          '| Name      | Description                                 |',
          '| --------- | ------------------------------------------- |',
          '| `created` | Emitted when the component has been created |',
          '| `loaded`  | Emitted when the component has been loaded  |',
          '',
          ''
        ].join('\n')

        return cli.processWithOutputOption(options)
          .then(() => expect(streamContent).toBe(expected))
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

      const expected = [
        '# checkbox',
        '',
        'A simple checkbox component',
        '',
        '- **author** - Sébastien',
        '- **license** - MIT',
        '- **input**',
        '',
        '## Slots',
        '',
        '| Name      | Description                             |',
        '| --------- | --------------------------------------- |',
        '| `default` |                                         |',
        '| `label`   | Use this slot to set the checkbox label |',
        '',
        '## Props',
        '',
        '| Name                | Type                      | Description                                        | Default |',
        '| ------------------- | ------------------------- | -------------------------------------------------- | ------- |',
        '| `schema` *required* | `Object` &#124; `Promise` | The JSON Schema object. Use the `v-if` directive   |         |',
        '| `v-model`           | `Object`                  | Use this directive to create two-way data bindings | `{}`    |',
        '| `model` *required*  | `Array`                   | The checkbox model                                 |         |',
        '| `disabled`          | `Boolean`                 | Initial checkbox state                             | &nbsp;  |',
        '',
        '## Events',
        '',
        '| Name      | Description                                 |',
        '| --------- | ------------------------------------------- |',
        '| `created` | Emitted when the component has been created |',
        '| `loaded`  | Emitted when the component has been loaded  |',
        '',
        ''
      ].join('\n')

      return cli.processWithoutOutputOption(options)
        .then(() => expect(streamContent).toEqual(expected))
    })
  })

  describe('exec(argv, componentRawContent)', () => {
    it('should successfully generate the component documentation', () => {
      const argv = []
      const filename = checkboxfile
      const componentRawContent = fs.readFileSync(filename).toString()

      return cli.exec(argv, componentRawContent)
    })
  })

  describe('exec(argv)', () => {
    it('should successfully print version with --version', (done) => {
      const { version } = require('../../../package')
      const expected = `@vuedoc/md v${version}\n`
      const cli = spawn('node', ['bin/cli.js', '--version'])

      cli.stdout.on('data', (data) => {
        expect(data.toString()).toEqual(expected)
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
      const expected = [
        'A simple checkbox component',
        '',
        '- **author** - Sébastien',
        '- **license** - MIT',
        '- **input**',
        '',
        '# Slots',
        '',
        '| Name      | Description                             |',
        '| --------- | --------------------------------------- |',
        '| `default` |                                         |',
        '| `label`   | Use this slot to set the checkbox label |',
        '',
        '# Props',
        '',
        '| Name                | Type                      | Description                                        | Default |',
        '| ------------------- | ------------------------- | -------------------------------------------------- | ------- |',
        '| `schema` *required* | `Object` &#124; `Promise` | The JSON Schema object. Use the `v-if` directive   |         |',
        '| `v-model`           | `Object`                  | Use this directive to create two-way data bindings | `{}`    |',
        '| `model` *required*  | `Array`                   | The checkbox model                                 |         |',
        '| `disabled`          | `Boolean`                 | Initial checkbox state                             | &nbsp;  |',
        '',
        '# Events',
        '',
        '| Name      | Description                                 |',
        '| --------- | ------------------------------------------- |',
        '| `created` | Emitted when the component has been created |',
        '| `loaded`  | Emitted when the component has been loaded  |',
        '',
        ''
      ].join('\n')

      const file1 = path.join(fixturesPath, 'join.component.1.js')
      const file2 = path.join(fixturesPath, 'join.component.2.vue')

      return cli.exec([ '--ignore-name', '--join', file1, file2 ])
        .then(() => expect(streamContent).toEqual(expected))
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

    it('should failed promise error catching', () => cli.silenceExec([notfoundfile]))
  })
})
