<template>
  <label>
    <input :disabled="disabled" type="text" v-model="textarea">
    <slot></slot>
    <!-- Use this slot to set the textarea label -->
    <slot name="label"></slot>
  </label>
</template>

<script>
const dynamic2 = 'dynamicMode'

/**
 * A simple textarea component
 */
export default {
  name: 'textarea',
  props: {
    /**
     * The textarea model
     */
    model: {
      type: Array,
      required: true,
      twoWay: true
    },
  },
  
  created () {
    /**
     * Emitted when the component has been loaded
     */
    this.$emit('loaded')
  },
  
  methods: {
    // Enable the textarea
    enable (value) {
      const x = true
      /** 
       * Emitted the event `enabled` when loaded
       * Multilign 
       */
      this.$emit('enabled', x)
    }
  }
};
</script>

<style lang="css" scoped>
</style>
