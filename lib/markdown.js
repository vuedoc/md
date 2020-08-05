const EventEmitter = require('events')
const table = require('markdown-table')

// eslint-disable-next-line import/no-unresolved
const { UNDEFINED } = require('@vuedoc/parser/lib/Enum')
const { Parser } = require('@vuedoc/parser/lib/parser/Parser')
const { MethodEntry } = require('@vuedoc/parser/lib/entity/MethodEntry')
const { JSDoc } = require('@vuedoc/parser/lib/JSDoc')

const tag = (level) => {
  if (level > 6) {
    level = 6
  }

  return '#'.repeat(level)
}

const DEFAULT_LEVEL = 1
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

const indent = (level = DEFAULT_INDENT_LEVEL, slug = DEFAULT_INDENT_SLUG) => {
  return slug.repeat(level)
}

const bold = (text) => `**${text}**`
const italic = (text) => `*${text}*`
const backtick = (text) => '`' + `${text}`.replace(/`/g, '\\`') + '`'

const code = (text, lang, raw = false) => {
  return raw
    ? `<code class="language-${lang}">${text}</code>`
    : '```' + lang + '\n' + text + '\n```'
}

const item = (text) => `- ${text}`

const h = (text, level) => tag(level) + ' ' + text

function indentText (text, level = DEFAULT_INDENT_LEVEL, slug = DEFAULT_INDENT_SLUG) {
  return text.split(/\n/g).map((line) => indent(level, slug) + line).join('\n')
}

function parseType (type, { keywords = [], separator = '|' } = {}) {
  return TypeField.transformValue(type, { keywords, tick: '' }).join(` ${separator} `)
}

function parseValue (value, item, { highlight, required, render }) {
  if (value === UNDEFINED) {
    return ''
  }

  let data = typeof render === 'function' ? render(value, item) : value

  if (typeof data === 'string') {
    data = data.replace(/\n\n/g, '<br>').replace(/\n/g, ' ')
  }

  if (highlight && data) {
    data = backtick(data)
  }

  if (typeof required === 'function' && required(item)) {
    data = `${data} ${italic('required')}`
  }

  return data
}

function deleteEmptyColumns (fields, head, body) {
  fields
    .map(({ hideIfEmpty = true }, index) => ({
      index,
      hideIfEmpty,
      isEmpty: body.every((row) => !row[index])
    }))
    .filter(({ isEmpty, hideIfEmpty }) => isEmpty && hideIfEmpty)
    .forEach(({ index }) => {
      head.splice(index, 1)
      body.forEach((row) => row.splice(index, 1))
    })
}

function fillLastRowColumn (body) {
  const lastRow = body[body.length - 1]
  const lastColumnIndex = lastRow.length - 1

  if (!lastRow[lastColumnIndex]) {
    lastRow[lastColumnIndex] = '&nbsp;'
  }
}

function printTableColumnValue (value, item, { separator = ', ', transformValue, ...fieldOptions }) {
  if (typeof transformValue === 'function') {
    value = transformValue(value, item)
  }

  return value instanceof Array
    ? value.map((val) => parseValue(val, item, fieldOptions)).join(separator)
    : parseValue(value, item, fieldOptions)
}

function printTableColumn (item) {
  return (accumulator, { key, ...fieldOptions }) => {
    const value = printTableColumnValue(item[key], item, fieldOptions)

    accumulator.push(value)

    return accumulator
  }
}

function printTable (items, { fields, ...options }) {
  const head = fields.map((item) => item.header)
  const body = items.map((item) => fields.reduce(printTableColumn(item), []))

  deleteEmptyColumns(fields, head, body)
  fillLastRowColumn(body)
  options.$println(table([ head, ...body ]))
  options.$println()
}

function renderMethodTitle (value, method) {
  const params = method.params
    .filter(({ name }) => name.indexOf('.') === -1)
    .map(({ name, type, declaration, defaultValue, optional, repeated }) => {
      let paramType = parseType(type)
      let paramName = declaration ? declaration.value : name
      const paramDefaultValue = defaultValue === UNDEFINED ? '' : defaultValue

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

function renderMethodBody ({ $print, $println, raw = false }, method, nbsp = '<br>') {
  if (method.description) {
    $println(method.description)
    $println()
  }

  $println(bold('Syntax'))
  $println()

  const syntaxKeywords = method.keywords.filter(({ name }) => name === 'syntax')

  if (syntaxKeywords.length) {
    const source = syntaxKeywords.map(({ description }) => description).join('\n')

    $println((code(source, 'typescript', raw)))
  } else {
    $println(code(renderMethodTitle(method.name, method), 'typescript', raw))
  }

  $println()

  if (method.params.length) {
    const hasDescribedParameters = method.params.some(({ description }) => description)

    if (hasDescribedParameters) {
      $println(bold('Parameters'))
      $println()

      if (raw) {
        $print('<ul>')
      }

      method.params.forEach(({ type = 'unknown', name, description }) => {
        let chunk = name

        if (syntaxKeywords.length) {
          chunk += `: ${type}`
        }

        chunk = bold(backtick(chunk))

        if (raw) {
          chunk = `<li>${chunk}`
        } else {
          chunk = item(chunk)
        }

        $print(chunk)

        if (description) {
          if (nbsp) {
            $println(nbsp)
          }

          $println(indentText(description))
        } else {
          $println()
        }

        if (raw) {
          $print('</li>')
        } else {
          $println()
        }
      })

      if (raw) {
        $print('</ul>')
      }
    }
  }

  if (method.return.description) {
    $println(bold('Return value'))
    $println()
    $println(method.return.description)
    $println()
  }
}

const NameField = {
  key: 'name',
  header: 'Name',
  highlight: true
}

const DescriptionField = {
  key: 'description',
  header: 'Description',
  hideIfEmpty: false
}

const TypeField = {
  key: 'type',
  header: 'Type',
  highlight: false,
  separator: ' &#124; ', // pipe char
  transformValue (value, { keywords, tick = '`' }) {
    const typerefs = keywords
      .filter(({ name, description }) => name === 'typeref' && description)
      .map(({ description }) => description)

    const types = value instanceof Array ? value : [ value ]

    return types.map((item, index) => (typerefs[index] ? `[${tick}${item}${tick}](${typerefs[index]})` : `${tick}${item}${tick}`))
  }
}

const ArgumentsField = {
  key: 'arguments',
  header: 'Arguments',
  separator: '',
  render: ({ name, type, description }) => {
    const tokens = [
      bold(backtick(name + ': ' + parseType(type)))
    ]

    if (description) {
      tokens.push('—')
      tokens.push(description)
    }

    const arg = tokens.join(' ')

    return `<li>${arg}</li>`
  }
}

const DependenciesField = {
  key: 'dependencies',
  highlight: true,
  header: 'Dependencies'
}

const Fields = {
  props: [
    {
      ...NameField,
      required: (item) => item.required,
      render: (name, { describeModel }) => (describeModel ? 'v-model' : name)
    },
    TypeField,
    {
      ...DescriptionField,
      render (description, prop) {
        if (prop.type === 'Function') {
          const chunk = []
          const options = {
            raw: true,
            $print: (...args) => chunk.push(args.join(' ')),
            $println: (...args) => {
              options.$print.apply(null, args)
              chunk.push('\n')
            }
          }

          const method = new MethodEntry(prop.name, [])

          method.description = prop.description
          method.keywords = prop.keywords

          JSDoc.parseParams(prop.keywords, method, 'params')

          renderMethodBody(options, method, '')

          return chunk.join('')
        }

        return description
      }
    },
    {
      key: 'default',
      header: 'Default',
      highlight: true
    }
  ],
  data: [
    NameField,
    TypeField,
    DescriptionField,
    {
      key: 'initial',
      header: 'Initial value',
      highlight: true
    }
  ],
  computed: [
    NameField,
    {
      ...DescriptionField,
      render (description, computed) {
        const tokens = [
          parseValue(description, computed, this)
        ].filter((token) => token)

        if (computed.dependencies.length) {
          const deps = printTableColumnValue(computed.dependencies, computed, DependenciesField)

          tokens.push(bold(DependenciesField.header) + `: ${deps}`)
        }

        return tokens.join('<br>')
      }
    }
  ],
  slots: [
    NameField,
    DescriptionField,
    {
      key: 'props',
      header: 'Props'
    }
  ],
  events: [
    NameField,
    {
      ...DescriptionField,
      render (description, event) {
        const tokens = [
          parseValue(description, event, this)
        ]

        if (event.arguments.length) {
          const args = printTableColumnValue(event.arguments, event, ArgumentsField)

          tokens.push(bold(ArgumentsField.header))
          tokens.push(`<ul>${args}</ul>`)
        }

        return tokens.join('<br>')
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

      renderMethodBody(options, method)
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
