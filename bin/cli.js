#!/usr/bin/env node

const cli = require('../lib/cli')

if (process.argv.length < 3) {
  process.stderr.write(cli.MISSING_FILENAME_MESSAGE)
  process.exit(1)
}

const args = process.argv.slice(2)

if (process.argv.length > 2) {
  cli.silenceExec(args)
} else {
  process.stdin.setEncoding('utf8')

  let input = ''

  process.stdin.on('readable', () => {
    let chunk

    /* eslint-disable-next-line no-cond-assign */
    while ((chunk = process.stdin.read())) {
      input += chunk
    }
  })

  process.stdin.on('end', () => cli.silenceExec(args, input))
}
