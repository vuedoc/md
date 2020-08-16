// eslint-disable-next-line import/no-unresolved
const vuedoc = require('@vuedoc/parser');
const JsonSchemav = require('jsonschemav');
const ValidationError = require('jsonschemav/lib/error');
const Markdown = require('./lib/Markdown');
const schema = require('./lib/config.schema');

const jsv = new JsonSchemav();
const validator = jsv.compile(schema);

module.exports.Parser = vuedoc;

module.exports.render = (options) => (component) => new Promise((resolve, reject) => {
  if (component.errors.length) {
    reject(new Error(component.errors[0]));
    return;
  }

  let document = '';

  Markdown.render(component, options)
    .on(Markdown.Event.write, (text) => {
      if (options.stream) {
        options.stream.write(text);
      } else {
        document += text;
      }
    })
    .on(Markdown.Event.end, () => resolve(document));
});

module.exports.join = ({ parsing, ...options }) => {
  /* eslint-disable-next-line global-require */
  const merge = require('deepmerge');
  const parsers = options.filenames.map((filename) => vuedoc.parse({ ...parsing, filename }));

  return Promise.all(parsers).then(merge.all);
};

module.exports.md = ({ filename, ...options }) => {
  if (!options.parsing) {
    options.parsing = {};
  }

  return validator
    .then((instance) => instance.validate(options))
    .then((parsedData) => {
      const parse = parsedData.join
        ? this.join(parsedData)
        : vuedoc.parse({ ...parsedData.parsing, filename });

      return parse.then(this.render(parsedData));
    })
    .catch((err) => {
      if (err instanceof ValidationError) {
        err.message = 'Invalid options';

        return Promise.reject(err);
      }

      return Promise.reject(err);
    });
};
