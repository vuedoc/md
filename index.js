'use strict'

const vuedoc = require('@vuedoc/parser')
const md = require('./lib/markdown')

module.exports.md = (options) => vuedoc.parse(options)
  .then((component) => new Promise((resolve) => {
    let document = ''
//   console.log('---------------')
//   console.log(component)

    md.render(component, options)
      .on('write', (text) => {
        if (options.stdout) {
          return process.stdout.write(text)
        }
        document += text
      })
      .on('end', () => resolve(document))
  }))
