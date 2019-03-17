

const vuedoc = require('@vuedoc/parser')
const md = require('./lib/markdown')

module.exports.render = (options) => (component) => new Promise((resolve) => {
  let document = ''

  md.render(component, options)
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

  /* eslint-disable-next-line arrow-body-style */
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
