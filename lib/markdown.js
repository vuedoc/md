'use strict'

const EventEmitter = require('events')

const tag = (level) => {
  level = level || 1

  let slog = ''

  if (level > 6) {
    level = 6
  }

  for (let i = 0; i < level; i++) {
    slog += '#'
  }

  return slog + ' '
}

const DEFAULT_PRINT_ORDER = ['props', 'slots', 'events', 'methods']
const DEFAULT_TITLES = {
  props: 'props',
  methods: 'methods',
  events: 'events',
  slots: 'slots'
}

const bold = (text) => `**${text}**`
const italic = (text) => `*${text}*`
// const underline = (text) => `_${text}_`
const backtick = (text) => `\`${text}\``
const item = (text) => `- ${text}`

const h = (text, level) => tag(level || 1) + text
const comma = () => ','
const parenthesis = (text) => `(${text})`

const writer = {
  props (options, props, title, level) {
    options.$println(h(title, level))

    props.forEach((prop) => {
      const name = Object.keys(prop.entry)[0]
      const type = prop.entry[name].type || prop.entry[name] || 'any'
      const nature = prop.entry[name].required ? 'required' : 'optional'
      const twoWay = prop.entry[name].twoWay
      let defaultValue = prop.entry[name].default

      if (typeof defaultValue === 'boolean') {
        defaultValue = defaultValue ? 'true' : 'false'
      } else if (defaultValue === null) {
        defaultValue = 'null'
      } else if (typeof defaultValue === 'string') {
        defaultValue = defaultValue.replace(/'/g, '\'')
        defaultValue = `'${defaultValue}'`
      }

      const line = []

      options.$print(item(backtick(name)))
      options.$print(bold(italic(type)))
      options.$print(parenthesis(italic(nature)))

      if (twoWay) {
        line[line.length - 1] += comma()

        options.$print(backtick(`twoWay = ${twoWay}`))
      }

      if (defaultValue) {
        options.$print(backtick(`default: ${defaultValue}`))
      }

      options.$println()

      if (prop.comments.length) {
        options.$println(prop.comments.join('\n'))
        options.$println()
      }
    })
  },

  methods (options, methods, title, level) {
    options.$println(h(title, level))

    methods.forEach((method) => {
      const name = Object.keys(method.entry)[0]

      options.$println(item(backtick(`${name}()`)))

      if (method.comments.length) {
        options.$println(method.comments.join('\n'))
      }

      options.$println()
    })

    options.$println()
  },

  slots (options, slots, title, level) {
    options.$println(h(title, level))

    slots.forEach((slot) => {
      options.$println(item(backtick(slot.name)), slot.comments.join('\n'))
    })

    options.$println()
  },

  events (options, events, title, level) {
    options.$println(h(title, level))

    events.forEach((event) => {
      options.$println(item(backtick(event.name)), event.comments.join('\n'))
    })

    options.$println()
  }
}

module.exports.render = (component, options) => {
  options = options || {}
  options.level = options.level || 1
  options.titles = options.titles || DEFAULT_TITLES
  options.printOrder = options.printOrder || DEFAULT_PRINT_ORDER

  const emiter = new EventEmitter()

  options.$print = function () {
    Array.prototype.slice.call(arguments)
      .forEach((str) => emiter.emit('write', str + ' '))
  }

  options.$println = function () {
    options.$print.apply(null, Array.prototype.slice.call(arguments))
    emiter.emit('write', '\n')
  }

  process.nextTick(() => {
    const item = component.header.find((item) =>
      item.entry.hasOwnProperty('name') ||
      item.hasOwnProperty('comments'))

    if (item) {
      if (item.entry && item.entry.name) {
        options.$println(h(item.entry.name, options.level++))
      }

      if (item.comments.length) {
        options.$println(item.comments.join('\n'))
      }

      options.$println()
    }

    options.printOrder.forEach((node) => {
      if (!component.hasOwnProperty(node)) {
        throw new Error(`Unknow node '${node}'`)
      }

      if (!component[node].length) {
        return options.$println()
      }

      const title = options.titles[node] || DEFAULT_TITLES[node]

      writer[node](options, component[node], title, options.level)
    })

    emiter.emit('end')
  })

  return emiter
}
