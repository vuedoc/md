#!/usr/bin/env node

import { MISSING_FILENAME_MESSAGE, silenceExec } from '../lib/CLI.js';

if (process.argv.length < 3) {
  process.stderr.write(MISSING_FILENAME_MESSAGE);
  process.exit(-1);
}

const args = process.argv.slice(2);

if (process.argv.length > 2) {
  silenceExec(args);
} else {
  process.stdin.setEncoding('utf8');

  let input = '';

  process.stdin.on('readable', () => {
    let chunk;

    /* eslint-disable-next-line no-cond-assign */
    while ((chunk = process.stdin.read())) {
      input += chunk;
    }
  });

  process.stdin.on('end', () => silenceExec(args, input));
}
