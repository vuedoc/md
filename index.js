import { parseComponent } from '@vuedoc/parser';
import { render, Event } from './lib/Markdown.js';

import merge from 'deepmerge';
import JsonSchemav from 'jsonschemav';
import ValidationError from 'jsonschemav/lib/error.js';
import schema from './lib/config.schema.js';

const jsv = new JsonSchemav();
const validator = jsv.compile(schema);

function renderFile(filename, keepStreamOpen, { ...options }) {
  return ({ warnings = [], ...component }) => new Promise((resolve, reject) => {
    warnings.forEach((message) => process.stderr.write(`Warn: ${message}\n`));

    const renderer = render(component, options);
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
        .on(Event.write, (text) => stream.write(text))
        .on(Event.end, () => {
          if (!keepStreamOpen) {
            stream.end();
          }

          resolve();
        });
    } else {
      let document = '';

      renderer.emiter
        .on(Event.write, (text) => {
          document += text;
        })
        .on(Event.end, () => resolve(document.trim() + '\n'));
    }

    renderer.start();
  });
}

export async function renderMarkdown({ stream, filename, reduce = true, ...options }) {
  if (!options.parsing) {
    options.parsing = {};
  }

  // compatibility with previous versions
  if (filename && !options.filenames) {
    options.filenames = [filename];
  }

  try {
    const instance = await validator;
    const { parsing: parsingOptions, join, filenames, ...restOptions } = await instance.validate(options);
    const output = await new Promise((resolve, reject) => {
      const renderOptions = { stream, ...restOptions };

      if (filenames.length) {
        const parsers = filenames.map((filename) => parseComponent({ ...parsingOptions, filename }));
        let promises = [];

        if (join) {
          promises = [
            Promise.all(parsers).then(merge.all).then(renderFile(null, false, renderOptions)),
          ];
        } else {
          promises = parsers.map((promise, index) => {
            return promise.then(renderFile(filenames[index], index !== filenames.length - 1, renderOptions));
          });
        }

        resolve(promises);
      } else if (parsingOptions.filecontent) {
        resolve([
          parseComponent(parsingOptions).then(renderFile(null, false, renderOptions)),
        ]);
      } else {
        reject(new Error('Invalid options. Missing options.filenames'));
      }
    });

    const docs = await Promise.all(output);

    if (reduce && docs.length === 1) {
      return docs[0];
    }

    return docs;
  } catch (err) {
    if (err instanceof ValidationError) {
      err.message = 'Invalid options';
    }

    throw err;
  }
}
