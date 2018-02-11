'use strict'

const vuedoc = require('@vuedoc/parser')
const md = require('./lib/markdown')

module.exports.render = (options) => (component) => new Promise((resolve) => {
  let document = ''

  md.render(component, options)
    .on('write', (text) => {
      if (options.stream) {
        return options.stream.write(text)
      }
      document += text
    })
    .on('end', () => resolve(document))
})

module.exports.join = (options) => {
  const merge = require('deepmerge')
  const parsers = options.filenames.map((filename) => {
    return vuedoc.parse(Object.assign({}, options, { filename }))
  })

  return Promise.all(parsers).then(merge.all)
}

module.exports.md = (options) => {
  const opts = Object.assign({}, options)
  const parse = options.join ? this.join(opts) : vuedoc.parse(opts)

  return parse.then(this.render(opts))
}
