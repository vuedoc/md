const EventEmitter = require('events');
const wordwrap = require('word-wrap');
const table = require('markdown-table');

// eslint-disable-next-line import/no-unresolved
const { Feature } = require('@vuedoc/parser/lib/Enum');
const { Parser } = require('@vuedoc/parser/lib/parser/Parser');
const { MethodParam } = require('@vuedoc/parser/lib/entity/MethodEntry');

const tag = (level) => {
  if (level > 6) {
    level = 6;
  }

  return '#'.repeat(level);
};

const Event = {
  write: 'write',
  end: 'end',
};

const DEFAULT_LEVEL = 1;
const DEFAULT_WORDWRAP = 110;
const DEFAULT_TITLES = {
  props: 'Props',
  data: 'Data',
  computed: 'Computed Properties',
  methods: 'Methods',
  events: 'Events',
  slots: 'Slots',
  syntax: 'Syntax',
  parameters: 'Parameters',
  returns: 'Return value',
};

const DEFAULT_INDENT_LEVEL = 1;
const DEFAULT_INDENT_SLUG = '  ';

const indent = (level = DEFAULT_INDENT_LEVEL, slug = DEFAULT_INDENT_SLUG) => {
  return slug.repeat(level);
}

const bold = (text) => `**${text}**`;
const italic = (text) => `*${text}*`;
const backtick = (text) => '`' + `${text}`.replace(/`/g, '\\`') + '`';

const code = (text, lang, raw = false) => {
  return raw
    ? `<code class="language-${lang}">${text}</code>`
    : '```' + lang + '\n' + text + '\n```';
};

const item = (text) => `- ${text}`;

const h = (text, level) => tag(level) + ' ' + text;

function indentText (text, { level = DEFAULT_INDENT_LEVEL, slug = DEFAULT_INDENT_SLUG, joinChar = '\n' } = {}) {
  return text.split(/(\n|\r\n)/g).map((line) => indent(level, slug) + line).join(joinChar);
}

function parseType (type, { keywords = [], separator = '|' } = {}) {
  return TypeField.transformValue(type, { keywords, tick: '' }).join(` ${separator} `);
}

function parseValue (value, item, { highlight, required, render }) {
  let data = typeof render === 'function' ? render(value, item) : value;

  if (typeof data === 'string') {
    data = data.replace(/\n\n/g, '<br>').replace(/\n/g, ' ');
  }

  if (highlight && data) {
    data = backtick(data);
  }

  if (typeof required === 'function' && required(item)) {
    data = `${data} ${italic('required')}`;
  }

  return data;
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
      head.splice(index, 1);
      body.forEach((row) => row.splice(index, 1));
    });
}

function fillLastRowColumn (body) {
  const lastRow = body[body.length - 1];
  const lastColumnIndex = lastRow.length - 1;

  if (!lastRow[lastColumnIndex]) {
    lastRow[lastColumnIndex] = '&nbsp;';
  }
}

function printTableColumnValue (value, item, { separator = ', ', transformValue, ...fieldOptions }) {
  if (typeof transformValue === 'function') {
    value = transformValue(value, item);
  }

  return value instanceof Array
    ? value.map((val) => parseValue(val, item, fieldOptions)).join(separator)
    : parseValue(value, item, fieldOptions);
}

function printTableColumn (item) {
  return (accumulator, { key, ...fieldOptions }) => {
    const value = printTableColumnValue(item[key], item, fieldOptions)

    accumulator.push(value)

    return accumulator
  }
}

function printTable (items, fields, options) {
  const head = fields.map((item) => item.header)
  const body = items.map((item) => fields.reduce(printTableColumn(item), []))

  deleteEmptyColumns(fields, head, body)
  fillLastRowColumn(body)
  options.$println(table([ head, ...body ]))
  options.$println()
}

function printItems ({ $print, $wrap, raw = false }, items) {
  if (raw) {
    $print('<ul>');
  }

  items.forEach((item) => $print(raw ? `<li>${item}</li>` : $wrap(item(item), '  ')));

  if (raw) {
    $print('</ul>');
  }
}

function printAuthor (options, entry) {
  if (entry.author.length === 1) {
    options.$println(bold('Author:'), entry.author[0]);
  } else {
    options.$println(bold('Authors:'));
    printItems(options, entry.author);
    options.$println();
  }

  options.$println();
}

function renderName (options, { name }) {
  options.$println(h(name, options.level++));
  options.$println();
}

function renderDescription (options, { description }) {
  options.$println(options.$wrap(description));
  options.$println();
}

function renderKeywords (options, { keywords }) {
  keywords.forEach(({ name, description }) => {
    let line = bold(name);

    if (description) {
      line += ` - ${indentText(description).trim()}`;
    }

    options.$println(item(line));
  });

  options.$println();
}

function renderMethodBody ({ $wrap, $print, $println, raw = false }, method, nbsp = '<br>') {
  if (method.description) {
    $println($wrap(method.description))
    $println()
  }

  if (method.author instanceof Array && method.author.length) {
    printAuthor({ $print, raw }, method)
  }

  $println(bold('Syntax'))
  $println()

  $println((code(method.syntax.join('\n'), 'typescript', raw)))
  $println()

  if (method.params.length) {
    const hasDescribedParameters = method.params.some(({ description }) => description)

    if (hasDescribedParameters) {
      $println(bold('Parameters'))
      $println()

      if (raw) {
        $print('<ul>')
      }

      method.params.forEach((param) => {
        let chunk = MethodParam.toString(param)

        chunk = bold(backtick(chunk))

        if (raw) {
          chunk = `<li>${chunk}`
        } else {
          chunk = item(chunk)
        }

        $print(chunk)

        if (param.description) {
          if (nbsp) {
            $println(nbsp)
          }

          $println($wrap(param.description, '  '))
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

  if (method.returns.description) {
    $println(bold('Return value'))
    $println()
    $println($wrap(method.returns.description))
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
};

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
        if (prop.function) {
          const chunk = [];
          const options = {
            raw: true,
            $wrap: (text) => text,
            $print: (...args) => chunk.push(args.join(' ')),
            $println: (...args) => {
              options.$print.apply(null, args)
              chunk.push('\n')
            }
          };

          renderMethodBody(options, prop.function, '');

          return chunk.join('');
        }

        return description;
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
      key: 'initialValue',
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
  // eslint-disable-next-line no-unused-vars
  model (options, model, title) {},

  props (options, { props }, title) {
    options.$println(h(title, options.level));
    options.$println();

    printTable(props, Fields.props, options);
  },

  data (options, { data }, title) {
    options.$println(h(title, options.level));
    options.$println();

    printTable(data, Fields.data, options);
  },

  computed (options, { computed }, title) {
    options.$println(h(title, options.level));
    options.$println();

    printTable(computed, Fields.computed, options);
  },

  methods (options, { methods }, title) {
    options.$println(h(title, options.level));
    options.$println();

    methods.forEach((method) => {
      options.$println(h(`${method.name}()`, options.level + 1));
      options.$println();

      renderMethodBody(options, method);
    });
  },

  slots (options, { slots }, title) {
    options.$println(h(title, options.level));
    options.$println();

    printTable(slots, Fields.slots, options);
  },

  events (options, { events }, title) {
    options.$println(h(title, options.level));
    options.$println();

    printTable(events, Fields.events, options);
  }
}

module.exports.Event = Event

module.exports.render = (component, options = {}) => {
  const emiter = new EventEmitter();
  const wordwrapOptions = {
    width: options.wordwrap || DEFAULT_WORDWRAP,
    trim: true,
  };

  options.level = options.level || DEFAULT_LEVEL;
  options.labels = options.labels || DEFAULT_TITLES;
  options.features = options.features || Parser.SUPPORTED_FEATURES;

  options.$tr = (key) => options.labels[key] || DEFAULT_TITLES[key];
  options.$wrap = (text, indent = '') => wordwrap(text, { ...wordwrapOptions, indent });
  options.$print = (...args) => emiter.emit(Event.write, args.join(' '));

  options.$println = (...args) => {
    options.$print.apply(null, args);
    emiter.emit(Event.write, '\n');
  };

  process.nextTick(() => {
    if (options.features.includes(Feature.name) && component.name) {
      renderName(options, component);
    }

    if (component.author instanceof Array && component.author.length) {
      printAuthor(options, component);
    }

    if (options.features.includes(Feature.description) && component.description) {
      renderDescription(options, component);
    }

    if (options.features.includes(Feature.keywords) && component.keywords instanceof Array && component.keywords.length) {
      renderKeywords(options, component);
    }

    const headerFeatures = [
      Feature.name,
      Feature.description,
      Feature.keywords,
    ];

    options.features
      .filter((feature) => !headerFeatures.includes(feature))
      .filter((feature) => component[feature] && component[feature].length)
      .forEach((feature) => writer[feature](options, component, options.$tr(feature)));

    emiter.emit(Event.end);
  });

  return emiter;
}
