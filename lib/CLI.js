const fs = require('fs');
const toString = require('mdast-util-to-string');

// eslint-disable-next-line import/no-unresolved
const { Parser } = require('@vuedoc/parser');
const vuedoc = require('..');

const usage = 'Usage: vuedoc.md [*.{js,vue} files]...';
const MISSING_FILENAME_MESSAGE = `Missing filenames. ${usage}\n`;

const ARG_IGNORE_PREFIX = '--ignore-';

function validateOptions (options) {
  if (options.section) {
    if (!options.output) {
      throw new Error('--output is required when using --section');
    }

    if (!fs.lstatSync(options.output).isFile()) {
      throw new Error('--output value must be an existing file when using --section');
    }
  }

  if (options.join && options.output) {
    if (fs.lstatSync(options.output).isDirectory()) {
      throw new Error('--output value must be a file when using --join');
    }
  }
}

function parseArgs (argv, requireFiles) {
  const parsing = {
    features: Parser.SUPPORTED_FEATURES
  };

  const options = {
    join: false,
    stream: true,
    reduce: false,
    filenames: [],
    parsing
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    switch (arg) {
      /* istanbul ignore next */
      case '-v':
      /* istanbul ignore next */
      case '--version': {
        /* eslint-disable-next-line global-require */
        const { name, version } = require('../package');
        const output = `${name} v${version}\n`;

        process.stdout.write(output);
        process.exit(0);
      }

      case '-c':
      case '--config': {
        const configFile = argv[i + 1] || 'vuedoc.config.js';

        /* eslint-disable-next-line global-require */
        const path = require('path');
        const configPath = path.isAbsolute(configFile)
          ? configFile
          : path.join(process.cwd(), configFile);

        /* eslint-disable-next-line */
        const config = require(configPath)

        Object.assign(options, config);

        if (config.parsing) {
          options.parsing = { ...parsing, ...config.parsing };
        }

        i++;
        break;
      }

      case '-l':
      case '--level': {
        if (!argv[i + 1]) {
          throw new Error('Missing level value. Usage: --level [integer]\n');
        }

        const value = Number.parseInt(argv[i + 1], 10);

        if (Number.isNaN(value)) {
          throw new Error('Invalid level value. Usage: --level [integer]\n');
        }

        options.level = value;
        i++;
        break;
      }

      case '-w':
      case '--wordwrap': {
        if (!argv[i + 1]) {
          throw new Error('Missing wordwrap value. Usage: --wordwrap [integer | false]\n');
        }

        const arg = argv[i + 1];

        if (arg === 'false') {
          options.wordwrap = 0;
        } else {
          const value = Number.parseInt(arg, 10);

          if (Number.isNaN(value)) {
            throw new Error('Invalid wordwrap value. Usage: --wordwrap [integer | false]\n');
          }

          options.wordwrap = value;
        }

        i++;
        break;
      }

      case '-o':
      case '--output':
        if (!argv[i + 1]) {
          throw new Error('Missing output value. Usage: --output [file or directory]\n');
        }

        options.output = argv[i + 1];
        i++;
        break;

      case '-s':
      case '--section':
        if (!argv[i + 1]) {
          throw new Error('Missing section value. Usage: --section [section name]\n');
        }

        options.section = argv[i + 1];
        i++;
        break;

      case '-j':
      case '--join':
        options.join = true;
        break;

      default: {
        if (arg.startsWith(ARG_IGNORE_PREFIX)) {
          const feature = arg.substring(ARG_IGNORE_PREFIX.length);

          options.parsing.features = options.parsing.features.filter((item) => item !== feature);
        } else {
          options.filenames.push(arg);
        }
        break;
      }
    }
  }

  if (requireFiles && options.filenames.length === 0) {
    throw new Error(MISSING_FILENAME_MESSAGE);
  }

  validateOptions(options);

  return options;
}

/* eslint-disable-next-line arrow-body-style */
const findSectionNode = (section) => (node) => {
  return node.type === 'Header' && toString(node) === section;
};

async function processRawContent (argv, componentRawContent) {
  const options = parseArgs(argv, false);

  options.stream = process.stdout;
  options.parsing.filecontent = componentRawContent;

  return vuedoc.md(options);
}

async function prepareSection (options, cache) {
  if (cache) {
    /* eslint-disable-next-line global-require */
    const ast = require('@textlint/markdown-to-ast');
    const output = fs.readFileSync(options.output, 'utf8');

    cache.target = ast.parse(output);

    const node = cache.target.children.find(findSectionNode(options.section));

    if (node && !options.level) {
      options.level = node.depth + 1;
    }

    delete options.stream;
  }

  return vuedoc.md(options);
}

async function prepareOutput (options) {
  if (fs.lstatSync(options.output).isDirectory()) {
    options.stream = (filename) => {
      /* eslint-disable-next-line global-require */
      const path = require('path');
      const info = path.parse(filename);
      const mdname = `${info.name}.md`;
      const dest = path.join(options.output, mdname);

      return fs.createWriteStream(dest);
    };
  } else {
    options.stream = fs.createWriteStream(options.output);
  }

  return vuedoc.md(options);
}

async function prepare (options, filenames, cache = null) {
  options.filenames = filenames;

  if (options.section) {
    return Promise.all([ prepareSection(options, cache) ]);
  }

  if (options.output) {
    return prepareOutput(options);
  }

  options.stream = process.stdout;

  return vuedoc.md(options);
}

async function processWithOutputOption (options) {
  const cache = {};
  const generatedDocs = await prepare(options, options.filenames, cache);

  if (options.section) {
    /* eslint-disable global-require */
    const ast = require('@textlint/markdown-to-ast');
    const toMarkdown = require('ast-to-markdown');
    const inject = require('md-node-inject');
    const docs = generatedDocs.reduce((accumulator, docEntry) => {
      ast.parse(docEntry)
        .children.forEach((node) => accumulator.children.push(node));

      return accumulator;
    }, { children: [] });

    const tree = inject(options.section, cache.target, docs);
    const doc = toMarkdown(tree);

    fs.writeFileSync(options.output, doc);
  }

  return generatedDocs;
}

async function processWithoutOutputOption (options) {
  return prepare(options, options.filenames);
}

async function exec (argv, componentRawContent) {
  if (componentRawContent) {
    return processRawContent(argv, componentRawContent);
  }

  const options = parseArgs(argv, true);

  return options.output
    ? processWithOutputOption(options)
    : processWithoutOutputOption(options);
}

async function silenceExec (argv, componentRawContent) {
  try {
    await exec(argv, componentRawContent);
  } catch ({ message }) {
    process.stderr.write(`${message}\n`);
  }
}

module.exports.MISSING_FILENAME_MESSAGE = MISSING_FILENAME_MESSAGE;
module.exports.validateOptions = validateOptions;
module.exports.parseArgs = parseArgs;
module.exports.findSectionNode = findSectionNode;
module.exports.processRawContent = processRawContent;
module.exports.processWithOutputOption = processWithOutputOption;
module.exports.processWithoutOutputOption = processWithoutOutputOption;
module.exports.exec = exec;
module.exports.silenceExec = silenceExec;
