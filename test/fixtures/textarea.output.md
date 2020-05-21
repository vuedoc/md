# my-textarea

The custom HTML `<textarea>` component.

- **author** - Sébastien
- **license** - MIT

## Slots

| Name      | Description                             |
| --------- | --------------------------------------- |
| `label`   | Use this slot to set the label          |
| `default` | Use this slot to set the textarea value |

## Props

| Name            | Type      | Description                                                                                                                                                  | Default                      |
| --------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------- |
| `v-model`       | `String`  | Use this directive to create two-way data bindings with the component. It automatically picks the correct way to update the element based on the input type. | &nbsp;                       |
| `id` *required* | `String`  | Defines a unique identifier (ID) which must be unique in the whole document.                                                                                 | &nbsp;                       |
| `disable`       | `Boolean` | This Boolean property indicates that the user cannot interact with the control.                                                                              | `false`                      |
| `theme`         | `Object`  | Define a custom theme for the component.                                                                                                                     | `new DefaultTextareaTheme()` |

## Events

| Name    | Description                                                                                                                                                                                                                                                                                                                                     |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `input` | Fired when the value is changed.<br>**Arguments**<br><ul><li>**`value: string`** — The updated value</li></ul>                                                                                                                                                                                                                                  |
| `keyup` | Fired when a key is released.<br>**Arguments**<br><ul><li>**`event: KeyboardEvent`** — Object describes a user interaction with the keyboard</li><li>**`event.code: DOMString`** — The code value of the physical key represented by the event</li><li>**`event.key: DOMString`** — The key value of the key represented by the event</li></ul> |

## Methods

### isEmpty()

Define if the control value is empty of not.

**Syntax**

```ts
isEmpty(): boolean
```

**Return value**

true if empty; otherwise false

