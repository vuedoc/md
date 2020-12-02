/* eslint-disable no-console */

const ast = require('@textlint/markdown-to-ast');
const inject = require('md-node-inject');
const toMarkdown = require('ast-to-markdown');
const path = require('path');
const vuedoc = require('..');

const mdContent = `
# Sample
Description

# API

# License
MIT
`;

const options = {
  filename: path.join(__dirname, 'test/fixtures/checkbox.vue')
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
