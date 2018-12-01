'use strict'

const vuedoc = require('../..')
const assert = require('assert')
const path = require('path')
const Parser = require('@vuedoc/parser/lib/parser')

/* global describe it beforeEach */

const filename = path.join(__dirname, '../fixtures/checkbox.vue')

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
    let doc = null
    const join = true
    const filenames = [
      path.join(__dirname, '../fixtures/join.component.1.js'),
      path.join(__dirname, '../fixtures/join.component.2.vue')
    ]
    const ignore = ['name']
    const features = Parser.SUPPORTED_FEATURES.filter((feature) => !ignore.includes(feature))
    const options = { join, filenames, features }

    const expected = {
      "description": "A simple checkbox component",
      "keywords": [
        { "name": "author", "description": "Sébastien" },
        { "name": "license", "description": "MIT" },
        { "name": "input", "description": "" }
      ],
      "slots": [
        { "name": "default", "description": null },
        {
          "name": "label",
          "description": "Use this slot to set the checkbox label"
        }
      ],
      "props": [
        {
          "keywords": [],
          "visibility": "public",
          "description": "The JSON Schema object. Use the `v-if` directive",
          "value": {
            "type": {
              "type": "ArrayExpression",
              "start": 120,
              "end": 137,
              "range": [120, 137],
              "elements": [
                {
                  "type": "Identifier",
                  "start": 121,
                  "end": 127,
                  "range": [121, 127],
                  "name": "Object"
                },
                {
                  "type": "Identifier",
                  "start": 129,
                  "end": 136,
                  "range": [129, 136],
                  "name": "Promise"
                }
              ]
            },
            "required": true
          },
          "name": "schema"
        },
        {
          "keywords": [
            { "name": "model", "description": "" },
            { "name": "default", "description": "{}" }
          ],
          "visibility": "public",
          "description": "Use this directive to create two-way data bindings",
          "value": {
            "type": "Object",
            "default": {
              "type": "ArrowFunctionExpression",
              "start": 301,
              "end": 311,
              "range": [301, 311],
              "id": null,
              "generator": false,
              "expression": true,
              "async": false,
              "params": [],
              "body": {
                "type": "ObjectExpression",
                "start": 308,
                "end": 310,
                "range": [308, 310],
                "properties": []
              }
            }
          },
          "name": "v-model"
        },
        {
          "keywords": [],
          "visibility": "public",
          "description": "The checkbox model",
          "value": { "type": "Array", "required": true },
          "name": "model"
        },
        {
          "keywords": [],
          "visibility": "public",
          "description": "Initial checkbox state",
          "value": "Boolean",
          "name": "disabled"
        }
      ],
      "data": [],
      "computed": [],
      "events": [
        {
          "name": "created",
          "description": "Emitted when the component has been created",
          "visibility": "public",
          "keywords": []
        },
        {
          "name": "loaded",
          "description": "Emitted when the component has been loaded",
          "visibility": "public",
          "keywords": []
        }
      ],
      "methods": []
    }
    
    return vuedoc.join(options)
      .then((ast) => assert.deepEqual(ast, expected))
  })
})

describe('rendering', () => {
  let doc = null
  const options = { filename }

  beforeEach(() => {
    return vuedoc.md(options)
      .then((_doc) => (doc = _doc))
  })

  describe('component', () => {
    it('should have name as main title', () => {
      assert.ok(/# checkbox/.test(doc))
    })

    it('should have author keyword', () =>
      assert.ok(/- \*\*author\*\* - Sébastien/.test(doc)))

    it('should have license keyword', () =>
      assert.ok(/- \*\*license\*\* - MIT/.test(doc)))

    it('should have input keyword without a description', () =>
      assert.ok(/- \*\*input\*\*\s\n/.test(doc)))

    it('should have main title with default level', () => {
      return vuedoc.md(options)
        .then((doc) => assert.equal(/# checkbox/.test(doc), true))
    })

    it('should have main title with level 2 notation', () => {
      const _options = {}

      Object.assign(_options, options)

      _options.level = 2

      return vuedoc.md(_options)
        .then((doc) => assert.equal(/## checkbox/.test(doc), true))
    })

    it('should have main title with level 7 to 6', () => {
      const _options = {}

      Object.assign(_options, options)

      _options.level = 7

      return vuedoc.md(_options)
        .then((doc) => assert.equal(/###### checkbox/.test(doc), true))
    })

    it('should have a description', () => {
      assert.equal(/A simple checkbox component/.test(doc), true)
    })
  })

  describe('props', () => {
    it('should render props with custom title', () => {
      assert.ok(/ \*\*\*CustomType\*\*\* \(\*optional\*\)/.test(doc))
    })

    it('should render props title', () => {
      assert.ok(/## props/.test(doc))
    })

    it('should render props.model with a description', () => {
      assert.ok(/- .model. \*\*\*Array\*\*\* \(\*required\*\)/.test(doc))
      assert.ok(/The checkbox model/.test(doc))
    })

    it('should render props.disabled with a description', () => {
      assert.ok(/- .disabled. \*\*\*Boolean\*\*\* \(\*optional\*\)/.test(doc))
      assert.ok(/Initial checkbox state/.test(doc))
    })

    it('should render props.checked with a description', () => {
      assert.ok(/- .enabled. \*\*\*Boolean\*\*\* \(\*optional\*\) .default: true../.test(doc))
      assert.ok(/Initial checkbox value/.test(doc))
    })

    it('should render props.propWithDefaultAsKeyworldButWithoutDefault with default value from keywords', () => {
      assert.ok(/- .prop-with-default-as-keyword-but-without-default. \*\*\*Object\*\*\* \(\*optional\*\) .default: {}../.test(doc))
    })

    it('should render props.propWithDefaultAsKeyword with default value from keywords', () => {
      assert.ok(/- .prop-with-default-as-keyword. \*\*\*Object\*\*\* \(\*optional\*\) .default: {}../.test(doc))
    })

    it('should render props.propWithEmptyDefaultAsKeyword with default empty from keywords', () => {
      assert.ok(/- .prop-with-empty-default-as-keyword. \*\*\*Object\*\*\* \(\*optional\*\) .default: \[object Object\]../.test(doc))
    })

    it('should render props.numberPropWithDefaultAsKeyword with default 0 from keywords', () => {
      assert.ok(/- .number-prop-with-default-as-keyword. \*\*\*Number\*\*\* \(\*optional\*\) .default: 0../.test(doc))
    })

    it('should render props.stringPropWithDefaultAsKeyword with default string from keywords', () => {
      assert.ok(/- .string-prop-with-default-as-keyword. \*\*\*String\*\*\* \(\*optional\*\) .default: ''../.test(doc))
    })

    it('should render props.booleanPropWithDefaultAsKeyword with default string from keywords', () => {
      assert.ok(/- .boolean-prop-with-default-as-keyword. \*\*\*Boolean\*\*\* \(\*optional\*\) .default: false../.test(doc))
    })

    it('should render props.arrayPropWithDefaultAsKeyword with default string from keywords', () => {
      assert.ok(/- .array-prop-with-default-as-keyword. \*\*\*Array\*\*\* \(\*optional\*\) .default: empty array../.test(doc))
    })

    it('should render props.functionPropWithDefaultAsKeyword with default string from keywords', () => {
      assert.ok(/- .function-prop-with-default-as-keyword. \*\*\*Function\*\*\* \(\*optional\*\) .default: identity function../.test(doc))
    })

    it('should render props.propWithNullAsDefaultKeyword with default string from keywords', () => {
      assert.ok(/- .prop-with-null-as-default-keyword. \*\*\*Object\*\*\* \(\*optional\*\) .default: null../.test(doc))
    })

    it('should render props.propWithUndefinedAsDefaultKeyword with default string from keywords', () => {
      assert.ok(/- .prop-with-undefined-as-default-keyword. \*\*\*Object\*\*\* \(\*optional\*\) .default: undefined../.test(doc))
    })
  })

  describe('data', () => {
    it('should render data title', () => {
      assert.ok(/## data/.test(doc))
    })

    it('should render a data with its description and initial value', () => {
      assert.ok(/- `initialValue`\s+The initial component value\.\n\s+Used to detect changes and restore the initial value\.\s+\*\*initial value:\*\* `''`/.test(doc))
    })

    it('should render a data without a description', () => {
      assert.ok(/- `currentValue`\s+\*\*initial value:\*\* `''`/.test(doc))
    })
  })

  describe('computed', () => {
    it('should render computed properties title', () => {
      assert.ok(/## computed properties/.test(doc))
    })

    it('should render a computed property with its description and dependencies', () => {
      assert.ok(/- `id`\s+The component identifier\.\n\s+Generated using the `initialValue` data\.\s+\*\*dependencies:\*\* `initialValue`/.test(doc))
    })

    it('should render a computed property without a description', () => {
      assert.ok(/- `changed`\s+\*\*dependencies:\*\* `currentValue`, `initialValue`/.test(doc))
    })

    it('should render a computed property without a description and dependencies', () => {
      assert.ok(/- `withNoDependencies`/.test(doc))
    })
  })

  describe('slots', () => {
    it('should render slots title', () => {
      assert.ok(/## slots/.test(doc))
    })

    it('should render the default slot without a description', () => {
      assert.ok(/- .default./.test(doc))
    })

    it('should render the nammed slot with a description', () => {
      assert.ok(/- .label. Use this slot to set the checkbox label/.test(doc))
    })
  })

  describe('events', () => {
    it('should render events title', () => {
      assert.ok(/## events/.test(doc))
    })

    it('should render an event with a description', () => {
      assert.ok(/- .loaded.\s+Emitted when the component has been loaded/.test(doc))
    })

    it('should render an event with a multiline description', () => {
      assert.ok(/- .enabled.\s+Emitted the event .enabled. when loaded\s+Multilign/.test(doc))
    })
  })

  describe('methods', () => {
    it('should render methods title', () => {
      assert.ok(/## methods/.test(doc))
    })

    it('should render a method with a description', () => {
      assert.ok(/- .check\(\).\s+Check if the input is checked/.test(doc))
    })

    it('should render a method without a description', () => {
      assert.ok(/- .prop\(\)./.test(doc))
    })

    it('should render a method with a dynamic name', () => {
      assert.ok(/- .dynamic\(\).\s+Make component dynamic/.test(doc))
    })

    it('should render a method with a recursive dynamic name', () => {
      assert.ok(/- .dynamic2\(\).\s+Enter to dynamic mode/.test(doc))
    })

    it('should render a method with its params', () => {
      assert.ok(/- .enable\(value\).\s+Enable the checkbox/.test(doc))
    })
  })
})
