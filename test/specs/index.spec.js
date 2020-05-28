const assert = require('assert')
const { join } = require('path')
const { Parser } = require('@vuedoc/parser/lib/parser/Parser')

const vuedoc = require('../..')

/* global describe it beforeEach */

const filename = join(__dirname, '../fixtures/checkbox.example.vue')

describe('options', () => {
  let doc = null
  const ignore = ['name', 'description']
  const features = Parser.SUPPORTED_FEATURES.filter((feature) => !ignore.includes(feature))
  const options = { filename, features }

  beforeEach(() => {
    return vuedoc.md(options)
      .then((_doc) => (doc = _doc))
      .catch((err) => { throw err })
  })

  it('should render without main title', () => {
    assert.equal(/# checkbox/.test(doc), false)
  })

  it('should render without description', () =>
    assert.equal(/A simple checkbox component/.test(doc), false))

  it('should successfully joined parsed files', () => {
    const filenames = [
      join(__dirname, '../fixtures/join.component.1.js'),
      join(__dirname, '../fixtures/join.component.2.vue')
    ]
    const ignore = ['name']
    const features = Parser.SUPPORTED_FEATURES.filter((feature) => !ignore.includes(feature))
    const options = { join: true, filenames, features }

    const expected = {
      "inheritAttrs": true,
      "description": "A simple checkbox component",
      "keywords": [
        {
          "name": "author",
          "description": "Sébastien"
        },
        {
          "name": "license",
          "description": "MIT"
        },
        {
          "name": "input",
          "description": ""
        }
      ],
      "slots": [
        {
          "kind": "slot",
          "visibility": "public",
          "description": "",
          "keywords": [],
          "name": "default",
          "props": []
        },
        {
          "kind": "slot",
          "visibility": "public",
          "description": "Use this slot to set the checkbox label",
          "keywords": [],
          "name": "label",
          "props": []
        }
      ],
      "props": [
        {
          "kind": "prop",
          "visibility": "public",
          "description": "The JSON Schema object. Use the `v-if` directive",
          "keywords": [],
          "name": "schema",
          "type": ["Object", "Promise"],
          "nativeType": "__undefined__",
          "default": "__undefined__",
          "required": true,
          "describeModel": false
        },
        {
          "kind": "prop",
          "visibility": "public",
          "description": "Use this directive to create two-way data bindings",
          "keywords": [],
          "name": "value",
          "type": "Object",
          "nativeType": "ArrowFunctionExpression",
          "default": "{}",
          "required": false,
          "describeModel": true
        },
        {
          "kind": "prop",
          "visibility": "public",
          "description": "The checkbox model",
          "keywords": [],
          "name": "model",
          "type": "Array",
          "nativeType": "array",
          "default": "__undefined__",
          "required": true,
          "describeModel": false
        },
        {
          "kind": "prop",
          "visibility": "public",
          "description": "Initial checkbox state",
          "keywords": [],
          "name": "disabled",
          "type": "Boolean",
          "nativeType": "boolean",
          "default": "__undefined__",
          "required": false,
          "describeModel": false
        }
      ],
      "data": [],
      "computed": [],
      "events": [
        {
          "kind": "event",
          "visibility": "public",
          "description": "Emitted when the component has been created",
          "keywords": [],
          "name": "created",
          "arguments": []
        },
        {
          "kind": "event",
          "visibility": "public",
          "description": "Emitted when the component has been loaded",
          "keywords": [],
          "name": "loaded",
          "arguments": []
        }
      ],
      "methods": [],
      "errors": []
    }

    return vuedoc.join(options).then((ast) => assert.deepEqual(ast, expected))
  })
})
