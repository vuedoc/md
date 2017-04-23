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

let print = null
let println = null

const writer = {
  props (props, title, level) {
    println(h(title, level))

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

      print(item(backtick(name)))
      print(bold(italic(type)))
      print(parenthesis(italic(nature)))

      if (twoWay) {
        line[line.length - 1] += comma()

        print(backtick(`twoWay = ${twoWay}`))
      }

      if (defaultValue) {
        print(backtick(`default: ${defaultValue}`))
      }

      println()

      if (prop.comments.length) {
        println(prop.comments.join('\n'))
        println()
      }
    })
  },

  methods (methods, title, level) {
    println(h(title, level))

    methods.forEach((method) => {
      const name = Object.keys(method.entry)[0]

      println(item(backtick(`${name}()`)))

      if (method.comments.length) {
        println(method.comments.join('\n'))
      }

      println()
    })

    println()
  },

  slots (slots, title, level) {
    println(h(title, level))

    slots.forEach((slot) => {
      println(item(backtick(slot.name)), slot.comments.join('\n'))
    })

    println()
  },

  events (events, title, level) {
    println(h(title, level))

    events.forEach((event) => {
      println(item(backtick(event.name)), event.comments.join('\n'))
    })

    println()
  }
}

module.exports.render = (component, options) => {
  options = options || {}
  options.level = options.level || 1
  options.titles = options.titles || DEFAULT_TITLES
  options.printOrder = options.printOrder || DEFAULT_PRINT_ORDER

  const emiter = new EventEmitter()

  print = function () {
    Array.prototype.slice.call(arguments)
      .forEach((str) => emiter.emit('write', str + ' '))
  }

  println = function () {
    print.apply(null, Array.prototype.slice.call(arguments))
    emiter.emit('write', '\n')
  }

  const entryName = component.header.find((item) =>
    item.entry.hasOwnProperty('name'))

  process.nextTick(() => {
    if (entryName) {
      println(h(entryName.entry.name, options.level++))
      println(entryName.comments.join('\n'))

      if (entryName.comments.length) {
        println()
      }
    }

    options.printOrder.forEach((node) => {
      if (!component.hasOwnProperty(node)) {
        throw new Error(`Unknow node '${node}'`)
      }

      if (!component[node].length) {
        return println()
      }

      const title = options.titles[node] || DEFAULT_TITLES[node]

      writer[node](component[node], title, options.level)
    })

    emiter.emit('end')
  })

  return emiter
}
