#!/usr/bin/env node

'use strict'

if (process.argv.length < 2) {
  return console.error('Missing filename. Usage: vuedoc.md [*.vue files]...')
}

const vuedoc = require('../')
const options = { stdout: true }

process.argv.slice(2).forEach((filename) => {
  options.filename = filename

  vuedoc.md(options).catch((e) => console.error(e))
})
