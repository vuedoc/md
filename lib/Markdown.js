const EventEmitter = require('events');
const wordwrap = require('word-wrap');
const table = require('markdown-table');

// eslint-disable-next-line import/no-unresolved
const { Parser } = require('@vuedoc/parser');
const { MethodParam } = require('@vuedoc/parser/lib/entity/MethodEntry');
const { KeywordsUtils } = require('@vuedoc/parser/lib/utils/KeywordsUtils');
const { Feature, CommonTags, JSDocTag, Type } = require('@vuedoc/parser/lib/Enum');

const { I18nKey, I18nLabel } = require('./I18n');

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
const DEFAULT_WORDWRAP = 80;
const DEFAULT_INDENT_LEVEL = 1;
const DEFAULT_INDENT_SLUG = '  ';
const CODE_MARKER = '```';
const CommonTagsOrder = [
  JSDocTag.since,
  JSDocTag.version,
  JSDocTag.deprecated,
  JSDocTag.see,
  JSDocTag.author,
];

const CommonTagsOrdered = CommonTagsOrder.map((tag) => CommonTags.find((item) => item.tag === tag));

const Md = {
  h: (text, level) => tag(level) + ' ' + text,
  item: (text) => `- ${text}`,
  bold: (text) => `**${text}**`,
  italic: (text) => `*${text}*`,
  backtick: (text) => '`' + `${text}`.replace(/`/g, '\\`') + '`',
  indent: (level, slug) => slug.repeat(level),
  code: (text, lang, inline = false) => {
    return inline
      ? `<code class="language-${lang}">${text}</code>`
      : '```' + lang + '\n' + text + '\n```';
  },
};

function indentText (text, { level = DEFAULT_INDENT_LEVEL, slug = DEFAULT_INDENT_SLUG, joinChar = '\n' } = {}) {
  return text.split(/(\n|\r\n)/g).map((line) => Md.indent(level, slug) + line).join(joinChar);
}

function parseType (type, { keywords = [], separator = '|' } = {}) {
  return TypeField.transformValue(type, { keywords, tick: '' }).join(` ${separator} `);
}

function parseValue (value, item, { highlight, required, render }, options) {
  let data = typeof render === 'function' ? render(value, item, options) : value;

  if (typeof data === 'string') {
    data = data.replace(/\n\n/g, '<br>').replace(/\n/g, ' ');
  }

  if (highlight && data) {
    data = Md.backtick(data);
  }

  if (typeof required === 'function' && required(item)) {
    data = `${data} ${Md.italic('required')}`;
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

function printTableColumnValue (value, item, { separator = ', ', transformValue, ...fieldOptions }, options) {
  if (typeof transformValue === 'function') {
    value = transformValue(value, item);
  }

  return value instanceof Array
    ? value.map((val) => parseValue(val, item, fieldOptions, options)).join(separator)
    : parseValue(value, item, fieldOptions, options);
}

function printTableColumn (item, options) {
  return (accumulator, { key, ...fieldOptions }) => {
    const value = printTableColumnValue(item[key], item, fieldOptions, options);

    accumulator.push(value);

    return accumulator;
  };
}

function printTable (items, fields, keys, options) {
  const head = fields.map((item) => options.$tr(keys[item.key]));
  const body = items.map((item) => fields.reduce(printTableColumn(item, options), []));

  deleteEmptyColumns(fields, head, body);
  fillLastRowColumn(body);
  options.$println(table([ head, ...body ]));
  options.$println();
}

function printItems (options, items, nbsp = false) {
  if (options.inline) {
    options.$print('<ul>');
    items.forEach((item) => options.$print(`<li>${item}</li>`));
    options.$print('</ul>');
  } else {
    items.forEach((item) => {
      options.$println(options.$wrap(Md.item(item), '  '));

      if (nbsp) {
        options.$println();
      }
    });
  }
}

function renderCommonTags (options, entry) {
  CommonTagsOrdered.forEach(({ tag, type }) => {
    switch (type) {
      case Type.array:
        if (entry[tag] instanceof Array && entry[tag].length) {
          if (entry[tag].length === 1) {
            options.$println(Md.bold(options.$tr(I18nKey[tag]) || tag), entry[tag][0]);
          } else {
            const key = `${tag}s`;

            options.$println(Md.bold(options.$tr(I18nKey[key]) || key));
            printItems(options, entry[tag]);
          }

          options.$println();
        }
        break;

      default:
        if (entry[tag]) {
          options.$printlni(Md.bold(options.$tr(I18nKey[tag]) || tag), entry[tag]);
        }
        break;
    }
  });
}

function renderName (options, { name }) {
  options.$println(Md.h(name, options.level++));
  options.$println();
}

function renderKeywords (options, { keywords }) {
  keywords.forEach(({ name, description }) => {
    let line = Md.bold(name);

    if (description) {
      line += ` - ${indentText(description).trim()}`;
    }

    options.$println(Md.item(line));
  });

  options.$println();
}

function renderMethodBody (options, method, nbsp = '<br>') {
  if (method.description) {
    options.$println(options.$wrap(method.description));
    options.$println();
  }

  renderCommonTags(options, method);

  options.$println(Md.bold(options.$tr(I18nKey.method.syntax)));
  options.$println();

  options.$println((Md.code(method.syntax.join('\n'), 'typescript', options.inline)));
  options.$println();

  if (method.params.length) {
    const hasDescribedParameters = method.params.some(({ description }) => description);

    if (hasDescribedParameters) {
      options.$println(Md.bold(options.$tr(I18nKey.method.parameters)));
      options.$println();

      const paramItems = method.params.map((param) => {
        let chunk = Md.bold(Md.backtick(MethodParam.toString(param)));

        if (param.description) {
          if (nbsp) {
            chunk += nbsp + '\n';
          }

          chunk += param.description;
        }

        if (nbsp) {
          chunk += '\n\n';
        }

        return chunk;
      });

      printItems(options, paramItems, true);
    }
  }

  if (method.returns.description) {
    options.$println(Md.bold(options.$tr(I18nKey.method.returns)));
    options.$println();
    options.$println(options.$wrap(method.returns.description));
    options.$println();
  }
}

const NameField = {
  key: 'name',
  highlight: true
};

const DescriptionField = {
  key: 'description',
  hideIfEmpty: false
};

const TypeField = {
  key: 'type',
  highlight: false,
  separator: ' &#124; ', // pipe char
  transformValue (value, { keywords, tick = '`' }) {
    const typerefs = KeywordsUtils.extract(keywords, 'typeref', true).map(({ description }) => description);
    const types = value instanceof Array ? value : [ value ];

    return types.map((item, index) => (typerefs[index] ? `[${tick}${item}${tick}](${typerefs[index]})` : `${tick}${item}${tick}`));
  }
};

const ArgumentsField = {
  key: 'arguments',
  separator: '',
  render: ({ name, type, description }) => {
    const tokens = [
      Md.bold(Md.backtick(name + ': ' + parseType(type)))
    ];

    if (description) {
      tokens.push('—');
      tokens.push(description);
    }

    const arg = tokens.join(' ');

    return `<li>${arg}</li>`;
  }
};

const DependenciesField = {
  key: 'dependencies',
  highlight: true,
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
      render (description, prop, options) {
        if (prop.function) {
          const chunk = [];
          const opts = {
            ...options,
            inline: true,
            $print: (...args) => chunk.push(args.join(' ')),
            $println: (...args) => {
              opts.$print.apply(null, args);
              chunk.push('\n');
            }
          };

          renderMethodBody(opts, prop.function, '');

          return chunk.join('');
        }

        return description;
      }
    },
    {
      key: 'default',
      highlight: true
    }
  ],
  data: [
    NameField,
    TypeField,
    DescriptionField,
    {
      key: 'initialValue',
      highlight: true
    }
  ],
  computed: [
    NameField,
    {
      ...DescriptionField,
      render (description, computed, options) {
        const tokens = [
          parseValue(description, computed, this)
        ].filter((token) => token);

        if (computed.dependencies.length) {
          const deps = printTableColumnValue(computed.dependencies, computed, DependenciesField);

          tokens.push(Md.bold(options.$tr(I18nKey.computed[DependenciesField.key])) + ` ${deps}`);
        }

        return tokens.join('<br>');
      }
    }
  ],
  slots: [
    NameField,
    DescriptionField,
    {
      key: 'props',
    }
  ],
  events: [
    NameField,
    {
      ...DescriptionField,
      render (description, event, options) {
        const tokens = [
          parseValue(description, event, this)
        ];

        if (event.arguments.length) {
          const args = printTableColumnValue(event.arguments, event, ArgumentsField);

          tokens.push(Md.bold(options.$tr(I18nKey.events[ArgumentsField.key])));
          tokens.push(`<ul>${args}</ul>`);
        }

        return tokens.join('<br>');
      }
    }
  ]
};

const writer = {
  props (options, { props }) {
    options.$println(Md.h(options.$tr(I18nKey.props.title), options.level));
    options.$println();

    printTable(props, Fields.props, I18nKey.props, options);
  },

  data (options, { data }) {
    options.$println(Md.h(options.$tr(I18nKey.data.title), options.level));
    options.$println();

    printTable(data, Fields.data, I18nKey.data, options);
  },

  computed (options, { computed }) {
    options.$println(Md.h(options.$tr(I18nKey.computed.title), options.level));
    options.$println();

    printTable(computed, Fields.computed, I18nKey.computed, options);
  },

  methods (options, { methods }) {
    options.$println(Md.h(options.$tr(I18nKey.method.title), options.level));
    options.$println();

    methods.forEach((method) => {
      options.$println(Md.h(`${method.name}()`, options.level + 1));
      options.$println();

      renderMethodBody(options, method);
    });
  },

  slots (options, { slots }) {
    options.$println(Md.h(options.$tr(I18nKey.slots.title), options.level));
    options.$println();

    printTable(slots, Fields.slots, I18nKey.slots, options);
  },

  events (options, { events }) {
    options.$println(Md.h(options.$tr(I18nKey.events.title), options.level));
    options.$println();

    printTable(events, Fields.events, I18nKey.events, options);
  }
};

const headerFeatures = [
  Feature.name,
  Feature.description,
  Feature.keywords,
  Feature.model,
];

module.exports.Event = Event;

module.exports.render = (component, options = {}) => {
  const emiter = new EventEmitter();

  options.level = options.level || DEFAULT_LEVEL;
  options.labels = options.labels || I18nLabel;
  options.features = options.features || Parser.SUPPORTED_FEATURES;

  if (options.wordwrap !== false) {
    options.wordwrap = typeof options.wordwrap === 'number'
      ? options.wordwrap || DEFAULT_WORDWRAP
      : DEFAULT_WORDWRAP;
  }

  options.$tr = (key) => options.labels[key] || I18nLabel[key];
  options.$wrap = options.wordwrap === false
    ? (text, indent = '') => indentText(text, { slug: indent, joinChar: '' }).trim()
    : (text, indent = '') => {
      let output = '';
      const lines = text.split(/\n/);
      const wordwrapOptions = {
        indent,
        trim: true,
        width: indent ? options.wordwrap - indent.length : options.wordwrap
      };

      for (let i = 0; i < lines.length; i++) {
        let item = lines[i].trim();

        if (item.startsWith(CODE_MARKER) || item.endsWith(CODE_MARKER)) {
          do {
            item = lines[i].trimEnd();
            output += lines[i] + '\n';
          } while (!item.endsWith(CODE_MARKER) && i++ < lines.length);
        } else {
          output += wordwrap(item, wordwrapOptions) + '\n';
        }
      }

      return output.trim();
    };

  options.$print = (...args) => emiter.emit(Event.write, args.join(' '));

  options.$println = (...args) => {
    options.$print.apply(null, args);
    emiter.emit(Event.write, '\n');
  };

  options.$printlni = (...args) => {
    options.$print.apply(null, args);
    emiter.emit(Event.write, '<br>\n');
  };

  process.nextTick(() => {
    if (options.features.includes(Feature.name) && component.name) {
      renderName(options, component);
    }

    renderCommonTags(options, component);

    if (options.features.includes(Feature.description) && component.description) {
      options.$println(options.$wrap(component.description));
      options.$println();
    }

    if (options.features.includes(Feature.keywords)
        && component.keywords instanceof Array
        && component.keywords.length) {
      renderKeywords(options, component);
    }

    options.features
      .filter((feature) => !headerFeatures.includes(feature))
      .filter((feature) => component[feature] && component[feature].length)
      .forEach((feature) => writer[feature](options, component));

    emiter.emit(Event.end);
  });

  return emiter;
};
