// eslint-disable-next-line import/no-unresolved
const vuedoc = require('@vuedoc/parser')
const markdown = require('./lib/markdown')

module.exports.Parser = vuedoc

module.exports.render = (options) => (component) => new Promise((resolve, reject) => {
  if (component.errors.length) {
    reject(component.errors[0])
    return
  }

  let document = ''

  markdown.render(component, options)
    .on('write', (text) => {
      if (options.stream) {
        options.stream.write(text)
      } else {
        document += text
      }
    })
    .on('end', () => resolve(document))
})

module.exports.join = ({ parsing, ...options }) => {
  /* eslint-disable-next-line global-require */
  const merge = require('deepmerge')
  const parsers = options.filenames.map((filename) => vuedoc.parse({ ...parsing, filename }))

  return Promise.all(parsers).then(merge.all)
}

module.exports.md = ({ filename, ...options }) => {
  if (!options.parsing || typeof options.parsing !== 'object') {
    options.parsing = {
      stringify: true
    }
  } else {
    options.parsing.stringify = true
  }

  const parse = options.join
    ? this.join(options)
    : vuedoc.parse({ ...options.parsing, filename })

  return parse.then(this.render(options))
}
