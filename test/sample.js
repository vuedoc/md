/* eslint-disable no-console */

import ast from '@textlint/markdown-to-ast';
import inject from 'md-node-inject';
import toMarkdown from 'ast-to-markdown';
import path from 'path';
import * as vuedoc from '..';
import { fileURLToPath } from 'url';

const mdContent = `
# Sample
Description

# API

# License
MIT
`;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const options = {
  filename: path.join(__dirname, 'test/fixtures/checkbox.vue'),
};

vuedoc.md(options)
  .then((document) => {
    const mdContentAst = ast.parse(mdContent);
    const mdApiContentAst = ast.parse(document);

    const injectionSection = 'API';
    const mergedContentAst = inject(injectionSection, mdContentAst, mdApiContentAst);

    const mergedContent = toMarkdown(mergedContentAst);

    console.log(mergedContent);
  })
  .catch((err) => { throw err; });
