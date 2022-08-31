import { lstat, readFile, writeFile } from 'node:fs/promises';
import { readFileSync, createWriteStream } from 'node:fs';
import { dirname, isAbsolute, join, parse } from 'node:path';
import { fileURLToPath } from 'node:url';
import { toString } from 'mdast-util-to-string';
import { VuedocParser } from '@vuedoc/parser';
import { renderMarkdown } from '../index.js';
import { parse as parseAst } from '@textlint/markdown-to-ast';
import toMarkdown from 'ast-to-markdown';
import inject from 'md-node-inject';

const ARG_IGNORE_PREFIX = '--ignore-';
const usage = 'Usage: renderMarkdown [*.{js,vue} files]...';

export const MISSING_FILENAME_MESSAGE = `Missing filenames. ${usage}\n`;

export async function validateOptions(options) {
  if (options.section) {
    if (!options.output) {
      throw new Error('--output is required when using --section');
    }

    if (!(await lstat(options.output)).isFile()) {
      throw new Error('--output value must be an existing file when using --section');
    }
  }

  if (options.join && options.output) {
    if ((await lstat(options.output)).isDirectory()) {
      throw new Error('--output value must be a file when using --join');
    }
  }
}

export async function parseArgs(argv, requireFiles) {
  const parsing = {
    features: VuedocParser.SUPPORTED_FEATURES,
  };

  const options = {
    join: false,
    stream: true,
    reduce: false,
    filenames: [],
    parsing,
  };

  const promises = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    switch (arg) {
      /* istanbul ignore next */
      case '-v':

      /* istanbul ignore next */
      case '--version': {
        const __dirname = dirname(fileURLToPath(import.meta.url));
        const packageFilename = join(__dirname, '../package.json');
        const { name, version } = JSON.parse(readFileSync(packageFilename));

        const output = `${name} v${version}\n`;

        process.stdout.write(output);

        return null;
      }

      case '-c':

      case '--config': {
        const configFile = argv[i + 1] || 'vuedoc.config.js';
        const configPath = isAbsolute(configFile)
          ? configFile
          : join(process.cwd(), configFile);

        promises.push((async () => {
          const config = await import(configPath);

          if (config.default) {
            Object.assign(options, config.default);

            if (config.default.parsing) {
              options.parsing = { ...parsing, ...config.default.parsing };
            }
          }
        })());

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

  await Promise.all(promises);

  if (requireFiles && options.filenames.length === 0) {
    throw new Error(MISSING_FILENAME_MESSAGE);
  }

  await validateOptions(options);

  return options;
}

/* eslint-disable-next-line arrow-body-style */
export const findSectionNode = (section) => (node) => {
  return node.type === 'Header' && toString(node) === section;
};

export async function processRawContent(argv, componentRawContent) {
  const options = await parseArgs(argv, false);

  if (options) {
    options.stream = process.stdout;
    options.parsing.filecontent = componentRawContent;

    return renderMarkdown(options);
  }

  return '';
}

async function prepareSection(options, cache) {
  if (cache) {
    const output = await readFile(options.output, 'utf8');

    cache.target = parseAst(output);

    const node = cache.target.children.find(findSectionNode(options.section));

    if (node && !options.level) {
      options.level = node.depth + 1;
    }

    delete options.stream;
  }

  return renderMarkdown(options);
}

async function prepareOutput(options) {
  const stat = await lstat(options.output);

  if (stat.isDirectory()) {
    options.stream = (filename) => {
      const info = parse(filename);
      const mdname = `${info.name}.md`;
      const dest = join(options.output, mdname);

      return createWriteStream(dest);
    };
  } else {
    options.stream = createWriteStream(options.output);
  }

  return renderMarkdown(options);
}

async function prepare(options, filenames, cache = null) {
  options.filenames = filenames;

  if (options.section) {
    return Promise.all([prepareSection(options, cache)]);
  }

  if (options.output) {
    return prepareOutput(options);
  }

  options.stream = process.stdout;

  return renderMarkdown(options);
}

export async function processWithOutputOption(options) {
  const cache = {};
  const generatedDocs = await prepare(options, options.filenames, cache);

  if (options.section) {
    const docs = generatedDocs.reduce((accumulator, docEntry) => {
      parseAst(docEntry)
        .children.forEach((node) => accumulator.children.push(node));

      return accumulator;
    }, { children: [] });

    const tree = inject(options.section, cache.target, docs);
    const doc = toMarkdown(tree);

    await writeFile(options.output, doc);
  }
}

export async function processWithoutOutputOption(options) {
  return prepare(options, options.filenames);
}

export async function exec(argv, componentRawContent) {
  if (componentRawContent) {
    await processRawContent(argv, componentRawContent);
  } else {
    const options = await parseArgs(argv, true);

    if (options) {
      if (options.output) {
        await processWithOutputOption(options);
      } else {
        await processWithoutOutputOption(options);
      }
    }
  }
}

export async function silenceExec(argv, componentRawContent) {
  try {
    await exec(argv, componentRawContent);
  } catch (err) {
    process.stderr.write(`${err.message}\n`);
  }
}
