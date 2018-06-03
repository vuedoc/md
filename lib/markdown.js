'use strict'

const EventEmitter = require('events')
const Parser = require('@vuedoc/parser/lib/parser')

const tag = (level) => {
  let slog = ''

  if (level > 6) {
    level = 6
  }

  for (let i = 0; i < level; i++) {
    slog += '#'
  }

  return slog + ' '
}

const DEFAULT_LEVEL = 1
const DEFAULT_TITLES = {
  props: 'props',
  data: 'data',
  computed: 'computed properties',
  methods: 'methods',
  events: 'events',
  slots: 'slots'
}

const indent = (level = 1, slug = '  ') => {
  return Array.apply(null, Array(level)).map((x) => slug).join('')
}

const bold = (text) => `**${text}**`
const italic = (text) => `*${text}*`
// const underline = (text) => `_${text}_`
const backtick = (text) => `\`${text}\``
const item = (text) => `- ${text}`

const h = (text, level) => tag(level) + text
const comma = () => ','
const parenthesis = (text) => `(${text})`

const parseValue = (value) => {
  switch (typeof value) {
    case 'boolean':
      return value ? 'true' : 'false'

    case 'string':
      value = value.replace(/'/g, '\'')
      return `'${value}'`

    default:
      if (value === null) {
        return 'null'
      }
  }

  return value
}

const parseType = (type) => {
  if (type && type.type === 'ArrayExpression') {
    return type.elements.map((typeIdentifier) => typeIdentifier.name).join('|')
  }
  return type
}

function printParams (params, options, title = 'parameters') {
  if (!params || !params.length) {
    return
  }

  options.$println(indent(), bold(`${title}:`))
  options.$println()

  params.forEach((param) => {
    if (param.type instanceof Array) {
      param.type = param.type.join('|')
    }

    options.$print(indent(2))
    options.$print(item(backtick(param.name)), bold(param.type))

    if (param.optional) {
      options.$print(italic('(optional)'))
    }

    if (param.default) {
      options.$print(backtick(`default: ${param.default}`))
    }

    options.$print('-', param.desc)
    options.$println()
  })

  options.$println()
}

const writer = {
  name (options, name) {
    options.$println(h(name, options.level++))
    options.$println()
  },

  description (options, description) {
    options.$println(description)
    options.$println()
  },

  keywords (options, keywords) {
    keywords.forEach((keyword) => {
      let line = bold(keyword.name)

      if (keyword.description) {
        line += ' - ' + keyword.description
      }

      options.$println(item(line))
    })

    options.$println()
  },

  props (options, props, title) {
    options.$println(h(title, options.level))
    options.$println()

    props.forEach((prop) => {
      const type = prop.value.type || prop.value || 'any'
      const nature = prop.value.required ? 'required' : 'optional'
      const defaultValue = parseValue(prop.value.default)

      options.$print(item(backtick(prop.name)))
      options.$print(bold(italic(parseType(type))))
      options.$print(parenthesis(italic(nature)))

      if (defaultValue) {
        options.$print(backtick(`default: ${defaultValue}`))
      }

      options.$println()
      options.$println()

      if (prop.description) {
        options.$println(indent(), prop.description)
        options.$println()
      }
    })
  },

  data (options, data, title) {
    options.$println(h(title, options.level))
    options.$println()

    data.forEach((prop) => {
      options.$println(item(backtick(prop.name)))
      options.$println()

      if (prop.description) {
        options.$println(indent(), prop.description)
        options.$println()
      }

      options.$print(bold('initial value:'))
      options.$println(backtick(parseValue(prop.value)))
      options.$println()
    })
  },

  computed (options, props, title) {
    options.$println(h(title, options.level))
    options.$println()

    props.forEach((prop) => {
      options.$println(item(backtick(prop.name)))

      if (prop.description) {
        options.$println()
        options.$println(indent(), prop.description)
      }

      if (prop.dependencies.length) {
        const depStr = prop.dependencies
          .map((dependency) => backtick(dependency))
          .join(', ')

        options.$println()
        options.$println(indent(), bold('dependencies:'), depStr)
        options.$println()
      }
    })

    options.$println()
  },

  methods (options, methods, title) {
    options.$println(h(title, options.level))
    options.$println()

    methods.forEach((method) => {
      const hasParams = method.params && method.params.length
      const args = hasParams
        ? method.params.map(({ name }) => name).join(', ')
        : method.args.join(', ')

      options.$println(item(backtick(`${method.name}(${args})`)))
      options.$println()

      if (method.description) {
        options.$println(indent(), method.description)
        options.$println()
      }

      printParams(method.params, options)

      if (method.return) {
        options.$println(indent(), bold('return value:'))
        options.$println()
        options.$print(indent(2))
        options.$println(item(bold(method.return.type)), '-', method.return.desc)
      }
    })
  },

  slots (options, slots, title) {
    options.$println(h(title, options.level))
    options.$println()

    slots.forEach((slot) => {
      options.$println(item(backtick(slot.name)), slot.description || '')
      options.$println()
    })
  },

  events (options, events, title) {
    options.$println(h(title, options.level))
    options.$println()

    events.forEach((event) => {
      options.$println(item(backtick(event.name)))
      options.$println()
      options.$println(indent(), event.description)
      options.$println()

      printParams(event.params, options, 'arguments')
    })
  }
}

module.exports.render = (component, options = {}) => {
  options.level = options.level || DEFAULT_LEVEL
  options.titles = options.titles || DEFAULT_TITLES
  options.features = options.features || Parser.SUPPORTED_FEATURES

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
    options.features.forEach((node) => {
      if (!component[node] || component[node].length === 0) {
        return
      }

      const title = options.titles[node] || DEFAULT_TITLES[node]

      writer[node](options, component[node], title)
    })

    emiter.emit('end')
  })

  return emiter
}
