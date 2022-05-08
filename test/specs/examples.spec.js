/* eslint-disable max-len */
/* global describe it expect */

import { readFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { renderMarkdown } from '../../index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function getFilePath(filename) {
  return join(__dirname, '../fixtures', filename);
}

function getFileContent(filename) {
  return readFile(getFilePath(filename), 'utf8');
}

const fixtures = [
  'formschema',
  'textarea',
  'checkbox',
  'jsdoc.all',
  'jsdoc.param',
  'jsdoc.returns',
  'mdn.event',
  'mdn.regexp',
  'mdn.string',
];

// Update snapshots
// fixtures.forEach((fixture) => {
//   const filename = getFilePath(`${fixture}.example.vue`);
//   const snapshotFilename = getFilePath(`${fixture}.output.md`);

//   renderMarkdown({ filename }).then((component) => fs.writeFileSync(snapshotFilename, component));
// });

describe('examples', () => {
  fixtures.forEach((fixture) => it(`should successfully render ${fixture}`, async () => {
    const filename = getFilePath(`${fixture}.example.vue`);
    const expected = await getFileContent(`${fixture}.output.md`);

    return renderMarkdown({ filenames: [filename] }).then((component) => expect(component).toEqual(expected));
  }));
});
