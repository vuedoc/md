const EventEmitter = require('events')
const table = require('markdown-table')

// eslint-disable-next-line import/no-unresolved
const ParserEnum = require('@vuedoc/parser/lib/Enum')
const { StringUtils } = require('@vuedoc/parser/lib/StringUtils')
const { UNDEFINED } = require('@vuedoc/parser/lib/Enum')

// eslint-disable-next-line import/no-unresolved
const { Parser } = require('@vuedoc/parser/lib/parser/Parser')

const tag = (level) => {
  if (level > 6) {
    level = 6
  }

  return '#'.repeat(level)
}

const DEFAULT_LEVEL = 1
const DEFAULT_TABLE = true
const DEFAULT_TITLES = {
  props: 'props',
  data: 'data',
  computed: 'computed properties',
  methods: 'methods',
  events: 'events',
  slots: 'slots'
}

const DEFAULT_INDENT_LEVEL = 1
const DEFAULT_INDENT_SLUG = '  '

/* eslint-disable-next-line arrow-body-style */
const indent = (level = DEFAULT_INDENT_LEVEL, slug = DEFAULT_INDENT_SLUG) => {
  return slug.repeat(level)
}

const bold = (text) => `**${text}**`
const italic = (text) => `*${text}*`
const backtick = (text) => '`' + `${text}`.replace(/`/g, '\\`') + '`'
const item = (text) => `- ${text}`

// eslint-disable-next-line prefer-template
const h = (text, level) => tag(level) + ' ' + text
const parenthesis = (text) => `(${text})`

const Fields = {
  keywords: [
    {
      key: 'name',
      highlight: true
    },
    {
      key: 'description'
    }
  ],
  props: [
    {
      key: 'name',
      highlight: true,
      required: (item) => item.required
    },
    {
      key: 'type',
      highlight: true
    },
    {
      key: 'default',
      highlight: true,
      formated: true
    },
    {
      key: 'description'
    }
  ],
  data: [
    {
      key: 'name',
      highlight: true
    },
    {
      key: 'type',
      highlight: true
    },
    {
      key: 'initial',
      highlight: true,
      formated: true
    },
    {
      key: 'description'
    }
  ],
  computed: [
    {
      key: 'name',
      highlight: true
    },
    {
      key: 'description'
    },
    {
      key: 'dependencies',
      highlight: true
    }
  ],
  methods: [
    {
      key: 'name',
      highlight: true
    },
    {
      key: 'params'
    },
    {
      key: 'description'
    },
    {
      key: 'return'
    }
  ],
  slots: [
    {
      key: 'name',
      highlight: true
    },
    {
      key: 'description'
    },
    {
      key: 'props'
    }
  ],
  events: [
    {
      key: 'name',
      highlight: true
    },
    {
      key: 'description'
    },
    {
      key: 'arguments'
    }
  ]
}

function parseEntryValue (type, value) {
  if (value === ParserEnum.UNDEFINED) {
    return undefined;
  }

  switch (type) {
    case 'string':
      if (value === '\'\'') {
        return value
      }

      value = value.replace(/'/g, '\'')

      return `'${value}'`

    default:
      return StringUtils.parse(value)
  }
}

function parseType (type) {
  return type instanceof Array ? type.join('|') : type
}

function indentText (
  text,
  level = DEFAULT_INDENT_LEVEL,
  slug = DEFAULT_INDENT_SLUG
) {
  return text.split(/\n/g)
    .map((line) => indent(level, slug) + line)
    .join('\n')
}

function parseValue (value, { highlight, required, formated }) {
  if (value === UNDEFINED) {
    return ''
  }

  let data = value;

  if (typeof value === 'string') {
    data = value.replace(/\n/g, '<br>')

    if (highlight && data) {
      data = backtick(data)
    }

    if (formated && value === "''") {
      data += ' ' + italic('empty string')
    }
  } else if (highlight) {
    data = backtick(data)
  }

  if (typeof required === 'function' && required(item)) {
    data = `${data} ${italic('required')}`
  }

  return data
}

function printTable (items, options) {
  const header = options.fields.map((item) => item.key)
  const data = items.map((item) => {
    return options.fields.reduce((accumulator, { key, ...options }) => {
      let value = item[key] instanceof Array
        ? item[key].map((val) => parseValue(val, options)).join(', ')
        : parseValue(item[key], options)

      return [...accumulator, value]
    }, [])
  })

  const output = table([header, ...data])

  options.$println(output)
  options.$println()
}

function printParams (params, options, title = 'parameters') {
  if (!params.length) {
    return
  }

  options.$println(indentText(bold(`${title}:`)))
  options.$println()

  const level = 2

  params.forEach((param) => {
    const tokens = [
      indent(level) + item(backtick(param.name))
    ]

    if (param.type) {
      const type = param.type instanceof Array
        ? param.type.join('|')
        : param.type

      tokens.push(bold(type))
    }

    if (param.optional) {
      tokens.push(italic('(optional)'))
    }

    if (param.default) {
      tokens.push(backtick(`default: ${param.default}`))
    }

    if (param.description) {
      tokens.push('-')
      tokens.push(param.description)
    }

    options.$println.apply(null, tokens)
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
    if (options.table) {
      printTable(keywords, { ...options, fields: Fields.keywords })
    } else {
      keywords.forEach(({ name, description }) => {
        let line = bold(name)

        if (description) {
          line += ` - ${indentText(description).trim()}`
        }

        options.$println(item(line))
      })
    }

    options.$println()
  },

  props (options, props, title) {
    options.$println(h(title, options.level))
    options.$println()

    if (options.table) {
      printTable(props, { ...options, fields: Fields.props })
    } else {
      props.forEach(({ name, description, keywords, ...prop }) => {
        const customTypeKeyword = keywords.find(({ name }) => name === 'type')

        const customType = customTypeKeyword
          && customTypeKeyword.description.replace(/\{(.+?)\}/, '$1')
        const type = customType || prop.type || prop.nativeType || 'Any'
        const nature = prop.required ? 'required' : 'optional'

        const defaultKeyword = keywords.find(({ name }) => name === 'default')

        const defaultValue = defaultKeyword
          ? defaultKeyword.description
          : parseEntryValue(prop.nativeType, prop.default)

        const tokens = [
          item(backtick(name)),
          bold(italic(parseType(type))),
          parenthesis(italic(nature))
        ]

        if (defaultValue && defaultValue !== ParserEnum.UNDEFINED) {
          tokens.push(backtick(`default: ${defaultValue}`))
        }

        options.$print.apply(null, tokens)

        options.$println()
        options.$println()

        if (description) {
          options.$println(indentText(description))
          options.$println()
        }
      })
    }
  },

  data (options, data, title) {
    options.$println(h(title, options.level))
    options.$println()

    if (options.table) {
      printTable(data, { ...options, fields: Fields.data })
    } else {
      data.forEach(({ name, description, type, initial }) => {
        options.$println(item(backtick(name)))
        options.$println()

        if (description) {
          options.$println(indentText(description))
          options.$println()
        }

        const value = backtick(parseEntryValue(type, initial))

        options.$print(bold('initial value:'), value)
        options.$println()
        options.$println()
      })
    }
  },

  computed (options, props, title) {
    options.$println(h(title, options.level))
    options.$println()

    if (options.table) {
      printTable(props, { ...options, fields: Fields.computed })
    } else {
      props.forEach(({ name, description, dependencies }) => {
        options.$println(item(backtick(name)))

        if (description) {
          options.$println()
          options.$println(indentText(description))
        }

        if (dependencies.length) {
          const depStr = dependencies
            .map((dependency) => backtick(dependency))
            .join(', ')

          options.$println()
          options.$println(indent(), bold('dependencies:'), depStr)
          options.$println()
        }
      })
    }

    options.$println()
  },

  methods (options, methods, title) {
    options.$println(h(title, options.level))
    options.$println()

    if (options.table) {
      printTable(methods, { ...options, fields: Fields.methods })
    } else {
      methods.forEach(({ name, description, params, return: returns }) => {
        const args = params.map(({ name }) => name).join(', ')

        options.$println(item(backtick(`${name}(${args})`)))
        options.$println()

        if (description) {
          options.$println(indentText(description))
          options.$println()
        }

        printParams(params, options)

        if (returns.type === 'void' && !returns.description) {
          return
        }

        options.$println(indentText(bold('return value:')))
        options.$println()

        options.$println(
          indentText(item(bold(returns.type)), 2), '-', returns.description
        )
      })
    }
  },

  slots (options, slots, title) {
    options.$println(h(title, options.level))
    options.$println()

    if (options.table) {
      printTable(slots, { ...options, fields: Fields.slots })
    } else {
      slots.forEach(({ name, description }) => {
        const tokens = [
          item(backtick(name))
        ]

        if (description) {
          tokens.push(indentText(description).trim())
        }

        options.$print.apply(null, tokens)
        options.$println()
        options.$println()
      })
    }
  },

  events (options, events, title) {
    options.$println(h(title, options.level))
    options.$println()

    if (options.table) {
      printTable(events, { ...options, fields: Fields.events })
    } else {
      events.forEach(({ name, description, arguments: args }) => {
        options.$println(item(backtick(name)))
        options.$println()

        if (description) {
          options.$println(indentText(description))
          options.$println()
        }

        printParams(args, options, 'arguments')
      })
    }
  }
}

module.exports.render = (component, options = {}) => {
  const emiter = new EventEmitter()

  options.level = options.level || DEFAULT_LEVEL
  options.table = options.hasOwnProperty('table') ? options.table : DEFAULT_TABLE
  options.titles = options.titles || DEFAULT_TITLES
  options.features = options.features || Parser.SUPPORTED_FEATURES

  options.$print = (...args) => emiter.emit('write', args.join(' '))

  options.$println = (...args) => {
    options.$print.apply(null, args)
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
