# EventTarget

This example demonstrates how to generate a MDN-like documentation
for a method.

The output is similar to
[https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)

## Methods

### addEventListener()

The EventTarget method addEventListener() sets up a function that will
be called whenever the specified event is delivered to the target.
Common targets are Element, Document, and Window, but the target may be
any object that supports events (such as XMLHttpRequest).

`addEventListener()` works by adding a function or an object that
implements EventListener to the list of event listeners for the
specified event type on the EventTarget on which it's called.

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

```typescript
target.addEventListener(type, listener [, options]);
target.addEventListener(type, listener [, useCapture]);
target.addEventListener(type, listener [, useCapture, wantsUntrusted  ]); // Gecko/Mozilla only
```

**Parameters**

- `type: string`<br/>
  A case-sensitive string representing the event type to listen for.

- `listener: function`<br/>
  The object that receives a notification (an object that implements the Event
  interface) when an event of the specified type occurs. This must be an object
  implementing the EventListener interface, or a JavaScript function. See The
  event listener callback for details on the callback itself.

- `options: object`<br/>
  An options object specifies characteristics about the event listener.

- `useCapture: boolean`<br/>
  A Boolean indicating whether events of this type will be dispatched to the
  registered listener before being dispatched to any EventTarget beneath it in
  the DOM tree. Events that are bubbling upward through the tree will not
  trigger a listener designated to use capture. Event bubbling and capturing are
  two ways of propagating events that occur in an element that is nested within
  another element, when both elements have registered a handle for that event.
  The event propagation mode determines the order in which elements receive the
  event. See DOM Level 3 Events and JavaScript Event order for a detailed
  explanation. If not specified, useCapture defaults to false.

- `wantsUntrusted: boolean`<br/>
  A Firefox (Gecko)-specific parameter. If true, the listener receives synthetic
  events dispatched by web content (the default is false for browser chrome and
  true for regular web pages). This parameter is useful for code found in
  add-ons, as well as the browser itself.

**Return value**

`undefined`
