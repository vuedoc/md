'use strict'

const vuedoc = require('@vuedoc/parser')
const md = require('./lib/markdown')

module.exports.md = (options) => {
  const _options = Object.assign({}, options)

  return vuedoc.parse(_options).then((component) => {
    return new Promise((resolve) => {
      let document = ''

      md.render(component, _options)
        .on('write', (text) => {
          if (_options.stdout) {
            return process.stdout.write(text)
          }
          document += text
        })
        .on('end', () => resolve(document))
    })
  })
}
