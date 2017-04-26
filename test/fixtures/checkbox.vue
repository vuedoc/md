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
 */
export default {
  name: 'checkbox',
  props: {
    /**
     * The checkbox model
     */
    model: {
      type: Array,
      required: true,
      twoWay: true
    },
    
    /** 
     * Initial checkbox state
     */
    disabled: Boolean,
    
    /**
     * Initial checkbox value
     */
    enabled: {
      type: Boolean,
      default: true
    },
    
    /**
     * The checkbox label
     */
    label: {
      type: String,
      default: 'Unamed checkbox'
    },
    
    object: {
      type: Object,
      default: null
    },
    
    boolFalse: {
      type: Boolean,
      default: false
    }
  },
  
  created () {
    /**
     * Emitted when the component has been loaded
     */
    this.$emit('loaded')
  },
  
  methods: {
    /**
     * Check if the input is checked
     */
    check () {
      console.log('check')
    },
    
    prop: () => {
      console.log('prop')
    },
    
    // Make component dynamic
    ['dynamic']: () => {
      console.log('dynamic')
    },
    
    // Enter to dynamic mode
    [dynamic2]: () => {
      console.log(dynamic2)
    },
    
    /*
     * This should be ignored
     * @private
     */
    ignored () {},
    
    // Another ignored method
    // @private
    anotherIgnored () {},
    
    // Enable the checkbox
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
