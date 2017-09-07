#!/usr/bin/env node

'use strict'

const MISSING_FILENAME_MESSAGE = 'Missing filename. Usage: vuedoc.md [*.vue files]...\n'

if (process.argv.length < 2) {
  return process.stderr.write(MISSING_FILENAME_MESSAGE)
}

const vuedoc = require('../')
const options = { stdout: true }

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

filenames.forEach((filename) =>
  vuedoc.md(options).catch((e) => process.stderr.write(e)))
