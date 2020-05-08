<template>
  <div>
    <label :for="id">
      <!-- Use this slot to set the label -->
      <slot name="label"></slot>
    </label>
    <textarea :id="id" v-on:keyup="keyup" v-on:input="input">
      <!-- Use this slot to set the default value -->
      <slot></slot>
    </textarea>
  </div>
</template>

<script>
  /**
   * The custom HTML `<textarea>` component.
   *
   * @author Sébastien
   * @license MIT
   */
  export default {
    name: 'my-textarea',
    model: {
      prop: 'value',
      event: 'input'
    },
    props: {
      /**
       * Use this directive to create two-way data bindings with the component.
       * It automatically picks the correct way to update the element based on the input type.
       */
      value: { type: String },
      /**
       * Defines a unique identifier (ID) which must be unique in the whole document.
       */
      id: { type: String, required: true },
      /**
       * This Boolean property indicates that the user cannot interact with the control.
       */
      disable: { type: Boolean, default: false },
      /**
       * Define a custom theme for the component.
       * @default new DefaultTextareaTheme()
       * @type TextareaTheme
       */
      theme: {
        type: Object,
        default: () => new DefaultTextareaTheme()
      }
    },
    methods: {
      /**
       * Define if the control value is empty of not.
       * @return {boolean} true if empty; otherwise false
       */
      isEmpty () {
        return !this.value || this.value.length === 0
      },
      /**
       * This will be ignored on rendering
       * @private
       */
      input (e) {
        this.value = e.target.value

        /**
         * Fired when the value is changed.
         * @param {string} value - The updated value
         */
        this.$emit('input', this.value)
      },
      /**
       * This will be ignored on rendering
       * @private
       */
      keyup (e) {
        /**
         * Fired when a key is released.
         */
        this.$emit('keyup')
      }
    }
  }
</script>