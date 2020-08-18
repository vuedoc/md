/* eslint-disable max-len */

const VuedocParserSchema = require('@vuedoc/parser/schema/options');

module.exports = {
  type: 'object',
  properties: {
    join: {
      type: 'boolean',
      default: false,
      description: 'Combine generated documentation for multiple component files into only one'
    },
    output: {
      type: 'string',
      minLength: 1,
      description: 'The output of the documentation. Can be a directory or a Markdown file. If absent, the STDOUT will be used'
    },
    section: {
      type: 'string',
      minLength: 1,
      description: 'Inject the generated documentation to a section. Works with options.output as Markdown file output'
    },
    level: {
      type: 'number',
      minimum: 1,
      description: 'Set the title level. An integer between 1 and 6'
    },
    filenames: {
      type: 'array',
      items: {
        type: 'string',
        minLength: 1
      },
      description: 'List of filenames to parse and render',
      default: []
    },
    parsing: VuedocParserSchema
  }
};
