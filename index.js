// eslint-disable-next-line import/no-unresolved
const vuedoc = require('@vuedoc/parser');
const JsonSchemav = require('jsonschemav');
const ValidationError = require('jsonschemav/lib/error');
const Markdown = require('./lib/Markdown');
const schema = require('./lib/config.schema');

const jsv = new JsonSchemav();
const validator = jsv.compile(schema);

function renderFile(filename, keepStreamOpen, { ...options }) {
  return ({ warnings = [], ...component }) => new Promise((resolve, reject) => {
    warnings.forEach((message) => process.stderr.write(`Warn: ${message}\n`));

    const renderer = Markdown.render(component, options);
    const stream = typeof options.stream === 'function' && filename
      ? options.stream(filename)
      : options.stream;

    if (component.errors.length) {
      component.errors.forEach((message) => process.stderr.write(`Err: ${message}\n`));
      reject(new Error(component.errors[0]));

      return;
    }

    if (stream) {
      renderer.emiter
        .on(Markdown.Event.write, (text) => stream.write(text))
        .on(Markdown.Event.end, () => {
          if (!keepStreamOpen) {
            stream.end();
          }

          resolve();
        });
    } else {
      let document = '';

      renderer.emiter
        .on(Markdown.Event.write, (text) => {
          document += text;
        })
        .on(Markdown.Event.end, () => resolve(document.trim() + '\n'));
    }

    renderer.start();
  });
}

function render({ stream, filename, reduce = true, ...options }) {
  if (!options.parsing) {
    options.parsing = {};
  }

  // compatibility with previous versions
  if (filename && !options.filenames) {
    options.filenames = [ filename ];
  }

  return validator
    .then((instance) => instance.validate(options))
    .then(({ parsing: parsingOptions, join, filenames, ...restOptions }) => {
      const renderOptions = { stream, ...restOptions };

      if (filenames.length) {
        const parsers = filenames.map((filename) => vuedoc.parse({ ...parsingOptions, filename }));

        if (join) {
          /* eslint-disable-next-line global-require */
          const merge = require('deepmerge');

          return [
            Promise.all(parsers).then(merge.all).then(renderFile(null, false, renderOptions)),
          ];
        }

        return parsers.map((promise, index) => {
          return promise.then(renderFile(filenames[index], index !== filenames.length - 1, renderOptions));
        });
      }

      if (parsingOptions.filecontent) {
        return [
          vuedoc.parse(parsingOptions).then(renderFile(null, false, renderOptions)),
        ];
      }

      return Promise.reject(new Error('Invalid options. Missing options.filenames'));
    })
    .then(async (output) => {
      const docs = await Promise.all(output);

      if (reduce) {
        return docs.length === 1 ? docs[0] : docs;
      }

      return docs;
    })
    .catch((err) => {
      if (err instanceof ValidationError) {
        err.message = 'Invalid options';
      }

      return Promise.reject(err);
    });
}

module.exports.Parser = vuedoc;
module.exports.render = renderFile;
module.exports.md = render;
