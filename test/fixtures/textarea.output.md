# my-textarea

The custom HTML `<textarea>` component.

- **author** - Sébastien
- **license** - MIT

## Slots

| Name    | Description                    | Props |
| ------- | ------------------------------ | ----- |
| `label` | Use this slot to set the label |       |

## Props

| Name            | Type      | Description                                                                                                                                                  | Default                      |
| --------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------- |
| `v-model`       | `String`  | Use this directive to create two-way data bindings with the component. It automatically picks the correct way to update the element based on the input type. |                              |
| `id` *required* | `String`  | Defines a unique identifier (ID) which must be unique in the whole document.                                                                                 |                              |
| `disable`       | `Boolean` | This Boolean property indicates that the user cannot interact with the control.                                                                              | `false`                      |
| `theme`         | `Object`  | Define a custom theme for the component.                                                                                                                     | `new DefaultTextareaTheme()` |

## Events

| Name    | Description                      | Arguments                               |
| ------- | -------------------------------- | --------------------------------------- |
| `input` | Fired when the value is changed. | **`value: string`** — The updated value |
| `keyup` | Fired when a key is released.    |                                         |

## Methods

### isEmpty()

Define if the control value is empty of not.

**Syntax**

```ts
isEmpty(): boolean
```

**Return value**

true if empty; otherwise false

