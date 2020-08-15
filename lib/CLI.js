const fs = require('fs')
const toString = require('mdast-util-to-string')

// eslint-disable-next-line import/no-unresolved
const { Parser } = require('@vuedoc/parser')
const vuedoc = require('..')

const usage = 'Usage: vuedoc.md [*.{js,vue} files]...'
const MISSING_FILENAME_MESSAGE = `Missing filename. ${usage}\n`

const ARG_IGNORE_PREFIX = '--ignore-'

function validateOptions (options) {
  if (options.section) {
    if (!options.output) {
      throw new Error('--output is required when using --section')
    }

    if (!fs.lstatSync(options.output).isFile()) {
      throw new Error('--output value must be an existing file when using --section')
    }
  }

  if (options.join && options.output) {
    if (fs.lstatSync(options.output).isDirectory()) {
      throw new Error('--output value must be a file when using --join')
    }
  }
}

function parseArgs (argv, requireFiles) {
  const parsing = {
    features: Parser.SUPPORTED_FEATURES
  }

  const options = {
    join: false,
    stream: true,
    filenames: [],
    parsing
  }

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]

    switch (arg) {
      /* istanbul ignore next */
      case '-v':
      /* istanbul ignore next */
      case '--version': {
        /* eslint-disable-next-line global-require */
        const { name, version } = require('../package')
        const output = `${name} v${version}\n`

        process.stdout.write(output)
        process.exit(0)
        break
      }

      case '-c':
      case '--config': {
        const configFile = argv[i + 1] || 'vuedoc.config.js'

        /* eslint-disable-next-line global-require */
        const path = require('path')
        const configPath = path.isAbsolute(configFile)
          ? configFile
          : path.join(process.cwd(), configFile)

        /* eslint-disable-next-line */
        const config = require(configPath)

        Object.assign(options, config)

        if (config.parsing) {
          options.parsing = { ...parsing, ...config.parsing }
        }

        i++
        continue
      }

      case '-l':
      case '--level': {
        if (!argv[i + 1]) {
          throw new Error('Missing level value. Usage: --level [integer]\n')
        }

        const value = Number.parseInt(argv[i + 1], 10)

        if (Number.isNaN(value)) {
          throw new Error('Invalid level value. Usage: --level [integer]\n')
        }

        options.level = value
        i++
        continue
      }

      case '-o':
      case '--output':
        if (!argv[i + 1]) {
          throw new Error('Missing output value. Usage: --output [file or directory]\n')
        }

        options.output = argv[i + 1]
        i++
        continue

      case '-s':
      case '--section':
        if (!argv[i + 1]) {
          throw new Error('Missing section value. Usage: --section [section name]\n')
        }

        options.section = argv[i + 1]
        i++
        continue

      case '-j':
      case '--join':
        options.join = true
        break

      default: {
        if (arg.startsWith(ARG_IGNORE_PREFIX)) {
          const feature = arg.substring(ARG_IGNORE_PREFIX.length)

          options.parsing.features = options.parsing.features.filter((item) => item !== feature)
          continue
        }

        options.filenames.push(arg)
      }
    }
  }

  if (requireFiles && options.filenames.length === 0) {
    throw new Error(MISSING_FILENAME_MESSAGE)
  }

  validateOptions(options)

  return options
}

/* eslint-disable-next-line arrow-body-style */
const findSectionNode = (section) => (node) => {
  return node.type === 'Header' && toString(node) === section
}

const processRawContent = (argv, componentRawContent) => {
  const options = parseArgs(argv, false)

  options.stream = process.stdout
  options.parsing.filecontent = componentRawContent

  return vuedoc.md(options).catch((err) => {
    throw err
  })
}

function prepareSection(options, cache) {
  if (cache) {
    /* eslint-disable-next-line global-require */
    const ast = require('@textlint/markdown-to-ast')
    const output = fs.readFileSync(options.output, 'utf8')

    cache.target = ast.parse(output)

    const node = cache.target.children.find(findSectionNode(options.section))

    if (node && !options.level) {
      options.level = node.depth + 1
    }

    delete options.stream
  }

  return vuedoc.md(options)
}

function prepareOutput(options) {
  if (fs.lstatSync(options.output).isDirectory()) {
    /* eslint-disable-next-line global-require */
    const path = require('path')
    const info = path.parse(options.filename)
    const mdname = `${info.name}.md`
    const dest = path.join(options.output, mdname)

    options.stream = fs.createWriteStream(dest)
  } else {
    options.stream = fs.createWriteStream(options.output)
  }

  return vuedoc.md(options).then(() => options.stream.end())
}

const prepare = (options, cache) => (filename) => {
  options.filename = filename

  if (options.section) {
    return prepareSection(options, cache)
  }

  if (options.output) {
    return prepareOutput(options)
  }

  options.stream = process.stdout

  return vuedoc.md(options)
}

function processWithOutputOption (options) {
  const cache = {}
  const callback = prepare(options, cache)
  const processes = options.join
    ? [ callback(options.filenames[options.filenames.length - 1]) ]
    : options.filenames.map(callback)

  return Promise.all(processes).then((generatedDocs) => {
    if (options.section) {
      /* eslint-disable global-require */
      const ast = require('@textlint/markdown-to-ast')
      const toMarkdown = require('ast-to-markdown')
      const inject = require('md-node-inject')
      const docs = generatedDocs.reduce((docs, doc) => {
        ast.parse(doc)
          .children.forEach((node) => docs.children.push(node))

        return docs
      }, { children: [] })

      const tree = inject(options.section, cache.target, docs)
      const doc = toMarkdown(tree)

      fs.writeFileSync(options.output, doc)
    }

    return generatedDocs
  })
}

function processWithoutOutputOption (options) {
  const callback = prepare(options)
  const processes = options.join
    ? [ callback(options.filenames[options.filenames.length - 1]) ]
    : options.filenames.map(callback)

  return Promise.all(processes)
}

function exec (argv, componentRawContent) {
  if (componentRawContent) {
    return processRawContent(argv, componentRawContent)
  }

  const options = parseArgs(argv, true)

  if (options.output) {
    return processWithOutputOption(options)
  }

  return processWithoutOutputOption(options)
}

function silenceExec (argv, componentRawContent) {
  try {
    exec(argv, componentRawContent)
      .catch(({ message }) => process.stderr.write(`${message}\n`))
  } catch ({ message }) {
    process.stderr.write(`${message}\n`)
  }
}

module.exports.MISSING_FILENAME_MESSAGE = MISSING_FILENAME_MESSAGE
module.exports.validateOptions = validateOptions
module.exports.parseArgs = parseArgs
module.exports.findSectionNode = findSectionNode
module.exports.processRawContent = processRawContent
module.exports.processWithOutputOption = processWithOutputOption
module.exports.processWithoutOutputOption = processWithoutOutputOption
module.exports.exec = exec
module.exports.silenceExec = silenceExec
