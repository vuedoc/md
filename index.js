// eslint-disable-next-line import/no-unresolved
const vuedoc = require('@vuedoc/parser')
const markdown = require('./lib/markdown')

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

module.exports.join = (options) => {
  /* eslint-disable-next-line global-require */
  const merge = require('deepmerge')
  const parsers = options.filenames.map((filename) => vuedoc.parse({ ...options, filename }))

  return Promise.all(parsers).then(merge.all)
}

module.exports.md = (options) => {
  const parse = options.join
    ? this.join(options)
    : vuedoc.parse(options)

  return parse.then(this.render(options))
}
