'use strict'

const vuedoc = require('../')

const MISSING_FILENAME_MESSAGE = 'Missing filename. Usage: vuedoc.md [*.vue files]...\n'

const validateOptions = (options) => {
  if (options.section) {
    if (!options.output) {
      throw new Error('--output is required when using --section')
    }

    const fs = require('fs')
    const stats = fs.lstatSync(options.output)

    if (!stats.isFile()) {
      throw new Error('--output value must be a file when using --section')
    }
  }
}

const parseArgs = (argv, requireFiles) => {
  const options = { stream: true, filenames: [] }

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]

    switch (arg) {
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

      case '--ignore-name':
        options.ignoreName = true
        continue

      case '--ignore-description':
        options.ignoreDescription = true
        continue

      default:
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

const processWithOutputOption = (options) => {
  const fs = require('fs')
  const ast = require('markdown-to-ast')
  const path = require('path')
  const cache = {}

  const stats = fs.lstatSync(options.output)
  const processes = options.filenames.reduce((mergedOutput, filename) => {
    options.filename = filename

    if (options.section) {
      const readme = fs.readFileSync(options.output, 'utf8')

      cache.target = ast.parse(readme.toString())

      const node = cache.target.children.find(findSectionNode(options.section))

      if (node && !options.level) {
        options.level = node.depth + 1
      }

      delete options.stream

      mergedOutput.push(vuedoc.md(options))
    } else {
      if (stats.isDirectory()) {
        const info = path.parse(filename)
        const mdname = `${info.name}.md`
        const dest = path.join(options.output, mdname)

        options.stream = fs.createWriteStream(dest)
      } else {
        options.stream = fs.createWriteStream(options.output)
      }

      vuedoc.md(options)
        .then(() => options.stream.end())
        .catch((e) => process.stderr.write(e))
    }

    return mergedOutput
  }, [])

  return Promise.all(processes)
    .then((generatedDocs) => {
      const toMarkdown = require('ast-to-markdown')
      const inject = require('md-node-inject')
      const docs = generatedDocs.reduce((docs, doc) => {
        ast.parse(doc)
          .children.forEach((node) => docs.children.push(node))

        return docs
      }, { children: [] })

      Promise.resolve(inject(options.section, cache.target, docs))
        .then((doc) => toMarkdown(doc))
        .then((doc) => {
          fs.writeFile(options.output, doc, (err) => {
            if (err) {
              console.error(err)
              throw err
            }
          })
        })
        .catch((err) => process.stderr.write(err))
    })
    .catch((e) => process.stderr.write(e))
}

const processWithoutOutputOption = (options) => {
  options.stream = process.stdout

  return Promise.all(options.filenames.map((filename) => {
    options.filename = filename

    return vuedoc.md(options)
  }))
}

const run = (argv, componentRawContent) => {
  if (componentRawContent) {
    return processRawContent(argv, componentRawContent)
  }

  const options = parseArgs(argv, true)

  if (options.output) {
    return processWithOutputOption(options)
  }

  return processWithoutOutputOption(options)
}

const silenceRun = (argv, componentRawContent) => {
  try {
    run(argv, componentRawContent)
  } catch (err) {
    process.stderr.write(err.message)
  }
}

module.exports.MISSING_FILENAME_MESSAGE = MISSING_FILENAME_MESSAGE
module.exports.validateOptions = validateOptions
module.exports.parseArgs = parseArgs
module.exports.findSectionNode = findSectionNode
module.exports.processRawContent = processRawContent
module.exports.processWithOutputOption = processWithOutputOption
module.exports.processWithoutOutputOption = processWithoutOutputOption
module.exports.run = run
module.exports.silenceRun = silenceRun
