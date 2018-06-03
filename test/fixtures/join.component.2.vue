<template>
  <label>
    <input :disabled="disabled" type="text" v-model="checkbox">
    <slot></slot>
    <!-- Use this slot to set the checkbox label -->
    <slot name="label"></slot>
  </label>
</template>

<script>
const dynamic2 = 'dynamicMode'

/**
 * A simple checkbox component
 *
 * @author Sébastien
 * @license MIT
 * @input
 */
export default {
  name: 'checkbox',
  props: {
    /**
     * The checkbox model
     */
    model: {
      type: Array,
      required: true
    },
    
    /** 
     * Initial checkbox state
     */
    disabled: Boolean
  },
  
  created () {
    /**
     * Emitted when the component has been loaded
     */
    this.$emit('loaded')
  }
};
</script>

<style lang="css" scoped>
</style>
