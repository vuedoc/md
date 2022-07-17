# checkbox

**Author:** Sébastien

A simple checkbox component

```html
<checkbox v-model="value"/>
```

- **license** - MIT

## Slots

| Name      | Description                             |
| --------- | --------------------------------------- |
| `default` |                                         |
| `label`   | Use this slot to set the checkbox label |

## Props

| Name                                               | Type         | Description                                                                                                                                                                                                                                                                                     | Default                           |
| -------------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| `model` *required*                                 | `array`      | The checkbox model                                                                                                                                                                                                                                                                              |                                   |
| `disabled`                                         | `boolean`    | Initial checkbox state                                                                                                                                                                                                                                                                          |                                   |
| `enabled`                                          | `boolean`    | Initial checkbox value                                                                                                                                                                                                                                                                          | `true`                            |
| `label`                                            | `string`     | The checkbox label                                                                                                                                                                                                                                                                              | `"Unamed checkbox"`               |
| `object`                                           | `CustomType` | The checkbox custom type object                                                                                                                                                                                                                                                                 | `null`                            |
| `bool-false`                                       | `boolean`    |                                                                                                                                                                                                                                                                                                 | `false`                           |
| `int`                                              | `number`     |                                                                                                                                                                                                                                                                                                 | `100_000_000`                     |
| `prop-with-default-as-keyword-but-without-default` | `object`     |                                                                                                                                                                                                                                                                                                 | `{}`                              |
| `prop-with-default-as-keyword`                     | `object`     |                                                                                                                                                                                                                                                                                                 | `{}`                              |
| `prop-with-empty-default-as-keyword`               | `object`     |                                                                                                                                                                                                                                                                                                 | `{}`                              |
| `number-prop-with-default-as-keyword`              | `number`     |                                                                                                                                                                                                                                                                                                 | `0`                               |
| `string-prop-with-default-as-keyword`              | `string`     |                                                                                                                                                                                                                                                                                                 | `''`                              |
| `boolean-prop-with-default-as-keyword`             | `boolean`    |                                                                                                                                                                                                                                                                                                 | `false`                           |
| `array-prop-with-default-as-keyword`               | `array`      |                                                                                                                                                                                                                                                                                                 | `empty array`                     |
| `validator`                                        | `function`   | The input validation function<br/>**Syntax**<br/><code class="language-typescript">function validator(value: any): boolean</code><br/>**Parameters**<br/><ul><li>`value: any` User input value to validate</li></ul>**Return value**<br/>`true` if validation succeeds; `false` otherwise.<br/> | `(value) => !Number.isNaN(value)` |
| `prop-with-null-as-default-keyword`                | `object`     |                                                                                                                                                                                                                                                                                                 | `null`                            |
| `prop-with-undefined-as-default-keyword`           | `object`     |                                                                                                                                                                                                                                                                                                 | `undefined`                       |

## Data

| Name           | Type     | Description                                                                        | Initial value |
| -------------- | -------- | ---------------------------------------------------------------------------------- | ------------- |
| `initialValue` | `string` | The initial component value. Used to detect changes and restore the initial value. | `""`          |
| `currentValue` | `string` |                                                                                    | `""`          |

## Computed Properties

| Name                 | Type     | Description                                                                                             |
| -------------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| `id`                 | `string` | The component identifier. Generated using the `initialValue` data.<br/>**Dependencies:** `initialValue` |
| `changed`            | `binary` | **Dependencies:** `currentValue`, `initialValue`                                                        |
| `withNoDependencies` | `string` | &nbsp;                                                                                                  |

## Events

| Name      | Description                                                                                                |
| --------- | ---------------------------------------------------------------------------------------------------------- |
| `loaded`  | Emitted when the component has been loaded                                                                 |
| `enabled` | Emitted the event `enabled` when loaded Multilign<br/>**Arguments**<br/><ul><li>**`x: boolean`**</li></ul> |

## Methods

### check()

Check if the input is checked

**Syntax**

```typescript
check(): void
```

### prop()

**Syntax**

```typescript
prop(): void
```

### dynamic()

Make component dynamic

**Syntax**

```typescript
dynamic(): void
```

### dynamicMode()

Enter to dynamic mode

**Syntax**

```typescript
dynamicMode(): void
```

### enable()

Enable the checkbox

**Syntax**

```typescript
enable(value: unknown): void
```
