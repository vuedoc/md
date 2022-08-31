import fs from 'fs';

import { fileURLToPath } from 'url';
import { VuedocParser } from '@vuedoc/parser';
import { spawn } from 'child_process';
import { readFile } from 'fs/promises';
import { mockProcessExit, mockProcessStdout, mockProcessStderr } from 'vitest-mock-process';
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { exec, findSectionNode, parseArgs, processRawContent, processWithoutOutputOption, processWithOutputOption, silenceExec, validateOptions } from '../../../lib/CLI.js';
import { dirname, join } from 'path';
import { cwd } from 'process';

const __dirname = dirname(fileURLToPath(import.meta.url));

const fixturesPath = join(__dirname, '../../fixtures');
const readmefile = join(fixturesPath, 'README.md');
const readme2file = join(fixturesPath, 'README2.md');
const notfoundfile = join(fixturesPath, 'notfound.vue');
const checkboxfile = join(fixturesPath, 'checkbox.example.vue');

const voidfile = '/tmp/void.vue';
const packageFilename = join(__dirname, '../../../package.json');
const vuecomponent = join(fixturesPath, 'vuecomponent.vue');
const vuedocConfigFile = join(fixturesPath, 'vuedoc.config.js');
const invalidVuedocConfigFile = join(fixturesPath, 'vuedoc.invalid.config.js');
const componentWordwrapFalse = join(fixturesPath, 'component.wordwrap.false.vue');

const fileSystem = {
  [voidfile]: vuecomponent,
  [readmefile]: [
    '# Sample\n\n',
    'Description\n\n',
    '# API\n',
    '**WIP**\n\n',
    '# License\n\n',
    'MIT',
  ].join(''),
  [readme2file]: [
    '# Sample\n\n',
    'Description\n\n',
    '###### API\n',
    '**WIP**\n\n',
    '# License\n\n',
    'MIT',
  ].join(''),
  [componentWordwrapFalse]: `
    <script>
      /**
       * Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur suscipit odio nisi, vel pellentesque augue tempor sed. Quisque tempus tortor metus, sit amet vehicula nisi tempus sit amet. Sed maximus massa ex, sed dictum dolor posuere in. Integer metus velit, euismod in turpis id, tincidunt tristique urna. Vivamus sit amet varius nisi. Nullam orci odio, tristique eget convallis ultrices, sodales at mi. Maecenas orci est, placerat eu dolor id, rhoncus congue lacus. Ut facilisis euismod vulputate. Nam metus nibh, blandit in eleifend ultricies, vehicula tempus dolor. Morbi varius lectus vehicula lectus bibendum suscipit. Nunc vel cursus eros, cursus lobortis sem. Nam tellus neque, dapibus id eros non, rhoncus ultricies turpis.
       */
      export default {
        name: 'NumericInput',
        methods: {
          /**
           * @param {number} value - Lorem ipsum dolor sit amet, consectetur adipiscing elit.
           *                         Curabitur suscipit odio nisi, vel pellentesque augue tempor sed.
           *                         Quisque tempus tortor metus, sit amet vehicula nisi tempus sit amet.
           */
          check(value) {}
        }
      }
    </script>
  `,
};

const { name, version } = JSON.parse(fs.readFileSync(packageFilename));

const defaultOptions = {
  join: false,
  stream: true,
  reduce: false,
  filenames: [],
  parsing: {
    features: VuedocParser.SUPPORTED_FEATURES,
  },
};

// FIXME Find a way to fix tests which use filesystem

describe('lib/CLI', () => {
  let processExit;
  let processStdout;
  let processStderr;

  beforeEach(() => {
    processExit = mockProcessExit();
    processStdout = mockProcessStdout();
    processStderr = mockProcessStderr();

    vi.mock('fs', async () => {
      const originalFs = await vi.importActual('fs');
      const mock = {
        createWriteStream: vi.fn(),
        readFileSync: (file) => (file in fileSystem ? fileSystem[file] : originalFs.readFileSync(file, 'utf8')),
      };

      return { ...mock, default: mock };
    });

    vi.mock('fs/promises', async () => {
      const internalFs = {};
      const originalFs = await vi.importActual('fs/promises');
      const mock = {
        ...originalFs,
        async readFile(file, encoding = 'utf8') {
          if (file in internalFs) {
            if (encoding) {
              return internalFs[file];
            }

            return {
              toString: () => internalFs[file],
            };
          }

          if (file in fileSystem) {
            if (encoding) {
              return fileSystem[file];
            }

            return {
              toString: () => fileSystem[file],
            };
          }

          return originalFs.readFile(file, encoding);
        },
        async writeFile(file, content) {
          internalFs[file] = content;
        },
      };

      return { ...mock, default: mock };
    });

    // vi.mock('fs/promises', () => ({
    //   lstat: vi.fn(),
    //   readFile: vi.fn(),
    //   writeFile: vi.fn(),
    // }));
  });

  afterEach(() => {
    processExit.mockRestore();
    processStdout.mockRestore();
    processStderr.mockRestore();
    vi.restoreAllMocks();
  });

  describe('validateOptions(options)', () => {
    const defaultOptions = { stream: true, filenames: [] };

    describe('--section', () => {
      const section = 'API';
      const options = { ...defaultOptions, section };

      it('should failed with missing --output option', () => {
        expect(() => validateOptions(options)).rejects.toThrow(/--output is required when using --section/);
      });

      it('should failed with invalid --output option value', () => {
        const output = fixturesPath;
        const _options = { ...options, output };

        expect(() => validateOptions(_options)).rejects.toThrow(/--output value must be an existing file/);
      });

      it('should successfully validate', () => {
        const output = readmefile;
        const _options = { ...options, output };

        expect(() => validateOptions(_options)).not.toThrow();
      });
    });

    describe('--join', () => {
      const join = true;
      const options = { ...defaultOptions, join };

      it('should failed with invalid --output option value', () => {
        const output = fixturesPath;
        const _options = { ...options, output };

        expect(() => validateOptions(_options)).rejects.toThrow(/--output value must be a file when using --join/);
      });

      it('should successfully validate', () => {
        const output = readmefile;
        const _options = { ...options, output };

        expect(() => validateOptions(_options)).not.toThrow();
      });
    });

    describe('with right options', () => {
      it('should successfully validate', () => {
        expect(() => validateOptions(defaultOptions)).not.toThrow();
      });
    });
  });

  describe('parseArgs(argv)', () => {
    describe.each(['-v', '--version'])('%s', (arg) => {
      it(`should display package version with ${arg}`, async () => {
        const args = [arg];
        const expected = `${name} v${version}\n`;

        await silenceExec(args);
        expect(processStderr).toHaveBeenCalledTimes(0);
        expect(processStdout).toHaveBeenCalledWith(expected);
        expect(processExit).toHaveBeenCalledTimes(0);
      });
    });

    describe.each(['-c', '--config'])('%s', (arg) => {
      it('should successfully parse with missing config value', () => {
        const argv = [arg];

        expect(() => parseArgs(argv)).not.toThrow();
      });

      it('should failed with invalid config value', () => {
        const argv = [arg, 'no found file'];

        expect(() => parseArgs(argv)).rejects.toThrowError(/Failed to load/);
      });

      it('should successfully set the parsing config option', () => {
        const argv = [arg, vuedocConfigFile];

        expect(parseArgs(argv)).resolves.toEqual({
          ...defaultOptions,
          wordwrap: 110,
          parsing: {
            ...defaultOptions.parsing,
            features: ['name', 'description', 'keywords', 'slots', 'model', 'props', 'events', 'methods'],
            loaders: [],
          },
        });
      });
    });

    describe.each(['-l', '--level'])('%s', (arg) => {
      it('should failed with missing level value', () => {
        const argv = [arg];

        expect(() => parseArgs(argv)).rejects.toThrowError(/Missing level value/);
      });

      it('should failed with invalid level value', () => {
        const argv = [arg, 'hello.vue'];

        expect(() => parseArgs(argv)).rejects.toThrowError(/Invalid level value/);
      });

      it('should successfully set the level option', () => {
        const level = 2;
        const argv = [arg, level];

        expect(parseArgs(argv)).resolves.toEqual({ ...defaultOptions, level });
      });
    });

    describe.each(['-w', '--wordwrap'])('%s', (arg) => {
      it('should failed with missing wordwrap value', () => {
        const argv = [arg];

        expect(() => parseArgs(argv)).rejects.toThrowError(/Missing wordwrap value/);
      });

      it('should failed with invalid wordwrap value', () => {
        const argv = [arg, 'hello.vue'];

        expect(() => parseArgs(argv)).rejects.toThrowError(/Invalid wordwrap value/);
      });

      it('should successfully set the wordwrap option', () => {
        const wordwrap = 110;
        const argv = [arg, wordwrap];

        expect(parseArgs(argv)).resolves.toEqual({ ...defaultOptions, wordwrap });
      });
    });

    describe.each(['-o', '--output'])('%s', (arg) => {
      it('should failed with missing level value', () => {
        const argv = [arg];

        expect(() => parseArgs(argv)).rejects.toThrowError(/Missing output value/);
      });

      it('should successfully set the output option', () => {
        const output = fixturesPath;
        const argv = [arg, output];

        expect(parseArgs(argv)).resolves.toEqual({ ...defaultOptions, output });
      });
    });

    describe.each(['-s', '--section'])('%s', (arg) => {
      it('should failed with missing level value', () => {
        const argv = [arg];

        expect(() => parseArgs(argv)).rejects.toThrowError(/Missing section value/);
      });

      it('should successfully set the section option', () => {
        const section = 'API';
        const output = readmefile;
        const argv = [
          arg, section,
          '--output', output,
        ];

        expect(parseArgs(argv)).resolves.toEqual({ ...defaultOptions, section, output });
      });
    });

    describe.each(['-j', '--join'])('%s', (arg) => {
      it('should successfully set the join option', () => {
        const argv = [arg];

        expect(parseArgs(argv)).resolves.toEqual({ ...defaultOptions, join: true });
      });
    });

    describe.each(defaultOptions.parsing.features)('--ignore-%s', (feature) => {
      it(`should successfully set the ignore-${feature} option`, () => {
        const argv = [`--ignore-${feature}`];
        const expected = {
          ...defaultOptions,
          parsing: {
            ...defaultOptions.parsing,
            features: defaultOptions.parsing.features.filter((item) => item !== feature),
          },
        };

        expect(parseArgs(argv)).resolves.toEqual(expected);
      });
    });

    describe('filenames', () => {
      it('should successfully set files', () => {
        const filenames = ['/tmp/checkbox.vue', '/tmp/textarea.vue'];
        const argv = filenames;
        const expected = { ...defaultOptions, filenames };

        expect(parseArgs(argv)).resolves.toEqual(expected);
      });
    });
  });

  describe('parseArgs(argv, requireFiles)', () => {
    it('should failed with missing files', () => {
      expect(() => parseArgs([], true)).rejects.toThrowError(/Missing filename/);
    });

    it('should successfully set files', () => {
      const filenames = ['/tmp/checkbox.vue', '/tmp/textarea.vue'];
      const argv = filenames;
      const expected = { ...defaultOptions, filenames };

      expect(parseArgs(argv, true)).resolves.toEqual(expected);
    });
  });

  describe('findSectionNode(section)', () => {
    it('should successfully found section node', () => {
      const section = 'API';
      const node = {
        type: 'Header',
        children: [
          {
            type: 'Str',
            value: section,
            raw: section,
          },
        ],
        raw: `# ${section}`,
      };
      const tree = {
        type: 'Document',
        children: [
          {
            type: 'Str',
            value: 'Text',
            raw: 'Text',
          },
          node,
        ],
        raw: `Text\n\n# ${section}`,
      };
      const expected = node;
      const foundNode = tree.children.find(findSectionNode(section));

      expect(foundNode).toBeTruthy();
      expect(foundNode).toEqual(expected);
    });
  });

  describe('processRawContent(argv, componentRawContent)', () => {
    it('should fail to generate documentation for an invalid component (javascript syntax error)', () => {
      const argv = [];
      const componentRawContent = `
        <template>
          <input @click="input"/>
        </template>
        <script>var invalid js code = !;</script>
      `;

      expect(() => processRawContent(argv, componentRawContent)).rejects.toThrow();
    });

    it.todo('should successfully generate the component documentation', async () => {
      const argv = [];
      const componentRawContent = await readFile(checkboxfile);

      expect(async () => processRawContent(argv, componentRawContent)).resolves.toThrow();

      expect(processExit).toHaveBeenCalledTimes(0);
      expect(processStderr).toHaveBeenCalledTimes(0);
      expect(processStdout).toHaveBeenCalledTimes(1);
      expect(processStdout).toHaveBeenCalledWith('');
    });
  });

  describe('processWithOutputOption(options)', () => {
    const output = readmefile;

    describe.todo('should successfully generate the component documentation', () => {
      const filenames = [
        join(fixturesPath, 'void.vue'),
      ];

      it.todo('with --section', async () => {
        const section = 'API';
        const options = { output, filenames, section };
        const expected = [
          '# Sample\n\n',
          'Description\n\n',
          '# API\n\n',
          '## void\n\n',
          'Void component\n\n',
          '# License\n\n',
          'MIT\n',
        ].join('');

        expect(processWithOutputOption(options)).resolves.toEqual(expected);
        expect(await readFile(output, 'utf8')).toEqual(expected);
      });

      it.todo('with --section and implicit level === 6', () => {
        const section = 'API';
        const output = readme2file;
        const options = { output, filenames, section };
        const expected = [
          '# Sample\n\n',
          'Description\n\n',
          '###### API\n\n',
          '###### void\n\n',
          'Void component\n\n',
          '# License\n\n',
          'MIT\n',
        ].join('');

        return processWithOutputOption(options).then(async () => {
          expect(await readFile(output, 'utf8')).toEqual(expected);
        });
      });

      it.todo('with --section and --level', () => {
        const section = 'API';
        const level = 3;
        const options = { output, filenames, section, level };

        return processWithOutputOption(options).then(async () => {
          const content = await readFile(output, 'utf8');

          expect(content.search(/\n### void/)).not.toBe(-1);
          expect(content.search(/\nVoid component/)).not.toBe(-1);
        });
      });

      it.todo('should successfully generate the component documentation', () => {
        const options = { output, filenames };

        return processWithOutputOption(options);
      });

      it.todo('should successfully generate the component documentation with output directory', () => {
        const output = fixturesPath;
        const options = { output, filenames };

        return processWithOutputOption(options);
      });

      it.todo('with --join', () => {
        const file1 = join(fixturesPath, 'join.component.1.js');
        const file2 = join(fixturesPath, 'join.component.2.vue');

        const filenames = [file1, file2];
        const options = { join: true, filenames };

        const expected = [
          '# checkbox',
          '',
          '**Author:** Sébastien',
          '',
          'A simple checkbox component',
          '',
          '- **license** - MIT',
          '- **input**',
          '',
          '## Slots',
          '',
          '| Name      | Description                             |',
          '| --------- | --------------------------------------- |',
          '| `default` |                                         |',
          '| `label`   | Use this slot to set the checkbox label |',
          '',
          '## Props',
          '',
          '| Name                | Type                      | Description                                        | Default |',
          '| ------------------- | ------------------------- | -------------------------------------------------- | ------- |',
          '| `schema` *required* | `Object` &#124; `Promise` | The JSON Schema object. Use the `v-if` directive   |         |',
          '| `v-model`           | `Object`                  | Use this directive to create two-way data bindings | `{}`    |',
          '| `model` *required*  | `Array`                   | The checkbox model                                 |         |',
          '| `disabled`          | `Boolean`                 | Initial checkbox state                             | &nbsp;  |',
          '',
          '## Events',
          '',
          '| Name      | Description                                 |',
          '| --------- | ------------------------------------------- |',
          '| `created` | Emitted when the component has been created |',
          '| `loaded`  | Emitted when the component has been loaded  |',
          '',
          '',
        ].join('\n');

        return processWithOutputOption(options)
          .then(() => expect(processStdout).toBe(expected));
      });
    });

    describe('should failed to generate the component documentation', () => {
      it('without not found file', () => {
        const filenames = [notfoundfile];
        const options = { output, filenames };

        expect(() => processWithOutputOption(options)).rejects.toThrow();
      });
    });
  });

  describe('processWithoutOutputOption(options)', () => {
    it('should failed to generate the component documentation', () => {
      const options = { filenames: [notfoundfile] };

      expect(() => processWithoutOutputOption(options)).rejects.toThrow(/Cannot find module/);
    });

    it('should successfully generate the component documentation', () => {
      const options = { filenames: [checkboxfile] };

      return processWithoutOutputOption(options);
    });

    it.todo('should successfully generate the component documentation with --join', async () => {
      const file1 = join(fixturesPath, 'join.component.1.js');
      const file2 = join(fixturesPath, 'join.component.2.vue');

      const filenames = [file1, file2];
      const options = { join: true, filenames };

      const expected = [
        '# checkbox',
        '',
        '**Author:** Sébastien',
        '',
        'A simple checkbox component',
        '',
        '- **license** - MIT',
        '- **input**',
        '',
        '## Slots',
        '',
        '| Name      | Description                             |',
        '| --------- | --------------------------------------- |',
        '| `default` |                                         |',
        '| `label`   | Use this slot to set the checkbox label |',
        '',
        '## Props',
        '',
        '| Name                | Type                      | Description                                        | Default |',
        '| ------------------- | ------------------------- | -------------------------------------------------- | ------- |',
        '| `schema` *required* | `Object` &#124; `Promise` | The JSON Schema object. Use the `v-if` directive   |         |',
        '| `v-model`           | `Object`                  | Use this directive to create two-way data bindings | `{}`    |',
        '| `model` *required*  | `Array`                   | The checkbox model                                 |         |',
        '| `disabled`          | `Boolean`                 | Initial checkbox state                             | &nbsp;  |',
        '',
        '## Events',
        '',
        '| Name      | Description                                 |',
        '| --------- | ------------------------------------------- |',
        '| `created` | Emitted when the component has been created |',
        '| `loaded`  | Emitted when the component has been loaded  |',
        '',
        '',
      ].join('\n');

      await processWithoutOutputOption(options);
      expect(processStdout).toHaveBeenCalledWith(expected);
    });
  });

  describe('exec(argv, componentRawContent)', () => {
    it('should successfully generate the component documentation', async () => {
      const argv = [];
      const filename = checkboxfile;
      const componentRawContent = await readFile(filename, 'utf8');

      await exec(argv, componentRawContent);
    });
  });

  describe('exec(argv)', () => {
    it('should successfully print version with --version', () => new Promise((resolve) => {
      const expected = `@vuedoc/md v${version}\n`;
      const cli = spawn('node', [join(cwd(), 'bin/cli.js'), '--version']);

      cli.stdout.on('data', (data) => {
        expect(data.toString()).toEqual(expected);
        resolve();
      });
    }));

    it('should successfully handle invalid vuedoc config file error', async () => {
      try {
        await exec(['-c', invalidVuedocConfigFile, checkboxfile]);
        await Promise.reject(new Error('Should failed with invalid vuedoc config file'));
      } catch (err) {
        expect(err.message).toEqual('Invalid options');
        expect(err.errors.length).toBe(1);
        expect(err.errors[0].prop).toBe('level');
        expect(err.errors[0].errors).toEqual([
          {
            keyword: 'minimum',
            message: 'invalid data',
          },
        ]);
      }
    });

    it('should successfully generate the component documentation with --output', () => {
      return exec([checkboxfile, '--output', fixturesPath]);
    });

    it('should successfully generate the component documentation', () => {
      return exec([checkboxfile]);
    });

    it.todo('should successfully generate the joined components documentation', async () => {
      const expected = [
        '**Author:** Sébastien',
        '',
        'A simple checkbox component',
        '',
        '- **license** - MIT',
        '- **input**',
        '',
        '# Slots',
        '',
        '| Name      | Description                             |',
        '| --------- | --------------------------------------- |',
        '| `default` |                                         |',
        '| `label`   | Use this slot to set the checkbox label |',
        '',
        '# Props',
        '',
        '| Name                | Type                      | Description                                        | Default |',
        '| ------------------- | ------------------------- | -------------------------------------------------- | ------- |',
        '| `schema` *required* | `Object` &#124; `Promise` | The JSON Schema object. Use the `v-if` directive   |         |',
        '| `v-model`           | `Object`                  | Use this directive to create two-way data bindings | `{}`    |',
        '| `model` *required*  | `Array`                   | The checkbox model                                 |         |',
        '| `disabled`          | `Boolean`                 | Initial checkbox state                             | &nbsp;  |',
        '',
        '# Events',
        '',
        '| Name      | Description                                 |',
        '| --------- | ------------------------------------------- |',
        '| `created` | Emitted when the component has been created |',
        '| `loaded`  | Emitted when the component has been loaded  |',
        '',
        '',
      ].join('\n');

      const file1 = join(fixturesPath, 'join.component.1.js');
      const file2 = join(fixturesPath, 'join.component.2.vue');

      await exec(['--ignore-name', '--join', file1, file2]);

      expect(processStdout).toHaveBeenCalledWith(expected);
    });

    it.todo('should successfully generate multiple components documentation', () => {
      const expected = [
        '# join.component.1',
        '',
        '## Props',
        '',
        '| Name                | Type                      | Description                                        | Default |',
        '| ------------------- | ------------------------- | -------------------------------------------------- | ------- |',
        '| `schema` *required* | `Object` &#124; `Promise` | The JSON Schema object. Use the `v-if` directive   |         |',
        '| `v-model`           | `Object`                  | Use this directive to create two-way data bindings | `{}`    |',
        '',
        '## Events',
        '',
        '| Name      | Description                                 |',
        '| --------- | ------------------------------------------- |',
        '| `created` | Emitted when the component has been created |',
        '',
        '# checkbox',
        '',
        '**Author:** Sébastien',
        '',
        'A simple checkbox component',
        '',
        '- **license** - MIT',
        '- **input**',
        '',
        '## Slots',
        '',
        '| Name      | Description                             |',
        '| --------- | --------------------------------------- |',
        '| `default` |                                         |',
        '| `label`   | Use this slot to set the checkbox label |',
        '',
        '## Props',
        '',
        '| Name               | Type      | Description            |',
        '| ------------------ | --------- | ---------------------- |',
        '| `model` *required* | `Array`   | The checkbox model     |',
        '| `disabled`         | `Boolean` | Initial checkbox state |',
        '',
        '## Events',
        '',
        '| Name     | Description                                |',
        '| -------- | ------------------------------------------ |',
        '| `loaded` | Emitted when the component has been loaded |',
        '',
        '',
      ].join('\n');

      const file1 = join(fixturesPath, 'join.component.1.js');
      const file2 = join(fixturesPath, 'join.component.2.vue');

      return exec([file1, file2])
        .then(() => expect(processStdout).toEqual(expected));
    });

    it.todo('should successfully generate doc with multiple authors', () => {
      const expected = [
        '**Authors:**',
        '- Arya Stark',
        '- Jon Snow <jon.snow@got.net>',
        '',
        'A simple checkbox component',
        '',
        '- **license** - MIT',
        '- **input**',
        '',
        '# Slots',
        '',
        '| Name      | Description                             |',
        '| --------- | --------------------------------------- |',
        '| `default` |                                         |',
        '| `label`   | Use this slot to set the checkbox label |',
        '',
        '# Props',
        '',
        '| Name               | Type      | Description            |',
        '| ------------------ | --------- | ---------------------- |',
        '| `model` *required* | `Array`   | The checkbox model     |',
        '| `disabled`         | `Boolean` | Initial checkbox state |',
        '',
        '# Events',
        '',
        '| Name     | Description                                |',
        '| -------- | ------------------------------------------ |',
        '| `loaded` | Emitted when the component has been loaded |',
        '',
        '# Methods',
        '',
        '## reset()',
        '',
        '**Author:** Arya',
        '',
        '**Syntax**',
        '',
        '```typescript',
        'reset(): void',
        '```',
        '',
        '',
      ].join('\n');

      const file = join(fixturesPath, 'component.authors.vue');

      return exec(['--ignore-name', file])
        .then(() => expect(processStdout).toEqual(expected));
    });

    it.todo('should successfully generate doc with options.wordwrap === false', () => {
      const expected = [
        '# NumericInput',
        '',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur suscipit odio nisi, vel pellentesque augue tempor sed. Quisque tempus tortor metus, sit amet vehicula nisi tempus sit amet. Sed maximus massa ex, sed dictum dolor posuere in. Integer metus velit, euismod in turpis id, tincidunt tristique urna. Vivamus sit amet varius nisi. Nullam orci odio, tristique eget convallis ultrices, sodales at mi. Maecenas orci est, placerat eu dolor id, rhoncus congue lacus. Ut facilisis euismod vulputate. Nam metus nibh, blandit in eleifend ultricies, vehicula tempus dolor. Morbi varius lectus vehicula lectus bibendum suscipit. Nunc vel cursus eros, cursus lobortis sem. Nam tellus neque, dapibus id eros non, rhoncus ultricies turpis.',
        '',
        '## Methods',
        '',
        '### check()',
        '',
        '**Syntax**',
        '',
        '```typescript',
        'check(value: number): void',
        '```',
        '',
        '**Parameters**',
        '',
        '- `value: number`<br/>  ',
        '  Lorem ipsum dolor sit amet, consectetur adipiscing elit.  ',
        '  Curabitur suscipit odio nisi, vel pellentesque augue tempor sed.  ',
        '  Quisque tempus tortor metus, sit amet vehicula nisi tempus sit amet.',
        '',
        '',
      ].join('\n');

      return exec(['--wordwrap', 'false', componentWordwrapFalse])
        .then(() => expect(processStdout).toEqual(expected));
    });
  });

  describe('silenceExec(argv)', () => {
    it('should successfully generate the component documentation with --output', () => {
      return silenceExec([checkboxfile]);
    });

    it('should failed with an exception', async () => {
      await silenceExec([]);
      expect(processStderr).toHaveBeenCalledWith('Missing filenames. Usage: renderMarkdown [*.{js,vue} files]...\n\n');
    });

    it('should failed promise error catching', () => silenceExec([notfoundfile]));
  });

  describe('parsing warnings output', () => {
    it('should successfully print parsing warning messages on stderr', async () => {
      const argv = [];
      const componentRawContent = `
        <script>
          export default {
            methods: {
              /**
               * @private
               */
              trigger() {
                /**
                 * Foo event description
                 *
                 * @arg {Object} {name, val} - foo event param description
                 */
                this.$emit("foo-event", { name: "foo-name", val: "voo-val" })
              }
            }
          }
        </script>
      `;

      await processRawContent(argv, componentRawContent);
      expect(processStderr).toHaveBeenCalledWith("Warn: Invalid JSDoc syntax: '{Object} {name, val} - foo event param description'\n");
    });
  });
});
