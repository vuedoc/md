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

| Name                                               | Type         | Description                                                                                                                                                                                                                                                                                  | Default                           |
| -------------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| `model` *required*                                 | `Array`      | The checkbox model                                                                                                                                                                                                                                                                           |                                   |
| `disabled`                                         | `Boolean`    | Initial checkbox state                                                                                                                                                                                                                                                                       |                                   |
| `enabled`                                          | `Boolean`    | Initial checkbox value                                                                                                                                                                                                                                                                       | `true`                            |
| `label`                                            | `String`     | The checkbox label                                                                                                                                                                                                                                                                           | `"Unamed checkbox"`               |
| `object`                                           | `CustomType` | The checkbox custom type object                                                                                                                                                                                                                                                              | `null`                            |
| `bool-false`                                       | `Boolean`    |                                                                                                                                                                                                                                                                                              | `false`                           |
| `int`                                              | `Number`     |                                                                                                                                                                                                                                                                                              | `100_000_000`                     |
| `prop-with-default-as-keyword-but-without-default` | `Object`     |                                                                                                                                                                                                                                                                                              | `{}`                              |
| `prop-with-default-as-keyword`                     | `Object`     |                                                                                                                                                                                                                                                                                              | `{}`                              |
| `prop-with-empty-default-as-keyword`               | `Object`     |                                                                                                                                                                                                                                                                                              | `() => ({})`                      |
| `number-prop-with-default-as-keyword`              | `Number`     |                                                                                                                                                                                                                                                                                              | `0`                               |
| `string-prop-with-default-as-keyword`              | `String`     |                                                                                                                                                                                                                                                                                              | `''`                              |
| `boolean-prop-with-default-as-keyword`             | `Boolean`    |                                                                                                                                                                                                                                                                                              | `false`                           |
| `array-prop-with-default-as-keyword`               | `Array`      |                                                                                                                                                                                                                                                                                              | `empty array`                     |
| `validator`                                        | `Function`   | The input validation function<br>**Syntax**<br><code class="language-typescript">function validator(value: any): boolean</code><br>**Parameters**<br><ul><li>**`value: any`**User input value to validate</li></ul>**Return value**<br>`true` if validation succeeds; `false` otherwise.<br> | `(value) => !Number.isNaN(value)` |
| `prop-with-null-as-default-keyword`                | `Object`     |                                                                                                                                                                                                                                                                                              | `null`                            |
| `prop-with-undefined-as-default-keyword`           | `Object`     |                                                                                                                                                                                                                                                                                              | `undefined`                       |

## Data

| Name           | Type     | Description                                                                        | Initial value |
| -------------- | -------- | ---------------------------------------------------------------------------------- | ------------- |
| `initialValue` | `string` | The initial component value. Used to detect changes and restore the initial value. | `""`          |
| `currentValue` | `string` |                                                                                    | `""`          |

## Computed Properties

| Name                 | Description                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------ |
| `id`                 | The component identifier. Generated using the `initialValue` data.<br>**Dependencies:** `initialValue` |
| `changed`            | **Dependencies:** `currentValue`, `initialValue`                                                       |
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
enable(value: unknow): void
```
