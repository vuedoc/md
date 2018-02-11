export default {
  props: {
    /**
     * The JSON Schema object. Use the `v-if` directive
     * @type [Object, Promise]
     */
    schema: { type: [Object, Promise], required: true },

    /**
     * Use this directive to create two-way data bindings
     * @model
     * @default {}
     */
    value: { type: Object, default: () => ({}) }
  },

  created () {
    /**
     * Emitted when the component has been created
     */
    this.$emit('created')
  }
}
