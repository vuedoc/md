# checkbox

A simple checkbox component

```html
<checkbox v-model="value"/>
```

- **author** - Sébastien
- **license** - MIT

## Slots

| Name      | Description                             |
| --------- | --------------------------------------- |
| `default` |                                         |
| `label`   | Use this slot to set the checkbox label |

## Props

| Name                                               | Type       | Description                     | Default             |
| -------------------------------------------------- | ---------- | ------------------------------- | ------------------- |
| `model` *required*                                 | `Array`    | The checkbox model              |                     |
| `disabled`                                         | `Boolean`  | Initial checkbox state          |                     |
| `enabled`                                          | `Boolean`  | Initial checkbox value          | `true`              |
| `label`                                            | `String`   | The checkbox label              | `Unamed checkbox`   |
| `object`                                           | `Object`   | The checkbox custom type object | `null`              |
| `bool-false`                                       | `Boolean`  |                                 | `false`             |
| `prop-with-default-as-keyword-but-without-default` | `Object`   |                                 | `{}`                |
| `prop-with-default-as-keyword`                     | `Object`   |                                 | `{}`                |
| `prop-with-empty-default-as-keyword`               | `Object`   |                                 |                     |
| `number-prop-with-default-as-keyword`              | `Number`   |                                 | `0`                 |
| `string-prop-with-default-as-keyword`              | `String`   |                                 | `''`                |
| `boolean-prop-with-default-as-keyword`             | `Boolean`  |                                 | `false`             |
| `array-prop-with-default-as-keyword`               | `Array`    |                                 | `empty array`       |
| `function-prop-with-default-as-keyword`            | `Function` |                                 | `identity function` |
| `prop-with-null-as-default-keyword`                | `Object`   |                                 | `null`              |
| `prop-with-undefined-as-default-keyword`           | `Object`   |                                 | `undefined`         |

## Data

| Name           | Type     | Description                                                                        |
| -------------- | -------- | ---------------------------------------------------------------------------------- |
| `initialValue` | `string` | The initial component value. Used to detect changes and restore the initial value. |
| `currentValue` | `string` | &nbsp;                                                                             |

## Computed Properties

| Name                 | Description                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------ |
| `id`                 | The component identifier. Generated using the `initialValue` data.<br>**Dependencies**: `initialValue` |
| `changed`            | **Dependencies**: `currentValue`, `initialValue`                                                       |
| `withNoDependencies` | &nbsp;                                                                                                 |

## Events

| Name      | Description                                                                                          |
| --------- | ---------------------------------------------------------------------------------------------------- |
| `loaded`  | Emitted when the component has been loaded                                                           |
| `enabled` | Emitted the event `enabled` when loaded Multilign<br>**Arguments**<br><ul><li>**`x: any`**</li></ul> |

## Methods

### check()

Check if the input is checked

**Syntax**

```ts
check(): void
```

### prop()

**Syntax**

```ts
prop(): void
```

### dynamic()

Make component dynamic

**Syntax**

```ts
dynamic(): void
```

### dynamicMode()

Enter to dynamic mode

**Syntax**

```ts
dynamicMode(): void
```

### enable()

Enable the checkbox

**Syntax**

```ts
enable(value: any): void
```

