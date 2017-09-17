#!/usr/bin/env node

'use strict'

const MISSING_FILENAME_MESSAGE = 'Missing filename. Usage: vuedoc.md [*.vue files]...\n'

if (process.argv.length < 2) {
  return process.stderr.write(MISSING_FILENAME_MESSAGE)
}

const vuedoc = require('../')
const options = { stream: true }
const filenames = []

const parseArgs = (requireFiles) => {
  const argv = process.argv.slice(2)

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]

    switch (arg) {
      case '--level':
        if (!argv[i + 1]) {
          return process.stderr.write('Missing level value. Usage: --level [integer]\n')
        }

        const value = parseInt(argv[i + 1])

        if (isNaN(value)) {
          return process.stderr.write('Invalid level value. Usage: --level [integer]\n')
        }

        options.level = value
        i++
        continue

      case '--output':
        if (!argv[i + 1]) {
          return process.stderr.write('Missing output directory value. Usage: --output [directory]\n')
        }

        options.output = argv[i + 1]
        i++
        continue

      case '--section':
        if (!argv[i + 1]) {
          return process.stderr.write('Missing section value. Usage: --section [section name]\n')
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
        filenames.push(arg)
    }
  }

  if (requireFiles && filenames.length === 0) {
    return process.stderr.write(MISSING_FILENAME_MESSAGE)
  }
}

const validateArgs = (argv) => {
  if (argv.section) {
    if (!argv.output) {
      throw new Error('`--output file` is required when using --section')
    }

    const fs = require('fs')
    const stats = fs.lstatSync(options.output)

    if (!stats.isFile()) {
      throw new Error('`--output` value must be a file when using --section')
    }
  }
}

const toString = require('mdast-util-to-string')
const findSectionNode = (node) => {
  return node.type === 'Header' && toString(node) === options.section
}

const run = (componentRawContent) => {
  if (componentRawContent) {
    parseArgs(false)

    options.stream = process.stdout
    options.filecontent = componentRawContent

    return vuedoc.md(options).catch((e) => console.error(e))
  }

  parseArgs(true)

  validateArgs(options)

  if (options.output) {
    const fs = require('fs')
    const path = require('path')
    const ast = require('markdown-to-ast')
    const cache = {}

    const stats = fs.lstatSync(options.output)
    const processes = filenames.reduce((mergedOutput, filename) => {
      options.filename = filename

      if (options.section) {
        const readme = fs.readFileSync(options.output, 'utf8')

        cache.target = ast.parse(readme.toString())

        const node = cache.target.children.find(findSectionNode)

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

    Promise.all(processes)
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
                throw err
              }
            })
          })
          .catch((err) => process.stderr.write(err))
      })
      .catch((e) => process.stderr.write(e))
  } else {
    options.stream = process.stdout

    filenames.forEach((filename) => {
      options.filename = filename

      vuedoc.md(options)
        .catch((e) => process.stderr.write(e))
    })
  }
}

if (process.argv.length > 2) {
  return run()
}

process.stdin.setEncoding('utf8')

let componentRawContent = ''

process.stdin.on('readable', () => {
  let chunk

  while ((chunk = process.stdin.read())) {
    componentRawContent += chunk
  }
})

process.stdin.on('end', () => run(componentRawContent))
