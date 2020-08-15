<template>
  <div>
    <label :for="id">
      <!-- Use this slot to set the label -->
      <slot name="label"></slot>
    </label>
    <div class="editor" contenteditable="true">
      <!-- Use this slot to set the textarea value -->
      <slot></slot>
    </div>
  </div>
</template>

<script>
  /**
   * The custom HTML `<textarea>` component.
   *
   * @author Arya Stark
   * @license MIT
   */
  export default {
    name: 'MyTextarea',
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
      disabled: { type: Boolean, default: false },
      /**
       * Define a custom theme for the component.
       * @type TextareaTheme
       * @default new DefaultTextareaTheme()
       */
      theme: {
        type: Object,
        default: () => new DefaultTextareaTheme()
      }
    },
    methods: {
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
      keyup(event) {
        /**
         * Fired when a key is released.
         * @bubbles Yes
         * @cancelable Yes
         * @interface [KeyboardEvent](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent)
         * @EventHandlerProperty [onkeyup](https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onkeyup)
         * @param {KeyboardEvent} event - Object describes a user interaction with the keyboard
         * @param {DOMString} event.code - The code value of the physical key represented by the event
         * @param {DOMString} event.key - The key value of the key represented by the event
         */
        this.$emit('keyup', event)
      },
      /**
       * The `replace()` method returns a new string with some or all matches of
       * a `pattern` replaced by a `replacement`. The `pattern` can be a string
       * or a RegExp, and the `replacement` can be a string or a function to be
       * called for each match. If `pattern` is a string, only the first
       * occurrence will be replaced.
       *
       * The original string is left unchanged.
       *
       * **Example**
       *
       * ```js
       * const p = 'The quick brown fox jumps over the lazy dog. If the dog reacted, was it really lazy?';
       * const regex = /dog/gi;
       *
       * console.log(p.replace(regex, 'ferret'));
       * // expected output: "The quick brown fox jumps over the lazy ferret. If the ferret reacted, was it really lazy?"
       *
       * console.log(p.replace('dog', 'monkey'));
       * // expected output: "The quick brown fox jumps over the lazy monkey. If the dog reacted, was it really lazy?"
       * ```
       *
       * @method Textarea.replace
       * @syntax const newStr = str.replace(pattern|substr, newSubstr|callback)
       * @param {RegExp} pattern - A RegExp object or literal. The match or matches are replaced with newSubstr or the value returned by the specified function.
       * @param {String} substr - A String that is to be replaced by newSubstr. It is treated as a literal string and is not interpreted as a regular expression. Only the first occurrence will be replaced.
       * @param {String} newSubstr - The String that replaces the substring specified by the specified regexp or substr parameter. A number of special replacement patterns are supported; see the "Specifying a string as a parameter" section below.
       * @param {Function} callback - A function to be invoked to create the new substring to be used to replace the matches to the given regexp or substr. The arguments supplied to this function are described in the "Specifying a function as a parameter" section below.
       * @returns A new string, with some or all matches of a pattern replaced by a replacement.
       */
      replace(str, newSubstr) {
        return this.value.replace(str, newSubstr)
      }
    }
  }
</script>
