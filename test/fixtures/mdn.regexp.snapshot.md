# regexp

## methods

### exec()

The exec() method executes a search for a match in a specified string.
Returns a result array, or null.

JavaScript RegExp objects are stateful when they have the global or sticky flags set (e.g. /foo/g or /foo/y). They store a lastIndex from the previous match. Using this internally, exec() can be used to iterate over multiple matches in a string of text (with capture groups), as opposed to getting just the matching strings with String.prototype.match().

A newer function has been proposed to simplify matching multiple parts of a string (with capture groups): String.prototype.matchAll().

If you are executing a match simply to find true or false, use RegExp.prototype.test() method or String.prototype.search() instead.

**Example**
```js
const regex1 = RegExp('foo*','g');
const str1 = 'table football, foosball';
let array1;

while ((array1 = regex1.exec(str1)) !== null) {
  console.log(`Found ${array1[0]}. Next starts at ${regex1.lastIndex}.`);
  // expected output: "Found foo. Next starts at 9."
  // expected output: "Found foo. Next starts at 19."
}
```

**Syntax**

```ts
regexObj.exec(str: string): any[]
```

**Parameters**

- **`str`**<br>
  The string against which to match the regular expression.

**Return value**

If the match succeeds, the exec() method returns an array (with extra properties index and input; see below) and updates the lastIndex property of the regular expression object. The returned array has the matched text as the first item, and then one item for each parenthetical capture group of the matched text.<br><br>If the match fails, the exec() method returns null, and sets lastIndex to 0.

