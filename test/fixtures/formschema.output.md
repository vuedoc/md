# FormSchema

## Slots

| Name      | Description |
| --------- | ----------- |
| `default` | &nbsp;      |

## Props

| Name                          | Type                                                                     | Description                                                                                                                                                                                                                                                                                                                                                                                                                     | Default            |
| ----------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `schema` *required*           | `Object`                                                                 | The input JSON Schema object.                                                                                                                                                                                                                                                                                                                                                                                                   |                    |
| `v-model`                     | `Number` &#124; `String` &#124; `Array` &#124; `Object` &#124; `Boolean` | Use this directive to create two-way data bindings with the component. It automatically picks the correct way to update the element based on the input type.                                                                                                                                                                                                                                                                    | `undefined`        |
| `id`                          | `String`                                                                 | The id property of the Element interface represents the form's identifier, reflecting the id global attribute.                                                                                                                                                                                                                                                                                                                  | `Random unique ID` |
| `name`                        | `String`                                                                 | The name of the form. It must be unique among the forms in a document.                                                                                                                                                                                                                                                                                                                                                          | `undefined`        |
| `bracketed-object-input-name` | `Boolean`                                                                | When set to `true` (default), checkbox inputs and nested object inputs will * automatically include brackets at the end of their names (e.g. `name="grouped-checkbox-fields[]"`). Setting this property to `false`, disables this behaviour.                                                                                                                                                                                    | `true`             |
| `search`                      | `Boolean`                                                                | Use this prop to enable `search` landmark role to identify a section of the page used to search the page, site, or collection of sites.                                                                                                                                                                                                                                                                                         | `false`            |
| `disabled`                    | `Boolean`                                                                | Indicates whether the form elements are disabled or not.                                                                                                                                                                                                                                                                                                                                                                        | `false`            |
| `components`                  | `Components`                                                             | Use this prop to overwrite the default Native HTML Elements with custom components.                                                                                                                                                                                                                                                                                                                                             | `GLOBAL.Elements`  |
| `descriptor`                  | [`DescriptorInstance`](#descriptor-interface)                            | UI Schema Descriptor to use for rendering.                                                                                                                                                                                                                                                                                                                                                                                      | `{}`               |
| `validator`                   | `Function`                                                               | The validator function to use to validate data before to emit the `input` event.<br>**Syntax**<br><code class="language-ts">validator(field: Field): Promise<boolean></code><br>**Parameters**<br><ul><li>**`field`**  The field that requests validation </li><li>**`field.value`**  The input value for validation </li></ul>**Return value**<br>A promise that return `true` if validation success and `false` otherwise<br> | `null`             |

## Data

| Name           | Type             | Description | Initial value                |
| -------------- | ---------------- | ----------- | ---------------------------- |
| `key`          | `any`            |             | `undefined`                  |
| `ref`          | `CallExpression` |             | `UniqueId.get('formschema')` |
| `initialModel` | `any`            |             | `undefined`                  |
| `ready`        | `boolean`        |             | `false`                      |
| `parser`       | `any`            |             | `null`                       |

## Computed Properties

| Name        | Description                                                                                                                                                    |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fieldId`   | **Dependencies**: `id`                                                                                                                                         |
| `options`   | **Dependencies**: `schema`, `initialModel`, `name`, `fieldId`, `descriptor`, `components`, `bracketedObjectInputName`, `emitInputEvent`, `validator`, `update` |
| `listeners` | **Dependencies**: `$listeners`, `parser`                                                                                                                       |

