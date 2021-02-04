# FormSchema

## Slots

| Name      | Description |
| --------- | ----------- |
| `default` | &nbsp;      |

## Props

| Name                          | Type                                                                     | Description                                                                                                                                                                                                                                  | Default            |
| ----------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `schema` *required*           | `Object`                                                                 | The input JSON Schema object.                                                                                                                                                                                                                |                    |
| `v-model`                     | `Number` &#124; `String` &#124; `Array` &#124; `Object` &#124; `Boolean` | Use this directive to create two-way data bindings with the component. It automatically picks the correct way to update the element based on the input type.                                                                                 | `undefined`        |
| `id`                          | `String`                                                                 | The id property of the Element interface represents the form's identifier, reflecting the id global attribute.                                                                                                                               | `Random unique ID` |
| `name`                        | `String`                                                                 | The name of the form. It must be unique among the forms in a document.                                                                                                                                                                       | `undefined`        |
| `bracketed-object-input-name` | `Boolean`                                                                | When set to `true` (default), checkbox inputs and nested object inputs will * automatically include brackets at the end of their names (e.g. `name="grouped-checkbox-fields[]"`). Setting this property to `false`, disables this behaviour. | `true`             |
| `search`                      | `Boolean`                                                                | Use this prop to enable `search` landmark role to identify a section of the page used to search the page, site, or collection of sites.                                                                                                      | `false`            |
| `disabled`                    | `Boolean`                                                                | Indicates whether the form elements are disabled or not.                                                                                                                                                                                     | `false`            |
| `components`                  | `Components`                                                             | Use this prop to overwrite the default Native HTML Elements with custom components.                                                                                                                                                          | `GLOBAL.Elements`  |
| `descriptor`                  | [`DescriptorInstance`](#descriptor-interface)                            | UI Schema Descriptor to use for rendering.                                                                                                                                                                                                   | `{}`               |
| `validator`                   | `Function`                                                               | The validator function to use to validate data before to emit the `input` event.                                                                                                                                                             | `null`             |

## Data

| Name           | Type      | Description | Initial value                |
| -------------- | --------- | ----------- | ---------------------------- |
| `key`          | `any`     |             | `undefined`                  |
| `ref`          | `unknown` |             | `UniqueId.get('formschema')` |
| `initialModel` | `any`     |             | `undefined`                  |
| `ready`        | `boolean` |             | `false`                      |
| `parser`       | `unknown` |             | `null`                       |

## Computed Properties

| Name        | Type      | Description                                                                                                                                                    |
| ----------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fieldId`   | `string`  | **Dependencies:** `id`                                                                                                                                         |
| `options`   | `object`  | **Dependencies:** `schema`, `initialModel`, `name`, `fieldId`, `descriptor`, `components`, `bracketedObjectInputName`, `emitInputEvent`, `validator`, `update` |
| `listeners` | `unknown` | **Dependencies:** `$listeners`, `parser`                                                                                                                       |
