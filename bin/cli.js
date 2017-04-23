#!/usr/bin/env node

'use strict'

const MISSING_FILENAME_MESSAGE = 'Missing filename. Usage: vuedoc.md [*.vue files]...'

if (process.argv.length < 2) {
  return console.error(MISSING_FILENAME_MESSAGE)
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
        return console.error('Missing level value. Usage: --level [integer]')
      }

      const value = parseInt(argv[i + 1])

      if (isNaN(value)) {
        return console.error('Invalid level value. Usage: --level [integer]')
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
  return console.error(MISSING_FILENAME_MESSAGE)
}

filenames.forEach((filename) => {
  options.filename = filename

  vuedoc.md(options).catch((e) => console.error(e))
})
