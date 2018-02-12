'use strict'

const fs = require('fs')
const Parser = require('@vuedoc/parser/lib/parser')
const vuedoc = require('../')

const MISSING_FILENAME_MESSAGE = 'Missing filename. Usage: vuedoc.md [*.vue files]...\n'

const validateOptions = (options) => {
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

const parseArgs = (argv, requireFiles) => {
  const options = {
    join: false,
    stream: true,
    filenames: [],
    features: Parser.SUPPORTED_FEATURES
  }

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]

    switch (arg) {
      /* istanbul ignore next */
      case '--version':
        const { name, version } = require('../package')
        const output = `${name} v${version}\n`

        process.stdout.write(output)
        process.exit()

      case '--level':
        if (!argv[i + 1]) {
          throw new Error('Missing level value. Usage: --level [integer]\n')
        }

        const value = parseInt(argv[i + 1])

        if (isNaN(value)) {
          throw new Error('Invalid level value. Usage: --level [integer]\n')
        }

        options.level = value
        i++
        continue

      case '--output':
        if (!argv[i + 1]) {
          throw new Error('Missing output value. Usage: --output [directory]\n')
        }

        options.output = argv[i + 1]
        i++
        continue

      case '--section':
        if (!argv[i + 1]) {
          throw new Error('Missing section value. Usage: --section [section name]\n')
        }

        options.section = argv[i + 1]
        i++
        continue

      case '--join':
        options.join = true
        break

      default:
        const ignorePrefix = '--ignore-'

        if (arg.startsWith(ignorePrefix)) {
          const feature = arg.substring(ignorePrefix.length)

          options.features = options.features.filter((item) => item !== feature)
          continue
        }

        options.filenames.push(arg)
    }
  }

  if (requireFiles && options.filenames.length === 0) {
    throw new Error(MISSING_FILENAME_MESSAGE)
  }

  validateOptions(options)

  return options
}

const toString = require('mdast-util-to-string')
const findSectionNode = (section) => (node) => {
  return node.type === 'Header' && toString(node) === section
}

const processRawContent = (argv, componentRawContent) => {
  const options = parseArgs(argv, false)

  options.stream = process.stdout
  options.filecontent = componentRawContent

  return vuedoc.md(options).catch((err) => {
    throw err
  })
}

const prepare = (options, cache) => (filename) => {
  options.filename = filename

  if (options.section) {
    const ast = require('markdown-to-ast')
    const output = fs.readFileSync(options.output, 'utf8')

    /* istanbul ignore else */
    if (cache) {
      cache.target = ast.parse(output.toString())

      const node = cache.target.children.find(findSectionNode(options.section))

      if (node && !options.level) {
        options.level = node.depth + 1
      }

      delete options.stream
    }

    return vuedoc.md(options)
  }

  if (options.output) {
    if (fs.lstatSync(options.output).isDirectory()) {
      const path = require('path')
      const info = path.parse(filename)
      const mdname = `${info.name}.md`
      const dest = path.join(options.output, mdname)

      options.stream = fs.createWriteStream(dest)
    } else {
      options.stream = fs.createWriteStream(options.output)
    }

    return vuedoc.md(options).then(() => options.stream.end())
  } else {
    options.stream = process.stdout
  }

  return vuedoc.md(options)
}

const processWithOutputOption = (options) => {
  const cache = {}
  const callback = prepare(options, cache)
  const processes = options.join
    ? [callback(options.filenames[options.filenames.length - 1])]
    : options.filenames.map(callback)

  return Promise.all(processes).then((generatedDocs) => {
    if (options.section) {
      const ast = require('markdown-to-ast')
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

const processWithoutOutputOption = (options) => {
  const callback = prepare(options)
  const processes = options.join
    ? [callback(options.filenames[options.filenames.length - 1])]
    : options.filenames.map(callback)

  return Promise.all(processes)
}

const exec = (argv, componentRawContent) => {
  if (componentRawContent) {
    return processRawContent(argv, componentRawContent)
  }

  const options = parseArgs(argv, true)

  if (options.output) {
    return processWithOutputOption(options)
  }

  return processWithoutOutputOption(options)
}

const silenceExec = (argv, componentRawContent) => {
  try {
    exec(argv, componentRawContent)
      .catch((err) => console.error(err.message))
  } catch (err) {
    process.stderr.write(err.message + '\n')
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
