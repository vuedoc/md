# string

This example demonstrates how to generate a MDN-like documentation
for a method.

The output is similar to:
- [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match)
- [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace)

## methods

### String.prototype.match()

The `match()` method retrieves the result of matching a string against a
regular expression.

**Example**
```js
const paragraph = 'The quick brown fox jumps over the lazy dog. It barked.';
const regex = /[A-Z]/g;
const found = paragraph.match(regex);

console.log(found);
// expected output: Array ["T", "I"]
```

**Syntax**

```ts
str.match(regexp)
```

**Parameters**

- **`regexp`**<br>
  A regular expression object.

**Return value**

An Array whose contents depend on the presence or absence of the global (g) flag, or null if no matches are found.

### String.prototype.replace()

The `replace()` method returns a new string with some or all matches of
a `pattern` replaced by a `replacement`. The `pattern` can be a string
or a RegExp, and the `replacement` can be a string or a function to be
called for each match. If `pattern` is a string, only the first
occurrence will be replaced.

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

```ts
const newStr = str.replace(regexp|substr, newSubstr|function)
```

**Parameters**

- **`regexp`**<br>
  A RegExp object or literal. The match or matches are replaced with newSubstr or the value returned by the specified function.

- **`substr`**<br>
  A String that is to be replaced by newSubstr. It is treated as a literal string and is not interpreted as a regular expression. Only the first occurrence will be replaced.

- **`newSubstr`**<br>
  The String that replaces the substring specified by the specified regexp or substr parameter. A number of special replacement patterns are supported; see the "Specifying a string as a parameter" section below.

- **`function`**<br>
  A function to be invoked to create the new substring to be used to replace the matches to the given regexp or substr. The arguments supplied to this function are described in the "Specifying a function as a parameter" section below.

**Return value**

A new string, with some or all matches of a pattern replaced by a replacement.

