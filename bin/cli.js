#!/usr/bin/env node

'use strict'

const cli = require('../lib/cli')

if (process.argv.length < 2) {
  return process.stderr.write(cli.MISSING_FILENAME_MESSAGE)
}

if (process.argv.length > 2) {
  return cli.silenceExec(process.argv.slice(2))
}

process.stdin.setEncoding('utf8')

let rawContent = ''

process.stdin.on('readable', () => {
  let chunk

  while ((chunk = process.stdin.read())) {
    rawContent += chunk
  }
})

process.stdin.on('end', () => cli.silenceExec(process.argv.slice(2), rawContent))
