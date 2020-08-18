<template>
  <label>
    <slot></slot>
  </label>
</template>

<script>
export default {
  name: 'FormSchema',
  model: {
    prop: 'value',
    event: 'input'
  },
  props: {
    /**
     * The input JSON Schema object.
     */
    schema: {
      type: Object,
      required: true
    },

    /**
     * Use this directive to create two-way data bindings with the
     * component. It automatically picks the correct way to update the
     * element based on the input type.
     */
    value: {
      type: [ Number, String, Array, Object, Boolean ],
      default: undefined
    },

    /**
     * The id property of the Element interface represents the form's identifier,
     * reflecting the id global attribute.
     *
     * @default Random unique ID
     */
    id: {
      type: String,
      default: UniqueId.get('form')
    },

    /**
     * The name of the form. It must be unique among the forms in a document.
     */
    name: {
      type: String,
      default: undefined
    },

    /**
     * When set to `true` (default), checkbox inputs and nested object inputs
     * will * automatically include brackets at the end of their names
     * (e.g. `name="grouped-checkbox-fields[]"`).
     * Setting this property to `false`, disables this behaviour.
     */
    bracketedObjectInputName: {
      type: Boolean,
      default: true
    },

    /**
     * Use this prop to enable `search` landmark role to identify a section
     * of the page used to search the page, site, or collection of sites.
     */
    search: {
      type: Boolean,
      default: false
    },

    /**
     * Indicates whether the form elements are disabled or not.
     */
    disabled: {
      type: Boolean,
      default: false
    },

    /**
     * Use this prop to overwrite the default Native HTML Elements with
     * custom components.
     *
     * @default GLOBAL.Elements
     */
    components: {
      type: Components,
      default: () => GLOBAL.Elements
    },

    /**
     * UI Schema Descriptor to use for rendering.
     *
     * @type DescriptorInstance
     * @typeref #descriptor-interface
     * @default {}
     */
    descriptor: {
      type: Object,
      default: () => ({})
    },

    /**
     * The validator function to use to validate data before to emit the
     * `input` event.
     *
     * @param {Field} field - The field that requests validation
     * @param {any} field.value - The input value for validation
     * @return {Promise<boolean>} A promise that return `true` if validation success and `false` otherwise
     */
    validator: {
      type: Function,
      default: null
    }
  },
  data: () => ({
    key: undefined,
    ref: UniqueId.get('formschema'),
    initialModel: undefined,
    ready: false,
    parser: null
  }),
  computed: {
    fieldId() {
      return `${this.id}-field`;
    },
    options() {
      return {
        schema: this.schema,
        model: this.initialModel,
        name: this.name,
        id: this.fieldId,
        required: true,
        descriptor: this.descriptor,
        components: this.components,
        bracketedObjectInputName: this.bracketedObjectInputName,
        onChange: this.emitInputEvent,
        validator: this.validator,
        requestRender: this.update
      };
    },
    listeners() {
      const on = { ...this.$listeners };

      on.reset = on.reset ? [ on.reset ] : [];

      on.reset.unshift(() => {
        if (this.parser) {
          this.parser.field.reset();
        }
      });

      if (on.submit) {
        const onsubmit = on.submit;

        on.submit = (event) => {
          if (this.parser) {
            event.field = this.parser.field;
          }

          return onsubmit(event);
        };
      }

      // remove the injected vue's input event
      // to prevent vue errors on the submit event
      delete on.input;

      return on;
    }
  }
};
</script>

<style lang="css" scoped>
</style>
