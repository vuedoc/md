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
const zero = 0
const nullValue = null
const undefinedValue = undefined
const emptyString = ''
const boolFalse = false

/**
 * A simple checkbox component
 *
 * ```html
 * <checkbox v-model="value"/>
 * ```
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
    },

    /**
     * @default {}
     */
    propWithDefaultAsKeywordButWithoutDefault: {
      type: Object
    },

    /**
     * @default {}
     */
    propWithDefaultAsKeyword: {
      type: Object,
      default: () => ({})
    },

    /**
     * @default
     */
    propWithEmptyDefaultAsKeyword: {
      type: Object,
      default: () => ({})
    },

    /**
     * @default 0
     */
    numberPropWithDefaultAsKeyword: {
      type: Number,
      default: zero
    },

    /**
     * @default ''
     */
    stringPropWithDefaultAsKeyword: {
      type: String,
      default: emptyString
    },

    /**
     * @default false
     */
    booleanPropWithDefaultAsKeyword: {
      type: Boolean,
      default: boolFalse
    },

    /**
     * @default empty array
     */
    arrayPropWithDefaultAsKeyword: {
      type: Array,
      default: () => ([])
    },

    /**
     * @default identity function
     */
    functionPropWithDefaultAsKeyword: {
      type: Function,
      default: (x) => x
    },

    /**
     * @default null
     */
    propWithNullAsDefaultKeyword: {
      type: Object,
      default: nullValue
    },

    /**
     * @default undefined
     */
    propWithUndefinedAsDefaultKeyword: {
      type: Object,
      default: undefinedValue
    }
  },
  
  created () {
    /**
     * Emitted when the component has been loaded
     */
    this.$emit('loaded')
  },

  data () {
    return {
      /**
       * The initial component value.
       * Used to detect changes and restore the initial value.
       */
      initialValue: '',
      currentValue: ''
    }
  },

  computed: {
    /**
     * The component identifier.
     * Generated using the `initialValue` data.
     */
    id () {
      return `checkbox-${this.initialValue}`
    },

    changed () {
      return this.currentValue !== this.initialValue
    },

    withNoDependencies () {
      return 'yeah'
    }
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
