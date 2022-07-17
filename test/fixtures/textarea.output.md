# MyTextarea

**Author:** Arya Stark

The custom HTML `<textarea>` component.

- **license** - MIT

## Slots

| Name      | Description                             |
| --------- | --------------------------------------- |
| `label`   | Use this slot to set the label          |
| `default` | Use this slot to set the textarea value |

## Props

| Name            | Type            | Description                                                                                                                                                  | Default                      |
| --------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------- |
| `v-model`       | `string`        | Use this directive to create two-way data bindings with the component. It automatically picks the correct way to update the element based on the input type. |                              |
| `id` *required* | `string`        | Defines a unique identifier (ID) which must be unique in the whole document.                                                                                 |                              |
| `disabled`      | `boolean`       | This Boolean property indicates that the user cannot interact with the control.                                                                              | `false`                      |
| `theme`         | `TextareaTheme` | Define a custom theme for the component.                                                                                                                     | `new DefaultTextareaTheme()` |

## Events

| Name    | Description                                                                                                                                                                                                                                                                                                                                       |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `input` | Fired when the value is changed.<br/>**Arguments**<br/><ul><li>**`value: string`** — The updated value</li></ul>                                                                                                                                                                                                                                  |
| `keyup` | Fired when a key is released.<br/>**Arguments**<br/><ul><li>**`event: KeyboardEvent`** — Object describes a user interaction with the keyboard</li><li>**`event.code: DOMString`** — The code value of the physical key represented by the event</li><li>**`event.key: DOMString`** — The key value of the key represented by the event</li></ul> |

## Methods

### Textarea.replace()

The `replace()` method returns a new string with some or all matches of a
`pattern` replaced by a `replacement`. The `pattern` can be a string or a
RegExp, and the `replacement` can be a string or a function to be called for
each match. If `pattern` is a string, only the first occurrence will be
replaced.

The original string is left unchanged.

**Example**

```js
const p = 'The quick brown fox jumps over the lazy dog. If the dog reacted, was it really lazy?';
const regex = /dog/gi;

console.log(p.replace(regex, 'ferret'));
// expected output: "The quick brown fox jumps over the lazy ferret. If the ferret reacted, was it really lazy?"

console.log(p.replace('dog', 'monkey'));
// expected output: "The quick brown fox jumps over the lazy monkey. If the dog reacted, was it really lazy?"
```

**Syntax**

```typescript
const newStr = str.replace(pattern|substr, newSubstr|callback)
```

**Parameters**

- `str: unknown`

- `newSubstr: String`<br/>
  The String that replaces the substring specified by the specified regexp or
  substr parameter. A number of special replacement patterns are supported; see
  the "Specifying a string as a parameter" section below.

- `pattern: RegExp`<br/>
  A RegExp object or literal. The match or matches are replaced with newSubstr
  or the value returned by the specified function.

- `substr: String`<br/>
  A String that is to be replaced by newSubstr. It is treated as a literal
  string and is not interpreted as a regular expression. Only the first
  occurrence will be replaced.

- `callback: Function`<br/>
  A function to be invoked to create the new substring to be used to replace the
  matches to the given regexp or substr. The arguments supplied to this function
  are described in the "Specifying a function as a parameter" section below.

**Return value**

A new string, with some or all matches of a pattern replaced by a replacement.
