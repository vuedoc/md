const EventEmitter = require('events')
const table = require('markdown-table')

// eslint-disable-next-line import/no-unresolved
const ParserEnum = require('@vuedoc/parser/lib/Enum')
const { StringUtils } = require('@vuedoc/parser/lib/StringUtils')
const { Value } = require('@vuedoc/parser/lib/entity/Value')

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
  props: 'Props',
  data: 'Data',
  computed: 'Computed Properties',
  methods: 'Methods',
  events: 'Events',
  slots: 'Slots'
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
const code = (text, lang) => '```' + lang + '\n' + text + '\n```'
const item = (text) => `- ${text}`

const h = (text, level) => tag(level) + ' ' + text

function indentText (text, level = DEFAULT_INDENT_LEVEL, slug = DEFAULT_INDENT_SLUG) {
  return text.split(/\n/g).map((line) => indent(level, slug) + line).join('\n')
}

function parseEntryValue (type, value) {
  if (value === ParserEnum.UNDEFINED) {
    return undefined;
  }

  switch (type) {
    case 'string':
    case 'String':
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
  if (type instanceof Array) {
    return type.join(' | ')
  }

  return type
}

function parseValue (value, item, { highlight, required, formated, render }) {
  if (value === ParserEnum.UNDEFINED) {
    return ''
  }

  let data = typeof render === 'function'
    ? render(value, item).replace(/\n/g, '<br>')
    : value

  if (typeof value === 'string') {
    data = data.replace(/\n\n/g, '<br>').replace(/\n/g, ' ')

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

function printTable (items, { fields = [], ...options }) {
  const head = fields.map((item) => item.header)
  const body = items.map((item) => fields.reduce((accumulator, { key, separator = ', ', ...fieldOptions }) => {
    const value = item[key] instanceof Array
      ? item[key].map((val) => parseValue(val, item, fieldOptions)).join(separator)
      : parseValue(item[key], item, fieldOptions)

    accumulator.push(value)

    return accumulator
  }, []))

  options.$println(table([ head, ...body ]))
  options.$println()
}

function renderMethodTitle (value, method) {
  const params = method.params
    .filter(({ name }) => name.indexOf('.') === -1)
    .map(({ name, type, declaration, defaultValue, optional, default: defaultParamValue, repeated }) => {
      let paramType = parseType(type)
      let paramDefaultValue = defaultParamValue ? parseEntryValue(type, defaultParamValue) : null
      let paramName = declaration ? declaration.value : name

      if (defaultValue instanceof Value) {
        paramDefaultValue = defaultValue.type === ParserEnum.Syntax.ObjectExpression
          ? JSON.stringify(defaultValue.value)
          : defaultValue.value
      }

      if (!paramType) {
        paramType = paramDefaultValue ? typeof paramDefaultValue : 'any'
      }

      if (repeated) {
        paramName = `...${paramName}`
        paramType += '[]'
      } else if (optional && !paramDefaultValue) {
        paramName += '?'
      }

      let arg = `${paramName}: ${paramType}`

      if (paramDefaultValue) {
        arg += ` = ${paramDefaultValue}`
      }

      return arg
    })

  const args = params.join(', ')
  const methodReturnType = method.return.type instanceof Array
    ? method.return.type.join(' | ')
    : method.return.type

  return `${value}(${args}): ${methodReturnType}`
}

const Fields = {
  props: [
    {
      key: 'name',
      header: 'Name',
      highlight: true,
      required: (item) => item.required,
      render: (name, { describeModel }) => (describeModel ? 'v-model' : name)
    },
    {
      key: 'type',
      header: 'Type',
      highlight: true,
      separator: ' | ',
      render: (type) => parseType(type)
    },
    {
      key: 'description',
      header: 'Description'
    },
    {
      key: 'default',
      header: 'Default',
      highlight: true,
      formated: true
    }
  ],
  data: [
    {
      key: 'name',
      header: 'Name',
      highlight: true
    },
    {
      key: 'type',
      header: 'Type',
      highlight: true,
      render: (type) => parseType(type)
    },
    {
      key: 'description',
      header: 'Description'
    },
    {
      key: 'initial',
      header: 'Initial value',
      highlight: true,
      formated: true
    }
  ],
  computed: [
    {
      key: 'name',
      highlight: true,
      header: 'Name'
    },
    {
      key: 'description',
      header: 'Description'
    },
    {
      key: 'dependencies',
      highlight: true,
      header: 'Dependencies'
    }
  ],
  slots: [
    {
      key: 'name',
      highlight: true,
      header: 'Name'
    },
    {
      key: 'description',
      header: 'Description'
    },
    {
      key: 'props',
      header: 'Props'
    }
  ],
  events: [
    {
      key: 'name',
      header: 'Name',
      highlight: true
    },
    {
      key: 'description',
      header: 'Description'
    },
    {
      key: 'arguments',
      header: 'Arguments',
      separator: '<br>',
      render: ({ name, type, description }, event) => {
        const hasManyArgs = event.arguments.length > 1
        const tokens = [
          bold(backtick(name + ': ' + parseType(type)))
        ]

        if (description) {
          tokens.push('—')
          tokens.push(description)
        }

        const arg = tokens.join(' ')

        return hasManyArgs ? item(arg) : arg
      }
    }
  ]
}

const writer = {
  name (options, { name }) {
    options.$println(h(name, options.level++))
    options.$println()
  },

  description (options, { description }) {
    options.$println(description)
    options.$println()
  },

  keywords (options, { keywords }) {
    keywords.forEach(({ name, description }) => {
      let line = bold(name)

      if (description) {
        line += ` - ${indentText(description).trim()}`
      }

      options.$println(item(line))
    })

    options.$println()
  },

  // eslint-disable-next-line no-unused-vars
  model (options, model, title) {},

  props (options, { props }, title) {
    options.$println(h(title, options.level))
    options.$println()

    printTable(props, { ...options, fields: Fields.props })
  },

  data (options, { data }, title) {
    options.$println(h(title, options.level))
    options.$println()

    printTable(data, { ...options, fields: Fields.data })
  },

  computed (options, { computed }, title) {
    options.$println(h(title, options.level))
    options.$println()

    printTable(computed, { ...options, fields: Fields.computed })
  },

  methods (options, { methods }, title) {
    options.$println(h(title, options.level))
    options.$println()

    methods.forEach((method) => {
      options.$println(h(`${method.name}()`, options.level + 1))
      options.$println()

      if (method.description) {
        options.$println(method.description)
        options.$println()
      }

      options.$println(bold('Syntax'))
      options.$println()

      const syntaxKeywords = method.keywords.filter(({ name }) => name === 'syntax')

      if (syntaxKeywords.length) {
        const source = syntaxKeywords.map(({ description }) => description).join('\n')

        if (source) {
          options.$println((code(source, 'ts')))
        }
      } else {
        options.$println(code(renderMethodTitle(method.name, method), 'ts'))
      }

      options.$println()

      if (method.params.length) {
        options.$println(bold('Parameters'))
        options.$println()

        method.params.forEach(({ name, description }) => {
          options.$print(item(bold(backtick(name))))

          if (description) {
            options.$println('<br>')
            options.$println(indentText(description))
          } else {
            options.$println()
          }

          options.$println()
        })
      }

      if (method.return.description) {
        options.$println(bold('Return value'))
        options.$println()
        options.$println(method.return.description)
        options.$println()
      }
    })
  },

  slots (options, { slots }, title) {
    options.$println(h(title, options.level))
    options.$println()

    printTable(slots, { ...options, fields: Fields.slots })
  },

  events (options, { events }, title) {
    options.$println(h(title, options.level))
    options.$println()

    printTable(events, { ...options, fields: Fields.events })
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
    options.features.forEach((feature) => {
      if (!component[feature] || component[feature].length === 0) {
        return
      }

      const title = options.titles[feature] || DEFAULT_TITLES[feature]

      writer[feature](options, component, title)
    })

    emiter.emit('end')
  })

  return emiter
}
