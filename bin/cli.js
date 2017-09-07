#!/usr/bin/env node

'use strict'

const MISSING_FILENAME_MESSAGE = 'Missing filename. Usage: vuedoc.md [*.vue files]...\n'

if (process.argv.length < 2) {
  return process.stderr.write(MISSING_FILENAME_MESSAGE)
}

const vuedoc = require('../')
const options = { stream: true }

const argv = process.argv.slice(2)
const filenames = []

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

if (filenames.length === 0) {
  return process.stderr.write(MISSING_FILENAME_MESSAGE)
}

if (options.output) {
  const fs = require('fs')
  const path = require('path')

  filenames.forEach((filename) => {
    const info = path.parse(filename)
    const mdname = `${info.name}.md`
    const dest = path.join(options.output, mdname)
    const wstream = fs.createWriteStream(dest)

    options.stream = wstream

    process.stdout.write(`${filename} -> ${dest}\n`)

    vuedoc.md(options).then(() => wstream.end())
  })
} else {
  options.stream = process.stdout

  filenames.forEach((filename) => {
    options.filename = filename

    vuedoc.md(options)
      .catch((e) => process.stderr.write(e))
  })
}
